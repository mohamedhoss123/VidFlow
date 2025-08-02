package config

type Resolution struct {
	VideoBitrate string
	Width        int
	Height       int
}

var Resolutions = map[string]Resolution{
	"144p": {
		VideoBitrate: "200k",
		Width:        256,
		Height:       144,
	},
	"360p": {
		VideoBitrate: "800k",
		Width:        640,
		Height:       360,
	},
	"720p": {
		VideoBitrate: "2500k",
		Width:        1280,
		Height:       720,
	},
}
