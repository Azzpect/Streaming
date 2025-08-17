package main

import (
	"fmt"
	"os"
	"streamer/httpserver"
	"streamer/mediaserver"

	"github.com/getlantern/systray"
	"github.com/joho/godotenv"
	_"embed"
)

func main() {

	systray.Run(onReady, onExit)
}

//go:embed linux.png
var iconData []byte

func onReady() {

	systray.SetIcon(iconData)
	quit := systray.AddMenuItem("Quit", "Stop the server and exit.")

	err := godotenv.Load()

	if err != nil {
		fmt.Println("Error loading env file")
		return
	}

	go mediaserver.StartMediaServer()
	go httpserver.StartHTTPServer()

	go func() {
		<- quit.ClickedCh
		systray.Quit()
	}()
}

func onExit() {
	fmt.Println("Exiting....")
	os.Exit(0)
}

