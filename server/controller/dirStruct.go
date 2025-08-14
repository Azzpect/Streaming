package controller

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"regexp"
)

type DirectoryData struct {
	Name    string `json:"name"`
	DirType string `json:"type"`
}

func GetDirInfo(w http.ResponseWriter, r *http.Request) {
	
	dir := r.URL.Query().Get("dir")

	var dirInfo []os.DirEntry
	var parentPath string

	if dir == "/" {
		parentPath = "/"
	} else {
		parentPath = dir + "/"
	}

	dirInfo, err := os.ReadDir(parentPath)

	if err != nil {
		json.NewEncoder(w).Encode([]string{})
		return
	}


	var dirs []DirectoryData = []DirectoryData{}

	for _, dir := range dirInfo {
		entry := DirectoryData{Name: dir.Name()}

		info, err := os.Stat(parentPath + entry.Name)
		if err != nil {
			continue
		}

		if info.IsDir() {
			entry.DirType = "dir"
		} else {
			if t, err := GetMimeType(parentPath + entry.Name); err != nil {
				entry.DirType = "file"
			} else {
				entry.DirType = t
			}
		}

		dirs = append(dirs, entry)
	}


	json.NewEncoder(w).Encode(dirs)

}

func GetMimeType(path string) (string, error) {
	file, err := os.Open(path)

	if err != nil {
		return "", err
	}

	defer file.Close()

	buf := make([]byte, 512)

	n, err := file.Read(buf)

	if err != nil && err != io.EOF {
		return "", err
	}

	mimeType := http.DetectContentType(buf[:n])

	matched, err := regexp.MatchString("image", mimeType)

	if err != nil {
		return "", err
	}

	if matched {
		return "image", nil
	}

	matched, err = regexp.MatchString("video", mimeType)

	if err != nil {
		return "", err
	}

	if matched {
		return "video", nil
	}

	matched, err = regexp.MatchString("audio", mimeType)

	if err != nil {
		return "", err
	}

	if matched {
		return "audio", nil
	}

	matched, err = regexp.MatchString("text", mimeType)

	if err != nil {
		return "", err
	}

	if matched {
		return "txt", nil
	} else {
		return "file", nil
	}
}
