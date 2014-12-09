'use strict'

// TODO - break up into UserList/UserAdd/UserPreview
var UsersPage = function() {
  this.searchButton = element(by.css('.header-search button'));
  this.searchField = element(by.css('.search-form input'));

  this.listPanel = element(by.id('userslistpanel'));
  this.manageDialog = element(by.id('modalContent'));
  this.squaredPanel = element(by.id('conversations-link'));
  this.entitlementPanel = element(by.id('entitlementPanel'));
  this.huronPanel = element(by.id('huronPanel'));
  this.conferencePanel = element(by.id('conferencePanel'));
  this.endpointPanel = element(by.id('endpointPanel'));
  this.previewPanel = element(by.id('details-panel'));
  this.previewName = element(by.id('name-preview'));

  this.addUsers = element(by.id('addUsers'));
  this.addUsersField = element(by.id('usersfield-tokenfield'));
  this.closeAddUsers = element(by.id('closeAddUser'));
  this.invalid = element(by.css('.invalid'));
  this.close = element(by.css('.close'));

  this.manageCallInitiation = element(by.id('chk_squaredCallInitiation')); // on add users
  this.manageSquaredTeamMember = element(by.id('chk_squaredTeamMember'));
  this.callInitiationCheckbox = element(by.id('chk_squaredCallInitiation')); // on edit user
  this.messengerCheckBox = element(by.id('chk_jabberMessenger'));
  this.fusionCheckBox = element(by.id('chk_squaredFusionUC'));
  this.squaredCheckBox = element(by.id('chk_webExSquared'));
  this.squaredUCCheckBox = element(by.id('chk_ciscoUC'));
  this.closePreview = element(by.id('exitPreviewButton'));
  this.closeDetails = element(by.id('exit-details-btn'));

  this.subTitleAdd = element(by.id('subTitleAdd'));
  this.subTitleEnable = element(by.id('subTitleEnable'));

  this.inviteButton = element(by.id('btnInvite'));
  this.entitleButton = element(by.id('btnEntitle'));
  this.addButton = element(by.id('btnAdd'));

  this.cancelButton = element(by.id('btn-cancel'));
  this.saveButton = element(by.id('btn-save'));

  this.clearButton = element(by.id('btnCancel'));

  this.currentPage = element(by.css('.pagination-current a'));
  this.queryCount = element(by.binding('totalResults'));
  this.nextPage = element(by.id('next-page'));
  this.prevPage = element(by.id('prev-page'));
  this.queryResults = element(by.id('queryresults'));

  this.moreOptions = element(by.id('userMoreOptions'));
  this.settingsBar = element(by.id('setting-bar'));
  this.exportButton = element(by.id('export-btn'));
  this.logoutButton = element(by.id('logout-btn'));
  this.userNameCell = element(by.id('userNameCell'));
  this.checkBoxEnts = element.all(by.repeater('(service, val) in entitlements'));
  this.iconSearch = element(by.id('icon-search'));
  this.userListEnts = element.all(by.binding('userName'));
  this.userListStatus = element.all(by.binding('userStatus'));
  this.userListAction = element(by.id('actionsButton'));
  this.actionDropdown = element(by.css('.dropdown-menu'));
  this.resendInviteOption = element(by.id('resendInviteOption'));
  this.gridCell = element(by.css('.ngCell'));

  this.assertSorting = function(nameToSort) {
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

  this.assertPage = function(page) {
    expect(this.currentPage.getText()).toBe(page);
  };

  this.assertResultsLength = function(results) {
    element.all(by.repeater('user in queryuserslist')).then(function(rows) {
      if (results === 20) {
        expect(rows.length).toBeLessThanOrEqualTo(results);
      } else if (results === 0) {
        expect(rows.length).toBeGreaterThan(results);
      } else {
        expect(rows.length).toBe(results);
      }
    });
  };

  this.search = function(query, size) {
    this.searchButton.click();
    utils.expectIsDisplayed(this.searchField);
    this.searchField.clear();
    browser.sleep(1000);
    if (query) {
      this.searchField.sendKeys(query);
      browser.sleep(1000);
      expect(this.queryCount.getText()).toBe(typeof size !== 'undefined' ? size : '1');
    }
  };

  this.assertEntitlementListSize = function(size) {
    element.all(by.repeater('(service, val) in entitlements')).then(function(items) {
      expect(items.length).toBe(size);
    });
  };
};

module.exports = UsersPage;
