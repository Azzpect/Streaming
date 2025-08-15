package main

import (
	"fmt"
	"net/http"
	"streamer/controller"
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
	router.HandleFunc("/start-processing", controller.ProcessFiles).Methods("GET")

	fServer := http.StripPrefix("/media/", http.FileServer(http.Dir("./media")))
	router.PathPrefix("/media/").Handler(fServer)

	fmt.Println("Starting server....")
	if err := http.ListenAndServe(":8080", router); err != nil {
		fmt.Println("Error starting server.")
	}

}
