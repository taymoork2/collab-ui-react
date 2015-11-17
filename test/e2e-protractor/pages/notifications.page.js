'use strict';

/* global log, TIMEOUT */

var Notifications = function () {
  var alert = element(by.css('.toast .toast-close-button'));
  this.errorAlert = element(by.css('.toast-error'));
  this.successAlert = element(by.css('.toast-success'));
  this.assertError = assertError;
  this.assertSuccess = assertSuccess;
  this.clearNotifications = clearNotifications;

  function assertError(msg1, msg2) {
    utils.expectText(this.errorAlert, msg1, msg2)
      .then(clearNotifications);
  }

  function assertSuccess(msg1, msg2) {
    utils.expectText(this.successAlert, msg1, msg2)
      .then(clearNotifications);
  }

  function clearNotifications() {
    return browser.wait(function () {
      log('Clear outstanding notifications');
      // If a notification is displayed, try to click it
      return alert.isDisplayed().then(function (isDisplayed) {
        if (isDisplayed) {
          log('Clear notification: ' + alert.locator());
          // The notification may still be animating, so ignore click errors
          alert.click().then(function () {}, function () {});
        }
        return false;
      }, function () {
        return true;
      });
    }, TIMEOUT);
  }
};

module.exports = Notifications;
