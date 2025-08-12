package controller

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
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
			if t, err := getMimeType(parentPath + entry.Name); err != nil {
				entry.DirType = "file"
			} else {
				entry.DirType = t
			}
		}

		dirs = append(dirs, entry)
	}


	json.NewEncoder(w).Encode(dirs)

}

func getMimeType(path string) (string, error) {
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

	return http.DetectContentType(buf[:n]), nil
}
