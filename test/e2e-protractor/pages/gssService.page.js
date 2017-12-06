'use strict'

var GSSServicePage = function () {
  this.serviceNameText = 'new service';
  this.serviceNameEditText = 'edit service';
  this.serviceDescText = 'new service description'
  this.serviceSelector = element(by.css('#serviceSelector'));
  this.tabLink = element(by.css('a[href="/gss/services"]'));
  this.serviceSelectorFirstChild = element(by.css('.gss-iframe .select-options li a'));
  this.serviceSelectorLastChild = element(by.css('.select-list .dropdown-menu ul li:last-child'));

  this.addModalTitle = element(by.cssContainingText('.modal-title', 'New Service'));
  this.addServiceNameInputObj = element(by.model('addServiceCtrl.serviceName'));
  this.addServiceDescInputObj = element(by.model('addServiceCtrl.serviceDesc'));
  this.addServiceBtn = element(by.css('.add-service-page .modal-footer .btn--primary'));

  this.serviceList = element.all(by.cssContainingText('.services-page ul li', this.serviceNameText));
  this.serviceEditBtn = element.all(by.cssContainingText('.services-page ul li', this.serviceNameText)).first().element(by.cssContainingText('a', 'Edit'));
  this.serviceDeleteBtn = element.all(by.cssContainingText('.services-page ul li', this.serviceNameEditText)).first().element(by.cssContainingText('a', 'Delete'));
  this.updateModalTitle = element(by.cssContainingText('.modal-title', 'Edit Service'));
  this.updateServiceNameInputObj = element(by.model('editServiceCtrl.serviceName'));
  this.updateServiceBtn = element(by.css('.edit-service-page .modal-footer .btn--primary'));

  this.deleteModalInput = element(by.model('deleteServiceCtrl.confirmText'));
  this.deleteBtn = element(by.css('.delete-service-page .btn--negative'));

  this.clickService = function () {
    navigation.clickGSSTab();
    utils.click(this.tabLink);
    navigation.expectCurrentUrl('/gss/services');
  }
}

module.exports = GSSServicePage;
