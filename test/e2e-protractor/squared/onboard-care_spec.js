'use strict';

/* global LONG_TIMEOUT */

xdescribe('Onboard users with Care Service', function () {
  // TODO : test cases to be enabled once we have sunlight integration org
  var token;
  var testUser = utils.randomTestGmailwithSalt('care');
  var LICENSE = users.paidCareCheckbox;

  it('should login as an account admin', function () {
    login.login('contactcenter-admin', '#/users')
      .then(function (bearerToken) {
        token = bearerToken;
      });
  });

  describe('Onboard user', function () {
    it('should add a user (Care On)', function () {
      users.createUserWithLicense(testUser, LICENSE);
    });
  });

  afterAll(function () {
    // deleteUtils.deleteUser(testUser, token);
  });
});
