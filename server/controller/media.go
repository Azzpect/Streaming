package controller

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"streamer/types"
	"strings"

	"github.com/gorilla/mux"
)

func GetMediaData(w http.ResponseWriter, r *http.Request) {
	var allData []types.MediaData = []types.MediaData{}
	encoder := json.NewEncoder(w)
	if _, err := os.Stat("mediaData.json"); err != nil {
		encoder.Encode(types.Response{Status: "error", Message: "No data found"})
		return
	}
	jsonData, err := os.ReadFile("mediaData.json")
	if err != nil {
		encoder.Encode(types.Response{Status: "error", Message: "Error reading data."})
		return
	}
	err = json.Unmarshal(jsonData, &allData)
	if err != nil {
		encoder.Encode(types.Response{Status: "error", Message: "Error decoding data."})
		return
	}
	encoder.Encode(map[string]any{"status": "success", "data": allData})
}

func ProcessMedia(w http.ResponseWriter, r *http.Request) {
	jsonData, err := os.ReadFile("userData.json")
	var userData types.UserData
	encoder := json.NewEncoder(w)
	if err != nil {
		encoder.Encode(types.Response{Status: "error", Message: "Couldn't read user data file."})
		return
	}

	err = json.Unmarshal(jsonData, &userData)
	if err != nil {
		encoder.Encode(types.Response{Status: "error", Message: "Couldn't decode user data file."})
		return
	}

	dirInfo, err := os.ReadDir(userData.MediaPath)
	if err != nil {
		encoder.Encode(types.Response{Status: "error", Message: "Couldn't read media directory."})
		return
	}

	allMediaData := []types.MediaData{}

	for _, item := range dirInfo {
		mimeType, err := GetMimeType(userData.MediaPath + "/" + item.Name())
		if err != nil {
			encoder.Encode(types.Response{Status: "error", Message: "Couldn't decode the mimetype of the file."})
			return
		}
		if mimeType == "image" || mimeType == "video" {
			name := getName(item.Name())
			path := userData.MediaPath + "/" + item.Name()
			thumbnail, err := getThumbnail(path, name)
			if err != nil {
				fmt.Println(err)
				continue
			}
			mediaData := types.MediaData{Name: name, Path: "/media/" + item.Name(), Thumbnail: thumbnail }
			allMediaData = append(allMediaData, mediaData)
		}
	}

	byteData, err := json.MarshalIndent(allMediaData, "", "	")
	if err != nil {
		encoder.Encode(types.Response{Status: "error", Message: "Couldn't encode media details."})
		return
	}
	err = os.WriteFile("mediaData.json", byteData, 0644)
	if err != nil {
		encoder.Encode(types.Response{Status: "error", Message: "Couldn't write media details."})
		return
	}
	encoder.Encode(map[string]any{ "status": "success", "data": allMediaData})
}

func getName(filename string) string {
	parts := strings.Split(filename, ".")
	var mediaName string = ""
	for i := 0; i < len(parts) - 1; i++ {
		mediaName = mediaName + parts[i]
	}
	return mediaName
}

func getThumbnail(filepath string, filename string) (string, error) {

	_, err := os.ReadDir("./thumbnails")
	if os.IsNotExist(err) {
		os.Mkdir("./thumbnails", 0755)
	}

	fileLoc := "./thumbnails/"+filename+"-thumbnail.jpg"

	cmd := exec.Command("ffmpeg", "-i", filepath, "-ss", "00:00:10", "-vframes", "1", fileLoc)
	err = cmd.Run()
	if err != nil {
		return "", err
	}

	return fileLoc, nil
}


func StartMediaServer() {

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

	thumbnailHandler := http.StripPrefix("/thumbnails/", http.FileServer(http.Dir("./thumbnails")))
	router.PathPrefix("/thumbnails/").Handler(thumbnailHandler)

	fmt.Println("Starting file server....")
	if err := http.ListenAndServe(":8100", router); err != nil {
		fmt.Println("Error starting file server.")
	}
}