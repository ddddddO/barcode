const go = new Go();
let mod, instance;
WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject).then((result) => {
    mod = result.module;
    instance = result.instance;

    go.run(instance);
    instance = WebAssembly.instantiate(mod, go.importObject);
});

const callGenBarcode = (input, imgId) => {
    genBarcode(input, "code128", imgId);
};

const user = document.getElementById("staticInput_1_1")
const password = document.getElementById("staticInput_1_2")
const url = document.getElementById("staticInput_1_3")


const handleGenQRForURL = () => {
    if (url.value.length === 0) {
        return;
    }

    // TODO: ここで失敗したらアラートだす
    const u = new URL(url.value);
    u.username = user.value;
    u.password = password.value;

    genBarcode(`${u.toString()}`, "qr", "URL");
}

[user, password, url].forEach((elm) => {
    elm.addEventListener('input', function(e) {
        handleGenQRForURL();
    })
});

const switchHidden = () => {

}