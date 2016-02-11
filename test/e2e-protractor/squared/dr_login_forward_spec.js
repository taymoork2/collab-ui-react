describe('Digital River Forward with Login to CI', function () {
  it('should redirect to digitalriver', function () {

    browser.get('#/dr-login-forward');
    var loginButton = element(by.css('[ng-click="login()"]'));
    loginButton.click();

    browser.driver.wait(login.isLoginUsernamePresent, TIMEOUT);
    var emailElement = element(by.id('IDToken1'));
    emailElement.sendKeys('sqtest-admin@squared.example.com');

    var emailButton = element(by.id('IDButton2'));
    emailButton.click();

    browser.driver.wait(login.isLoginPasswordPresent, TIMEOUT);
    var passwordElement = element(by.id('IDToken2'));
    passwordElement.sendKeys('P@ssword123');

    var signinButton = element(by.id('Button1'));
    signinButton.click();

    navigation.expectDriverCurrentUrl("www.digitalriver.com");

  });
});
