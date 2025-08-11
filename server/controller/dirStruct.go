package controller

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	// "github.com/gorilla/mux"
)

type DirectoryData struct {
	Name    string `json:"name"`
	DirType string `json:"type"`
}

func GetDirInfo(w http.ResponseWriter, r *http.Request) {
	// vars := mux.Vars(r)

	dirInfo, err := os.ReadDir("/")

	if err != nil {
		fmt.Fprintln(w, "Internal server error")
		return
	}

	var dirs []DirectoryData = []DirectoryData{}

	for _, dir := range dirInfo {
		entry := DirectoryData{Name: dir.Name()}

		info, err := os.Stat("/" + entry.Name)
		if err != nil {
			continue
		}

		if info.IsDir() {
			entry.DirType = "dir"
		} else {
			if t, err := getMimeType("/" + entry.Name); err != nil {
				fmt.Println(err)
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
