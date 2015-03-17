'use strict';

var assertDisplayed = function (cssSelector, message) {
  if (!message) return;
  utils.expectIsDisplayed(
    element.all(
      by.cssContainingText(cssSelector, message)
    ).first()
  );
};

var Notifications = function () {
  var alert = element(by.css('.alertify-log'));
  this.errorAlert = element(by.css('.alertify-log-error'));
  this.successAlert = element(by.css('.alertify-log-success'));

  this.assertError = function (msg1, msg2) {
    utils.expectIsDisplayed(this.errorAlert);
    assertDisplayed('.alertify-log-error', msg1);
    assertDisplayed('.alertify-log-error', msg2);
    utils.click(this.errorAlert);
  };

  this.assertSuccess = function (msg1, msg2) {
    utils.expectIsDisplayed(this.successAlert);
    assertDisplayed('.alertify-log-success', msg1);
    assertDisplayed('.alertify-log-success', msg2);
    utils.click(this.successAlert);
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
    });
  };
};

module.exports = Notifications;
