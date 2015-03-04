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
      utils.expectIsDisplayed(navigation.homeTab);
      utils.expectIsDisplayed(navigation.customersTab);
      utils.expectIsDisplayed(navigation.reportsTab);
      expect(navigation.getTabCount()).toBe(3);
    });

    it('should display trials list', function() {
      utils.expectIsDisplayed(partner.trialsPanel);
    });
  }); //State is logged-in

  ddescribe('Add Partner Trial', function() {

    it('should view all trials', function() {
      utils.click(partner.viewAllLink);
      navigation.expectCurrentUrl('/customers');

      utils.expectIsDisplayed(partner.customerList);
    });

    it('should add a new trial', function(){
      utils.click(partner.addButton);
      utils.expectIsDisplayed(partner.addTrialModal);

      partner.assertDisabled('startTrialButton');

      utils.expectIsDisplayed(partner.squaredTrialCheckbox);
      utils.expectIsNotDisplayed(partner.squaredUCTrialCheckbox);

      partner.customerNameInput.sendKeys(partner.newTrial.customerName);
      partner.customerEmailInput.sendKeys(partner.newTrial.customerEmail);
      utils.click(partner.squaredTrialCheckbox);

      utils.click(partner.startTrialButton);
      notifications.assertSuccess(partner.newTrial.customerName, 'A trial was successfully started');

      utils.expectIsDisplayed(partner.newTrialRow);
    }, 60000);

    it('should edit an exisiting trial', function(){
      utils.click(partner.newTrialRow);
      utils.click(partner.editTrialModal);
      utils.expectIsDisplayed(partner.addTrialModal);

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

      expect(partner.launchCustomerPanelButton.isDisplayed()).toBeTruthy();
      partner.launchCustomerPanelButton.click();

      browser.getAllWindowHandles().then(function(handles) {
        var newWindowHandle = handles[1];
        browser.switchTo().window(newWindowHandle);
        utils.expectIsDisplayed(wizard.wizard);
        utils.expectIsDisplayed(wizard.leftNav);
        utils.expectIsDisplayed(wizard.mainView);
        wizard.finishTab.click();
        expect(wizard.mainviewTitle.getText()).toEqual('Get Started');
        expect(wizard.mainviewTitle.isDisplayed()).toBeTruthy();
        wizard.finishBtn.click();
        navigation.expectDriverCurrentUrl('overview');
        expect(navigation.tabs.isDisplayed()).toBeTruthy();
        browser.driver.close();
        browser.switchTo().window(appWindow);
      });
    });

    it('Launch customer portal via dropdown and display partner managing org in partner filter',function(){
      var appWindow = browser.getWindowHandle();

      utils.click(partner.exitPreviewButton);
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

        expect(navigation.userInfoButton.isDisplayed()).toBeTruthy();
        navigation.launchPartnerOrgPortal();

        browser.getAllWindowHandles().then(function(handles) {
        var newWindowHandle = handles[1];
        browser.switchTo().window(newWindowHandle);
        navigation.expectDriverCurrentUrl('true');
        expect(navigation.tabs.isDisplayed()).toBeTruthy();
        navigation.expectDriverCurrentUrl('overview');
        browser.driver.close();
        browser.switchTo().window(appWindow);
        });
      });

    });

  describe('Partner landing page reports', function(){

    it('should delete an exisiting org thus deleting trial', function(){
      navigation.clickHome();
      browser.executeScript('console.warn(window.localStorage.accessToken)');
      var token = '';
      browser.manage().logs().get('browser').then(function(browserLog) {
        token = browserLog[browserLog.length-1].message.split(' ')[2];
      });
      partner.newTrialRow.getAttribute('orgId').then(function(attr){
        deleteTrialUtils.deleteOrg(attr, token);
      });
    });

    it('should show the reports',function(){
      navigation.clickHome();
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
  });

  describe('Reports Page data refresh', function() {

    it('should load cached values into directive when switching tabs', function() {
      navigation.clickReports();
      expect(reports.refreshData.isDisplayed()).toBeTruthy();
      expect(reports.reloadedTime.isDisplayed()).toBeTruthy();
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

    xit('should load new values and update time when clicking refresh', function() {
      reports.refreshButton.click();
      expect(reports.refreshData.isDisplayed()).toBeTruthy();
      expect(reports.reloadedTime.isDisplayed()).toBeTruthy();
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
