'use strict';

xdescribe('List Media Fusion Servers', function () {
  //var searchStr = 'Cloud';
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
    login.login('pbr-admin');
  });

  // Asserting listing Media Fusion Servers.
  describe('Listing Media Fusion Servers on page load', function () {
    it('Clicking on Media Fusion Management tab should change the view', function () {
      navigation.clickMediaFusionManagement();
    });

    it('Should list more than 0 servers', function () {
      //management.assertResultsLength(0);
    });

    it('Should match the server count under header', function () {
      //fusionmanagement.assertServerCount();
    });

  });

  // Assert additional configuration and information/documention panel launch

  // Assert Action Items dropdown launch

  // Assert Information dropdown launch

  // Asserting feedback page launch
  /*
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
  });*/

  // Logout super admin user
  describe('Logout', function () {
    it('Should log out', function () {
      navigation.logout();
    });
  });
});
