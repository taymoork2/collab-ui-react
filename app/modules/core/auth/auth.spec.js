'use strict';

describe('Auth Service', function () {
  beforeEach(module('Core'));

  var Auth, Authinfo, $httpBackend, Config, Storage, SessionStorage, $rootScope, $state, $q, OAuthConfig, UrlConfig, WindowLocation, TokenService;

  beforeEach(inject(function (_Auth_, _Authinfo_, _$httpBackend_, _Config_, _Storage_, _SessionStorage_, _TokenService_, _$rootScope_, _$state_, _$q_, _OAuthConfig_, _UrlConfig_, _WindowLocation_) {
    $q = _$q_;
    Auth = _Auth_;
    Config = _Config_;
    $state = _$state_;
    Storage = _Storage_;
    Authinfo = _Authinfo_;
    UrlConfig = _UrlConfig_;
    $rootScope = _$rootScope_;
    OAuthConfig = _OAuthConfig_;
    $httpBackend = _$httpBackend_;
    SessionStorage = _SessionStorage_;
    TokenService = _TokenService_;
    WindowLocation = _WindowLocation_;

    spyOn(WindowLocation, 'set');
    spyOn($state, 'go').and.returnValue($q.when());
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should redirect to login if redirectToLogin method is called without email else to oauthURL', function () {
    Auth.redirectToLogin();
    expect($state.go).toHaveBeenCalled();
  });

  it('should redirect to oauthUrl if redirectToLogin method is called with email', function () {
    OAuthConfig.getOauthLoginUrl = sinon.stub().returns('oauthURL');
    Auth.redirectToLogin('email@email.com');
    expect(WindowLocation.set).toHaveBeenCalledWith('oauthURL');
  });

  it('should login if redirectToLogin method is called with sso=true', function () {
    OAuthConfig.getOauthLoginUrl = sinon.stub().returns('oauthURL');
    Auth.redirectToLogin(null, true);
    expect(WindowLocation.set).toHaveBeenCalledWith('oauthURL');
  });

  it('should get customer account info using correct API', function (done) {
    UrlConfig.getAdminServiceUrl = sinon.stub().returns('foo/');

    $httpBackend
      .expectGET('foo/customers?orgId=bar')
      .respond(200, {
        foo: 'bar'
      });

    Auth.getCustomerAccount('bar').then(function (res) {
      expect(res.data.foo).toBe('bar');
      _.defer(done);
    });

    $httpBackend.flush();
  });

  it('should get new access token', function (done) {
    OAuthConfig.getAccessTokenUrl = sinon.stub().returns('url');
    OAuthConfig.getNewAccessTokenPostData = sinon.stub().returns('data');
    OAuthConfig.getOAuthClientRegistrationCredentials = stubCredentials();
    spyOn(Auth, 'verifyOauthState').and.returnValue(true);

    $httpBackend
      .expectPOST('url', 'data', assertCredentials)
      .respond(200, {
        access_token: 'accessTokenFromAPI'
      });

    Auth.getNewAccessToken({
      code: 'argToGetNewAccessToken',
      state: '123-abc-456'
    }).then(function (accessToken) {
      expect(accessToken).toBe('accessTokenFromAPI');
      expect(OAuthConfig.getNewAccessTokenPostData.getCall(0).args[0]).toBe('argToGetNewAccessToken');
      _.defer(done);
    });

    $httpBackend.flush();
  });

  it('should not get new access token', function () {
    OAuthConfig.getAccessTokenUrl = sinon.stub().returns('url');
    OAuthConfig.getNewAccessTokenPostData = sinon.stub().returns('data');
    OAuthConfig.getOAuthClientRegistrationCredentials = stubCredentials();
    spyOn(Auth, 'verifyOauthState').and.returnValue(false);

    Auth.getNewAccessToken({
      code: 'argToGetNewAccessToken',
      state: '123-abc-456'
    }).catch(function (error) {
      expect(error).toBeUndefined();
    });
    $rootScope.$apply();
  });

  it('should refresh access token', function (done) {
    SessionStorage.get = sinon.stub().returns('fromStorage');
    OAuthConfig.getAccessTokenUrl = sinon.stub().returns('url');
    OAuthConfig.getOauthAccessCodeUrl = sinon.stub().returns('accessCodeUrl');
    OAuthConfig.getOAuthClientRegistrationCredentials = stubCredentials();

    $httpBackend
      .expectPOST('url', 'accessCodeUrl', assertCredentials)
      .respond(200, {
        access_token: 'accessTokenFromAPI'
      });

    Auth.refreshAccessToken('argToGetNewAccessToken').then(function (accessToken) {
      expect(accessToken).toBe('accessTokenFromAPI');
      expect(SessionStorage.get.getCall(0).args[0]).toBe('refreshToken');
      expect(OAuthConfig.getOauthAccessCodeUrl.getCall(0).args[0]).toBe('fromStorage');
      _.defer(done);
    });

    $httpBackend.flush();
  });

  it('should set access token', function (done) {
    OAuthConfig.getAccessTokenUrl = sinon.stub().returns('url');
    OAuthConfig.getOAuthClientRegistrationCredentials = stubCredentials();
    OAuthConfig.getAccessTokenPostData = sinon.stub().returns('data');

    $httpBackend
      .expectPOST('url', 'data', assertCredentials)
      .respond(200, {
        access_token: 'accessTokenFromAPI'
      });

    Auth.setAccessToken().then(function (accessToken) {
      expect(accessToken).toBe('accessTokenFromAPI');
      _.defer(done);
    });

    $httpBackend.flush();
  });

  it('should return rejected promise if setAccessToken fails', function (done) {
    OAuthConfig.getAccessTokenUrl = sinon.stub().returns('url');
    OAuthConfig.getOAuthClientRegistrationCredentials = stubCredentials();
    OAuthConfig.getAccessTokenPostData = sinon.stub().returns('data');

    $httpBackend
      .expectPOST('url', 'data', assertCredentials)
      .respond(500, {});

    Auth.setAccessToken().catch(function () {
      _.defer(done);
    });

    $httpBackend.flush();
  });

  it('should refresh token and resend request', function (done) {
    OAuthConfig.getOauth2Url = sinon.stub().returns('');
    OAuthConfig.getAccessTokenUrl = sinon.stub().returns('access_token_url');

    $httpBackend
      .expectPOST('access_token_url')
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
      _.defer(done);
    });

    $httpBackend.flush();
  });

  it('should set refresh token', function () {
    OAuthConfig.getAccessTokenUrl = sinon.stub().returns('url');
    OAuthConfig.getOAuthClientRegistrationCredentials = stubCredentials();
    OAuthConfig.getAccessTokenPostData = sinon.stub().returns('data');

    $httpBackend
      .expectPOST('url', 'data', assertCredentials)
      .respond(200, {
        refresh_token: 'refreshTokenFromAPI'
      });

    Storage.clear();
    Auth.setAccessToken().then(function () {
      expect(TokenService.getRefreshToken()).toBe('refreshTokenFromAPI');
    });

    $httpBackend.flush();
  });

  it('should logout and redirect to a provided url', function () {
    var loggedOut = sinon.stub();
    Storage.clear = sinon.stub();
    SessionStorage.get = sinon.stub().returns('accessToken');
    OAuthConfig.getOauthDeleteTokenUrl = sinon.stub().returns('OauthDeleteTokenUrl');
    OAuthConfig.getOAuthClientRegistrationCredentials = stubCredentials();

    $httpBackend
      .expectPOST('OauthDeleteTokenUrl', 'token=accessToken', assertCredentials)
      .respond(200, {});

    Auth.logoutAndRedirectTo('logoutUrl').then(loggedOut);

    $httpBackend.flush();

    expect(loggedOut.callCount).toBe(1);
    expect(Storage.clear.callCount).toBe(1);
    expect(WindowLocation.set).toHaveBeenCalledWith('logoutUrl');
  });

  it('should logout and redirect to the default logout url', function () {
    OAuthConfig.getLogoutUrl = sinon.stub().returns('logoutUrl');
    Auth.logoutAndRedirectTo = sinon.stub();
    Auth.logout();
    expect(Auth.logoutAndRedirectTo.calledWith('logoutUrl')).toBe(true);
  });

  describe('authorize', function () {

    beforeEach(function () {
      SessionStorage.get = sinon.stub();
      UrlConfig.getAdminServiceUrl = sinon.stub().returns('path/');
    });

    it('should use correct URL if customer org', function (done) {
      SessionStorage.get.withArgs('customerOrgId').returns('1337');
      $httpBackend
        .expectGET('path/organization/1337/userauthinfo')
        .respond(500, {});

      Auth.authorize().catch(function () {
        _.defer(done);
      });

      $httpBackend.flush();
    });

    it('should use correct URL if partner org', function (done) {
      SessionStorage.get.withArgs('partnerOrgId').returns('1337');
      $httpBackend
        .expectGET('path/organization/1337/userauthinfo?launchpartnerorg=true')
        .respond(500, {});

      Auth.authorize().catch(function () {
        _.defer(done);
      });

      $httpBackend.flush();
    });

    it('should use correct URL if other org', function (done) {
      $httpBackend
        .expectGET('path/userauthinfo')
        .respond(500, {});

      Auth.authorize().catch(function () {
        _.defer(done);
      });

      $httpBackend.flush();
    });

    describe('given user is full admin', function () {

      beforeEach(function () {
        UrlConfig.getMessengerServiceUrl = sinon.stub().returns('msn');
        $httpBackend
          .expectGET('path/userauthinfo')
          .respond(200, {
            orgId: 1337,
            roles: ['Full_Admin']
          });
      });

      it('services should be fetched', function () {
        $httpBackend
          .expectGET('path/organizations/1337/services')
          .respond(500, {});

        Auth.authorize();

        $httpBackend.flush();
      });

      it('returned entitlements should be used and webex api should be called', function () {
        $httpBackend
          .expectGET('path/organizations/1337/services')
          .respond(200, {
            entitlements: ['foo']
          });

        $httpBackend
          .expectGET('msn/orgs/1337/cisync/')
          .respond(200, {});

        Authinfo.initialize = sinon.stub();

        Auth.authorize();

        $httpBackend.flush();

        expect(Authinfo.initialize.callCount).toBe(1);

        var result = Authinfo.initialize.getCall(0).args[0];
        expect(result.services[0]).toBe('foo');
      });

    });

    describe('given user is not admin', function () {

      beforeEach(function () {
        UrlConfig.getMessengerServiceUrl = sinon.stub().returns('msn');
        $httpBackend
          .expectGET('path/userauthinfo')
          .respond(200, {
            orgId: 1337,
            services: [{
              ciService: 'foo',
              sqService: 'bar'
            }]
          });
        $httpBackend
          .expectGET('msn/orgs/1337/cisync/')
          .respond(200, {});
        Authinfo.initialize = sinon.stub();
      });

      it('massaged services are used and webex api should be called', function (done) {
        Auth.authorize().then(function () {
          _.defer(done);
        });

        $httpBackend.flush();

        expect(Authinfo.initialize.callCount).toBe(1);

        var result = Authinfo.initialize.getCall(0).args[0];
        expect(result.services[0].ciName).toBe('foo');
        expect(result.services[0].serviceId).toBe('bar');
        expect(result.services[0].ciService).toBe(undefined);
        expect(result.services[0].sqService).toBe(undefined);
      });

      it('will fetch account info if admin', function (done) {
        Authinfo.isAdmin = sinon.stub().returns(true);
        Authinfo.getOrgId = sinon.stub().returns(42);
        Authinfo.updateAccountInfo = sinon.stub();

        $httpBackend
          .expectGET('path/customers?orgId=42')
          .respond(200, {});

        Auth.authorize().then(function () {
          _.defer(done);
        });

        $httpBackend.flush();
        expect(Authinfo.updateAccountInfo.callCount).toBe(1);
      });

    });

    describe('given admin has read only role', function () {

      beforeEach(function () {
        UrlConfig.getMessengerServiceUrl = sinon.stub().returns('msn');
        $httpBackend
          .expectGET('path/userauthinfo')
          .respond(200, {
            orgId: 1337,
            services: [{
              ciService: 'foo',
              sqService: 'bar'
            }]
          });
        $httpBackend
          .expectGET('msn/orgs/1337/cisync/')
          .respond(200, {});
        Authinfo.initialize = sinon.stub();
      });

      it('will update account info', function (done) {
        Authinfo.isReadOnlyAdmin = sinon.stub().returns(true);
        Authinfo.getOrgId = sinon.stub().returns(42);
        Authinfo.updateAccountInfo = sinon.stub();

        $httpBackend
          .expectGET('path/customers?orgId=42')
          .respond(200, {});

        Auth.authorize().then(function () {
          _.defer(done);
        });

        $httpBackend.flush();
        expect(Authinfo.updateAccountInfo.callCount).toBe(1);
      });

    });

    it('will not add some webex stuff when not Full_Admin/Readonly_Admin', function (done) {
      Authinfo.initialize = sinon.stub();
      UrlConfig.getMessengerServiceUrl = sinon.stub().returns('msn');

      $httpBackend
        .expectGET('path/userauthinfo')
        .respond(200, {
          orgId: 1337,
          services: []
        });

      $httpBackend
        .expectGET('msn/orgs/1337/cisync/')
        .respond(200, {
          orgID: 'foo',
          orgName: 'bar'
        });

      Auth.authorize().then(function () {
        _.defer(done);
      });
      $httpBackend.flush();

      expect(Authinfo.initialize.callCount).toBe(1);

      var result = Authinfo.initialize.getCall(0).args[0];
      expect(result.services.length).toBe(0);
    });

    it('will add some webex stuff given some condition && when Full_Admin', function (done) {
      Authinfo.initialize = sinon.stub();
      UrlConfig.getMessengerServiceUrl = sinon.stub().returns('msn');

      $httpBackend
        .expectGET('path/userauthinfo')
        .respond(200, {
          orgId: 1337,
          roles: ['Full_Admin'],
          services: []
        });

      $httpBackend
        .expectGET('path/organizations/1337/services')
        .respond(200, {
          entitlements: ['foo']
        });

      $httpBackend
        .expectGET('msn/orgs/1337/cisync/')
        .respond(200, {
          orgID: 'foo',
          orgName: 'bar'
        });

      Auth.authorize().then(function () {
        _.defer(done);
      });
      $httpBackend.flush();

      expect(Authinfo.initialize.callCount).toBe(1);

      var result = Authinfo.initialize.getCall(0).args[0];
      expect(result.services.length).toBe(2);
      expect(result.services[1].ciName).toBe('webex-messenger');
    });
  });

  // helpers

  function stubCredentials() {
    return sinon.stub().returns('clientRegistrationCredentials');
  }

  function assertCredentials(headers) {
    return headers['Authorization'] === 'Basic clientRegistrationCredentials';
  }

});
