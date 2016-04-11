'use strict';

/* global log, TIMEOUT */

var Notifications = function () {
  var alert = element(by.css('.toast .toast-close-button'));
  this.errorAlert = element(by.css('.toast-error'));
  this.successAlert = element(by.css('.toast-success'));
  this.assertError = assertError;
  this.assertSuccess = assertSuccess;
  this.clearNotifications = clearNotifications;

  function assertError() {
    var args = [this.errorAlert].concat([].slice.call(arguments));
    utils.expectText.apply(utils, args).then(clearNotifications);
  }

  function assertSuccess() {
    var args = [this.successAlert].concat([].slice.call(arguments));
    utils.expectText.apply(utils, args).then(clearNotifications);
  }

  function clearNotifications() {
    return browser.wait(function () {
      log('Clear outstanding notifications');
      // If a notification is displayed, try to click it
      return alert.isDisplayed().then(function (isDisplayed) {
        log('Clear notification: ' + alert.locator() + '. Is displayed: ' + isDisplayed);
        if (isDisplayed) {
          // The notification may still be animating, so ignore click errors
          alert.click().then(function () {
            log('Clicked: ' + alert.locator());
          }, function (e) {
            log('Failed to click: ' + alert.locator() + '. Error: ' + (e && e.message || e));
          });
        }
        return false;
      }, function (e) {
        log('Alert.isDisplayed error: ' + alert.locator() + '. Error: ' + (e && e.message || e));
        return true;
      });
    }, TIMEOUT);
  }
};

module.exports = Notifications;
