#pragma once

#include "httplib.h"
#include "nlohmann/json.hpp"
#include <cstdlib>
#include <vector>

namespace StreamerNS {
struct MediaData {
  std::string name;
  std::string thumbnail;
  std::string media;
};
struct UserData {
  std::string mediaPath = std::getenv("HOME");
  int port = 8080;
  std::vector<MediaData> mediaData = {};
};

class Streamer {
private:
  std::string userDataFile = "userData.json";
  httplib::Server svr;
  std::vector<std::string> getDirInfo(const std::string &);
  void SaveUserData();
  void Scan();

public:
  UserData userData;
  Streamer();
  void StartServer();
};
void to_json(nlohmann::json &, const UserData &);
void from_json(const nlohmann::json &, UserData &);
void to_json(nlohmann::json &, const MediaData &);
void from_json(const nlohmann::json &, MediaData &);

}; // namespace StreamerNS
