import { test, expect } from '@playwright/test';
import { notDeepEqual } from 'assert';

test.describe('Test on the initial page', () => {
  test('check input of each forms and reload', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    const userForm = page.locator('#staticInput_1_1');
    userForm.fill('dddo');
    await expect(userForm).toHaveValue('dddo');
    const passwordForm = page.locator('#staticInput_1_2');
    passwordForm.fill('paspaspasa');
    await expect(passwordForm).toHaveValue('paspaspasa');
    const urlForm = page.locator('#staticInput_1_3');
    urlForm.fill('https://github.com');
    await expect(urlForm).toHaveValue('https://github.com');
    await expect(page.locator('#Img-URL')).toBeVisible();

    // barcode x 2
    const addBarcodeButton = page.locator('#addInputButton');
    addBarcodeButton.click();
    addBarcodeButton.click();
    const barcodeForm1 = page.locator('#\\31');
    barcodeForm1.fill('testtest');
    await expect(barcodeForm1).toHaveValue('testtest');
    const deleteButton1 = page.locator('#delete-button-1');
    await expect(deleteButton1).toContainText('削除');
    const barcode1 = page.locator('#Img-1');
    await expect(barcode1).toBeVisible();

    const barcodeForm2 = page.locator('#\\32');
    barcodeForm2.fill('1234567890');
    await expect(barcodeForm2).toHaveValue('1234567890');
    const deleteButton2 = page.locator('#delete-button-2');
    await expect(deleteButton2).toContainText('削除');
    const barcode2 = page.locator('#Img-2');
    await expect(barcode2).toBeVisible();

    // reload
    const reloadURL = page.url();
    expect(reloadURL).toEqual('http://localhost:8080/?url=https%3A%2F%2Fgithub.com&i1=testtest&i2=1234567890');
    await page.goto(reloadURL);

    // user/password が入ってないこと
    const reloadedUserForm = page.locator('#staticInput_1_1');
    await expect(reloadedUserForm).toBeEmpty();
    const reloadedPasswordForm = page.locator('#staticInput_1_2');
    await expect(reloadedPasswordForm).toBeEmpty();
    const reloadedUrlForm = page.locator('#staticInput_1_3');
    await expect(reloadedUrlForm).toHaveValue('https://github.com');

    // バーコードの入力値が入ってること
    const reloadedBarcodeForm1 = page.locator('#\\31');
    await expect(reloadedBarcodeForm1).toHaveValue('testtest');
    const reloadedBarcodeForm2 = page.locator('#\\32');
    await expect(reloadedBarcodeForm2).toHaveValue('1234567890');
    const reloadedBarcodeForm3 = page.locator('#\\33');
    await expect(reloadedBarcodeForm3).not.toBeVisible();

    // QRコード・バーコードが表示されていること
    await expect(page.locator('#Img-URL')).toBeVisible();
    await expect(page.locator('#Img-1')).toBeVisible();
    await expect(page.locator('#Img-2')).toBeVisible();
    await expect(page.locator('#Img-3')).not.toBeVisible();
  });

  test('check url error', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    const urlForm = page.locator('#staticInput_1_3');
    urlForm.fill('a');
    await expect(urlForm).toHaveValue('a');
    await expect(page.locator('#errorMessage-url')).toHaveText("TypeError: Failed to construct 'URL': Invalid URL");
    urlForm.fill('http://localhost');
    await expect(urlForm).toHaveValue('http://localhost');
    await expect(page.locator('#errorMessage-url')).not.toBeVisible();
    urlForm.fill('https://localhost');
    await expect(urlForm).toHaveValue('https://localhost');
    await expect(page.locator('#errorMessage-url')).not.toBeVisible();
  });

  test('check add barcode button', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    const addBarcodeButton = page.locator('#addInputButton');
    addBarcodeButton.click();
    addBarcodeButton.click();
    addBarcodeButton.click();

    const barcodeForm1 = page.locator('#\\31');
    barcodeForm1.fill('testtest');
    await expect(barcodeForm1).toHaveValue('testtest');
    const barcode1 = page.locator('#Img-1');
    await expect(barcode1).toBeVisible();

    const barcodeForm2 = page.locator('#\\32');
    await expect(barcodeForm2).toBeEmpty();
    const barcode2 = page.locator('#Img-2');
    await expect(barcode2).not.toBeVisible();

    const barcodeForm3 = page.locator('#\\33');
    barcodeForm3.fill('12345');
    await expect(barcodeForm3).toHaveValue('12345');
    const barcode3 = page.locator('#Img-3');
    await expect(barcode3).toBeVisible();

    // reload後、2番目のバーコードフォーム行が出てきていないこと
    await page.goto(page.url());
    const reloadedBarcodeForm1 = page.locator('#\\31');
    await expect(reloadedBarcodeForm1).toHaveValue('testtest');
    const reloadedBarcode1 = page.locator('#Img-1');
    await expect(reloadedBarcode1).toBeVisible();

    const reloadedBarcodeForm2 = page.locator('#\\32');
    await expect(reloadedBarcodeForm2).not.toBeVisible();
    const reloadedBarcode2 = page.locator('#Img-2');
    await expect(reloadedBarcode2).not.toBeVisible();

    const reloadedBarcodeForm3 = page.locator('#\\33');
    await expect(reloadedBarcodeForm3).toHaveValue('12345');
    const reloadedBarcode3 = page.locator('#Img-3');
    await expect(reloadedBarcode3).toBeVisible();
  });

  test('check removing row', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    const addBarcodeButton = page.locator('#addInputButton');
    addBarcodeButton.click();

    const barcodeForm1 = page.locator('#\\31');
    barcodeForm1.fill('4971633002005');
    await expect(barcodeForm1).toHaveValue('4971633002005');
    const deleteButton1 = page.locator('#delete-button-1');
    await expect(deleteButton1).toContainText('削除');
    const barcode1 = page.locator('#Img-1');
    await expect(barcode1).toBeVisible();

    // 削除ボタン押下
    deleteButton1.click();
    const deletedBarcodeForm1 = page.locator('#\\31');
    await expect(deletedBarcodeForm1).not.toBeVisible();
    const deletedDeleteButton1 = page.locator('#delete-button-1');
    await expect(deletedDeleteButton1).not.toBeVisible();
    const deletedBarcode1 = page.locator('#Img-1');
    await expect(deletedBarcode1).not.toBeVisible();
  })
});

