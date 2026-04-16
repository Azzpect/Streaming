cmake_minimum_required(VERSION 3.21.0)
project(Streamer VERSION 1.0.0 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# 1️⃣ Executable
add_executable(streamer
  ${CMAKE_SOURCE_DIR}/src/main.cpp
  ${CMAKE_SOURCE_DIR}/src/streamer.cpp
  ${CMAKE_SOURCE_DIR}/src/json.cpp
)

target_compile_options(streamer PRIVATE -Wall -Wextra -Werror -Wno-pedantic)
target_include_directories(streamer PRIVATE "${PROJECT_SOURCE_DIR}/include")

