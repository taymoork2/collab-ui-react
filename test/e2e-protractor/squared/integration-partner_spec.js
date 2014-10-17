'use strict';

/* global describe */
/* global expect */

var testuser = {
  username: 'admin@fancy-lawyer.com',
  password: 'P@ssword123'
};

var newTrial = {
  customerName : 'Atlas_Test_Trial',
  customerEmail : 'Atlas_Test_Trial@gmail.com'
};

describe('Partner flow', function() {
  // Logging in. Write your tests after the login flow is complete.
  describe('Login as partner admin user', function() {

    it('should login', function(){
      login.partnerlogin(testuser.username, testuser.password);
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

  // describe('Add Partner Trial', function() {

  //   it('should add a new trial', function(){
  //     // click on add button
  //     partner.addButton.click();
  //     // start trial should be disabled
  //     partner.startTrial.assertDisabled();
  //     // type in name and clear --> start trial should be disabled
  //     partner.customerNameInput.sendKeys(newTrial.customerName);
  //     partner.customerNameInput.clear();
  //     partner.startTrialButton.assertDisabled();
  //     // type in name
  //     partner.customerNameInput.sendKeys(newTrial.customerName);
  //     // type in email partially --> start trial should be disabled
  //     partner.customerNameInput.sendKeys(newTrial.customerEmail);
  //     partner.customerNameInput.clear();
  //     partner.startTrialButton.assertDisabled();
  //     // finish typing in email
  //     partner.customerNameInput.sendKeys(newTrial.customerEmail);
  //     // start trial should be enabled
  //     partner.startTrialButton.assertEnabled();
  //     // click start trial
  //     partner.startTrialButton.click();
  //     // expect success
  //     notification.assertSuccess('');
  //     // trial should be in list
  //     partner.assertNewTrial(newTrial.customerName);
  //   });

  //   it('should send error when adding an existing trial', function(){
  //     // click on add button
  //     partner.addButton.click();
  //     // type in existing trial name
  //     partner.customerNameInput.sendKeys(newTrial.customerName);
  //     // type in existing trial email
  //     partner.customerNameInput.sendKeys(newTrial.customerEmail);
  //     // click start trial
  //     partner.startTrialButton.click();
  //     // expect error
  //     notification.assertError('');
  //   });

  //   it('should edit an exisiting trial', function(){
  //     // click on exisitng trial
  //     // click on edit trial button
  //     partner.editTrialButton.click();
  //     // change value of license count
  //     // change value of license duration
  //     // click start trial
  //     partner.startTrialButton.click();
  //     // expect success
  //     notification.assertSuccess('');
  //   });

  //   it('should edit an exisiting trial', function(){
  //     // call delete trial

  //     // expect success
  //     notification.assertSuccess('');
  //     // trial should not be in list
  //     partner.assertDeletedTrial(newTrial.customerName);
  //   });


  // });

  // Log Out
  describe('Log Out', function() {
    it('should log out', function() {
      navigation.logout();
    });
  });
});
