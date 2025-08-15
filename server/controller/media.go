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

func GetMediaData(w http.ResponseWriter, r *http.Request) {
	var allData []types.MediaData = []types.MediaData{}
	encoder := json.NewEncoder(w)
	if _, err := os.Stat("mediaData.json"); err != nil {
		os.Create("mediaData.json")
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
		startProcessing(w, userData.MediaPath)
	}
}

type channelData struct {
	mediaData types.MediaData
	err error
}

func startProcessing(w http.ResponseWriter, path string) {

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	flusher, ok := w.(http.Flusher)

	if !ok {
		fmt.Fprintf(w, "data: ")
		json.NewEncoder(w).Encode(types.Response{Status: "error", Message: "streaming is not supported"})
		fmt.Fprintf(w, "\n")
		return
	}

	
	
	dirInfo, err := os.ReadDir(path)
	
	if err != nil {
		fmt.Fprintf(w, "data: ")
		json.NewEncoder(w).Encode(types.Response{Status: "error", Message: "Directory doesn't exist."})
		fmt.Fprintf(w, "\n")
		return
	}
	
	fmt.Fprintf(w, "data: ")
	json.NewEncoder(w).Encode(types.Response{Status: "process", Message: "started processing"})
	fmt.Fprintf(w, "\n")
	flusher.Flush()
	

	ch := make(chan channelData)
	index := 0
	for _, item := range dirInfo {
		go processMedia(path + "/" + item.Name(), strings.Split(item.Name(), ".")[0], &ch)
		index++
	}

	type processedMediaData struct {
		types.Response
		Media types.MediaData	`json:"media"`
	}


	for index > 0 {
		val := <- ch
		if val.err != nil {
			fmt.Fprintf(w, "data: ")
			json.NewEncoder(w).Encode(types.Response{Status: "error", Message: val.err.Error()})
			fmt.Fprintf(w, "\n")
			break
		} else {
			msg := fmt.Sprintf("%s media is successfully processed", val.mediaData.Name)
			fmt.Fprintf(w, "data: ")
			json.NewEncoder(w).Encode(processedMediaData{Response: types.Response{Status: "success", Message: msg}, Media: val.mediaData})
			fmt.Fprintf(w, "\n")
			flusher.Flush()
			index--
		}
	}
}

func saveMediaData(data types.MediaData) error {
	var allData []types.MediaData = []types.MediaData{}
	if _, err := os.Stat("mediaData.json"); err != nil {
		os.Create("mediaData.json")
	} else {
		jsonData, err := os.ReadFile("mediaData.json")
		if err != nil {
			return err
		}
		err = json.Unmarshal(jsonData, &allData)
		if err != nil {
			return err
		}
	}
	allData = appendMedia(allData, data)
	jsonData, err := json.MarshalIndent(allData, "", "	")
	if err != nil {
		return err
	}
	err = os.WriteFile("mediaData.json", jsonData, 0644)
	if err != nil {
		return err
	}
	return nil
}

func appendMedia(list []types.MediaData, media types.MediaData) []types.MediaData {
	var newList []types.MediaData = []types.MediaData{}
	for _, m := range list {
		if m.Name != media.Name {
			newList = append(newList, m)
		}
	}
	return append(newList, media)
}

func processMedia(filepath string, filename string, ch *chan channelData) {
	dirInfo, err := os.Stat(mediaDestPath)

	if os.IsNotExist(err) || !dirInfo.IsDir() {
		if err := os.Mkdir(mediaDestPath, 0755); err != nil {
			*ch <- channelData{mediaData: types.MediaData{}, err: err}
			return
		}
	}

	fileDest := mediaDestPath + "/" + filename
	_, err = os.Stat(fileDest)
	
	if err == nil {
		if err := os.RemoveAll(fileDest); err != nil {
			*ch <- channelData{mediaData: types.MediaData{}, err: err}
			return
		}
	}
	if err := os.Mkdir(fileDest, 0755); err != nil {
		*ch <- channelData{mediaData: types.MediaData{}, err: err}
		return
	}

	cmd := exec.Command("ffmpeg", "-i", filepath, "-c:v", "libx264", "-c:a", "aac", "-b:a", "128k", "-f", "dash", "-seg_duration", "4", "-use_template", "1", "-use_timeline", "1", fileDest+"/manifest.mpd")

	if err = cmd.Run(); err != nil {
		*ch <- channelData{mediaData: types.MediaData{}, err: err}
		if err := os.RemoveAll(fileDest); err != nil {
			*ch <- channelData{mediaData: types.MediaData{}, err: err}
			return
		}
		return
	}

	thumbnail := fileDest + "/thumbnail-" + filename + ".jpg"

	cmd = exec.Command("ffmpeg", "-i", filepath, "-ss", "00:00:10", "-vframes", "1", thumbnail)
	if err = cmd.Run(); err != nil {
		*ch <- channelData{mediaData: types.MediaData{}, err: err}
		if err := os.RemoveAll(fileDest); err != nil {
			*ch <- channelData{mediaData: types.MediaData{}, err: err}
			return
		}
		return
	}

	data := types.MediaData{ Name: filename, Thumbnail: thumbnail, Path: fileDest + "/manifest.mpd"}
	err = saveMediaData(data)
	if err != nil {
		*ch <- channelData{mediaData: types.MediaData{}, err: err}
		if err := os.RemoveAll(fileDest); err != nil {
			*ch <- channelData{mediaData: types.MediaData{}, err: err}
			return
		}
		return
	}
	*ch <- channelData{mediaData: data, err: nil}
}