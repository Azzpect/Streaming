package main

import (
	"fmt"
	"streamer/httpserver"
	"streamer/mediaserver"

	"github.com/joho/godotenv"
)

func main() {

	err := godotenv.Load()

	if err != nil {
		fmt.Println("Error loading env file")
		return
	}

	go mediaserver.StartMediaServer()
	httpserver.StartHTTPServer()
}

