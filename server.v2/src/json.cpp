#include "streamer.hpp"
#include "nlohmann/json.hpp"

void StreamerNS::to_json(nlohmann::json &j, const UserData &u) {
  j = nlohmann::json{
      {"mediaPath", u.mediaPath}, {"port", u.port}, {"mediaData", u.mediaData}};
}

void StreamerNS::from_json(const nlohmann::json &j, UserData &u) {
  j.at("mediaPath").get_to(u.mediaPath);
  j.at("port").get_to(u.port);
}

void StreamerNS::to_json(nlohmann::json &j, const MediaData &m) {
  j = nlohmann::json{{"name", m.name}, {"path", m.path}};
}

void StreamerNS::from_json(const nlohmann::json &j, MediaData &m) {
  j.at("name").get_to(m.name);
  j.at("path").get_to(m.path);
}

void StreamerNS::to_json(nlohmann::json &j, const Dir &d) {
  j = nlohmann::json{{"name", d.name}, {"type", d.type}};
}

void StreamerNS::from_json(const nlohmann::json &j, Dir &d) {
  j.at("name").get_to(d.name);
  j.at("type").get_to(d.type);
}
