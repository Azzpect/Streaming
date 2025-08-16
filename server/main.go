package main

import (
	"fmt"
	"net/http"
	"streamer/controller"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {

	server()

}

func server() {

	router := mux.NewRouter()

	router.HandleFunc("/getDirInfo", controller.GetDirInfo).Methods("GET")
	router.HandleFunc("/get-user-data", controller.GetUserData).Methods("GET")
	router.HandleFunc("/save/media-path", controller.SaveMediaPath).Methods("POST")
	router.HandleFunc("/get-media-data", controller.GetMediaData).Methods("GET")
	router.HandleFunc("/process-media", controller.ProcessMedia).Methods("GET")

	cors := handlers.CORS(
		handlers.AllowedOrigins([]string{"*"}),
		handlers.AllowedMethods([]string{"GET", "POST"}),
		handlers.AllowedHeaders([]string{"Content-Type"}),
	)

	go controller.StartMediaServer()

	fmt.Println("Starting server....")
	if err := http.ListenAndServe(":8080", cors(router)); err != nil {
		fmt.Println("Error starting server.", err)
	}

}
