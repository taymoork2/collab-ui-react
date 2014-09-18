'use strict'

// TODO - break up into UserList/UserAdd/UserPreview
var UsersPage = function(){
  this.searchField = element(by.id('search-input'));
  this.resultUsername = element(by.binding('user.userName'));

  this.listPanel = element(by.id('userslistpanel'));
  this.managePanel = element(by.id('manageUsersPanel'));
  this.squaredPanel = element(by.id('squaredPanel'));
  this.entitlementPanel = element(by.id('entitlementPanel'));
  this.huronPanel = element(by.id('huronPanel'));
  this.conferencePanel = element(by.id('conferencePanel'));
  this.endpointPanel = element(by.id('endpointPanel'));
  this.entitlementCol = element(by.id('entitlementCol'));
  this.previewPanel = element(by.id('details-panel'));
  this.previewName = element(by.id('name-preview'));

  this.addUsers = element(by.id('addUsers'));
  this.addUsersField = element(by.id('usersfield'));
  this.closeAddUsers = element(by.id('closeAddUser'));
  this.invalid = element(by.css('.invalid'));
  this.close = element(by.css('.close'));

  this.manageCallInitiation = element(by.id('btn_squaredCallInitiation')); // on add users
  this.manageSquaredTeamMember = element(by.id('btn_squaredTeamMember'));
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

  this.currentPage = element(by.css('.pagination-current a'));
  this.queryCount = element.all(by.repeater('user in queryuserslist'));
  this.nextPage = element(by.id('next-page'));
  this.prevPage = element(by.id('prev-page'));
  this.queryResults = element(by.id('queryresults'));
  this.iCheck = element(by.css('.iCheck-helper'));

  this.moreOptions = element(by.id('userMoreOptions'));
  this.settingsBar = element(by.id('setting-bar'));
  this.exportButton = element(by.id('export-btn'));
  this.logoutButton = element(by.id('logout-btn'));
  this.userNameCell = element(by.id('userNameCell'));
  this.checkBoxEnts = element.all(by.css('.details-body .icheckbox_square-blue'));
  this.fusionCheckBox = element(by.id('chk_squaredFusionUC'));
  this.iconSearch = element(by.id('icon-search'));

  this.assertSorting = function(nameToSort){
    this.queryResults.getAttribute('value').then(function(value) {
        var queryresults = parseInt(value, 10);
        if (queryresults > 1) {
          //get first user
          var user = null;
          element.all(by.repeater('user in queryuserslist')).then(function(rows) {
            user = rows[0].getText();
          });
          //Click on username sort and expect the first user not to be the same
          element(by.id(nameToSort)).click().then(function() {
            element.all(by.repeater('user in queryuserslist')).then(function(rows) {
              expect(rows[0].getText()).not.toBe(user);
            });
          });
        }
      });
  };

  this.assertPage = function(page){
    expect(this.currentPage.getText()).toBe(page);
  };

  this.assertResultsLength = function(results) {
    element.all(by.repeater('user in queryuserslist')).then(function(rows){
      if(results == 20)
      {
        expect(rows.length).toBeLessThanOrEqualTo(results);
      }
      else if(results == 0)
      {
        expect(rows.length).toBeGreaterThan(results);
      }
      else
      {
        expect(rows.length).toBe(results);
      }
    });
  };

  this.assertError = function(msg1, msg2){
    utils.expectIsDisplayed(this.errorAlert);
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
    utils.expectIsDisplayed(this.successAlert);
    this.successAlert.click();
    if (msg1){
      expect(this.successBody.getText()).toContain(msg1);
    }
    if (msg2) {
      expect(this.successBody.getText()).toContain(msg2);
    }
    this.notificationCancel.click();
  };

  this.search = function(query, size){
    this.searchField.clear();
    browser.sleep(500);
    this.searchField.sendKeys(query);
    browser.sleep(1000);
    element.all(by.repeater('user in queryuserslist')).then(function(rows) {
      if(size){
        expect(rows.length).toBe(size);
      }
      else{
        expect(rows.length).toBe(1);
      }
    });
  };

  this.assertEntitlementListSize = function (size) {
    element.all(by.css('.details-body .icheckbox_square-blue')).then(function(items) {
      expect(items.length).toBe(size);
    });
  };
};

module.exports = UsersPage;
