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

  it('should login as non-sso admin user', function () {
    login.login(testuser.username, testuser.password);
  });

  // Asserting listing users.
  describe('Listing users on page load', function () {
    it('clicking on users tab should change the view', function () {
      navigation.clickUsers();
    });

    xit('should show first page of users', function () {
      users.assertPage('1');
    });

    it('should list more than 0 users', function () {
      users.assertResultsLength(0);
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
    });
  });

  describe('Display user profile page', function(){
    it('display user profile page when clicking on a user name', function(){
      users.clickOnUser();
      utils.expectIsDisplayed(users.userLink);
    });
  });

  // Asserting pagination of users.
  xdescribe('Paginating users returned', function () {
    it('should paginate the total number of users', function () {
      //pagination is only relevant if total matches exceeds 20
      //Initial page
      users.assertPage('1');
      users.assertResultsLength(20);
      //next page
      users.nextPage.click();
      users.assertPage('2');
      users.assertResultsLength(0);
      //previous page
      users.prevPage.click();
      users.assertPage('1');
      users.assertResultsLength(20);
      users.search();
    });
  });

  // Asserting sorting of users.
  xdescribe('Sorting users', function () {
    it('should sort users by name', function () {
      users.assertSorting('name-sort');
    });

    it('should sort users by username', function () {
      users.assertSorting('username-sort');
    });
  });

  // Asserting search users.
  describe('search users on page', function () {
    it('should show first page of users based on search string', function () {
      users.search(testuser.searchStr);
    });
  });

  describe('Display user profile', function(){
    it('display user profile page when clicking on the user link', function(){
      users.clickOnUser();
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
