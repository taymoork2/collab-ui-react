'use strict';

var CustomersPage = function () {

  this.viewCustomer = element(by.id('launchCustomer'));

  this.clickViewCustomer = function (alias) {
    utils.clickUser(alias);
  };

  this.username = element(by.css('li.user-name'));

  this.checkLoggedinUsername = function (emailAlias) {
    browser.getAllWindowHandles().then(function (handles) {
      var newTabHandle = handles[1];
      browser.switchTo().window(newTabHandle).then(function () {
        utils.expectText(global.customers.username, emailAlias);
      });
    });
  };
};

module.exports = CustomersPage;