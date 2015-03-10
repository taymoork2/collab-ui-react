'use strict';

/* global describe */
/* global it */
/* global browser */
/* global expect */
/* global protractor */

var getTestBody = function () {
  return {
    'email': utils.randomTestGmail(),
    'pushId': utils.randomId(),
    'deviceName': utils.randomId(),
    'deviceId': utils.randomId()
  };
};

function getToken(obj) {
  // //console.log('getting token');
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

  return utils.sendRequest(options).then(function (data) {
    var resp = JSON.parse(data);
    // //console.log('access token', resp.access_token);
    obj.token = resp.access_token;
  });
}

function verifyEmail(obj) {
  var options = {
    method: 'post',
    url: config.adminServiceUrl.integration + 'users/email/verify',
    headers: {
      'User-Agent': obj.deviceUA,
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + obj.token
    },
    body: JSON.stringify(obj.body)
  };

  return utils.sendRequest(options).then(function (data) {
    var resp = JSON.parse(data);
    // //console.log('encrypted param', resp.eqp);
    obj.encryptedQueryParam = resp.eqp;
  });
}

function setup(deviceUA) {
  var obj = {
    body: getTestBody(),
    deviceUA: deviceUA
  };
  var flow = protractor.promise.controlFlow();
  flow.execute(getToken.bind(null, obj));
  flow.execute(verifyEmail.bind(null, obj));
  return obj;
}

describe('Self Registration Activation Page', function () {

  var iosData = setup(config.deviceUserAgent.iPhone);
  var androidData = setup(config.deviceUserAgent.android);

  describe('Desktop activation for iOS device', function () {
    it('should display without admin controls on navigation bar', function () {
      expect(iosData.encryptedQueryParam).not.toBe(null);
      browser.get('#/activate?eqp=' + encodeURIComponent(iosData.encryptedQueryParam));
      navigation.expectAdminSettingsNotDisplayed();
    });

    it('should activate user and display success info', function () {
      utils.expectIsDisplayed(activate.provisionSuccess);
      utils.expectIsNotDisplayed(activate.codeExpired);
      utils.expectIsNotDisplayed(activate.resendSuccess);
    });

  });

  describe('Desktop activation after code is invalidated', function () {

    it('should display without admin controls on navigation bar', function () {
      browser.get('#/activate?eqp=' + encodeURIComponent(iosData.encryptedQueryParam));
      navigation.expectAdminSettingsNotDisplayed();
    });

    it('should display without admin controls on navigation bar', function () {
      var url = '#/activate?eqp=' + encodeURIComponent(iosData.encryptedQueryParam);
      browser.get(url);
      navigation.expectCurrentUrl(url);
      navigation.expectAdminSettingsNotDisplayed();
    });

    it('should display code expired with user email', function () {
      utils.expectIsNotDisplayed(activate.provisionSuccess);
      utils.expectIsDisplayed(activate.codeExpired);
      utils.expectIsNotDisplayed(activate.resendSuccess);
      expect(activate.userEmail.getText()).toContain(iosData.body.email);
    });

    it('should request new code when link is clicked', function () {
      utils.click(activate.sendCodeLink);
      utils.expectIsNotDisplayed(activate.provisionSuccess);
      utils.expectIsNotDisplayed(activate.codeExpired);
      utils.expectIsDisplayed(activate.resendSuccess);

      activate.testData.getAttribute('eqp').then(function (eqp) {
        expect(eqp).not.toBe(null);
      });
    });

  });

  describe('Desktop activation for android device', function () {
    it('should display without admin controls on navigation bar', function () {
      browser.get('#/activate?eqp=' + encodeURIComponent(androidData.encryptedQueryParam));
      navigation.expectAdminSettingsNotDisplayed();
    });

    it('should activate user and display success info', function () {
      utils.expectIsDisplayed(activate.provisionSuccess);
      utils.expectIsNotDisplayed(activate.codeExpired);
      utils.expectIsNotDisplayed(activate.resendSuccess);
    });
  });

  describe('deletes the accounts', function () {
    it('should delete ios user', function () {
      deleteUtils.deleteUser(iosData.body.email);
    });
    it('should delete android user', function () {
      deleteUtils.deleteUser(androidData.body.email);
    });
  });

});
