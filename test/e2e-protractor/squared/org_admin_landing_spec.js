'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global navigation */
/* global login */
/* global landing */
/* global utils */

xdescribe('Customer Admin Landing Page License Info', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  describe('Organization not on trials', function () {
    it('login as admin user', function () {
      login.login('non-trial-admin');
    });

    it('should log out', function () {
      navigation.logout();
    });
  });

  describe('Oranization on trial', function () {
    it('should login as non squared team member admin user', function () {
      login.login('test-user');
    });

    it('should log out', function () {
      navigation.logout();
    });
  });

  describe('Non admin user, no license info', function () {
    it('should login as non-admin user', function () {
      login.login('invite-admin');
    });

  });
});
