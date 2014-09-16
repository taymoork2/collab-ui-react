'use strict';

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */
/* global protractor */

// Notes:
// - State is conserved between each describe and it blocks.
// - When a page is being loaded, use wait() to check if elements are there before asserting.

var token = null;
var testEmail = utils.randomTestGmail();
var deviceUserAgent = config.deviceUserAgent.iPhone;
var encryptedQueryParam = null;
var resentEqp = null;

var testBody = {
  'email': testEmail,
  'pushId': utils.randomId(),
  'deviceName': utils.randomId(),
  'deviceId': utils.randomId()
};

function getToken() {
  console.log('getting token');
  var options = {
    method: 'post',
    url: config.oauth2Url + 'access_token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    auth: {
      'user': config.oauthClientRegistration.id,
      'pass': config.oauthClientRegistration.secret,
      'sendImmediately': true
    },
    body: 'grant_type=client_credentials&scope=' + config.oauthClientRegistration.scope
  };

  return utils.sendRequest(options).then(function(data) {
    var resp = JSON.parse(data);
    console.log('access token', resp.access_token);
    token = resp.access_token;
  });
}

function verifyEmail() {
  var options = {
    method: 'post',
    url: config.adminServiceUrl.integration + 'users/email/verify',
    headers: {
      'User-Agent': deviceUserAgent,
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify(testBody)
  };

  return utils.sendRequest(options).then(function(data) {
    var resp = JSON.parse(data);
    console.log('encrypted param', resp.eqp);
    encryptedQueryParam = resp.eqp;
  });
}

function setup(deviceUA) {
  deviceUserAgent = deviceUA;
  var flow = protractor.promise.controlFlow();
  flow.execute(getToken);
  flow.execute(verifyEmail);
}

setup(config.deviceUserAgent.iPhone);

describe('Self Registration Activation Page', function() {

  var invalidatedParam;

  describe('Desktop activation for iOS device', function() {

    it('should display without admin controls on navigation bar', function() {

      expect(encryptedQueryParam).not.toBe(null);

      browser.get('#/activate?eqp=' + encryptedQueryParam);

      expect(users.logoutButton.isDisplayed()).toBeFalsy();
      expect(users.iconSearch.isDisplayed()).toBeFalsy();
      expect(users.searchField.isDisplayed()).toBeFalsy();
      expect(users.settingsBar.isDisplayed()).toBeFalsy();
    });

    it('should activate user and display success info', function() {
      expect(activate.provisionSuccess.isDisplayed()).toBeTruthy();
      expect(activate.codeExpired.isDisplayed()).toBeFalsy();
      expect(activate.resendSuccess.isDisplayed()).toBeFalsy();

      invalidatedParam = encryptedQueryParam;
      // setting up next test
      invalidatedParam = encryptedQueryParam;
      setup(config.deviceUserAgent.android);
    });
  });

  describe('Desktop activation for android device', function() {

    it('should display without admin controls on navigation bar', function() {
      browser.get('#/activate?eqp=' + encryptedQueryParam);

      expect(users.logoutButton.isDisplayed()).toBeFalsy();
      expect(users.iconSearch.isDisplayed()).toBeFalsy();
      expect(users.searchField.isDisplayed()).toBeFalsy();
      expect(users.settingsBar.isDisplayed()).toBeFalsy();

      // run = false;
    });

    it('should activate user and display success info', function() {
      expect(activate.provisionSuccess.isDisplayed()).toBeTruthy();
      expect(activate.codeExpired.isDisplayed()).toBeFalsy();
      expect(activate.resendSuccess.isDisplayed()).toBeFalsy();

      // run = false;
    });
  });

  describe('Desktop activation after code is invalidated', function() {

    it('should display without admin controls on navigation bar', function() {
      browser.get('#/activate?eqp=' + invalidatedParam);

      expect(users.logoutButton.isDisplayed()).toBeFalsy();
      expect(users.iconSearch.isDisplayed()).toBeFalsy();
      expect(users.searchField.isDisplayed()).toBeFalsy();
      expect(users.settingsBar.isDisplayed()).toBeFalsy();
    });


    it('should display code expired with user email', function() {
      expect(activate.provisionSuccess.isDisplayed()).toBeFalsy();
      expect(activate.codeExpired.isDisplayed()).toBeTruthy();
      expect(activate.resendSuccess.isDisplayed()).toBeFalsy();
      expect(activate.userEmail.getText()).toContain(testEmail);
    });

    it('should request new code when link is clicked', function() {
      activate.sendCodeLink.click();
      expect(activate.provisionSuccess.isDisplayed()).toBeFalsy();
      expect(activate.codeExpired.isDisplayed()).toBeFalsy();
      expect(activate.resendSuccess.isDisplayed()).toBeTruthy();
        activate.testData.getAttribute('eqp').then(function(eqp) {
          expect(eqp).not.toBe(null);
          resentEqp = eqp;
        });
    });

    it('should delete added user', function() {
      deleteUtils.deleteUser(testEmail).then(function(message) {
        expect(message).toEqual(200);
      }, function(data) {
        expect(data.status).toEqual(200);
      });
    });

  });

});
