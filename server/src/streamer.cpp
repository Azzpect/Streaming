#include "streamer.hpp"
#include "httplib.h"
#include "nlohmann/json.hpp"
#include <chrono>
#include <cstdlib>
#include <filesystem>
#include <fstream>

StreamerNS::Streamer::Streamer() {
  if (!std::filesystem::exists(userDataFile)) {
    std::cout << "User data file doesn't exist. Creating a new file..."
              << std::endl;
    SaveUserData();
  } else {
    try {
      std::ifstream file(userDataFile);
      nlohmann::json j = nlohmann::json::parse(file);
      this->userData = j.get<UserData>();
    } catch (nlohmann::json::parse_error &err) {
      std::cout << "Corrupted userData file. Rewriting..." << std::endl;
      SaveUserData();
    } catch (nlohmann::json::out_of_range &err) {
      std::cout << "Corrupted userData file. Rewriting..." << std::endl;
      SaveUserData();
    }
  }
}

void StreamerNS::Streamer::StartServer() {
  svr.Get("/api/get_user_data",
          [this](const httplib::Request &req, httplib::Response &res) {
            nlohmann::json j = this->userData;
            res.set_content(j.dump(1), "application/json");
            res.set_header("Access-Control-Allow-Origin",
                           req.get_header_value("Origin"));
            res.status = 200;
          });

  svr.Get("/api/get_dir_info",
          [this](const httplib::Request &req, httplib::Response &res) {
            nlohmann::json j;
            if (!req.has_param("path")) {
              res.status = httplib::StatusCode::BadRequest_400;
              j["message"] = "no path is given";
              res.set_content(j.dump(1), "application/json");
              return;
            }
            res.status = httplib::StatusCode::OK_200;
            j = getDirInfo(req.get_param_value("path"));
            res.set_content(j.dump(1), "application/json");
            res.set_header("Access-Control-Allow-Origin",
                           req.get_header_value("Origin"));
          });

  svr.Patch("/api/change_user_data", [this](const httplib::Request &req,
                                            httplib::Response &res) {
    res.set_header("Access-Control-Allow-Origin",
                   req.get_header_value("Origin"));

    try {
      std::ofstream file(userDataFile);
      nlohmann::json j = nlohmann::json::parse(req.body);
      if (j.contains("path"))
        userData.mediaPath = j["path"];
      if (j.contains("port"))
        userData.port = j["port"];
      SaveUserData();
      res.status = 204;
    } catch (nlohmann::json::parse_error &err) {
      res.status = 400;
    } catch (nlohmann::json::out_of_range &err) {
      res.status = 400;
    }
    std::cout << "setting mount point to: " << userData.mediaPath << std::endl;
    svr.set_mount_point("/media/movies", userData.mediaPath);
  });

  svr.Get("/api/scan",
          [this](const httplib::Request &req, httplib::Response &res) {
            res.set_header("Access-Control-Allow-Origin",
                           req.get_header_value("Origin"));

            Scan();
            nlohmann::json j = userData.mediaData;
            res.status = 200;

            svr.set_mount_point("/media/thumbnails", "./thumbnails");
            res.set_content(j.dump(1), "application/json");
          });

  svr.Options(".*", [](const httplib::Request &req, httplib::Response &res) {
    auto origin = req.get_header_value("Origin");

    if (!origin.empty()) {
      res.set_header("Access-Control-Allow-Origin", origin);
      res.set_header("Access-Control-Allow-Headers",
                     "Content-Type, Authorization, X-Requested-With");
      res.set_header("Access-Control-Allow-Methods",
                     "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    }

    res.status = 204;
  });

  std::cout << "Starting http server on port " << this->userData.port
            << std::endl;
  svr.set_mount_point("/media/thumbnails", "./thumbnails");
  svr.set_mount_point("/media/movies", userData.mediaPath);
  if (!svr.listen("0.0.0.0", this->userData.port)) {
    std::cerr << "Couldn't start http server on port " << this->userData.port
              << std::endl;
  }
}

std::vector<std::string>
StreamerNS::Streamer::getDirInfo(const std::string &path) {
  std::vector<std::string> items;

  for (const auto &item : std::filesystem::directory_iterator(path)) {
    if (item.is_directory()) {
      items.push_back(item.path().filename().string());
    }
  }
  return items;
}

void StreamerNS::Streamer::SaveUserData() {
  std::ofstream file(userDataFile);
  nlohmann::json j = userData;
  file << j.dump(1);
}

void StreamerNS::Streamer::Scan() {
  userData.mediaData.clear();
  if (std::filesystem::exists("thumbnails") &&
      std::filesystem::is_directory("thumbnails")) {
    std::filesystem::remove_all("thumbnails");
  }
  std::filesystem::create_directory("thumbnails");
  for (const auto &item :
       std::filesystem::directory_iterator(userData.mediaPath)) {
    if (!item.is_directory()) {
      auto ext = item.path().extension();
      std::string filename = item.path().filename();
      if (ext == ".mp4" || ext == ".mkv" || ext == ".avi" || ext == ".mov") {
        std::string path = item.path();
        auto now = std::chrono::system_clock::now().time_since_epoch();
        auto ms =
            std::chrono::duration_cast<std::chrono::milliseconds>(now).count();
        auto thumbnail = std::format("thumbnails/{}.jpg", ms);
        std::string cmd = std::format("./bin/ffmpeg -ss 00:00:10 -i \"{}\" "
                                      "-frames:v 1 {}",
                                      path, thumbnail);
        std::system(cmd.c_str());
        userData.mediaData.push_back(MediaData{filename, "/media/" + thumbnail,
                                               "/media/movies/" + filename});
      }
    }
  }
  SaveUserData();
}
