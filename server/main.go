package main

import (
	"fmt"
	"net/http"
	"streamer/controller"
	"github.com/gorilla/mux"
	"github.com/gorilla/handlers"
)

func main() {

	server()

}

func server() {

	router := mux.NewRouter()

	router.HandleFunc("/getDirInfo", controller.GetDirInfo).Methods("GET")
	router.HandleFunc("/get-user-data", controller.GetUserData).Methods("GET")
	router.HandleFunc("/save/media-path", controller.SaveMediaPath).Methods("POST")
	router.HandleFunc("/start-processing", controller.ProcessFiles).Methods("GET")
	router.HandleFunc("/get-media-data", controller.GetMediaData).Methods("GET")

	fServer := http.StripPrefix("/media/", http.FileServer(http.Dir("./media")))
	router.PathPrefix("/media/").Handler(fServer)


	cors := handlers.CORS(
		handlers.AllowedOrigins([]string{"*"}),
		handlers.AllowedMethods([]string{"GET", "POST"}),
		handlers.AllowedHeaders([]string{"Content-Type"}),
	)

	fmt.Println("Starting server....")
	if err := http.ListenAndServe(":8080", cors(router)); err != nil {
		fmt.Println("Error starting server.")
	}

}
