package mediaserver

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"os"
	"streamer/types"
	"strings"
	"time"
)

var mediaServerInstance *http.Server = nil

func StartMediaServer() {

	if mediaServerInstance != nil {
		fmt.Println("Stopping any existing file server....")
		if err := mediaServerInstance.Close(); err != nil {
			fmt.Println("Server stopped unexpectedly.")
		}
		time.Sleep(5 * time.Second)
	}

	var userData types.UserData

	if _, err := os.Stat("userData.json"); err != nil {
		userData = types.UserData{MediaPath: os.Getenv("HOME") + "/Downloads"}
		data, err := json.Marshal(userData)
		if err != nil {
			fmt.Println("failed to create default user data file")
			return
		}
		os.WriteFile("userData.json", data, 0644)
	} else {
		jsonData, err := os.ReadFile("userData.json")
		if err != nil {
			fmt.Println("Error reading user data file.")
			return
		}
		err = json.Unmarshal(jsonData, &userData)
		if err != nil {
			fmt.Println("Error decoding user data file.")
			return
		}
	}

	if strings.Trim(userData.MediaPath, " ") == "" {
		fmt.Println("Wrong file path.")
		return
	}

	router := mux.NewRouter()

	mediaHandler := http.StripPrefix("/media/", http.FileServer(http.Dir(userData.MediaPath)))
	router.PathPrefix("/media/").Handler(mediaHandler)

	thumbnailHandler := http.StripPrefix("/thumbnails/", http.FileServer(http.Dir("./thumbnails")))
	router.PathPrefix("/thumbnails/").Handler(thumbnailHandler)

	fmt.Println("Starting file server....")
	mediaServerInstance = &http.Server{
		Addr:    ":8100",
		Handler: router,
	}

	go func() {
		if err := mediaServerInstance.ListenAndServe(); err != nil {
			fmt.Println("Media server stopped:", err)
		}
	}()

}

