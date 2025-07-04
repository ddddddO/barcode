package barcode

import (
	"bytes"
	"image/png"

	"github.com/boombuler/barcode"
	"github.com/boombuler/barcode/code128"
	"github.com/boombuler/barcode/qr"
)

func GenerateCode(t string, input string) ([]byte, error) {
	switch t {
	case "qr":
		return QRCode(input)
	case "code128":
		return Barcode128(input)
	default:
		return Barcode128(input)
	}
}

func QRCode(input string) ([]byte, error) {
	qrCode, err := qr.Encode(input, qr.M, qr.Auto)
	if err != nil {
		return nil, err
	}
	qrCode, err = barcode.Scale(qrCode, 130, 130)
	if err != nil {
		return nil, err
	}
	b := &bytes.Buffer{}
	png.Encode(b, qrCode)
	return b.Bytes(), nil
}

func Barcode128(input string) ([]byte, error) {
	barcode128, err := code128.Encode(input)
	if err != nil {
		return nil, err
	}
	scaled, err := barcode.Scale(barcode128, 300, 70)
	if err != nil {
		return nil, err
	}
	b := &bytes.Buffer{}
	png.Encode(b, scaled)
	return b.Bytes(), nil
}
