const updateURLWithQueryParams = (currentParams) => {
    const newQueryString = currentParams.toString();
    const newUrl = window.location.pathname + '?' + newQueryString + window.location.hash;
    window.history.replaceState({ path: newUrl }, '', newUrl);
}

const callGenBarcode = (input, imgId) => {
    if (input.length === 0) {
        document.getElementById(`Img-${imgId}`).setAttribute('src', '');

        return;
    }

    genBarcode(input, "code128", imgId);
};

const currentParams = new URLSearchParams(window.location.search);

let inputCounter = 0;
const addButton = document.getElementById('addInputButton');
const inputContainer = document.getElementById('inputContainer');
const handleInputEvent = (e) => {
    const input = e.target.value;
    const imgId = e.target.id;

    // クエリパラメータに追加するか消すか
    const key = `i${imgId}`;
    if (input.length === 0) {
        currentParams.delete(key);
    } else {
        currentParams.set(key, input);
    }
    updateURLWithQueryParams(currentParams);

    callGenBarcode(input, imgId);
}

const user = document.getElementById("staticInput_1_1")
const password = document.getElementById("staticInput_1_2")
const url = document.getElementById("staticInput_1_3")

const handleGenQRForURL = () => {
    const key = `url`

    if (url.value.length === 0) {
        currentParams.delete(key);
        updateURLWithQueryParams(currentParams);
        document.getElementById('Img-URL').setAttribute('src', '');
        hideErrorMessage('url');
        return;
    }

    switch (url.value) {
        case 'h':
        case 'ht':
        case 'htt':
        case 'http':
        case 'http:':
        case 'http:/':
        case 'http://':
        case 'https':
        case 'https:':
        case 'https:/':
        case 'https://':
            currentParams.delete(key);
            updateURLWithQueryParams(currentParams);
            document.getElementById('Img-URL').setAttribute('src', '');
            hideErrorMessage('url');
            return;
    }

    try {
        const u = new URL(url.value);
        u.username = user.value;
        u.password = password.value;
        genBarcode(`${u.toString()}`, "qr", "URL");
        hideErrorMessage('url');
    } catch (err) {
        currentParams.delete(key);
        updateURLWithQueryParams(currentParams);
        document.getElementById('Img-URL').setAttribute('src', '');
        showErrorMessage('url', err);
        return;
    }
    // user/passwordが入力されたときは、urlは以前と変わらないから
    // また、user/passwordは認証情報で共有されると危ないので、クエリパラメータに保持しない
    const preURL = currentParams.get(key);
    if (preURL !== url.value) {
        currentParams.set(key, url.value);
        updateURLWithQueryParams(currentParams);
    }

}

[user, password, url].forEach((elm) => {
    elm.addEventListener('input', function(e) {
        handleGenQRForURL();
    })
});

// クエリパラメータからページ復元
document.addEventListener('DOMContentLoaded', function() {
    const go = new Go();
    let mod, instance;
    WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject).then((result) => {
        mod = result.module;
        instance = result.instance;

        go.run(instance);
        instance = WebAssembly.instantiate(mod, go.importObject);

        // wasmで定義してる関数のloadが終わってないとダメなので以降の処理はこの位置にある
        if (typeof window.genBarcode !== 'function') {
            return;
        }

        const queryString = window.location.search;
        if (!queryString) {
            return;
        }

        let url = '';
        let barcodes = [];
        let maxInputCounter = 0;
        const params = new URLSearchParams(queryString);
        for (const [key, value] of params.entries()) {
            if (key === 'url') {
                url = value;
                continue;
            }

            // バーコードフォームの入力とみなす
            if (key.startsWith('i')) {
                const registeredInputCounter = Number(key.substring(1));
                if (registeredInputCounter > maxInputCounter) {
                    maxInputCounter = registeredInputCounter;
                }

                barcodes.push({ inputCounter: registeredInputCounter, barcode: value});
                continue;
            }
        }

        for (let i = 1; i <= maxInputCounter; i++) {
            const registeredBarcode = barcodes.find((barcode) => barcode.inputCounter === i);

            // TODO: 以降からだいぶかぶってる
            inputCounter++;

            const inputGroup = document.createElement('div');
            inputGroup.className = 'input-group';

            const input = document.createElement('input');
            input.type = 'text';
            input.inputMode = 'latin';
            input.id = `${inputCounter}`;
            input.name = `${inputCounter}`;
            input.placeholder = `コード生成元文字列をどうぞ！`;
            input.value = registeredBarcode?.barcode ?? '';
            input.addEventListener('input', handleInputEvent);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '削除';
            deleteButton.className = 'delete-button';

            deleteButton.addEventListener('click', function() {
                const key = `i${input.id}`;
                currentParams.delete(key);
                updateURLWithQueryParams(currentParams);

                inputContainer.removeChild(inputGroup);
            });

            const img = document.createElement('img');
            img.id = `Img-${inputCounter}`

            const gallery = document.querySelector('.form-section');
            img.addEventListener('mouseenter', () => {
                // マウスオーバー時に親要素にクラスを追加
                gallery.classList.add('dim-others');
            });
            img.addEventListener('mouseleave', () => {
                // マウスが画像から離れたらクラスを削除
                gallery.classList.remove('dim-others');
            });

            inputGroup.appendChild(input);
            inputGroup.appendChild(deleteButton);
            inputGroup.appendChild(img);

            inputContainer.appendChild(inputGroup);

            // documentにimg追加後でないとgo側でimg取得できないみたいなので最後に処理
            if (registeredBarcode !== undefined) {
                genBarcode(registeredBarcode.barcode, "code128", inputCounter.toString());                
            } else {
                // クエリパラメータにないiN番目のバーコード用フォームが空で出てしまう
                // それでもいいけど、もしかしたらユーザーはあれ？と思うかもしれないので消しておく
                inputContainer.removeChild(inputGroup);
            }
        }

        if (url.length > 0) {
            const urlForm = document.getElementById('staticInput_1_3');
            urlForm.value = url;
            genBarcode(url, 'qr', 'URL');
        }
    });
});

// TODO: ↑とだいぶかぶってる
addButton.addEventListener('click', function() {
    inputCounter++;

    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';

    const input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'latin';
    input.id = `${inputCounter}`;
    input.name = `${inputCounter}`;
    input.placeholder = `コード生成元文字列をどうぞ！`;
    input.addEventListener('input', handleInputEvent);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.className = 'delete-button';

    deleteButton.addEventListener('click', function() {
        const key = `i${input.id}`;
        currentParams.delete(key);
        updateURLWithQueryParams(currentParams);

        inputContainer.removeChild(inputGroup);
    });

    const img = document.createElement('img');
    img.id = `Img-${inputCounter}`

    const gallery = document.querySelector('.form-section');
    img.addEventListener('mouseenter', () => {
        // マウスオーバー時に親要素にクラスを追加
        gallery.classList.add('dim-others');
    });
    img.addEventListener('mouseleave', () => {
        // マウスが画像から離れたらクラスを削除
        gallery.classList.remove('dim-others');
    });

    inputGroup.appendChild(input);
    inputGroup.appendChild(deleteButton);
    inputGroup.appendChild(img);

    inputContainer.appendChild(inputGroup);
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

const showErrorMessage = (target, message) => {
    const errorMessageDiv = document.getElementById(`errorMessage-${target}`);
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block'; 
}

const hideErrorMessage = (target) => {
    const errorMessageDiv = document.getElementById(`errorMessage-${target}`);
    errorMessageDiv.textContent = '';
    errorMessageDiv.style.display = 'none';
}
