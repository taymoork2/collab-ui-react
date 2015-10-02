'use strict';

var assertDisplayed = function (cssSelector, message) {
  if (!message) return;
  expect(element.all(by.cssContainingText(cssSelector, message)).first().isDisplayed()).toBeTruthy();
};

var Notifications = function () {
  var alert = element(by.css('.toast .toast-close-button'));
  this.errorAlert = element(by.css('.toast-error .toast-close-button'));
  this.successAlert = element(by.css('.toast-success .toast-close-button'));

  this.assertError = function (msg1, msg2) {
    utils.wait(this.errorAlert).then(function () {
      assertDisplayed('.toast-error', msg1);
      assertDisplayed('.toast-error', msg2);
      this.errorAlert.click();
    }.bind(this));
  };

  this.assertSuccess = function (msg1, msg2) {
    utils.wait(this.successAlert).then(function () {
      assertDisplayed('.toast-success', msg1);
      assertDisplayed('.toast-success', msg2);
      this.successAlert.click();
    }.bind(this));
  };

  this.clearNotifications = function () {
    browser.wait(function () {
      // If a notification is displayed, try to click it
      return alert.isDisplayed().then(function (isDisplayed) {
        if (isDisplayed) {
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
