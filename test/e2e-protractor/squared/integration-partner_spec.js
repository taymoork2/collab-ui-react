'use strict';

/* global describe */
/* global expect */
/* global partner */
/* global navigation */
/* global utils */
/* global login */
/* global notifications */
/* global deleteTrialUtils */

describe('Partner flow', function() {
  var orgId;
  var accessToken;

  beforeEach(function() { browser.ignoreSynchronization = true; });
  afterEach(function() { browser.ignoreSynchronization = false; });

  // Logging in. Write your tests after the login flow is complete.
  describe('Login as partner admin user', function() {

    it('should login', function(done){
      login.partnerlogin(partner.testuser.username, partner.testuser.password);

      element(by.tagName('body')).evaluate('token').then(function(token){
        accessToken = token;
        expect(accessToken).not.toBeNull();
        done();
      });
    });

    it('should display correct tabs for user based on role', function() {

      utils.expectIsDisplayed(navigation.homeTab);
      utils.expectIsDisplayed(navigation.customersTab);
      utils.expectIsDisplayed(navigation.reportsTab);
      expect(navigation.getTabCount()).toBe(3);
    });

    it('should display trials list', function() {
      utils.expectIsDisplayed(partner.trialsPanel);
    });
  }); //State is logged-in

  describe('Add Partner Trial', function() {

    it('should view all trials', function() {
      utils.click(partner.viewAllLink);
      navigation.expectCurrentUrl('/customers');

      utils.expectIsDisplayed(partner.customerList);
    });

    it('should add a new trial', function(done){
      utils.click(partner.addButton);
      utils.expectIsDisplayed(partner.addTrialForm);

      partner.assertDisabled('startTrialButton');

      utils.expectIsDisplayed(partner.squaredTrialCheckbox);
      utils.expectIsNotDisplayed(partner.squaredUCTrialCheckbox);

      partner.customerNameInput.sendKeys(partner.newTrial.customerName);
      partner.customerEmailInput.sendKeys(partner.newTrial.customerEmail);
      utils.click(partner.squaredTrialCheckbox);

      utils.click(partner.startTrialButton);
      notifications.assertSuccess(partner.newTrial.customerName, 'A trial was successfully started');

      utils.expectIsDisplayed(partner.newTrialRow);

      partner.newTrialRow.getAttribute('orgId').then(function(attr){
        orgId = attr;
        expect(orgId).not.toBeNull();
        done();
      });
    }, 60000);

    it('should edit an exisiting trial', function(){
      utils.click(partner.newTrialRow);

      utils.expectIsDisplayed(partner.previewPanel);
      utils.click(partner.editLink);

      utils.expectIsDisplayed(partner.editTrialForm);

      expect(partner.squaredTrialCheckbox.getAttribute('disabled')).toBeTruthy();
      utils.expectIsDisplayed(partner.saveSendButton);
      utils.click(partner.saveSendButton);

      notifications.assertSuccess(partner.newTrial.customerName, 'You have successfully edited a trial for');

      utils.expectIsDisplayed(partner.newTrialRow);
    }, 60000);

  });

  describe('Partner launches customer portal', function(){

    it('Launch customer portal via preview panel and display first time wizard',function(){
      var appWindow = browser.getWindowHandle();

      utils.click(partner.launchCustomerPanelButton);

      browser.getAllWindowHandles().then(function(handles) {
        var newWindowHandle = handles[1];
        browser.switchTo().window(newWindowHandle);

        utils.expectIsDisplayed(wizard.wizard);
        utils.expectIsDisplayed(wizard.leftNav);
        utils.expectIsDisplayed(wizard.mainView);
        utils.click(wizard.finishTab);

        expect(wizard.mainviewTitle.getText()).toEqual('Get Started');
        utils.expectIsDisplayed(wizard.mainviewTitle);
        utils.click(wizard.finishBtn);
        navigation.expectDriverCurrentUrl('overview');
        utils.expectIsDisplayed(navigation.tabs);

        browser.driver.close();
        browser.switchTo().window(appWindow);
      });
    });

    it('Launch customer portal via dropdown and display partner managing org in partner filter',function(){
      var appWindow = browser.getWindowHandle();

      utils.click(partner.exitPreviewButton);
      utils.expectIsNotDisplayed(partner.previewPanel);

      utils.click(partner.actionsButton);
      utils.click(partner.launchCustomerButton);

      browser.getAllWindowHandles().then(function(handles) {
        var newWindowHandle = handles[1];
        browser.switchTo().window(newWindowHandle);
        utils.expectIsDisplayed(navigation.tabs);

        navigation.clickUsers();
        utils.click(partner.partnerFilter);
        utils.expectIsDisplayed(partner.partnerEmail);
        users.assertResultsLength(0);
        partner.partnerEmail.then(function (cell) {
          expect(cell[0].getText()).toContain(partner.testuser.username);
        });

        browser.driver.close();
        browser.switchTo().window(appWindow);
      });
    });

  });

  describe('Partner launches its orgs portal', function(){

      it('should launch partners org view',function(){
        var appWindow = browser.getWindowHandle();

        utils.expectIsDisplayed(navigation.userInfoButton);
        navigation.launchPartnerOrgPortal();

        browser.getAllWindowHandles().then(function(handles) {
        var newWindowHandle = handles[1];
        browser.switchTo().window(newWindowHandle);
        navigation.expectDriverCurrentUrl('true');
        utils.expectIsDisplayed(navigation.tabs);

        navigation.expectDriverCurrentUrl('overview');
        browser.driver.close();
        browser.switchTo().window(appWindow);
        });
      });

    });

  describe('Partner landing page reports', function(){

    it('should delete an exisiting org thus deleting trial', function(){
      expect(deleteTrialUtils.deleteOrg(orgId, accessToken)).toEqual(200);
    });

    it('should show the reports',function(){
      navigation.clickHome();
      utils.expectIsDisplayed(partner.entitlementsChart);
      expect(partner.entitlementsCount.getText()).toBeTruthy();
    });

    it('should show active users chart',function(){
      partner.activeUsersTab.click();
      utils.expectIsDisplayed(partner.activeUsersChart);
      utils.expectIsDisplayed(partner.activeUsersCount.getText());
    });

    it('should show average calls chart',function(){
      partner.averageCallsTab.click();
      utils.expectIsDisplayed(partner.averageCallsChart);
      utils.expectIsDisplayed(partner.averageCallsCount.getText());
    });

    it('should show content shared chart',function(){
      partner.contentSharedTab.click();
      utils.expectIsDisplayed(partner.contentSharedChart);
      utils.expectIsDisplayed(partner.contentSharedCount.getText());
    });
  });

  describe('Reports Page', function() {

    it('should load cached values into directive when switching tabs', function() {
      navigation.clickReports();
      utils.expectIsDisplayed(reports.refreshData);
      utils.expectIsDisplayed(reports.reloadedTime);
      utils.expectIsDisplayed(reports.calls);
      utils.expectIsDisplayed(reports.conversations);
      utils.expectIsDisplayed(reports.activeUsers);
      utils.expectIsDisplayed(reports.convOneOnOne);
      utils.expectIsDisplayed(reports.convGroup);
      utils.expectIsDisplayed(reports.calls);
      utils.expectIsDisplayed(reports.callsAvgDuration);
      utils.expectIsDisplayed(reports.contentShared);
      utils.expectIsDisplayed(reports.contentShareSizes);
    });
  });

  // Log Out
  describe('Log Out', function() {
    it('should log out', function() {
      navigation.logout();
    });
  });
});
