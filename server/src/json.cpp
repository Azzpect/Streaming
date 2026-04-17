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
  j = nlohmann::json{{"name", m.name}, {"thumbnail", m.thumbnail}, {"media", m.media}};
}

void StreamerNS::from_json(const nlohmann::json &j, MediaData &m) {
  j.at("name").get_to(m.name);
  j.at("thumbnail").get_to(m.thumbnail);
  j.at("media").get_to(m.media);
}
