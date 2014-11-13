var testuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!',
};

describe('Login Page', function() {

  it('should open the login page', function() {
    browser.get('#/login');
    expect(login.loginButton.isDisplayed()).toBeTruthy();
    expect(browser.driver.getCurrentUrl()).toContain('#/login');
  });

  it('should redirect to login page when not logged in', function() {
    browser.get('#/users');
    expect(login.loginButton.isDisplayed()).toBeTruthy();
    expect(browser.driver.getCurrentUrl()).toContain('#/login');
  });

  it('should redirect to idbroker when clicked login button', function() {
    login.loginButton.click();
    browser.driver.wait(login.isLoginUsernamePresent);
    expect(browser.driver.getCurrentUrl()).toContain('idbroker.webex.com');
  });
  it('should not log in with invalid credentials', function() {
    expect(login.isLoginUsernamePresent()).toBeTruthy();
    login.setLoginUsername(testuser.username);
    login.clickLoginNext();
    browser.driver.wait(login.isLoginPasswordPresent);
    login.setLoginPassword('fakePassword');
    login.clickLoginSubmit();
    login.assertLoginError('You\'ve entered an incorrect email address or password.');
    expect(browser.driver.getCurrentUrl()).toContain('idbroker.webex.com');
  });

  it('should login to the requested users page', function() {
    login.setLoginPassword(testuser.password);
    login.clickLoginSubmit();
    //TODO this needs to be fixed, should redirect to users page
    navigation.expectCurrentUrl('/home');
  });

  it('should logout', function() {
    navigation.logout();
  });

}); //State is logged-in