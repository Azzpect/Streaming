#pragma once

#include "httplib.h"
#include "nlohmann/json.hpp"
#include <vector>

namespace StreamerNS {
struct MediaData {
  std::string name;
  std::string path;
};
struct UserData {
  std::string mediaPath;
  int port = 8080;
  std::vector<MediaData> mediaData = {};
};
struct Dir {
  std::string name;
  std::string type;
};

class Streamer {
private:
  httplib::Server svr;
  std::vector<Dir> getDirInfo(const std::string&);

public:
  UserData userData;

  Streamer();
  void StartServer();
};
void to_json(nlohmann::json &, const UserData &);
void from_json(const nlohmann::json &, UserData &);
void to_json(nlohmann::json &, const MediaData &);
void from_json(const nlohmann::json &, MediaData &);
void to_json(nlohmann::json &, const Dir &);
void from_json(const nlohmann::json &, Dir &);


}; // namespace Streamer
