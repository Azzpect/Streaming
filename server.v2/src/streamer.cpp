#include "streamer.hpp"
#include "httplib.h"
#include "nlohmann/json.hpp"
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

  svr.Patch("/api/change_user_data",
            [this](const httplib::Request &req, httplib::Response &res) {
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
