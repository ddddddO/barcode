const go = new Go();
let mod, instance;
WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject).then((result) => {
    mod = result.module;
    instance = result.instance;

    go.run(instance);
    instance = WebAssembly.instantiate(mod, go.importObject);
});

const callGenBarcode = (input, imgId) => {
    if (input.length === 0) {
        document.getElementById(`Img-${imgId}`).setAttribute('src', '');

        return;
    }

    genBarcode(input, "code128", imgId);
};

const user = document.getElementById("staticInput_1_1")
const password = document.getElementById("staticInput_1_2")
const url = document.getElementById("staticInput_1_3")


const handleGenQRForURL = () => {
    if (url.value.length === 0) {
        document.getElementById('Img-URL').setAttribute('src', '');

        return;
    }

    try {
        const u = new URL(url.value);
        u.username = user.value;
        u.password = password.value;
        genBarcode(`${u.toString()}`, "qr", "URL");
    } catch (err) {
        alert(err);
        return;
    }
}

[user, password, url].forEach((elm) => {
    elm.addEventListener('input', function(e) {
        handleGenQRForURL();
    })
});

const toggleImageButton = document.getElementById('toggle-button');
const urlImage = document.getElementById('Img-URL');

toggleImageButton.addEventListener('click', function() {
    if (urlImage.src === "") {
        return;
    }

    if (urlImage.style.display === 'none') {
        urlImage.style.display = 'block';
        toggleImageButton.textContent = '認証情報が画像にあるかも！ここ押して隠して';
    } else {
        urlImage.style.display = 'none';
        toggleImageButton.textContent = '画像を表示する';
    }
});

// バーコードを目立たせるところ
document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.querySelector('.form-section');
  const images = gallery.querySelectorAll('img');

  images.forEach(img => {
    img.addEventListener('mouseenter', () => {
      // マウスオーバー時に親要素にクラスを追加
      gallery.classList.add('dim-others');
    });

    img.addEventListener('mouseleave', () => {
      // マウスが画像から離れたらクラスを削除
      gallery.classList.remove('dim-others');
    });
  });
});