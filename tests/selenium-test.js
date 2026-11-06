const { Builder, By, until } = require('selenium-webdriver');

(async function onlineShoppingTest() {
  let driver;
  try {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();
    await driver.get('http://localhost:3000');
    await driver.wait(until.titleContains('ShopEase'), 10000);
    console.log('PASS: Home page loaded successfully.');

    const heading = await driver.findElement(By.css('h1')).getText();
    if (!heading.includes('Everything you need')) throw new Error('Home heading not found.');
    console.log('PASS: Home page heading displayed.');

    await driver.findElement(By.id('search')).sendKeys('Headphones');
    await driver.wait(async () => {
      return await driver.executeScript(
        "return document.querySelector('#product-list').innerText.includes('Wireless Headphones');"
      );
    }, 10000);
    console.log('PASS: Product search works successfully.');

    const addButton = await driver.findElement(By.css('.product-card button'));
    await driver.executeScript('arguments[0].click();', addButton);
    const count = await driver.findElement(By.id('cart-count')).getText();
    if (count !== '1') throw new Error('Product was not added to cart.');
    console.log('PASS: Add to cart works successfully.');
    console.log('SUCCESS: All Selenium tests passed.');
  } catch (error) {
    console.error('FAIL:', error.message);
    process.exitCode = 1;
  } finally {
    if (driver) await driver.quit();
  }
})();
