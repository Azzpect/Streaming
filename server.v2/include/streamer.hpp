#pragma once

#include "httplib.h"
#include "nlohmann/json.hpp"

namespace Streamer {
struct UserData {
  std::string mediaPath;
  int port = 8080;
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

}; // namespace Streamer
