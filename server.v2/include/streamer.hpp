#pragma once

#include "httplib.h"
#include "nlohmann/json.hpp"
#include <vector>

namespace Streamer {
struct MediaData {
  std::string name;
  std::string path;
};
struct UserData {
  std::string mediaPath;
  int port = 8080;
  std::vector<MediaData> mediaData = {};
};

class Streamer {
private:
  httplib::Server svr;

public:
  UserData userData;

  Streamer();
  void StartServer();
};
void to_json(nlohmann::json &, const UserData &);
void from_json(const nlohmann::json &, UserData &);
void to_json(nlohmann::json &, const MediaData &);
void from_json(const nlohmann::json &, MediaData &);


}; // namespace Streamer
