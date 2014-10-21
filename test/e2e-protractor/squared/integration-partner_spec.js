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
    });

    it('should edit an exisiting trial', function(){
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

  // Log Out
  describe('Log Out', function() {
    it('should log out', function() {
      navigation.logout();
    });
  });
});
