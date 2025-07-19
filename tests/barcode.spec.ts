import { test, expect } from '@playwright/test';

test.describe('Restore page from URL with query parameters', () => {
  test('check each elements', async ({ page }) => {
    await page.goto('http://localhost:8080/?url=https%3A%2F%2Fgo.dev%2F&i1=4971633002005&i2=ITEM-1234&i3=1A-2B-3C&i4=aaaa&i5=bbb');

    await expect(page).toHaveTitle(/CODECODECODECODECODECODE/);
    
    await expect(page.getByLabel('User:')).toHaveValue('');
    await expect(page.getByLabel('Password:')).toHaveValue('');
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
    const qrcode = page.locator('#Img-URL');
    qrcode.hover();
    await expect(qrcode).toBeVisible();    

    // 任意のバーコードにフォーカスして拡大とぼかし確認(目視)
    const barcode3 = page.locator('#Img-3');
    barcode3.hover();
    await expect(barcode3).toBeVisible();
  });
});
