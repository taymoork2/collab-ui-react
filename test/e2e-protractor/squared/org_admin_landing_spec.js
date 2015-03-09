'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global navigation */
/* global login */
/* global landing */
/* global utils */

// Logging in. Write your tests after the login flow is complete.
describe('Customer Admin Landing Page License Info', function () {

  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });
  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  describe('Organization not on trials', function () {
    it('login as admin user', function () {
      login.login(landing.nontrialadmin.username, landing.nontrialadmin.password);
    });

    xit('Should display default license info', function () {
      utils.expectIsDisplayed(landing.packages);
      utils.expectIsDisplayed(landing.packagesUnlimited);
      utils.expectIsDisplayed(landing.devices);
      utils.expectIsDisplayed(landing.licenses);
      utils.expectIsDisplayed(landing.licensesUsed);
      utils.expectIsDisplayed(landing.unlicensedUsers);
    });

    it('should display the right quick links', function () {
      utils.expectIsDisplayed(landing.addUserQuickLink);
      utils.expectIsDisplayed(landing.installDeviceSharedSpaceQuickLink);
      utils.expectIsDisplayed(landing.deviceLogsQuickLink);
      utils.expectIsNotDisplayed(landing.installDeviceQuickLink);
      utils.expectIsNotDisplayed(landing.autoAttendantQuickLink);
    });

    it('should log out', function () {
      navigation.logout();
    });
  });

  describe('Oranization on trial', function () {
    it('should login as non squared team member admin user', function () {
      login.login(landing.trialadmin.username, landing.trialadmin.password);
    });

    xit('Should display trial license info', function () {
      utils.expectIsDisplayed(landing.packages);
      utils.expectIsDisplayed(landing.devices);
      utils.expectIsDisplayed(landing.licenses);
      utils.expectIsDisplayed(landing.licensesLeft);
      utils.expectIsDisplayed(landing.unlicensedUsers);
    });

    it('should display the right quick links', function () {
      utils.expectIsDisplayed(landing.addUserQuickLink);
      utils.expectIsNotDisplayed(landing.installDeviceSharedSpaceQuickLink);
      utils.expectIsDisplayed(landing.deviceLogsQuickLink);
      utils.expectIsNotDisplayed(landing.installDeviceQuickLink);
      utils.expectIsNotDisplayed(landing.autoAttendantQuickLink);
    });

    it('should log out', function () {
      navigation.logout();
    });
  });

  describe('Non admin user, no license info', function () {
    it('should login as non-admin user', function () {
      login.login(landing.nonadmin.username, landing.nonadmin.password);
    });

    it('Should not display license info', function () {
      utils.expectIsNotDisplayed(landing.packages);
      utils.expectIsNotDisplayed(landing.devices);
      utils.expectIsNotDisplayed(landing.licenses);
      utils.expectIsNotDisplayed(landing.unlicensedUsers);
    });

    it('should display the right quick links', function () {
      utils.expectIsNotDisplayed(landing.addUserQuickLink);
      utils.expectIsNotDisplayed(landing.installDeviceSharedSpaceQuickLink);
      utils.expectIsDisplayed(landing.deviceLogsQuickLink);
      utils.expectIsNotDisplayed(landing.installDeviceQuickLink);
      utils.expectIsNotDisplayed(landing.autoAttendantQuickLink);
    });

    it('should log out', function () {
      navigation.logout();
    });
  });
});
