'use strict';

fdescribe('Auth Service', function () {
  beforeEach(module('Core'));

  var Auth, $httpBackend, Config, Storage, $window;

  beforeEach(module(function ($provide) {
    $provide.value('$window', $window = {});
  }));

  beforeEach(inject(function (_Auth_, _$httpBackend_, _Config_, _Storage_) {
    Auth = _Auth_;
    Config = _Config_;
    Storage = _Storage_;
    $httpBackend = _$httpBackend_;
  }));

  it('should get account info using correct API', function (done) {
    Config.getAdminServiceUrl = sinon.stub().returns('foo/');

    $httpBackend
      .expectGET('foo/organization/bar/accounts')
      .respond(200, {
        foo: 'bar'
      });

    Auth.getAccount('bar').then(function (res) {
      expect(res.data.foo).toBe('bar');
      done();
    });

    $httpBackend.flush();
  });

  it('should get new access token', function (done) {
    Config.oauthClientRegistration = {
      scope: 'scope'
    };
    Config.getOauth2Url = sinon.stub().returns('oauth/');
    Config.getRedirectUrl = sinon.stub().returns('redir');
    Config.getOauthCodeUrl = sinon.stub().returns('codeUrl-');
    Config.getOAuthClientRegistrationCredentials = sinon.stub().returns('clientRegistrationCredentials');

    $httpBackend
      .expectPOST('oauth/access_token', 'codeUrl-scope&redir', function (headers) {
        return headers['Authorization'] == 'Basic clientRegistrationCredentials';
      })
      .respond(200, {
        access_token: 'accessTokenFromAPI'
      });

    Auth.getNewAccessToken('argToGetNewAccessToken').then(function (accessToken) {
      expect(accessToken).toBe('accessTokenFromAPI');
      expect(Config.getOauthCodeUrl.getCall(0).args[0]).toBe('argToGetNewAccessToken');
      done();
    });

    $httpBackend.flush();
  });

  it('should refresh access token', function (done) {
    Storage.get = sinon.stub().returns('fromStorage');
    Config.getOauth2Url = sinon.stub().returns('oauth2Url/');
    Config.getOauthAccessCodeUrl = sinon.stub().returns('accessCodeUrl');
    Config.getOAuthClientRegistrationCredentials = sinon.stub().returns('clientRegistrationCredentials');

    $httpBackend
      .expectPOST('oauth2Url/access_token', 'accessCodeUrl', function (headers) {
        return headers['Authorization'] == 'Basic clientRegistrationCredentials';
      })
      .respond(200, {
        access_token: 'accessTokenFromAPI'
      });

    Auth.refreshAccessToken('argToGetNewAccessToken').then(function (accessToken) {
      expect(accessToken).toBe('accessTokenFromAPI');
      expect(Storage.get.getCall(0).args[0]).toBe('refreshToken');
      expect(Config.getOauthAccessCodeUrl.getCall(0).args[0]).toBe('fromStorage');
      done();
    });

    $httpBackend.flush();
  });

  it('should set access token', function (done) {
    Config.getOauth2Url = sinon.stub().returns('oauth2Url/');
    Config.oauthClientRegistration = {
      atlas: {
        scope: 'scope'
      }
    };
    Config.oauthUrl = {
      oauth2ClientUrlPattern: 'oauth2ClientUrlPattern-'
    };
    Config.getOAuthClientRegistrationCredentials = sinon.stub().returns('clientRegistrationCredentials');

    $httpBackend
      .expectPOST('oauth2Url/access_token', 'oauth2ClientUrlPattern-scope', function (headers) {
        return headers['Authorization'] == 'Basic clientRegistrationCredentials';
      })
      .respond(200, {
        access_token: 'accessTokenFromAPI'
      });

    Auth.setAccessToken().then(function (accessToken) {
      expect(accessToken).toBe('accessTokenFromAPI');
      done();
    });

    $httpBackend.flush();
  });

  it('should refresh token and resend request', function (done) {
    Config.getOauth2Url = sinon.stub().returns('');

    $httpBackend
      .expectPOST('access_token')
      .respond(200, {
        access_token: ''
      });

    $httpBackend
      .expectGET('foo')
      .respond(200, {
        bar: 'baz'
      });

    Auth.refreshAccessTokenAndResendRequest({
      config: {
        method: 'GET',
        url: 'foo'
      }
    }).then(function (res) {
      expect(res.data.bar).toBe('baz');
      done();
    });

    $httpBackend.flush();
  });

  it('should logout', function () {
    var loggedOut = sinon.stub();
    $window.location = {};
    Storage.clear = sinon.stub();
    Config.getLogoutUrl = sinon.stub().returns('logoutUrl');
    Storage.get = sinon.stub().returns('accessToken');
    Config.getOauthDeleteTokenUrl = sinon.stub().returns('OauthDeleteTokenUrl');
    Config.getOAuthClientRegistrationCredentials = sinon.stub().returns('clientRegistrationCredentials');

    $httpBackend
      .expectPOST('OauthDeleteTokenUrl', 'token=accessToken', function (headers) {
        return headers['Authorization'] == 'Basic clientRegistrationCredentials';
      })
      .respond(200, {});

    Auth.logout().then(loggedOut);

    $httpBackend.flush();

    expect(Storage.clear.callCount).toBe(1);
    expect($window.location.href).toBe('logoutUrl');
    expect(loggedOut.callCount).toBe(1);
  });

});