test.describe('Restore page from URL with query parameters', () => {
  test('check each elements', async ({ page }) => {
    await page.goto('http://localhost:8080/?url=https%3A%2F%2Fgo.dev%2F&i1=4971633002005&i2=ITEM-1234&i3=1A-2B-3C&i4=aaaa&i5=bbb');

    await expect(page).toHaveTitle(/CODECODECODECODECODECODE/);
    
    await expect(page.getByLabel('User:')).toBeEmpty();
    await expect(page.getByLabel('Password:')).toBeEmpty();
    await expect(page.getByLabel('URL:')).toHaveValue('https://go.dev/');

    const toggleButton = page.locator('#toggle-button');
    await expect(toggleButton).toContainText('認証情報が画像にあるかも！ここ押して隠して');
    await expect(page.locator('#Img-URL')).toBeVisible();
    toggleButton.click();
    await expect(page.locator('#Img-URL')).not.toBeVisible();
    await expect(toggleButton).toContainText('画像を表示する');
    toggleButton.click();
    await expect(page.locator('#Img-URL')).toBeVisible();

    const addBarcodeButton = page.locator('#addInputButton');
    await expect(addBarcodeButton).toContainText('バーコード追加');

    const barcodeForm1 = page.locator('#\\31');
    await expect(barcodeForm1).toHaveValue('4971633002005');
    const deleteButton1 = page.locator('#delete-button-1');
    await expect(deleteButton1).toContainText('削除');
    const barcode1 = page.locator('#Img-1');
    await expect(barcode1).toBeVisible();

    const barcodeForm2 = page.locator('#\\32');
    await expect(barcodeForm2).toHaveValue('ITEM-1234');
    const deleteButton2 = page.locator('#delete-button-2');
    await expect(deleteButton2).toContainText('削除');
    const barcode2 = page.locator('#Img-2');
    await expect(barcode2).toBeVisible();

    const barcodeForm3 = page.locator('#\\33');
    await expect(barcodeForm3).toHaveValue('1A-2B-3C');
    const deleteButton3 = page.locator('#delete-button-3');
    await expect(deleteButton3).toContainText('削除');
    const barcode3 = page.locator('#Img-3');
    await expect(barcode3).toBeVisible();

    const barcodeForm4 = page.locator('#\\34');
    await expect(barcodeForm4).toHaveValue('aaaa');
    const deleteButton4 = page.locator('#delete-button-4');
    await expect(deleteButton4).toContainText('削除');
    const barcode4 = page.locator('#Img-4');
    await expect(barcode4).toBeVisible();

    const barcodeForm5 = page.locator('#\\35');
    await expect(barcodeForm5).toHaveValue('bbb');
    const deleteButton5 = page.locator('#delete-button-5');
    await expect(deleteButton5).toContainText('削除');
    const barcode5 = page.locator('#Img-5');
    await expect(barcode5).toBeVisible();
  });

  test('check movement', async ({ page }) => {
    await page.goto('http://localhost:8080/?url=https%3A%2F%2Fgo.dev%2F&i1=4971633002005&i2=ITEM-1234&i3=1A-2B-3C&i4=aaaa&i5=bbb');

    const addBarcodeButton = page.locator('#addInputButton');
    await expect(addBarcodeButton).toContainText('バーコード追加');

    // 新しいバーコード用フォーム追加前
    const nonBarcodeForm = page.locator('#\\36');
    await expect(nonBarcodeForm).not.toBeVisible();
    const nonDeleteButton = page.locator('#delete-button-6');
    await expect(nonDeleteButton).not.toBeVisible();
    const nonBarcode = page.locator('#Img-6');
    await expect(nonBarcode).not.toBeVisible();

    // 新しいバーコード用フォーム追加
    addBarcodeButton.click();
    const addedBarcodeForm = page.locator('#\\36');
    await expect(addedBarcodeForm).toBeVisible();
    const addedDeleteButton = page.locator('#delete-button-6');
    await expect(addedDeleteButton).toContainText('削除');
    const addedBarcode = page.locator('#Img-6');
    await expect(addedBarcode).not.toBeVisible();

    // 追加したバーコードフォームに入力してバーコード生成
    addedBarcodeForm.fill('input text');
    await expect(addedBarcode).toBeVisible();

    // 既存のバーコード行を削除
    const barcodeForm3 = page.locator('#\\33');
    await expect(barcodeForm3).toHaveValue('1A-2B-3C');
    const deleteButton3 = page.locator('#delete-button-3');
    await expect(deleteButton3).toContainText('削除');
    const barcode3 = page.locator('#Img-3');
    await expect(barcode3).toBeVisible();

    deleteButton3.click();
    const deletedBarcodeForm3 = page.locator('#\\33');
    await expect(deletedBarcodeForm3).not.toBeVisible();
    const deletedDeleteButton3 = page.locator('#delete-button-3');
    await expect(deletedDeleteButton3).not.toBeVisible();
    const deletedBarcode3 = page.locator('#Img-3');
    await expect(deletedBarcode3).not.toBeVisible();

    // User/Password に入力する
    const userForm = page.locator('#staticInput_1_1');
    userForm.fill('dddo');
    await expect(userForm).toHaveValue('dddo');
    const passwordForm = page.locator('#staticInput_1_2');
    passwordForm.fill('paspaspasa');
    await expect(passwordForm).toHaveValue('paspaspasa');

    // 最後にURLが意図したものになってるか確認
    expect(page.url()).toEqual('http://localhost:8080/?url=https%3A%2F%2Fgo.dev%2F&i1=4971633002005&i2=ITEM-1234&i4=aaaa&i5=bbb&i6=input+text');
  });

  test('check enlargement and blurring on mouse-over', async ({ page }) => {
    await page.goto('http://localhost:8080/?url=https%3A%2F%2Fgo.dev%2F&i1=4971633002005&i2=ITEM-1234&i3=1A-2B-3C&i4=aaaa&i5=bbb');

    // QRコードにフォーカスして拡大とぼかし確認(目視)
    // const qrcode = page.locator('#Img-URL');
    // qrcode.hover();
    // await expect(qrcode).toBeVisible();

    // 任意のバーコードにフォーカスして拡大とぼかし確認(目視)
    // const barcode3 = page.locator('#Img-3');
    // barcode3.hover();
    // await expect(barcode3).toBeVisible();
  });
});
