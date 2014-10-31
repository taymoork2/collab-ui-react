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

describe('List users flow', function() {
  beforeEach(function() {
    this.addMatchers({
      toBeLessThanOrEqualTo: function() {
        return {
          compare: function(actual, expected) {
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

  it('should login as non-sso admin user', function() {
    login.login(testuser.username, testuser.password);
  });

  // Asserting listing users.
  describe('Listing users on page load', function() {
    it('clicking on users tab should change the view', function() {
      navigation.clickUsers();
      navigation.expectCurrentUrl('/users');
    });

    xit('should show first page of users', function() {
      users.assertPage('1');
    });

    xit('should list 20 or less users', function() {
      users.assertResultsLength(20);
    });
  });

  // Asserting pagination of users.
  xdescribe('Paginating users returned', function() {
    it('should paginate the total number of users', function() {
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
  xdescribe('Sorting users', function() {
    it('should sort users by name', function() {
      users.assertSorting('name-sort');
    });

    it('should sort users by username', function() {
      users.assertSorting('username-sort');
    });
  });

  // Asserting search users.
  describe('search users on page', function() {
    it('should show first page of users based on search string', function() {
      users.search(testuser.searchStr, '60');
    });
  });

  describe('Exporting to CSV', function() {
    it('should display the CSV export button', function() {
      expect(users.exportButton.isDisplayed()).toBeTruthy();
    });
  });

  it('should log out', function() {
    navigation.logout();
  });

});
