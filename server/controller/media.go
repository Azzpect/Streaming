package controller

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"runtime"
	"streamer/types"
	"strings"
	"sync"
)

func GetMediaData(w http.ResponseWriter, r *http.Request) {
	var dirData types.Directory = types.Directory{}
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
	err = json.Unmarshal(jsonData, &dirData)
	if err != nil {
		encoder.Encode(types.Response{Status: "error", Message: "Error decoding data."})
		return
	}
	encoder.Encode(map[string]any{"status": "success", "data": dirData})
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

	directoryData := types.Directory{Files: map[string]types.MediaData{}, SubDirectories: map[string]types.Directory{}}
	var wg *sync.WaitGroup = &sync.WaitGroup{}
	wg.Add(1)
	go processDir(userData.MediaPath, "/", &directoryData, wg)

	wg.Wait()

	byteData, err := json.MarshalIndent(directoryData, "", "	")
	if err != nil {
		encoder.Encode(types.Response{Status: "error", Message: "Couldn't encode media details."})
		return
	}
	err = os.WriteFile("mediaData.json", byteData, 0644)
	if err != nil {
		encoder.Encode(types.Response{Status: "error", Message: "Couldn't write media details."})
		return
	}
	encoder.Encode(types.Response{Status: "success", Message: "Media processed successfully."})
}

func processDir(basePath string, dirName string, collection *types.Directory, wg *sync.WaitGroup) {
	defer wg.Done()
	dirInfo, err := os.ReadDir(basePath + dirName)
	if err != nil {
		fmt.Println("Couldn't read media directory.")
	}
	for _, item := range dirInfo {
		if item.IsDir() {
			newDir := types.Directory{Files: map[string]types.MediaData{}, SubDirectories: map[string]types.Directory{}}
			collection.SubDirectories[item.Name()] = newDir
			wg.Add(1)
			go processDir(basePath, dirName + item.Name() + "/", &newDir, wg)
			continue
		}
		mimeType, err := GetMimeType(basePath + dirName + item.Name())
		if err != nil {
			fmt.Println("Couldn't decode the mimetype of the file.", err)
			continue
		}
		if mimeType == "image" || mimeType == "video" {
			nameYear, err := getNameAndYear(item.Name())
			var thumbnail string
			if err != nil {
				filename := item.Name()
				nameYear = map[string]string{"name": strings.Split(filename, ".")[0]}
				filepath := basePath + dirName + filename
				thumbnail, err = generateThumbnail(filepath, filename)
				if err != nil {
					fmt.Println(err)
					continue
				}
			} else {
				thumbnail, err = getThumbnail(nameYear)
				if err != nil {
					filename := item.Name()
					filepath := basePath + dirName + filename
					thumbnail, err = generateThumbnail(filepath, filename)
					if err != nil {
						fmt.Println(err)
						continue
					}
				}
			}
			mediaData := types.MediaData{Path: "/media" + dirName + item.Name(), Thumbnail: thumbnail}
			(*collection).Files[nameYear["name"]] = mediaData
		}
	}
}

func getNameAndYear(filename string) (map[string]string, error) {
	parts := strings.Split(filename, ".")
	if len(parts) < 3 {
		return nil, fmt.Errorf("not enough data")
	}
	return map[string]string{"name": parts[0], "year": parts[1]}, nil
}

func getThumbnail(nameYear map[string]string) (string, error) {

	api_url := os.Getenv("API_URL")
	api_key := os.Getenv("API_KEY")
	res, err := http.Get(api_url + "/?apikey=" + api_key + "&t=" + url.QueryEscape(nameYear["name"]) + "&y=" + url.QueryEscape(nameYear["year"]))

	if err != nil {
		return "", err
	}

	defer res.Body.Close()

	var data map[string]any

	body, err := io.ReadAll(res.Body)

	if err != nil {
		return "", err
	}

	err = json.Unmarshal(body, &data)
	if err != nil {
		return "", err
	}

	poster, ok := data["Poster"].(string)
	if !ok {
		return "", fmt.Errorf("wrong poster data")
	}

	return poster, nil

}

func generateThumbnail(filepath string, filename string) (string, error) {

	_, err := os.ReadDir("thumbnails")
	if os.IsNotExist(err) {
		os.Mkdir("thumbnails", 0755)
	}
	thumbnailPath := "thumbnails/" + filename + "-thumbnail.jpg"

	var cmd *exec.Cmd

	if runtime.GOOS == "windows" {
		cmd = exec.Command("./bin/ffmpeg.exe", "-i", filepath, "-ss", "00:00:10", "-vframes", "1", thumbnailPath)
	} else {
		cmd = exec.Command("./bin/ffmpeg", "-i", filepath, "-ss", "00:00:10", "-vframes", "1", thumbnailPath)
	}

	err = cmd.Run()

	if err != nil {
		return "", err
	}

	return thumbnailPath, nil
}
