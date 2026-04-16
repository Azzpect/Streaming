#include "streamer.hpp"
#include "httplib.h"
#include "nlohmann/json.hpp"
#include <filesystem>
#include <fstream>

StreamerNS::Streamer::Streamer() {
  if (!std::filesystem::exists("userData.json")) {
    std::cout << "User data file doesn't exist. Creating a new file..."
              << std::endl;
    std::ofstream file("userData.json");
    userData.mediaPath = std::getenv("HOME");
    nlohmann::json j = this->userData;
    std::string data = j.dump(1);
    file << data;
  } else {
    try {
      std::ifstream file("userData.json");
      nlohmann::json j = nlohmann::json::parse(file);
      this->userData = j.get<UserData>();
    } catch (nlohmann::json::parse_error &err) {
      std::cout << "Corrupted userData file. Rewriting..." << std::endl;
      std::ofstream file("userData.json");
      userData.mediaPath = std::getenv("HOME");
      nlohmann::json j = this->userData;
      std::string data = j.dump(1);
      file << data;
    } catch (nlohmann::json::out_of_range &err) {
      std::cout << "Corrupted userData file. Rewriting..." << std::endl;
      std::ofstream file("userData.json");
      userData.mediaPath = std::getenv("HOME");
      nlohmann::json j = this->userData;
      std::string data = j.dump(1);
      file << data;
    }
  }
}

void StreamerNS::Streamer::StartServer() {
  svr.Get("/api/get_user_data",
          [this](const httplib::Request &, httplib::Response &res) {
            nlohmann::json j = this->userData;
            res.set_content(j.dump(1), "application/json");
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
          });

  std::cout << "Starting http server on port " << this->userData.port
            << std::endl;
  if (!svr.listen("0.0.0.0", this->userData.port)) {
    std::cerr << "Couldn't start http server on port " << this->userData.port
              << std::endl;
  }
}

std::vector<StreamerNS::Dir>
StreamerNS::Streamer::getDirInfo(const std::string &path) {
  std::vector<StreamerNS::Dir> items;

  for (const auto &item : std::filesystem::directory_iterator(path)) {
    items.push_back(StreamerNS::Dir{item.path().filename().string(),
                                    item.is_directory() ? "dir" : "file"});
  }
  return items;
}
