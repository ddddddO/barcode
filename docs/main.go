package main

import (
	"encoding/base64"
	"fmt"
	"syscall/js" // nolint

	"github.com/ddddddO/barcode"
)

func main() {
	c := make(chan struct{}, 0)
	println("barcode WebAssembly Initialized")
	registerCallbacks()
	<-c
}

func registerCallbacks() {
	js.Global().Set("genBarcode", js.FuncOf(genBarcode))
}

func genBarcode(this js.Value, args []js.Value) interface{} {
	if len(args) < 3 {
		alert("required 3 args")
		return nil
	}
	input := args[0].String()
	codeType := args[1].String()
	imgID := args[2].String()
	code, err := barcode.GenerateCode(codeType, input)
	if err != nil {
		alert(err.Error())
		return nil
	}
	document := js.Global().Get("document")
	if document.IsNull() {
		alert("document is nil")
		return nil
	}
	img := document.Call("getElementById", fmt.Sprintf("Img-%s", imgID))
	if img.IsNull() {
		alert("img is nil")
		return nil
	}
	base64PNG := base64.StdEncoding.EncodeToString(code)
	src := fmt.Sprintf("data:image/png;base64, %s", base64PNG)
	img.Set("src", src)

	return nil
}

func alert(msg string) {
	js.Global().Call("alert", msg)
}
