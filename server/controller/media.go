package controller

import (
	"encoding/json"
	"fmt"
	"os/exec"
	"strings"
	"net/http"
	"os"
	"streamer/types"

)

const mediaDestPath string = "./media"



func ProcessFiles(w http.ResponseWriter, r *http.Request) {
	if _, err := os.Stat("userData.json"); err != nil {
		userData := types.UserData{MediaPath: ""}
		jsonData, err := json.MarshalIndent(userData, "", "	")
		if err != nil {
			json.NewEncoder(w).Encode(types.Response{Status: "error", Message: "Error while encoding data."})
			return
		}
		if err := os.WriteFile("userData.json", jsonData, 0644); err != nil {
			json.NewEncoder(w).Encode(types.Response{Status: "error", Message: "Error while saving file data."})
			return
		}
		json.NewEncoder(w).Encode(types.Response{Status: "error", Message: "User data doesn't exist."})
	} else {
		var userData types.UserData
		jsonData, err := os.ReadFile("userData.json")
		if err != nil {
			json.NewEncoder(w).Encode(types.Response{Status: "error", Message: "Error while reading file data."})
			return
		}
		if err := json.Unmarshal(jsonData, &userData); err != nil {
			json.NewEncoder(w).Encode(types.Response{Status: "error", Message: "Error while decoding data."})
			return
		}
		if userData.MediaPath == "" {
			json.NewEncoder(w).Encode(types.Response{Status: "error", Message: "User data is incomplete."})
			return
		}
		go startProcessing(userData.MediaPath)
		json.NewEncoder(w).Encode(types.Response{Status: "success", Message: "started processing"})
	}
}


func startProcessing(path string) error {
	dirInfo, err := os.ReadDir(path)

	if err != nil {
		return fmt.Errorf("directory doesn't exist")
	}

	ch := make(chan error)
	index := 0
	for _, item := range dirInfo {
		go processMedia(path + "/" + item.Name(), strings.Split(item.Name(), ".")[0], &ch)
		index++
	}


	for index > 0 {
		val := <- ch
		if val != nil {
			fmt.Println("Error occured:", val.Error())
			break
		} else {
			fmt.Println("One media is successfully processed.")
			index--
		}
	}


	return nil
}

func processMedia(filepath string, filename string, ch *chan error) {
	dirInfo, err := os.Stat(mediaDestPath)

	if os.IsNotExist(err) || !dirInfo.IsDir() {
		if err := os.Mkdir(mediaDestPath, 0755); err != nil {
			*ch <- err
			return
		}
	}

	fileDest := mediaDestPath + "/" + filename
	_, err = os.Stat(fileDest)
	
	if err == nil {
		if err := os.RemoveAll(fileDest); err != nil {
			*ch <- err
			return
		}
	}
	if err := os.Mkdir(fileDest, 0755); err != nil {
		*ch <- err
		return
	}

	cmd := exec.Command("ffmpeg", "-i", filepath, "-c:v", "libx264", "-c:a", "aac", "-b:a", "128k", "-f", "dash", "-seg_duration", "4", "-use_template", "1", "-use_timeline", "1", fileDest+"/manifest.mpd")

	if err = cmd.Run(); err != nil {
		*ch <- err
		return
	}

	*ch <- nil
}