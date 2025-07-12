package main

import (
	"embed"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net/http"
)

// プロジェクトルートのdocsを参照するのは無理そうなので、このファイルと同階層にdocsディレクトリからコピーしたものを配置している
// ref: https://pkg.go.dev/embed#hdr-Directives

//go:embed docs/*
var staticFiles embed.FS

func main() {
	var port string
	flag.StringVar(&port, "port", "8080", "Specify port")
	flag.Parse()

	log.Printf("Launch barcode web server (:%s)", port)

	contents, err := fs.Sub(staticFiles, "docs")
	if err != nil {
		log.Fatalln(err)
	}

	fsHandler := http.FileServer(http.FS(contents))
	http.Handle("/", fsHandler)
	log.Fatalln(http.ListenAndServe(fmt.Sprintf(":%s", port), nil))
}
