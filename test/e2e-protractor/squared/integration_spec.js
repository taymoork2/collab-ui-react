'use strict';

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */
/* global protractor */

var testuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!',
  orgname: 'SquaredAdminTool',
  usernameWithNoEntitlements: 'doNotDeleteTestUser@wx2.example.com'
};

var notsqinviteruser = {
  username: 'sqtest-admin@squared.example.com',
  password: 'C1sc0123!',
};

// Notes:
// - State is conserved between each describe and it blocks.
// - When a page is being loaded, use wait() to check if elements are there before asserting.

describe('App flow', function() {

  beforeEach(function() {
    browser.ignoreSynchronization = true;
  });

  afterEach(function() {
    browser.ignoreSynchronization = false;
  });

  it('should just login', function() {
    login.login(testuser.username, testuser.password);
  });

  // Navigation bar
  describe('Navigation Bar', function() {

    it('should display correct tabs for user based on role', function() {
      expect(navigation.getTabCount()).toBe(6);
      expect(navigation.homeTab.isDisplayed()).toBeTruthy();
      expect(navigation.usersTab.isDisplayed()).toBeTruthy();
      expect(navigation.devicesTab.isDisplayed()).toBeTruthy();
      expect(navigation.reportsTab.isDisplayed()).toBeTruthy();
      expect(navigation.supportTab.isDisplayed()).toBeTruthy();
      expect(navigation.developmentTab.isDisplayed()).toBeTruthy();
    });

    it('clicking on users tab should change the view', function() {
      navigation.clickUsers();
    });

    xit('should still be logged in', function() {
      expect(navigation.settings.isPresent()).toBeTruthy();
      expect(navigation.feedbackButton.isPresent()).toBeTruthy();
    });

    xit('should display the username and the orgname', function() {
      expect(navigation.username.getText()).toContain(testuser.username);
      expect(navigation.orgname.getText()).toContain(testuser.orgname);
    });

  });

  describe('Switching tabs', function() {

    it('clicking on home tab should change the view', function() {
      navigation.clickHome();
      expect(landing.packages.isDisplayed()).toBeTruthy();
      expect(landing.devices.isDisplayed()).toBeTruthy();
      expect(landing.licenses.isDisplayed()).toBeTruthy();
      expect(landing.unlicensedUsers.isDisplayed()).toBeTruthy();
      expect(landing.callsChart.isDisplayed()).toBeTruthy();
    });

    // it('clicking on quick setup launch should open a dialog and change the page', function(){
    //   utils.click(landing.quickSetupButton);
    //   utils.click(landing.enableServiceEntitlement);
    //   utils.click(landing.quickSetupNextButton);
    //   navigation.expectCurrentUrl('/users');
    // });

    it('clicking on system health panel should open to status page in a new tab', function() {
      navigation.clickHome();
      var appWindow = browser.getWindowHandle();
      landing.monitoringRows.first().click();
      browser.getAllWindowHandles().then(function(handles) {
        var newWindowHandle = handles[1];
        browser.switchTo().window(newWindowHandle);
        navigation.expectDriverCurrentUrl('status.projectsquared.com/');
        browser.driver.close();
        browser.switchTo().window(appWindow);
      });
    });

    it('clicking on orgs tab should change the view', function() {
      navigation.clickOrganization();
      expect(manage.displayName.isDisplayed()).toBeTruthy();
      expect(manage.estimatedSize.isDisplayed()).toBeTruthy();
      expect(manage.totalUsers.isDisplayed()).toBeTruthy();
      expect(manage.enableSSO.isDisplayed()).toBeTruthy();
      expect(manage.saveButton.isDisplayed()).toBeFalsy();
      expect(manage.refreshButton.isDisplayed()).toBeTruthy();
    });

    it('clicking on reports tab should change the view', function() {
      navigation.clickReports();
      //expect(reports.entitlements.isDisplayed()).toBeTruthy();
      expect(reports.onboarding.isDisplayed()).toBeTruthy();
      expect(reports.calls.isDisplayed()).toBeTruthy();
      expect(reports.conversations.isDisplayed()).toBeTruthy();
      expect(reports.activeUsers.isDisplayed()).toBeTruthy();
    });

    it('clicking on users tab should change the view', function() {
      navigation.clickUsers();
    });
  });

  describe('Home data refresh', function() {

    it('should load refresh directive template', function() {
      navigation.clickHome();
      expect(landing.reloadedTime.isDisplayed()).toBeTruthy();
      expect(landing.refreshData.isDisplayed()).toBeTruthy();
    });

    it('should load cached values into directive when switching tabs', function() {
      navigation.clickUsers();
      navigation.clickHome();

      expect(landing.reloadedTime.isDisplayed()).toBeTruthy();
      expect(landing.refreshData.isDisplayed()).toBeTruthy();
      // expect(landing.activeUsers.isDisplayed()).toBeTruthy();
      // expect(landing.calls.isDisplayed()).toBeTruthy();
      // expect(landing.conversations.isDisplayed()).toBeTruthy();
      // expect(landing.contentShare.isDisplayed()).toBeTruthy();
      // expect(landing.homeSetup.isDisplayed()).toBeTruthy();
      expect(landing.callsChart.isDisplayed()).toBeTruthy();
    });

    // it('should load new values and update time when clicking refresh', function() {
    //   landing.refreshButton.click();
    //   expect(landing.reloadedTime.isDisplayed()).toBeTruthy();
    //   expect(landing.refreshData.isDisplayed()).toBeTruthy();
    //   // expect(landing.activeUsers.isDisplayed()).toBeTruthy();
    //   // expect(landing.calls.isDisplayed()).toBeTruthy();
    //   // expect(landing.conversations.isDisplayed()).toBeTruthy();
    //   // expect(landing.contentShare.isDisplayed()).toBeTruthy();
    //   // expect(landing.homeSetup.isDisplayed()).toBeTruthy();
    //   expect(landing.callsChart.isDisplayed()).toBeTruthy();
    // });
  });

  describe('Reports data refresh', function() {

    it('should load refresh directive template', function() {
      navigation.clickReports();
      expect(reports.refreshData.isDisplayed()).toBeTruthy();
      expect(reports.reloadedTime.isDisplayed()).toBeTruthy();
    });

    it('should load cached values into directive when switching tabs', function() {
      navigation.clickUsers();
      navigation.clickReports();
      expect(reports.refreshData.isDisplayed()).toBeTruthy();
      expect(reports.reloadedTime.isDisplayed()).toBeTruthy();
      //expect(reports.entitlements.isDisplayed()).toBeTruthy();
      expect(reports.calls.isDisplayed()).toBeTruthy();
      expect(reports.conversations.isDisplayed()).toBeTruthy();
      expect(reports.activeUsers.isDisplayed()).toBeTruthy();
      expect(reports.convOneOnOne.isDisplayed()).toBeTruthy();
      expect(reports.convGroup.isDisplayed()).toBeTruthy();
      expect(reports.calls.isDisplayed()).toBeTruthy();
      expect(reports.callsAvgDuration.isDisplayed()).toBeTruthy();
      expect(reports.contentShared.isDisplayed()).toBeTruthy();
      expect(reports.contentShareSizes.isDisplayed()).toBeTruthy();
      expect(reports.onboarding.isDisplayed()).toBeTruthy();
    });

    it('should load new values and update time when clicking refresh', function() {
      reports.refreshButton.click();
      expect(reports.refreshData.isDisplayed()).toBeTruthy();
      expect(reports.reloadedTime.isDisplayed()).toBeTruthy();
      //expect(reports.entitlements.isDisplayed()).toBeTruthy();
      expect(reports.calls.isDisplayed()).toBeTruthy();
      expect(reports.conversations.isDisplayed()).toBeTruthy();
      expect(reports.activeUsers.isDisplayed()).toBeTruthy();
      expect(reports.convOneOnOne.isDisplayed()).toBeTruthy();
      expect(reports.convGroup.isDisplayed()).toBeTruthy();
      expect(reports.calls.isDisplayed()).toBeTruthy();
      expect(reports.callsAvgDuration.isDisplayed()).toBeTruthy();
      expect(reports.contentShared.isDisplayed()).toBeTruthy();
      expect(reports.contentShareSizes.isDisplayed()).toBeTruthy();
      expect(reports.onboarding.isDisplayed()).toBeTruthy();
    });
  });

  // Log Out
  describe('Log Out', function() {
    it('should log out', function() {
      navigation.logout();
    });
  });

  //Log in with a user with no SquaredInviter Entitlement
  xdescribe('No SquaredInviter Entitlement', function() {
    // Logging in. Write your tests after the login flow is complete.
    describe('Login as sqtest-admin user', function() {

      it('should login', function() {
        login.login(notsqinviteruser.username, notsqinviteruser.password);
      });

      it('should display correct tabs for user based on role', function() {
        expect(navigation.getTabCount()).toBe(5);
        expect(navigation.homeTab.isDisplayed()).toBeTruthy();
        expect(navigation.reportsTab.isDisplayed()).toBeTruthy();
        expect(navigation.manageTab.isDisplayed()).toBeTruthy();
      });

      it('clicking on users tab should change the view', function() {
        navigation.clickUsers();
        navigation.expectCurrentUrl('/users');
      });

      it('click on invite subtab should show add users', function() {
        users.addUsers.click();
        expect(users.listPanel.isDisplayed()).toBeFalsy();
        expect(users.managePanel.isDisplayed()).toBeTruthy();
      });

      it('should initialize users page for add/entitle/invite users with disabled invite button', function() {
        expect(users.subTitleAdd.isDisplayed()).toBeTruthy();
        expect(users.subTitleEnable.isDisplayed()).toBeFalsy();
        expect(users.subTitleAdd.getText()).toBe('Manage users');
        expect(users.addButton.isDisplayed()).toBeTruthy();
        expect(users.entitleButton.isDisplayed()).toBeTruthy();
        expect(users.inviteButton.isEnabled()).toBeFalsy();
      });

      it('should log out', function() {
        navigation.logout();
      });
    });
  });

});
