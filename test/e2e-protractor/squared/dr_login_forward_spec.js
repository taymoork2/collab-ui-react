'use strict';

describe('Digital River Forward with Login to CI', function () {
  it('should redirect to digitalriver', function () {

    browser.get('#/dr-login-forward');

    utils.sendKeys(login.emailField, 'sqtest-admin@squared.example.com');
    login.clickLoginButton();

    browser.driver.wait(login.isLoginPasswordPresent);
    login.setLoginPassword('P@ssword123');
    login.clickLoginSubmit();

    navigation.expectDriverCurrentUrl('www.digitalriver.com');

  });
});
