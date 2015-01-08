'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global expect */
/* global navigation, users */
/* global login */
/* global landing */
/* global utils */


var nontrialadmin = {
  username: 'pbr-test-admin@squared2webex.com',
  password: 'C1sc0123!',
};

var trialadmin = {
  username: 'atlasmapservice+ll1@gmail.com',
  password: 'C1sc0123!',
};

var nonadmin = {
  username: 'pbr-invite-user@squared2webex.com',
  password: 'C1sc0123!',
};

var convertAdmin = {
  username: 'sqtest-admin@squared.example.com',
  password: 'C1sc0123!',
};

// Logging in. Write your tests after the login flow is complete.
describe('Customer Admin Landing Page License Info', function() {
  describe('Organization not on trials', function() {
    it('login as admin user', function(){
      login.login(nontrialadmin.username, nontrialadmin.password);
    });

    it('Should display default license info', function() {
      expect(landing.packages.isDisplayed()).toBeTruthy();
      expect(landing.packagesName.getText()).toContain('Default');
      expect(landing.packagesUnlimited.isDisplayed()).toBeTruthy();
      expect(landing.devices.isDisplayed()).toBeTruthy();
      expect(landing.licenses.isDisplayed()).toBeTruthy();
      expect(landing.licensesBought.getText()).toContain('Unlimited');
      expect(landing.licensesUsed.isDisplayed()).toBeTruthy();
      expect(landing.unlicencedUsers.isDisplayed()).toBeTruthy();
    });

    it('should display the right quick links', function() {
      expect(landing.addUserQuickLink.isDisplayed()).toBeTruthy();
      expect(landing.installDeviceSharedSpaceQuickLink.isDisplayed()).toBeTruthy();
      expect(landing.deviceLogsQuickLink.isDisplayed()).toBeTruthy();
      expect(landing.installDeviceQuickLink.isPresent()).toBeFalsy();
      expect(landing.autoAttendantQuickLink.isPresent()).toBeFalsy();
    });

    it('should log out', function() {
      navigation.logout();
    });
  });

  describe('Oranization on trial', function() {
    it('should login as non squared team member admin user', function(){
      login.login(trialadmin.username, trialadmin.password);
    });

    it('Should display trial license info', function() {
      expect(landing.packages.isDisplayed()).toBeTruthy();
      expect(landing.packagesName.getText()).toContain('COLLAB');
      expect(landing.packagesDaysLeft.isDisplayed()).toBeTruthy();
      expect(landing.devices.isDisplayed()).toBeTruthy();
      expect(landing.licenses.isDisplayed()).toBeTruthy();
      expect(landing.licensesBought.getText()).toNotContain('Unlimited');
      expect(landing.licensesLeft.isDisplayed()).toBeTruthy();
      expect(landing.unlicencedUsers.isDisplayed()).toBeTruthy();
    });

    it('should display the right quick links', function() {
      expect(landing.addUserQuickLink.isDisplayed()).toBeTruthy();
      expect(landing.installDeviceSharedSpaceQuickLink.isDisplayed()).toBeTruthy();
      expect(landing.deviceLogsQuickLink.isPresent()).toBeFalsy();
      expect(landing.installDeviceQuickLink.isPresent()).toBeFalsy();
      expect(landing.autoAttendantQuickLink.isPresent()).toBeFalsy();
    });

    it('should log out', function() {
      navigation.logout();
    });
  });

  describe('Non admin user, no license info', function() {
    it('should login as non-admin user', function(){
      login.login(nonadmin.username, nonadmin.password);
    });

    it('Should not display license info', function() {
      expect(landing.packages.isDisplayed()).toBeFalsy();
      expect(landing.devices.isDisplayed()).toBeFalsy();
      expect(landing.licenses.isDisplayed()).toBeFalsy();
      expect(landing.unlicencedUsers.isDisplayed()).toBeFalsy();
    });

    it('should display the right quick links', function() {
      expect(landing.addUserQuickLink.isPresent()).toBeFalsy();
      expect(landing.installDeviceSharedSpaceQuickLink.isPresent()).toBeFalsy();
      expect(landing.deviceLogsQuickLink.isDisplayed()).toBeTruthy();
      expect(landing.installDeviceQuickLink.isPresent()).toBeFalsy();
      expect(landing.autoAttendantQuickLink.isPresent()).toBeFalsy();
    });

    it('should log out', function() {
      navigation.logout();
    });
  });

  describe('Convert Users Flows', function() {
    it('login as admin user', function(){
      login.login(convertAdmin.username, convertAdmin.password);
    });

    it('should close convert users flow', function() {
      utils.expectIsDisplayed(landing.convertButton);
      landing.convertButton.click();
      utils.expectIsDisplayed(landing.convertDialog);
      utils.expectIsDisplayed(landing.convertModalClose);
      landing.convertModalClose.click();
      browser.sleep(1000);
      expect(landing.convertDialog.isPresent()).toBeFalsy();
    });

    it('should cancel convert users flow', function() {
      utils.expectIsDisplayed(landing.convertButton);
      landing.convertButton.click();
      utils.expectIsDisplayed(landing.convertDialog);
      utils.expectIsDisplayed(landing.convertCancelButton);
      landing.convertCancelButton.click();
      browser.sleep(1000);
      expect(landing.convertDialog.isPresent()).toBeFalsy();
    });

    // for now just click on the convert button and verify that modal is closed
    it('should convert users', function() {
      utils.expectIsDisplayed(landing.convertButton);
      landing.convertButton.click();
      utils.expectIsDisplayed(landing.convertDialog);
      utils.expectIsDisplayed(landing.convertActionButton);
      landing.convertActionButton.click();
      browser.sleep(1000);
      expect(landing.convertDialog.isPresent()).toBeFalsy();
    });

    it('should log out', function() {
      navigation.logout();
    });
  });
});

