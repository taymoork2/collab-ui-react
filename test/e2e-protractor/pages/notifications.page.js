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
    var notifications = element.all(by.css('alertify-log'));
    if (notifications.length > 0) {
      notifications.then(function (notifications) {
        for (var idx in notifications) {
          notifications[idx].click();
        }
      });
    }
  };
};

module.exports = Notifications;
