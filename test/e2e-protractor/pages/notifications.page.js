'use strict'

var Notifications = function(){
  this.errorAlert = element(by.css('.alertify-log-error'));
  this.successAlert = element(by.css('.alertify-log-success'));

  this.notificationCancel = element(by.id('notifications-cancel'));
  this.smallNotificationCancel = element(by.id('small-notification-cancel'));

  this.assertError = function(msg1, msg2){
    utils.expectIsDisplayed(this.errorAlert);
    this.errorAlert.click();
    if (msg1){
      expect(element(by.cssContainingText('.panel-danger-body', msg1)).isDisplayed()).toBeTruthy();
    }
    if (msg2){
      expect(element(by.cssContainingText('.panel-danger-body', msg2)).isDisplayed()).toBeTruthy();
    }
    this.notificationCancel.click();
  };

  this.assertSuccess = function(msg1, msg2){
    utils.expectIsDisplayed(this.successAlert);
    this.successAlert.click();
    if (msg1){
      expect(element(by.cssContainingText('.panel-success-body', msg1)).isDisplayed()).toBeTruthy();
    }
    if (msg2) {
      expect(element(by.cssContainingText('.panel-success-body', msg2)).isDisplayed()).toBeTruthy();
    }
    if (msg1 || msg2){
      this.notificationCancel.click();
    }
  };

  this.clearNotifications = function() {
    var notifications = element.all(by.id('small-notification-cancel'));
    if(notifications.length > 0 ) {
      notifications.then(function(notifications){
        for(var idx in notifications){
          notifications[idx].click();
        }
      });
    }
  };
};

module.exports = Notifications;
