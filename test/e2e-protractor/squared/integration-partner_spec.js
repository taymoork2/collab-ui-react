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
  // Logging in. Write your tests after the login flow is complete.
  describe('Login as partner admin user', function() {

    it('should login', function(){
      login.partnerlogin(partner.testuser.username, partner.testuser.password);
    });

    it('should display correct tabs for user based on role', function() {
      expect(navigation.getTabCount()).toBe(3);
      expect(navigation.homeTab.isDisplayed()).toBeTruthy();
      expect(navigation.manageTab.isDisplayed()).toBeTruthy();
      expect(navigation.reportsTab.isDisplayed()).toBeTruthy();
    });
    it('should display trials list', function() {
      expect(partner.trialsPanel.isDisplayed()).toBeTruthy();
    });

  }); //State is logged-in

  describe('Add Partner Trial', function() {

    it('should add a new trial', function(){
      partner.addButton.click();
      partner.assertDisabled('startTrialButton');

      partner.customerNameInput.sendKeys(partner.newTrial.customerName);
      partner.customerNameInput.clear();
      partner.assertDisabled('startTrialButton');

      partner.customerEmailInput.sendKeys(partner.newTrial.customerEmail);
      partner.customerEmailInput.clear();
      partner.assertDisabled('startTrialButton');

      partner.customerNameInput.sendKeys(partner.newTrial.customerName);
      partner.customerEmailInput.sendKeys(partner.newTrial.customerEmail);

      partner.startTrialButton.click();
      notifications.assertSuccess(partner.newTrial.customerName, 'A trial was successfully started');

      utils.expectIsDisplayed(partner.newTrialRow);
    });

    it('should send error when adding an existing trial', function(){
      partner.addButton.click();
      partner.assertDisabled('startTrialButton');

      partner.customerNameInput.sendKeys(partner.newTrial.customerName);
      partner.customerEmailInput.sendKeys(partner.newTrial.customerEmail);

      partner.startTrialButton.click();
      notifications.assertError(partner.newTrial.customerName, 'already exists');
      partner.cancelTrialButton.click();
    });

    it('should edit an exisiting trial', function(){
      utils.expectIsNotDisplayed(partner.addTrialModal);
      partner.newTrialRow.click();

      utils.expectIsDisplayed(partner.editTrialModal);
      utils.expectIsDisplayed(partner.editTrialButton);

      partner.editTrialButton.click();

      expect(partner.saveSendButton.isDisplayed()).toBeTruthy();
      partner.saveSendButton.click();

      notifications.assertSuccess(partner.newTrial.customerName, 'You have successfully edited a trial for');

      utils.expectIsNotDisplayed(partner.editTrialModal);
      utils.expectIsDisplayed(partner.newTrialRow);
    });

    it('should delete an exisiting org thus deleting trial', function(done){
      partner.newTrialRow.getAttribute('orgId').then(function(attr){
        deleteTrialUtils.deleteOrg(attr).then(function(message) {
          expect(message).toEqual(200);
          done();
        }, function(data) {
          expect(data.status).toEqual(200);
          done();
        });
      });
    });
  });

  describe('Partner landing page reports', function(){
    it('should show the reports',function(){
      expect(partner.entitlementsChart.isDisplayed()).toBeTruthy();
      expect(partner.entitlementsCount.getText()).toBeTruthy();
    });

    it('should show active users chart',function(){
      partner.activeUsersTab.click();
      expect(partner.activeUsersChart.isDisplayed()).toBeTruthy();
      expect(partner.activeUsersCount.getText()).toBeTruthy();
    });

    it('should show average calls chart',function(){
      partner.averageCallsTab.click();
      expect(partner.averageCallsChart.isDisplayed()).toBeTruthy();
      expect(partner.averageCallsCount.getText()).toBeTruthy();
    });

    it('should show content shared chart',function(){
      partner.contentSharedTab.click();
      expect(partner.contentSharedChart.isDisplayed()).toBeTruthy();
      expect(partner.contentSharedCount.getText()).toBeTruthy();
    });

    it('should refresh reports', function(){
      partner.refreshButton.click();
      expect(partner.noResultsAvailable.isPresent()).toBeFalsy();
      expect(partner.errorProcessing.isPresent()).toBeFalsy();
    });
  });

  describe('Reports Page data refresh', function() {

    it('should load refresh directive template', function() {
      navigation.clickReports();
      navigation.expectCurrentUrl('/partnerreports');
      expect(reports.refreshData.isDisplayed()).toBeTruthy();
      expect(reports.reloadedTime.isDisplayed()).toBeTruthy();
    });

    it('should load cached values into directive when switching tabs', function() {
      navigation.clickHome();
      navigation.expectCurrentUrl('/partnerhome');
      navigation.clickReports();
      navigation.expectCurrentUrl('/partnerreports');
      expect(reports.refreshData.isDisplayed()).toBeTruthy();
      expect(reports.reloadedTime.isDisplayed()).toBeTruthy();
      expect(reports.entitlements.isDisplayed()).toBeTruthy();
      expect(reports.calls.isDisplayed()).toBeTruthy();
      expect(reports.conversations.isDisplayed()).toBeTruthy();
      expect(reports.activeUsers.isDisplayed()).toBeTruthy();
      expect(reports.convOneOnOne.isDisplayed()).toBeTruthy();
      expect(reports.convGroup.isDisplayed()).toBeTruthy();
      expect(reports.calls.isDisplayed()).toBeTruthy();
      expect(reports.callsAvgDuration.isDisplayed()).toBeTruthy();
      expect(reports.contentShared.isDisplayed()).toBeTruthy();
      expect(reports.contentShareSizes.isDisplayed()).toBeTruthy();
    });

    it('should load new values and update time when clicking refresh', function() {
      reports.refreshButton.click();
      expect(reports.refreshData.isDisplayed()).toBeTruthy();
      expect(reports.reloadedTime.isDisplayed()).toBeTruthy();
      expect(reports.entitlements.isDisplayed()).toBeTruthy();
      expect(reports.calls.isDisplayed()).toBeTruthy();
      expect(reports.conversations.isDisplayed()).toBeTruthy();
      expect(reports.activeUsers.isDisplayed()).toBeTruthy();
      expect(reports.convOneOnOne.isDisplayed()).toBeTruthy();
      expect(reports.convGroup.isDisplayed()).toBeTruthy();
      expect(reports.calls.isDisplayed()).toBeTruthy();
      expect(reports.callsAvgDuration.isDisplayed()).toBeTruthy();
      expect(reports.contentShared.isDisplayed()).toBeTruthy();
      expect(reports.contentShareSizes.isDisplayed()).toBeTruthy();
    });
  });

  // Log Out
  describe('Log Out', function() {
    it('should log out', function() {
      navigation.logout();
    });
  });
});
