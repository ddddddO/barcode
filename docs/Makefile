build:
	GOOS=js GOARCH=wasm go build -o main.wasm main.go

serve:
	python3 -m http.server 8080

cpwasmexec:
	cp $(shell tinygo env TINYGOROOT)/targets/wasm_exec.js .

cpgowasmexec:
	cp $(shell go env GOROOT)/lib/wasm/wasm_exec.js .

credit:
	gocredits ../ > ../CREDITS