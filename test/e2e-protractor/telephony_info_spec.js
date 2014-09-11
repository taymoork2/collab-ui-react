'use strict';

var testuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!'
};

// Logging in. Write your tests after the login flow is complete.
describe('Login as non-sso admin user', function() {

  it('should redirect to CI global login page.', function() {
    browser.get('#/login');
    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.css('#IDToken1'));
    }).then(function() {
      expect(browser.driver.getCurrentUrl()).toContain('idbroker.webex.com');
    });
  });

  it('should log in with valid sso admin user and display home page', function() {
    browser.driver.findElement(by.css('#IDToken1')).sendKeys(testuser.username);
    browser.driver.findElement(by.css('#IDButton2')).click();
    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.css('#IDToken2'));
    }).then(function() {
      browser.driver.findElement(by.css('#IDToken2')).sendKeys(testuser.password);
      browser.driver.findElement(by.css('#Button1')).click();
    });

    expect(browser.getCurrentUrl()).toContain('/home');
  });

}); //State is logged-in



// Log Out
describe('Log Out', function() {
  it('should log out', function() {
    element(by.id('setting-bar')).click();
    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.id('logout-btn'));
    }).then(function() {
      element(by.id('logout-btn')).click();
    });
  });
});
