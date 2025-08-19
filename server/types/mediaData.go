package types

type MediaData struct {
	Thumbnail string `json:"thumbnail"`
	Path      string `json:"path"`
}

type Directory struct {
	Files          map[string]MediaData `json:"files"`
	SubDirectories map[string]Directory `json:"sub-directories"`
}
