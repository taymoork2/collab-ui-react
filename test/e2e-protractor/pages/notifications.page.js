'use strict';

var Notifications = function () {
  this.errorAlert = element(by.css('.alertify-log-error'));
  this.successAlert = element(by.css('.alertify-log-success'));

  this.notificationCancel = element.all(by.id('notifications-cancel')).first();
  this.smallNotificationCancel = element(by.id('small-notification-cancel'));

  this.assertError = function (msg1, msg2) {
    utils.expectIsDisplayed(this.errorAlert);
    utils.click(this.errorAlert);
    if (msg1) {
      expect(element.all(by.cssContainingText('.panel-danger-body', msg1)).first().isDisplayed()).toBeTruthy();
    }
    if (msg2) {
      expect(element.all(by.cssContainingText('.panel-danger-body', msg2)).first().isDisplayed()).toBeTruthy();
    }
    utils.click(this.notificationCancel);
  };

  this.assertSuccess = function (msg1, msg2) {
    utils.expectIsDisplayed(this.successAlert);
    utils.click(this.successAlert);
    if (msg1) {
      utils.expectIsDisplayed(element.all(by.cssContainingText('.panel-success-body', msg1)).first());
    }
    if (msg2) {
      utils.expectIsDisplayed(element.all(by.cssContainingText('.panel-success-body', msg2)).first());
    }
    if (msg1 || msg2) {
      utils.click(this.notificationCancel);
    }
  };

  this.clearNotifications = function () {
    var notifications = element.all(by.id('small-notification-cancel'));
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
