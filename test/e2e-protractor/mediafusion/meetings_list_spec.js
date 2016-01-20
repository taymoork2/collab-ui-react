'use strict';

xdescribe('List meetings flow', function () {
  var searchStr = 'Cloud';
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

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('Should login as super admin', function () {
    login.login('media-super-admin');
  });

  // Asserting listing meetings and pagination.
  describe('Listing meetings on page load', function () {
    it('Clicking on meetings tab should change the view', function () {
      navigation.clickMeetings();
    });

    it('Should list more than 0 meetings', function () {
      meetings.assertResultsLength(0);
    });

    it('Should list less than or equal to 50 meetings', function () {
      meetings.assertResultsLength(50);
    });

  });

  // Asserting Day decrement
  describe('Decrement day and checking meeting chart info, leader board and Meeting Table', function () {
    it('Should decrement the day and populate the Meeting chart, Leader board and Meeting table data.', function () {
      meetings.decrementDay();
      browser.sleep(1000);
    });

    it('Should list more than zero latest meetings on the day after decremented', function () {
      meetings.assertResultsLength(0);
    });

    it('Should increment the day and populate the Meeting chart, Leader board and Meeting table data.', function () {
      meetings.incrementDay();
      browser.sleep(1000);
    });

    it('Should list more than zero latest meetings on the day after incremented', function () {
      meetings.assertResultsLength(0);
    });
  });

  // Asserting filtering of meetings
  describe('Filter meetings on page', function () {

    it('Click on Meetings filter icon', function () {
      meetings.clickOnFilter();
    });

    it('Provide filter values', function () {
      meetings.provideFilterValues('Cloud');
    });

    it('Should list filtered meetings', function () {
      meetings.assertResultsLength(0);
    });

    it('Clear the values of filter', function () {
      meetings.clearFilterValues();
    });

    it('Should list all meetings', function () {
      meetings.assertResultsLength(0);
    });
  });

  // Asserting search meetings and empty search
  describe('Search meetings on page', function () {
    it('Should show first page of meetings based on search string', function () {
      meetings.search(searchStr);
    });

    it('Should show first page of meetings for empty search string', function () {
      utils.search();
    });
  });

  // Asserting meetings preview.
  describe('Display meeting information', function () {
    it('Display meeting preview panel when clicking on a meeting', function () {
      meetings.clickOnMeeting();
      expect(meetings.meetingPreviewLink.isDisplayed()).toBeTruthy();
    });
  });

  // Asserting pagination - page scroll to bottom and count meetings
  describe('Page scroll to bottom and count meetings', function () {
    it('Should scroll to bottom and list more than 50 meetings', function () {
      browser.executeScript('window.scrollTo(0,10000);').then(function () {
        meetings.assertResultsLength(51);
      });
    });
  });

  // Asserting feedback page launch
  describe('Launch feedback page', function () {
    it('Click feedback and launch form page', function () {
      browser.driver.manage().window().setSize(1195, 569);

      //Store the current window handle
      var winHandleBefore = browser.getWindowHandle();

      utils.click(navigation.userInfoButton);
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

  // Logout super admin user
  describe('Logout', function () {
    it('Should log out', function () {
      navigation.logout();
    });
  });
});
