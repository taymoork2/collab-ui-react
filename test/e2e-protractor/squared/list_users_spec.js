'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */

var testuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!',
  orgname: 'SquaredAdminTool',
  searchStr: 'fake'
};

var inputEmail;

// Notes:
// - State is conserved between each despribe and it blocks.
// - When a page is being loaded, use wait() to check if elements are there before asserting.

describe('List users flow', function () {
  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });
  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  it('should login as non-sso admin user', function () {
    login.login(testuser.username, testuser.password);
  });

  // Asserting listing users.
  describe('Listing users on page load', function () {
    it('clicking on users tab should change the view', function () {
      navigation.clickUsers();
    });
  });

  describe('Display user information', function () {
    it('display user preview panel when clicking on a user', function () {
      users.clickOnUser();
      utils.expectIsDisplayed(users.userLink);
    });

    it('display user admin settings panel when clicking on next arrow', function () {
      utils.click(users.rolesChevron);

      utils.expectIsDisplayed(users.previewPanel);
      utils.expectIsDisplayed(roles.closeButton);
      utils.expectIsDisplayed(roles.rolesDetailsPanel);

      utils.click(roles.closeButton);
      utils.expectIsNotDisplayed(users.userLink);
    });
  });

  // Asserting search users.
  describe('search users on page', function () {
    it('should show first page of users based on search string', function () {
      utils.searchAndClick(testuser.searchStr);
    });
    it('display user profile page when clicking on the user link', function () {
      utils.click(users.userLink);
      navigation.expectCurrentUrl('/userprofile');
      utils.expectIsDisplayed(users.fnameField);
      utils.expectIsDisplayed(users.lnameField);
      utils.expectIsDisplayed(users.displayField);
      utils.expectIsDisplayed(users.emailField);
      utils.expectIsDisplayed(users.orgField);
      utils.expectIsDisplayed(users.titleField);
    });
  });

  describe('Exporting to CSV', function () {
    it('should display the CSV export button', function () {
      users.userTab.click();
      users.clickOnUser();
      utils.expectIsDisplayed(users.exportButton);
    });
  });

  describe('logout', function () {
    it('should log out', function () {
      navigation.logout();
    });
  });
});
