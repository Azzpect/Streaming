#include "streamer.hpp"
#include "nlohmann/json.hpp"
#include <filesystem>
#include <fstream>

Streamer::Streamer::Streamer() {
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

void Streamer::Streamer::StartServer() {
  svr.Get("/api/get_user_data",
          [this](const httplib::Request &, httplib::Response &res) {
            nlohmann::json j = this->userData;
            res.set_content(j.dump(1), "application/json");
          });

  std::cout << "Starting http server on port " << this->userData.port << std::endl;
  if (!svr.listen("0.0.0.0", this->userData.port)) {
    std::cerr << "Couldn't start http server on port " << this->userData.port << std::endl;
  }
}

void Streamer::to_json(nlohmann::json &j, const UserData &u) {
  j = nlohmann::json{{"mediaPath", u.mediaPath}, {"port", u.port}};
}

void Streamer::from_json(const nlohmann::json &j, UserData &u) {
  j.at("mediaPath").get_to(u.mediaPath);
  j.at("port").get_to(u.port);
}
