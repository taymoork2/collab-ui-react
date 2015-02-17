'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */

var testuser = {
  username: 'super-admin@mfusion1webex.com',
  password: 'Mc23267!',
  searchStr: 'Narender'
  //searchStr: 'Fake'
};


// Notes:
// - State is conserved between each despribe and it blocks.
// - When a page is being loaded, use wait() to check if elements are there before asserting.

describe('List meetings flow', function () {
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

  it('should login as test user', function () {
    login.login(testuser.username, testuser.password);
  });

  // Asserting listing meetings and pagination.
  describe('Listing meetings on page load', function () {
    it('clicking on meetings tab should change the view', function () {
      navigation.clickMeetings();
    });

    it('should list more than 0 meetings', function () {
      meetings.assertResultsLength(0);
    });

    it('should list less than or equal to 50 meetings', function () {
      meetings.assertResultsLength(50);
    });

  });

  // Asserting meetings preview.
  describe('Display meeting information', function () {
    it('display meeting preview panel when clicking on a meeting', function () {
      meetings.clickOnMeeting();
      expect(meetings.meetingPreviewLink.isDisplayed()).toBeTruthy();
    });
  });

  // Asserting search users.
  describe('search users on page', function () {
    it('should show first page of users based on search string', function () {
      meetings.search(testuser.searchStr);
    });

    it('should show first page of users for empty search string', function () {
      meetings.searchEmpty('');
    });

  });

  // Asserting pagination - page scroll to bottom and count meetings
  describe('page scroll to bottom and count meetings', function () {
    it('should scroll to bottom and list more than 50 meetings', function () {
      browser.executeScript('window.scrollTo(0,10000);').then(function () {
        meetings.assertResultsLength(51);
      });
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
