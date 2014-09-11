'use strict'

// TODO - break up into UserList/UserAdd/UserPreview
var UsersPage = function(){
  this.searchField = element(by.id('search-input'));
  this.resultUsername = element(by.binding('user.userName'));

  this.listPanel = element(by.id('userslistpanel'));
  this.managePanel = element(by.id('manageUsersPanel'));
  this.squaredPanel = element(by.id('squaredPanel'));
  this.entitlementPanel = element(by.id('entitlementPanel'));
  this.entitlementCol = element(by.id('entitlementCol'));
  this.previewPanel = element(by.id('details-panel'));

  this.addUsers = element(by.id('addUsers'));
  this.addUsersField = element(by.id('usersfield'));
  this.closeAddUsers = element(by.id('closeAddUser'));
  this.invalid = element(by.css('.invalid'));
  this.close = element(by.css('.close'));

  this.manageCallInitiation = element(by.id('btn_squaredCallInitiation')); // on add users
  this.callInitiationCheckbox = element(by.css('#chk_squaredCallInitiation')); // on edit user
  this.closePreview = element(by.id('exitPreviewButton'));

  this.subTitleAdd = element(by.id('subTitleAdd'));
  this.subTitleEnable = element(by.id('subTitleEnable'));

  this.inviteButton = element(by.id('btnInvite'));
  this.entitleButton = element(by.id('btnEntitle'));
  this.addButton = element(by.id('btnAdd'));
  this.cancelButton = element(by.id('btnCancel'));
  this.saveButton = element(by.id('btnSave'));

  this.errorAlert = element(by.css('.alertify-log-error'));
  this.errorBody = element(by.css('.panel-danger-body p'));
  this.successAlert = element(by.css('.alertify-log-success'));
  this.successBody = element(by.css('.panel-success-body p'));

  this.notificationCancel = element(by.id('notifications-cancel'));

  this.assertError = function(msg1, msg2){
    expect(this.errorAlert.isDisplayed()).toBeTruthy();
    this.errorAlert.click();
    if (msg1){
      expect(this.errorBody.getText()).toContain(msg1);
    }
    if (msg2){
      expect(this.errorBody.getText()).toContain(msg2);
    }
    this.notificationCancel.click();
  };

  this.assertSuccess = function(msg1, msg2){
    expect(this.successAlert.isDisplayed()).toBeTruthy();
    this.successAlert.click();
    if (msg1){
      expect(this.successBody.getText()).toContain(msg1);
    }
    if (msg2) {
      expect(this.successBody.getText()).toContain(msg2);
    }
    this.notificationCancel.click();
  };

  this.search = function(query){
    this.searchField.clear();
    browser.sleep(500);
    this.searchField.sendKeys(query);
    browser.sleep(1000);
    element.all(by.repeater('user in queryuserslist')).then(function(rows) {
      expect(rows.length).toBe(1);
    });
  };
};

module.exports = UsersPage;