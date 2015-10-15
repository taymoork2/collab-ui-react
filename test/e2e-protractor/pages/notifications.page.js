'use strict';

/* global log, TIMEOUT */

var assertDisplayed = function (elem, message, message2) {
  if (!message) return;
  utils.expectText(elem, message, message2);
};

var Notifications = function () {
  var alert = element(by.css('.toast .toast-close-button'));
  this.errorAlert = element(by.css('.toast-error'));
  this.successAlert = element(by.css('.toast-success'));

  this.assertError = function (msg1, msg2) {
    assertDisplayed(this.errorAlert, msg1, msg2);
    this.clearNotifications();
  };

  this.assertSuccess = function (msg1, msg2) {
    assertDisplayed(this.successAlert, msg1, msg2);
    this.clearNotifications();
  };

  this.clearNotifications = function () {
    browser.wait(function () {
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
  };
};

module.exports = Notifications;
