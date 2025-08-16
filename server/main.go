package main

import (
	"streamer/httpserver"
	"streamer/mediaserver"
)

func main() {
	go mediaserver.StartMediaServer()
	httpserver.StartHTTPServer()
}

