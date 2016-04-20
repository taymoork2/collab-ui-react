'use strict';

/* global LONG_TIMEOUT */

describe('Onboard users with Meeting Service', function () {
  var token;
  var testUser = utils.randomTestGmailwithSalt('meetings');
  var LICENSE = users.paidMtgCheckbox;

  it('should login as an account admin', function () {
    login.login('account-admin', '#/users')
      .then(function (bearerToken) {
        token = bearerToken;
      });
  });

  describe('Onboard user', function () {
    it('should add a user (Meeting On)', function () {
      users.createUserWithLicense(testUser, LICENSE);
    });

    it('should check (Meeting On) then uncheck', function () {
      users.clickServiceCheckbox(testUser, false, true, LICENSE);
    });

    it('should check (Meeting Off) then check', function () {
      users.clickServiceCheckbox(testUser, false, false, LICENSE);
    });

    it('should check (Meeting On)', function () {
      users.clickServiceCheckbox(testUser, false, true, LICENSE);
    });
  });

  afterAll(function () {
    deleteUtils.deleteUser(testUser, token);
  });
});
