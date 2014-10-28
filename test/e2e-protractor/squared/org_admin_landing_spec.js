'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global expect */
/* global navigation */
/* global login */
/* global landing */


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

// Logging in. Write your tests after the login flow is complete.
describe('Customer Admin Landing Page License Info', function() {
  describe('Organization not on trials', function() {
    it('login as admin user', function(){
      login.login(nontrialadmin.username, nontrialadmin.password);
    });

    it('Should display default license info', function() {
      navigation.expectCurrentUrl('/home');
      expect(landing.packages.isDisplayed()).toBeTruthy();
      expect(landing.packagesName.getText()).toContain('Default');
      expect(landing.packagesUnlimited.isDisplayed()).toBeTruthy();
      expect(landing.devices.isDisplayed()).toBeTruthy();
      expect(landing.licenses.isDisplayed()).toBeTruthy();
      expect(landing.licensesBought.getText()).toContain('Unlimited');
      expect(landing.licensesUsed.isDisplayed()).toBeTruthy();
      expect(landing.unlicencedUsers.isDisplayed()).toBeTruthy();
    });

    it('should display quick links', function() {
      expect(landing.getQuickLinks()).toBe(3);
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
      navigation.expectCurrentUrl('/home');
      expect(landing.packages.isDisplayed()).toBeTruthy();
      expect(landing.packagesName.getText()).toContain('COLLAB');
      expect(landing.packagesDaysLeft.isDisplayed()).toBeTruthy();
      expect(landing.devices.isDisplayed()).toBeTruthy();
      expect(landing.licenses.isDisplayed()).toBeTruthy();
      expect(landing.licensesBought.getText()).toNotContain('Unlimited');
      expect(landing.licensesLeft.isDisplayed()).toBeTruthy();
      expect(landing.unlicencedUsers.isDisplayed()).toBeTruthy();
    });
 
    it('should display quick links', function() {
      expect(landing.getQuickLinks()).toBe(2);
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
       // navigation.clickHome();
      navigation.expectCurrentUrl('/home');
      expect(landing.packages.isDisplayed()).toBeFalsy();
      expect(landing.devices.isDisplayed()).toBeFalsy();
      expect(landing.licenses.isDisplayed()).toBeFalsy();
      expect(landing.unlicencedUsers.isDisplayed()).toBeFalsy();
    });
 
    it('should display quick links', function() {
      expect(landing.getQuickLinks()).toBe(1);
    });

    it('should log out', function() {
      navigation.logout();
    });
  });
});

