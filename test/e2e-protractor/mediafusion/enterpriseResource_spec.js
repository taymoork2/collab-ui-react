'use strict';

// Test data
var testuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!',
  userOrgId: '4214d345-7caf-4e32-b015-34de878d1158',
  superUser: 'super-admin@mfusion1webex.com',
  superUserPasswd: 'Mc23267!',
  superUserOrgId: 'baab1ece-498c-452b-aea8-1a727413c818'
};

describe('List Resources Flow', function () {
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

  //////////////////// Login as super admin user test cases starts //////////////////////

  it('Login as super admin', function () {
    login.login(testuser.superUser, testuser.superUserPasswd);
  });

  it('Click on Enterprise Reource tab', function () {
    navigation.clickEnterpriseResource();
  });

  it('List more than 0 resources', function () {
    enterpriseResource.assertResultsLength(0);
  });

  it('Click on Resources filter icon', function () {
    enterpriseResource.clickOnFilter();
  });

  it('Provide filter values', function () {
    enterpriseResource.provideFilterValues('Offline');
  });

  it('Should list filtered resources', function () {
    enterpriseResource.assertResultsLength(0);
  });

  it('Clear the values of filter', function () {
    enterpriseResource.clearFilterValues();
  });

  it('Should list all resources', function () {
    enterpriseResource.assertResultsLength(0);
  });

  it('Display resource preview panel', function () {
    enterpriseResource.clickOnResource();
    expect(enterpriseResource.enterpriseResourceLink.isDisplayed()).toBeTruthy();
  });

  it('Logout', function () {
    navigation.logout();
  });

  //////////////////// Login as super admin user test cases ends //////////////////////

  //////////////////// Login with non-sso user test cases starts //////////////////////

  it('Login as non-sso admin', function () {
    login.login(testuser.username, testuser.password);
  });

  it('Click on Enterprise Reource tab', function () {
    navigation.clickEnterpriseResource();
  });

  it('List more than 0 resources', function () {
    enterpriseResource.assertResultsLength(0);
  });

  //////////////////// Login with non-sso user test cases ends ///////////////////////

  /*describe('launch feedback page', function () {
    it('click feedback and launch form page', function () {
        //browser.driver.manage().window().setSize(1195, 569);
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
  });*/
});
