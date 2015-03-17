'use strict';

var InvitePage = function () {
  this.inviteLauncher = element(by.id('invitelauncher'));

  this.expectWebClient = function (urlparams) {
    browser.driver.wait(function () {
      return browser.driver.isElementPresent(by.id('sign-in-button'));
    });
    expect(browser.driver.getCurrentUrl()).toContain(config.webClientURL);
    if (urlparams) {
      expect(browser.driver.getCurrentUrl()).toContain(urlparams);
    }
  };
};

module.exports = InvitePage;
