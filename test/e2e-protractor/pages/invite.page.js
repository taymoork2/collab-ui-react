'use strict';

var InvitePage = function () {
  var inviteLauncher = element(by.id('invitelauncher'));
  var squaredUrl = 'squared://invitee/?invdata=';

  this.expectWebClient = function (urlparams) {
    browser.driver.wait(function () {
      return browser.driver.isElementPresent(by.id('sign-in-button'));
    });
    expect(browser.driver.getCurrentUrl()).toContain(config.webClientURL);
    if (urlparams) {
      expect(browser.driver.getCurrentUrl()).toContain(urlparams);
    }
  };

  this.expectSquaredProtocol = function () {
    browser.driver.wait(function () {
      return inviteLauncher.isPresent().then(function (isPresent) {
        return isPresent || browser.driver.getCurrentUrl().then(function (currentUrl) {
          return currentUrl.indexOf(squaredUrl) !== -1;
        });
      });
    });
  };
};

module.exports = InvitePage;
