package mediaserver

import (
	"net/http"
	"fmt"
	"time"
	"encoding/json"
	"os"
	"streamer/types"
	"strings"
	"github.com/gorilla/mux"
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

	if strings.Trim(userData.MediaPath, " ") == "" {
		fmt.Println("Wrong file path.")
		return
	}

	router := mux.NewRouter()

	mediaHandler := http.StripPrefix("/media/", http.FileServer(http.Dir(userData.MediaPath)))
	router.PathPrefix("/media/").Handler(mediaHandler)

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