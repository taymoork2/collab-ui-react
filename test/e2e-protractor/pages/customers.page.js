'use strict';

var CustomersPage = function () {

  this.viewCustomer = element(by.id('launchCustomer'));
  this.clickViewCustomer = function (alias) {
    utils.clickUser(alias);
  };
};

module.exports = CustomersPage;
