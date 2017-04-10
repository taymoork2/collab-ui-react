'use strict';

var ActivatePage = function () {
  this.provisionSuccess = element(by.id('provisionSuccess'));
  this.codeExpired = element(by.id('codeExpired'));
  this.resendSuccess = element(by.id('resendSuccess'));
  this.userEmail = element(by.binding('userEmail'));
  this.sendCodeLink = element(by.id('sendCodeLink'));
  this.testData = element(by.id('testdata'));

  // setup -- specify deviceUA = '' for web activation
  this.setup = function setup(deviceUA, email) {
    var obj = {
      body: this.getTestBody(email),
      deviceUA: deviceUA,
    };

    var flow = protractor.promise.controlFlow();
    flow.execute(getToken.bind(null, obj));
    flow.execute(verifyEmail.bind(null, obj));
    expect(obj.encryptedQueryParam).not.toBeNull();
    return obj;
  }

  this.getTestBody = function getTestBody(email) {
    return {
      'email': email || utils.randomTestGmail(),
      'pushId': utils.randomId(),
      'deviceName': utils.randomId(),
      'deviceId': utils.randomId(),
    };
  }

  function getToken(obj) {
    var options = {
      method: 'post',
      url: config.oauth2Url + 'access_token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: {
        'user': config.oauthClientRegistration.id,
        'pass': config.oauthClientRegistration.secret,
        'sendImmediately': true,
      },
      body: 'grant_type=client_credentials&scope=' + config.oauthClientRegistration.scope,
    };
    return utils.sendRequest(options).then(function (data) {
      var resp = JSON.parse(data);
      obj.token = resp.access_token;
    });
  }

  function verifyEmail(obj) {
    var options = {
      method: 'post',
      url: config.getAdminServiceUrl() + 'users/email/verify',
      headers: {
        'User-Agent': obj.deviceUA,
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + obj.token,
      },
      body: JSON.stringify(obj.body),
    };
    return utils.sendRequest(options).then(function (data) {
      var resp = JSON.parse(data);
      obj.encryptedQueryParam = resp.eqp;
    });
  }
};

module.exports = ActivatePage;
