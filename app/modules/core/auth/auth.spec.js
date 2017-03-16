'use strict';

var testModule = require('./auth');

describe('Auth Service', function () {
  beforeEach(angular.mock.module(testModule));

  var Auth, Authinfo, $httpBackend, SessionStorage, $rootScope, $state, $q, OAuthConfig, Storage, UrlConfig, WindowLocation, TokenService;

  afterEach(function () {
    Auth = Authinfo = $httpBackend = SessionStorage = $rootScope = $state = $q = OAuthConfig = Storage = UrlConfig = WindowLocation = TokenService = undefined;
  });

  beforeEach(inject(function (_Auth_, _Authinfo_, _$httpBackend_, _SessionStorage_, _LocalStorage_, _TokenService_, _$rootScope_, _$state_, _$q_, _OAuthConfig_, _UrlConfig_, _WindowLocation_) {
    $q = _$q_;
    Auth = _Auth_;
    $state = _$state_;
    Authinfo = _Authinfo_;
    UrlConfig = _UrlConfig_;
    $rootScope = _$rootScope_;
    OAuthConfig = _OAuthConfig_;
    $httpBackend = _$httpBackend_;
    SessionStorage = _SessionStorage_;
    Storage = _LocalStorage_;
    TokenService = _TokenService_;
    WindowLocation = _WindowLocation_;

    spyOn(WindowLocation, 'set');
    spyOn($state, 'go').and.returnValue($q.resolve());

    this.orgInfo = {
      orgSettingsWithDomain: {
        orgSettings: [
          '{"sparkCallBaseDomain":"sparkc-eu.com"}',
        ],
      },
    };

  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  beforeEach(installPromiseMatchers);

  describe('redirectToLogin()', function () {
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
  });

  describe('getCustomerAccount()', function () {
    it('should get customer account info using correct API', function () {
      UrlConfig.getAdminServiceUrl = sinon.stub().returns('foo/');

      $httpBackend
        .expectGET('foo/customers?orgId=bar')
        .respond(200, {
          foo: 'bar',
        });

      var promise = Auth.getCustomerAccount('bar');

      $httpBackend.flush();
      expect(promise).toBeResolvedWith(jasmine.objectContaining({
        data: {
          foo: 'bar',
        },
      }));
    });
  });

  describe('getNewAccessToken()', function () {
    beforeEach(function () {
      OAuthConfig.getAccessTokenUrl = sinon.stub().returns('url');
      OAuthConfig.getNewAccessTokenPostData = sinon.stub().returns('data');
      OAuthConfig.getOAuthClientRegistrationCredentials = stubCredentials();
      spyOn(Auth, 'verifyOauthState').and.returnValue(true);
    });

    it('should get new access token', function () {
      $httpBackend
        .expectPOST('url', 'data', assertCredentials)
        .respond(200, {
          access_token: 'accessTokenFromAPI',
        });

      var promise = Auth.getNewAccessToken({
        code: 'argToGetNewAccessToken',
        state: '123-abc-456',
      });

      $httpBackend.flush();
      expect(promise).toBeResolvedWith('accessTokenFromAPI');
      expect(OAuthConfig.getNewAccessTokenPostData.getCall(0).args[0]).toBe('argToGetNewAccessToken');
    });

    it('should not get new access token if failure', function () {
      Auth.verifyOauthState.and.returnValue(true);

      $httpBackend
        .expectPOST('url', 'data', assertCredentials)
        .respond(500);

      var promise = Auth.getNewAccessToken({
        code: 'argToGetNewAccessToken',
        state: '123-abc-456',
      });
      $httpBackend.flush();
      expect(promise).toBeRejectedWith(mockResponse(500));
    });

    it('should not get new access token if not oauth state', function () {
      Auth.verifyOauthState.and.returnValue(false);

      var promise = Auth.getNewAccessToken({
        code: 'argToGetNewAccessToken',
        state: '123-abc-456',
      });
      $rootScope.$apply();
      expect(promise).toBeRejectedWith(undefined);
    });
  });

  describe('refreshAccessToken()', function () {
    beforeEach(function () {
      SessionStorage.get = sinon.stub().returns('fromStorage');
      OAuthConfig.getAccessTokenUrl = sinon.stub().returns('url');
      OAuthConfig.getOauthAccessCodeUrl = sinon.stub().returns('accessCodeUrl');
      OAuthConfig.getOAuthClientRegistrationCredentials = stubCredentials();
      spyOn(TokenService, 'completeLogout');
    });

    it('should refresh access token', function () {
      $httpBackend
        .expectPOST('url', 'accessCodeUrl', assertCredentials)
        .respond(200, {
          access_token: 'accessTokenFromAPI',
        });

      var promise = Auth.refreshAccessToken();

      $httpBackend.flush();
      expect(promise).toBeResolvedWith('accessTokenFromAPI');
      expect(SessionStorage.get.getCall(0).args[0]).toBe('refreshToken');
      expect(OAuthConfig.getOauthAccessCodeUrl.getCall(0).args[0]).toBe('fromStorage');
    });

    it('should reject refresh access token if failure', function () {
      $httpBackend
        .expectPOST('url', 'accessCodeUrl', assertCredentials)
        .respond(500);

      var promise = Auth.refreshAccessToken();

      $httpBackend.flush();
      expect(promise).toBeRejectedWith(mockResponse(500));
      expect(SessionStorage.get.getCall(0).args[0]).toBe('refreshToken');
      expect(OAuthConfig.getOauthAccessCodeUrl.getCall(0).args[0]).toBe('fromStorage');
      expect(TokenService.completeLogout).toHaveBeenCalled();
    });

    it('should reject refresh access token if no refresh token', function () {
      SessionStorage.get.returns(undefined);

      var promise = Auth.refreshAccessToken();

      $rootScope.$apply();
      expect(promise).toBeRejectedWith('refreshtoken not found');
      expect(SessionStorage.get.getCall(0).args[0]).toBe('refreshToken');
      expect(OAuthConfig.getOauthAccessCodeUrl.getCall(0).args[0]).toBe(undefined);
      expect(TokenService.completeLogout).toHaveBeenCalled();
    });
  });

  describe('refreshAccessTokenAndResendRequest()', function () {
    beforeEach(function () {
      OAuthConfig.getOauth2Url = sinon.stub().returns('');
      OAuthConfig.getAccessTokenUrl = sinon.stub().returns('access_token_url');
      TokenService.getRefreshToken = sinon.stub().returns('refresh_token');
      spyOn(TokenService, 'completeLogout');
    });

    beforeEach(function () {
      jasmine.clock().install();
      jasmine.clock().mockDate();
    });

    afterEach(function () {
      jasmine.clock().uninstall();
    });

    it('should refresh token and resend request with new access token', function () {
      $httpBackend
        .expectPOST('access_token_url')
        .respond(200, {
          access_token: 'new-access-token',
        });

      $httpBackend
        .expectGET('foo', function (headers) {
          return headers.Authorization === 'Bearer new-access-token';
        })
        .respond(200, {
          bar: 'baz',
        });

      var promise = Auth.refreshAccessTokenAndResendRequest({
        config: {
          method: 'GET',
          url: 'foo',
        },
      });

      $httpBackend.flush();
      expect(promise).toBeResolvedWith(jasmine.objectContaining({
        data: {
          bar: 'baz',
        },
      }));
    });

    it('should refresh token once if multiple retries requested during a 1 second span', function () {
      expectRefreshCountFromTwoRetriesOverSpan(1, 999);
    });

    it('should refresh token multiple times if multiple retries requested after a 1 second span', function () {
      expectRefreshCountFromTwoRetriesOverSpan(2, 1001);
    });

    it('should not refresh token and resend request, should redirect to login', function () {
      OAuthConfig.getLogoutUrl = sinon.stub().returns('logoutUrl');
      $httpBackend
        .expectPOST('access_token_url')
        .respond(500);

      var promise = Auth.refreshAccessTokenAndResendRequest();

      $httpBackend.flush();
      expect(promise).toBeRejectedWith(mockResponse(500));
      expect(TokenService.completeLogout).toHaveBeenCalledWith('logoutUrl');
    });

    function expectRefreshCountFromTwoRetriesOverSpan(expectedRefreshCount, durationOfSpan) {
      var refreshCount = 0;

      $httpBackend
        .whenPOST('access_token_url')
        .respond(function () {
          refreshCount += 1;
          return [200];
        });

      $httpBackend
        .expectGET('foo')
        .respond(200);

      Auth.refreshAccessTokenAndResendRequest({
        config: {
          method: 'GET',
          url: 'foo',
        },
      });

      jasmine.clock().tick(durationOfSpan);

      $httpBackend
        .expectGET('bar')
        .respond(200);

      Auth.refreshAccessTokenAndResendRequest({
        config: {
          method: 'GET',
          url: 'bar',
        },
      });

      $httpBackend.flush();
      expect(refreshCount).toBe(expectedRefreshCount);
    }
  });

  describe('setAccessToken()', function () {
    beforeEach(function () {
      OAuthConfig.getAccessTokenUrl = sinon.stub().returns('url');
      OAuthConfig.getOAuthClientRegistrationCredentials = stubCredentials();
      OAuthConfig.getAccessTokenPostData = sinon.stub().returns('data');
    });

    it('should set access and refresh token', function () {
      $httpBackend
        .expectPOST('url', 'data', assertCredentials)
        .respond(200, {
          access_token: 'accessTokenFromAPI',
          refresh_token: 'refreshTokenFromAPI',
        });

      var promise = Auth.setAccessToken();

      $httpBackend.flush();
      expect(promise).toBeResolvedWith('accessTokenFromAPI');
      expect(TokenService.getRefreshToken()).toBe('refreshTokenFromAPI');
    });

    it('should return rejected promise if setAccessToken fails', function () {
      $httpBackend
        .expectPOST('url', 'data', assertCredentials)
        .respond(500);

      var promise = Auth.setAccessToken();

      $httpBackend.flush();
      expect(promise).toBeRejectedWith(mockResponse(500));
    });
  });

  describe('logoutAndRedirectTo()', function () {
    beforeEach(function () {
      OAuthConfig.getLogoutUrl = sinon.stub().returns('logoutUrl');
      OAuthConfig.getOauthListTokenUrl = sinon.stub().returns('OauthListTokenUrl');
      OAuthConfig.getOauthDeleteRefreshTokenUrl = sinon.stub().returns('refreshtoken=');
      OAuthConfig.getClientId = sinon.stub().returns('ewvmpibn34inbr433f23f4');
      spyOn(TokenService, 'completeLogout');
      spyOn(TokenService, 'getClientSessionId').and.returnValue('testSessionId123');
    });

    it('should delete access tokens, logout, and redirect to a provided url', function () {
      $httpBackend
        .expectGET('OauthListTokenUrl')
        .respond(200, {
          total: 1,
          data: [{
            device_type: null,
            create_time: '2016-07-28 21:39:06',
            client_id: 'ewvmpibn34inbr433f23f4',
            last_used_time: '2016-07-28 21:39:06',
            token_id: 'OauthDeleteRefreshTokenUrl',
            client_name: 'Admin Portal',
            user_info: {
              client_session_id: 'testSessionId123',
            },
          }],
        });

      $httpBackend
        .expectDELETE('refreshtoken=OauthDeleteRefreshTokenUrl')
        .respond(204, 'No Content');

      var promise = Auth.logoutAndRedirectTo('customLogoutUrl');

      $httpBackend.flush();
      expect(promise).toBeResolved();
      expect(TokenService.completeLogout).toHaveBeenCalledWith('customLogoutUrl');
    });

    it('should logout and redirect to a provided url even if delete access tokens fail', function () {
      $httpBackend
        .expectGET('OauthListTokenUrl')
        .respond(200, {
          total: 1,
          data: [{
            device_type: null,
            create_time: '2016-07-28 21:39:06',
            client_id: 'ewvmpibn34inbr433f23f4',
            last_used_time: '2016-07-28 21:39:06',
            token_id: 'OauthDeleteRefreshTokenUrl',
            client_name: 'Admin Portal',
            user_info: {
              client_session_id: 'testSessionId123',
            },
          }],
        });

      $httpBackend
        .expectDELETE('refreshtoken=OauthDeleteRefreshTokenUrl')
        .respond(500);

      var promise = Auth.logoutAndRedirectTo('customLogoutUrl');

      $httpBackend.flush();
      expect(promise).toBeRejectedWith(mockResponse(500));
      expect(TokenService.completeLogout).toHaveBeenCalledWith('customLogoutUrl');
    });

    it('should logout and redirect to a provided url even if we didnt match any refresh tokens on client_session_id', function () {
      $httpBackend
        .expectGET('OauthListTokenUrl')
        .respond(200, {
          total: 1,
          data: [{
            device_type: null,
            create_time: '2016-07-28 21:39:06',
            client_id: 'ewvmpibn34inbr433f23f4',
            last_used_time: '2016-07-28 21:39:06',
            token_id: 'OauthDeleteRefreshTokenUrl',
            client_name: 'Admin Portal',
            user_info: {
              client_session_id: 'testSessionId123-not-correct',
            },
          }],
        });

      var promise = Auth.logoutAndRedirectTo('customLogoutUrl');

      $httpBackend.flush();
      expect(promise).toBeResolved();
      expect(TokenService.completeLogout).toHaveBeenCalledWith('customLogoutUrl');
    });

    it('should logout and redirect to a provided url even if getting the access tokens fails', function () {
      $httpBackend
        .expectGET('OauthListTokenUrl')
        .respond(500);

      var promise = Auth.logoutAndRedirectTo('customLogoutUrl');

      $httpBackend.flush();
      expect(promise).toBeRejectedWith(mockResponse(500));
      expect(TokenService.completeLogout).toHaveBeenCalledWith('customLogoutUrl');
    });
  });

  describe('logout()', function () {
    beforeEach(function () {
      spyOn(TokenService, 'triggerGlobalLogout');
    });

    it('should logout and redirect to the default logout url', function () {
      var logoutDefer = $q.defer();
      OAuthConfig.getLogoutUrl = sinon.stub().returns('logoutUrl');
      Auth.logoutAndRedirectTo = sinon.stub().returns(logoutDefer.promise);
      var promise = Auth.logout();

      expect(TokenService.triggerGlobalLogout).not.toHaveBeenCalled(); // should not be called before logout (token revocation) is complete
      logoutDefer.resolve();
      expect(promise).toBeResolved();  // seems unnecessary, but should be the same promise returned from logoutAndRedirectTo()
      expect(Auth.logoutAndRedirectTo.calledWith('logoutUrl')).toBe(true);
      expect(TokenService.triggerGlobalLogout).toHaveBeenCalled(); // should only be called after logout (token revocation)
    });
    it('should set the message in the local storage if it has been passed in', function () {
      TokenService.triggerGlobalLogout.and.callThrough();
      OAuthConfig.getLogoutUrl = sinon.stub().returns('logoutUrl');
      Auth.logoutAndRedirectTo = sinon.stub().returns($q.resolve());
      var promise = Auth.logout('still there');
      expect(promise).toBeResolved();
      expect(TokenService.triggerGlobalLogout).toHaveBeenCalled(); // should only be called after logout (token revocation)
      expect(Storage.get('loginMessage')).toBe('still there');
    });
  });

  describe('authorize()', function () {
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
            roles: ['Full_Admin'],
          });

        $httpBackend
          .expectGET('path/organizations/1337?disableCache=true')
          .respond(200, this.orgInfo.orgSettingsWithDomain);

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
            entitlements: ['foo'],
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
              sqService: 'bar',
            }],
          });

        $httpBackend
          .expectGET('path/organizations/1337?disableCache=true')
          .respond(200, this.orgInfo.orgSettingsWithDomain);

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
              sqService: 'bar',
            }],
          });

        $httpBackend
          .expectGET('path/organizations/1337?disableCache=true')
          .respond(200, this.orgInfo.orgSettingsWithDomain);

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

    it('will add some webex stuff given some condition && when no roles specified', function (done) {
      Authinfo.initialize = sinon.stub();
      UrlConfig.getMessengerServiceUrl = sinon.stub().returns('msn');

      $httpBackend
        .expectGET('path/userauthinfo')
        .respond(200, {
          orgId: 1337,
          services: [],
        });

      $httpBackend
        .expectGET('path/organizations/1337?disableCache=true')
        .respond(200, this.orgInfo.orgSettingsWithDomain);

      $httpBackend
        .expectGET('msn/orgs/1337/cisync/')
        .respond(200, {
          orgID: 'foo',
          orgName: 'bar',
        });

      Auth.authorize().then(function () {
        _.defer(done);
      });
      $httpBackend.flush();

      expect(Authinfo.initialize.callCount).toBe(1);

      var result = Authinfo.initialize.getCall(0).args[0];
      expect(result.services.length).toBe(1);
      expect(result.services[0].ciName).toBe('webex-messenger');
    });

    it('will add some webex stuff given some condition && when Full_Admin', function (done) {
      Authinfo.initialize = sinon.stub();
      UrlConfig.getMessengerServiceUrl = sinon.stub().returns('msn');

      $httpBackend
        .expectGET('path/userauthinfo')
        .respond(200, {
          orgId: 1337,
          roles: ['Full_Admin'],
          services: [],
        });

      $httpBackend
        .expectGET('path/organizations/1337?disableCache=true')
        .respond(200, this.orgInfo.orgSettingsWithDomain);

      $httpBackend
        .expectGET('path/organizations/1337/services')
        .respond(200, {
          entitlements: ['foo'],
        });

      $httpBackend
        .expectGET('msn/orgs/1337/cisync/')
        .respond(200, {
          orgID: 'foo',
          orgName: 'bar',
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

    it('will not add some webex stuff given some condition && when Full_Admin && inactive wapi org', function (done) {
      Authinfo.initialize = sinon.stub();
      UrlConfig.getMessengerServiceUrl = sinon.stub().returns('msn');

      $httpBackend
        .expectGET('path/userauthinfo')
        .respond(200, {
          orgId: 1337,
          roles: ['Full_Admin'],
          services: [],
        });

      $httpBackend
        .expectGET('path/organizations/1337?disableCache=true')
        .respond(200, this.orgInfo.orgSettingsWithDomain);

      $httpBackend
        .expectGET('path/organizations/1337/services')
        .respond(200, {
          entitlements: ['foo'],
        });
      $httpBackend
        .expectGET('msn/orgs/1337/cisync/')
        .respond(200, {
          orgID: 'foo',
          orgName: 'bar',
          wapiOrgStatus: 'inactive',
        });

      Auth.authorize().then(function () {
        _.defer(done);
      });
      $httpBackend.flush();

      expect(Authinfo.initialize.callCount).toBe(1);

      var result = Authinfo.initialize.getCall(0).args[0];
      expect(result.services.length).toBe(1);
    });

    it('will not add some webex stuff given some condition && when PARTNER_ADMIN', function (done) {
      Authinfo.initialize = sinon.stub();
      UrlConfig.getMessengerServiceUrl = sinon.stub().returns('msn');

      $httpBackend
        .expectGET('path/userauthinfo')
        .respond(200, {
          orgId: 1337,
          roles: ['PARTNER_ADMIN'],
          services: [],
        });

      $httpBackend
        .expectGET('path/organizations/1337?disableCache=true')
        .respond(200, this.orgInfo.orgSettingsWithDomain);

      $httpBackend
        .expectGET('path/organizations/1337/services')
        .respond(200, {
          entitlements: [],
        });

      $httpBackend
        .expectGET('msn/orgs/1337/cisync/')
        .respond(200, {
          orgID: 'foo',
          orgName: 'bar',
        });

      Auth.authorize().then(function () {
        _.defer(done);
      });
      $httpBackend.flush();

      expect(Authinfo.initialize.callCount).toBe(1);

      var result = Authinfo.initialize.getCall(0).args[0];
      expect(result.services.length).toBe(0);
    });
  });

  // helpers

  function stubCredentials() {
    return sinon.stub().returns('clientRegistrationCredentials');
  }

  function assertCredentials(headers) {
    return headers['Authorization'] === 'Basic clientRegistrationCredentials';
  }

  function mockResponse(status) {
    return jasmine.objectContaining({
      status: status,
    });
  }

});
