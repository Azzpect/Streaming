package controller

import (
	"encoding/json"
	"net/http"
	"os"
	"streamer/types"
)


type bodyData struct {
	MediaPath string	`json:"path"`
}


func SaveMediaPath(w http.ResponseWriter, r *http.Request) {

	var data bodyData

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		json.NewEncoder(w).Encode(types.Response{Status: "error", Message: "Can't parse request body"})
		return
	}

	var userData types.UserData

	if _, err := os.Stat("userData.json"); err != nil {
		os.Create("userData.json")
		userData = types.UserData{MediaPath: ""}
	} else {
		fileData, err := os.ReadFile("userData.json");
		if err != nil {
			json.NewEncoder(w).Encode(types.Response{Status: "error", Message: "Error opening user data file."})
			return
		}

		if err = json.Unmarshal(fileData, &userData); err != nil {
			json.NewEncoder(w).Encode(types.Response{Status: "error", Message: "Error decoding user data file."})
			return
		}
	}

	userData.MediaPath = data.MediaPath
	jsonData, err := json.MarshalIndent(userData, "", "	");
	if err != nil {
		json.NewEncoder(w).Encode(types.Response{Status: "error", Message: "Error encoding user data."})
		return
	}

	if err := os.WriteFile("userData.json", jsonData, 0644); err != nil {
		json.NewEncoder(w).Encode(types.Response{Status: "error", Message: "Error saving user data."})
		return
	}

	json.NewEncoder(w).Encode(types.Response{Status: "success", Message: "User preference saved."})

}