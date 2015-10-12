'use strict';

var assertDisplayed = function (elem, message) {
  if (!message) return;
  utils.expectText(elem, message);
};

var Notifications = function () {
  var alert = element(by.css('.toast .toast-close-button'));
  this.errorAlert = element(by.css('.toast-error'));
  this.successAlert = element(by.css('.toast-success'));
  this.closeButton = element(by.css('.toast-close-button'));

  this.assertError = function (msg1, msg2) {
    utils.wait(this.errorAlert).then(function () {
      assertDisplayed(this.errorAlert, msg1);
      assertDisplayed(this.errorAlert, msg2);
      utils.click(this.errorAlert.element(this.closeButton.locator()));
    }.bind(this));
  };

  this.assertSuccess = function (msg1, msg2) {
    utils.wait(this.successAlert).then(function () {
      assertDisplayed(this.successAlert, msg1);
      assertDisplayed(this.successAlert, msg2);
      utils.click(this.successAlert.element(this.closeButton.locator()));
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
