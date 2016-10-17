/**
 * Created by snzheng on 16/10/12.
 */

'use strict';

var ServiceListPage = function () {
  this.serviceListPage = element(by.css('.serviceList'));
  this.serviceList = element(by.css('.row'));
  this.editServiceModal = element(by.css('.status-edit-service'));
  this.deleteServiceModal = element(by.css('.status-delete-service'));
  this.editButton = element(by.css('.activate-button'));
  this.inputDelete = element(by.css('.cs-input'));
  this.deleteButton = element(by.css('.activate-button'));
};

module.exports = ServiceListPage;
