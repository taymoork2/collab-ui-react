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


  // Logging in. Write your tests after the login flow is complete.
  describe('Login flow', function() {

    it('should redirect to CI global login page', function() {
      browser.get('#/login');
      browser.driver.wait(login.isLoginUsernamePresent);
      expect(browser.driver.getCurrentUrl()).toContain('idbroker.webex.com');
    });

    it('should redirect to login page when not logged in', function() {
      browser.get('#/users');
      browser.driver.wait(login.isLoginUsernamePresent);
      expect(browser.driver.getCurrentUrl()).toContain('idbroker.webex.com');
    });

    it('should not log in with invalid credentials', function() {
      expect(login.isLoginUsernamePresent()).toBeTruthy();
      login.setLoginUsername(testuser.username);
      login.clickLoginNext();
      browser.driver.wait(login.isLoginPasswordPresent);
      login.setLoginPassword('fakePassword');
      login.clickLoginSubmit();
      login.assertLoginError('You\'ve entered an incorrect email address or password.');
      expect(browser.driver.getCurrentUrl()).toContain('idbroker.webex.com');
    });

    it('should just login', function(){
      login.login(testuser.username,testuser.password);
    });

  }); //State is logged-in

  // Navigation bar
  describe('Navigation Bar', function() {

    it('should display correct tabs for user based on role', function() {
      expect(navigation.getTabCount()).toBe(4);
      expect(navigation.homeTab.isDisplayed()).toBeTruthy();
      expect(navigation.manageTab.isDisplayed()).toBeTruthy();
      expect(navigation.reportsTab.isDisplayed()).toBeTruthy();
      expect(navigation.supportTab.isDisplayed()).toBeTruthy();
    });

    it('clicking on users tab should change the view', function() {
      navigation.clickUsers();
      navigation.expectCurrentUrl('/users');
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

  // Add User Flows: state is in the users page
  describe('Add User Flows', function() {

    describe('Page initialization', function() {
      it('click on invite subtab should show add users', function() {
        users.addUsers.click();
        expect(users.listPanel.isDisplayed()).toBeFalsy();
        expect(users.managePanel.isDisplayed()).toBeTruthy();
      });

      it('should initialize users page for add/entitle/invite users', function() {
        expect(users.subTitleAdd.isDisplayed()).toBeTruthy()
        expect(users.subTitleEnable.isDisplayed()).toBeFalsy();
        expect(users.subTitleAdd.getText()).toBe('Manage users');
        expect(users.addButton.isDisplayed()).toBeTruthy();
        expect(users.entitleButton.isDisplayed()).toBeTruthy();
        expect(users.inviteButton.isDisplayed()).toBeTruthy()
      });

      it('should display error if no user is entered on add', function() {
        users.addButton.click();
        users.assertError('Please enter valid user email(s).');
      });

      it('should display error if no user is entered on update', function() {
        users.entitleButton.click();
        users.assertError('Please enter valid user email(s).');
      });

      it('should display error if no user is entered on invite', function() {
        users.inviteButton.click();
        users.assertError('Please enter valid user email(s).');
      });

    });

    describe('Input validation', function() {
      var validinputs = ['user@test.com', '<user@user.test>', '"user@user.test"'];
      var invalidinputs = ['user', '<user@user.com', 'user@user.com>', '"user@user.com', 'user@user.com"'];
      it('should tokenize a valid input and activate button', function() {
        for (var i = 0; i < validinputs.length; i++) {
          users.addUsersField.clear();
          users.addUsersField.sendKeys(validinputs[i]);
          expect(users.invalid.isPresent()).toBeFalsy();
          expect(users.addButton.isEnabled()).toBeTruthy();
          expect(users.entitleButton.isEnabled()).toBeTruthy();
          expect(users.inviteButton.isEnabled()).toBeTruthy();
          users.addButton.click();
          users.assertError('already exists');
          users.close.click();
        }
      }, 45000);
      it('should invalidate token with invalid inputs and disable button', function() {
        for (var i = 0; i < invalidinputs.length; i++) {
          users.addUsersField.clear();
          users.addUsersField.sendKeys(invalidinputs[i]);
          users.addButton.click(); // Needed to leave focus
          expect(users.invalid.isPresent()).toBeTruthy();
          expect(users.addButton.isEnabled()).toBeFalsy();
          expect(users.entitleButton.isEnabled()).toBeFalsy();
          expect(users.inviteButton.isEnabled()).toBeFalsy();
          users.close.click();
        }
      });
    });

    describe('Add an existing user', function() {
      it('should display input user email in results with already exists message', function() {
        users.addUsersField.clear();
        users.addUsersField.sendKeys(testuser.username);
        users.addButton.click();
        users.assertError('already exists');
      });
    });

    describe('Cancel', function() {
      it('should clear user input field and error message', function() {
        users.cancelButton.click();
        expect(users.addUsersField.getText()).toBe('');
      });
    });
  });

  describe('Invite users', function() {
    it('should invite users successfully', function() {
      var inviteEmail = utils.randomTestEmail();
      users.addUsersField.clear();
      users.addUsersField.sendKeys(inviteEmail);
      users.inviteButton.click();
      users.assertSuccess('sent successfully');
    });

    it('should not invite users successfully if they are already entitled', function() {
      var inviteEmail = testuser.username;
      users.addUsersField.clear();
      users.addUsersField.sendKeys(inviteEmail);
      users.inviteButton.click();
      users.assertError('already entitled');
    });

    it('should invite users successfully from org which has autoentitlement flag disabled', function() {
      var inviteEmail = testuser.usernameWithNoEntitlements;
      users.addUsersField.clear();
      users.addUsersField.sendKeys(inviteEmail);
      users.inviteButton.click();
      users.assertSuccess('sent successfully');
    });
  });

  //Entitle User Flows: state is in the users page
  describe('Entitle User Flows', function() {
    var inputEmail = utils.randomTestEmail();

    describe('Add a new user', function() {
      it('should display input user email in results with success message', function() {
        users.addUsersField.clear();
        users.addUsersField.sendKeys(inputEmail);
        users.addButton.click();
        users.assertSuccess(inputEmail,'added successfully');
      });
    });

    describe('Entitle an existing user with call-initiation', function() {
      it('should display input user email in results with success message', function() {
        users.addUsersField.clear();
        users.addUsersField.sendKeys(inputEmail);
        users.manageCallInitiation.click();
        users.entitleButton.click();
        users.assertSuccess(inputEmail,'entitled successfully');
      });
    });

    describe('Attempt to un-entitle call-initiation', function() {
      it('should display input user email in results with entitlement previously updated message', function() {
        users.addUsersField.clear();
        users.addUsersField.sendKeys(inputEmail);
        users.manageCallInitiation.click();
        users.entitleButton.click();
        users.assertError(inputEmail,'entitlement previously updated');
        users.closeAddUsers.click();
      });
    });

    describe('Users preview panel', function() {

      it('should show the squared entitlement column on first load', function() {
        expect(users.entitlementCol.isDisplayed()).toBeTruthy();
      });

      it('should show the preview panel when clicking on a user', function() {
        utils.click(users.resultUsername);
        utils.expectIsNotDisplayed(users.entitlementCol);
        utils.expectIsDisplayed(users.previewPanel);
      });

      it('should exit the preview panel when clicking the x', function() {
        utils.click(users.closePreview);
        utils.expectIsDisplayed(users.entitlementCol);
        utils.expectIsNotDisplayed(users.previewPanel);
      });
    });

    describe('Verify call-initiation entitlement exists for user and un-entitle', function() {
      it('should show call-initiation entitlement for the user', function() {
        users.search(inputEmail);
        expect(users.resultUsername.getText()).toContain(inputEmail);
        users.resultUsername.click();
        expect(users.squaredPanel.isDisplayed()).toBeTruthy();
        users.squaredPanel.click();
        browser.sleep(1000); //TODO fix this - animation should be resolved by angular
        expect(users.callInitiationCheckbox.isDisplayed()).toBeTruthy();
        users.callInitiationCheckbox.click();
        users.saveButton.click();
        users.assertSuccess(inputEmail,'updated successfully');
        users.closePreview.click();
        users.search();
      });
    });

    describe('Delete user used for entitle test', function(){
      it('should delete added user', function() {
        deleteUtils.deleteUser(inputEmail).then(function(message) {
          expect(message).toEqual(200);
        }, function(data) {
          expect(data.status).toEqual(200);
        });
      });
    });

  });

  describe('Switching tabs', function() {
    xit('should have a tab bar', function() {
      expect(navigation.tabs.isDisplayed()).toBeTruthy();
      expect(navigation.getTabCount()).toEqual(12);
    });

    it('clicking on home tab should change the view', function() {
      navigation.clickHome();
      navigation.expectCurrentUrl('/home');
      expect(home.activeUsers.isDisplayed()).toBeTruthy();
      expect(home.calls.isDisplayed()).toBeTruthy();
      expect(home.conversations.isDisplayed()).toBeTruthy();
      expect(home.contentShare.isDisplayed()).toBeTruthy();
      expect(home.homeSetup.isDisplayed()).toBeTruthy();
    });

    it('clicking on quick setup launch should open a dialog and change the page', function(){
      utils.click(home.quickSetupButton);
      utils.click(home.enableServiceEntitlement);
      utils.click(home.quickSetupNextButton);
      navigation.expectCurrentUrl('/users');
    });

    it('clicking on system health panel should open to status page in a new tab', function() {
      navigation.clickHome();
      navigation.expectCurrentUrl('/home');
      var appWindow = browser.getWindowHandle();
      home.monitoring.click();
      browser.getAllWindowHandles().then(function (handles) {
        var newWindowHandle = handles[1];
        browser.switchTo().window(newWindowHandle);
        navigation.expectDriverCurrentUrl('status.squaredpreview.com/');
        browser.driver.close();
        browser.switchTo().window(appWindow);
      });
    });

    it('clicking on orgs tab should change the view', function() {
      navigation.clickOrganization();
      navigation.expectCurrentUrl('/orgs');
      expect(manage.displayName.isDisplayed()).toBeTruthy();
      expect(manage.estimatedSize.isDisplayed()).toBeTruthy();
      expect(manage.totalUsers.isDisplayed()).toBeTruthy();
      expect(manage.enableSSO.isDisplayed()).toBeTruthy();
      expect(manage.saveButton.isDisplayed()).toBeFalsy();
      expect(manage.refreshButton.isDisplayed()).toBeTruthy();
    });

    it('clicking on reports tab should change the view', function() {
      navigation.clickReports();
      navigation.expectCurrentUrl('/reports');
      expect(reports.entitlements.isDisplayed()).toBeTruthy();
      expect(reports.calls.isDisplayed()).toBeTruthy();
      expect(reports.conversations.isDisplayed()).toBeTruthy();
      expect(reports.activeUsers.isDisplayed()).toBeTruthy();
    });

    it('clicking on users tab should change the view', function() {
      navigation.clickUsers();
      navigation.expectCurrentUrl('/users');
    });
  });

  describe('Home data refresh', function() {

    it('should load refresh directive template', function() {
      navigation.clickHome();
      navigation.expectCurrentUrl('/home');
      expect(home.reloadedTime.isDisplayed()).toBeTruthy();
      expect(home.refreshData.isDisplayed()).toBeTruthy();
    });

    it('should load cached values into directive when switching tabs', function() {
      navigation.clickUsers();
      navigation.expectCurrentUrl('/users');
      navigation.clickHome();
      navigation.expectCurrentUrl('/home');

      expect(home.reloadedTime.isDisplayed()).toBeTruthy();
      expect(home.refreshData.isDisplayed()).toBeTruthy();
      expect(home.activeUsers.isDisplayed()).toBeTruthy();
      expect(home.calls.isDisplayed()).toBeTruthy();
      expect(home.conversations.isDisplayed()).toBeTruthy();
      expect(home.contentShare.isDisplayed()).toBeTruthy();
      expect(home.homeSetup.isDisplayed()).toBeTruthy();
      expect(home.activeUsersChart.isDisplayed()).toBeTruthy();
    });

    it('should load new values and update time when clicking refresh', function() {
      home.refreshButton.click();
      expect(home.reloadedTime.isDisplayed()).toBeTruthy();
      expect(home.refreshData.isDisplayed()).toBeTruthy();
      expect(home.activeUsers.isDisplayed()).toBeTruthy();
      expect(home.calls.isDisplayed()).toBeTruthy();
      expect(home.conversations.isDisplayed()).toBeTruthy();
      expect(home.contentShare.isDisplayed()).toBeTruthy();
      expect(home.homeSetup.isDisplayed()).toBeTruthy();
      expect(home.activeUsersChart.isDisplayed()).toBeTruthy();
    });
  });

  describe('Reports data refresh', function() {

    it('should load refresh directive template', function() {
      navigation.clickReports();
      navigation.expectCurrentUrl('/reports');
      expect(reports.refreshData.isDisplayed()).toBeTruthy();
      expect(reports.reloadedTime.isDisplayed()).toBeTruthy();
    });

    it('should load cached values into directive when switching tabs', function() {
      navigation.clickUsers()
      navigation.expectCurrentUrl('/users');
      navigation.clickReports();
      navigation.expectCurrentUrl('/reports');
      expect(reports.refreshData.isDisplayed()).toBeTruthy();
      expect(reports.reloadedTime.isDisplayed()).toBeTruthy();
      expect(reports.entitlements.isDisplayed()).toBeTruthy();
      expect(reports.calls.isDisplayed()).toBeTruthy();
      expect(reports.conversations.isDisplayed()).toBeTruthy();
      expect(reports.activeUsers.isDisplayed()).toBeTruthy();
    });

    it('should load new values and update time when clicking refresh', function() {
      reports.refreshButton.click();
      expect(reports.refreshData.isDisplayed()).toBeTruthy();
      expect(reports.reloadedTime.isDisplayed()).toBeTruthy();
      expect(reports.entitlements.isDisplayed()).toBeTruthy();
      expect(reports.calls.isDisplayed()).toBeTruthy();
      expect(reports.conversations.isDisplayed()).toBeTruthy();
      expect(reports.activeUsers.isDisplayed()).toBeTruthy();
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

      it('should login', function(){
        login.login(notsqinviteruser.username, notsqinviteruser.password);
      });

      it('should display correct tabs for user based on role', function() {
        expect(navigation.getTabCount()).toBe(4);
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
