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
    this.addMatchers({
      toBeLessThanOrEqualTo: function () {
        return {
          compare: function (actual, expected) {
            return {
              pass: actual < expected || actual === expected,
              message: 'Expected ' + actual + 'to be less than or equal to ' + expected
            };
          }
        };
      }
    });
    utils.scrollTop();
  });

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
      expect(users.userLink.isDisplayed()).toBeTruthy();
    });

    it('display user admin settings panel when clicking on next arrow', function () {
      utils.expectIsDisplayed(users.nextButton);
      users.nextButton.click();

      utils.expectIsDisplayed(users.rolesPanel);
      utils.expectIsDisplayed(users.previewPanel);
      utils.expectIsDisplayed(users.closeRolesPanel);

      expect(users.closeRolesPanel.isDisplayed()).toBeTruthy();

      users.closeRolesPanel.click();
    });
  });

  describe('Display user profile page', function(){
    it('display user profile page when clicking on a user name', function(){
      users.clickOnUser();
      expect(users.previewPanel.isDisplayed()).toBeTruthy();
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
      expect(users.userLink.isDisplayed()).toBeTruthy();
      users.userLink.click();
      navigation.expectCurrentUrl('/userprofile');
      expect(users.fnameField.isDisplayed()).toBeTruthy();
      expect(users.lnameField.isDisplayed()).toBeTruthy();
      expect(users.displayField.isDisplayed()).toBeTruthy();
      expect(users.emailField.isDisplayed()).toBeTruthy();
      expect(users.orgField.isDisplayed()).toBeTruthy();
      expect(users.titleField.isDisplayed()).toBeTruthy();
      users.userTab.click();
      users.clickOnUser();
    });
  });

  describe('Exporting to CSV', function () {
    it('should display the CSV export button', function () {
      expect(users.exportButton.isDisplayed()).toBeTruthy();
    });
  });

  describe('launch feedback page', function () {
    it('click feedback and launch form page', function () {
      browser.driver.manage().window().setSize(1195, 569);

      //Store the current window handle
      var winHandleBefore = browser.getWindowHandle();

      navigation.userInfoButton.click();
      utils.click(navigation.feedbackLink);
      browser.sleep(2000);

      browser.getAllWindowHandles().then(function (handles) {
        expect(handles.length).toEqual(2);
        var newWindowHandle = handles[1];
        browser.switchTo().window(newWindowHandle);
        browser.driver.close();
        browser.switchTo().window(winHandleBefore);
      });

      browser.driver.manage().window().maximize();
    });
  });

  describe('logout', function () {
    it('should log out', function () {
      navigation.logout();
    });
  });
});
