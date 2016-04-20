'use strict';

/*global TIMEOUT*/

var InvitePage = function () {
  var inviteLauncher = element(by.id('invitelauncher'));
  var squaredUrl = 'squared://invitee/?invdata=';

  this.expectWebClient = function (urlparams) {
    browser.driver.wait(function () {
      return browser.driver.isElementPresent(by.id('sign-in-button'));
    }, TIMEOUT);
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
    }, TIMEOUT);
  };
};

module.exports = InvitePage;
