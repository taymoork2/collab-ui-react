describe('Protractor Demo App', function () {
  it('should redirect to digitalriver', function () {
    //login.login('pbr-admin', '#/drLoginForward');

    browser.get('#/drLoginForward');
    var loginButton = element(by.css('[ng-click="login()"]'));
    loginButton.click();
    browser.driver.sleep(2000);

    var emailElement = element(by.id('IDToken1'));
    emailElement.sendKeys('sqtest-admin@squared.example.com');
    //    browser.driver.sleep(1000);

    var emailButton = element(by.id('IDButton2'));
    emailButton.click();
    browser.driver.sleep(2000);

    var passwordElement = element(by.id('IDToken2'));
    passwordElement.sendKeys('P@ssword123');
    browser.driver.sleep(1000);

    var signinButton = element(by.id('Button1'));
    signinButton.click();
    browser.driver.sleep(5000);

    expect(browser.getCurrentUrl()).toContain('digitalriver');

  });
});
