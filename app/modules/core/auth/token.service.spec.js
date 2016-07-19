'use strict';

describe('TokenService', function () {
  beforeEach(module('Core'));

  var Auth, Config, SessionStorage, Storage, TokenService, $rootScope, $window, $injector;
  var windowMock = {
    open: sinon.stub(),
    sessionStorage: {},
    localStorage: {
      setItem: function () {},
      removeItem: function () {}
    }
  };

  beforeEach(inject(function (_Auth_, _Config_, _SessionStorage_, _Storage_, _TokenService_, _$injector_, _$rootScope_) {
    Auth = _Auth_;
    Config = _Config_;
    $rootScope = _$rootScope_;
    $injector = _$injector_;
    SessionStorage = _SessionStorage_;
    TokenService = _TokenService_;
    Storage = _Storage_;
    $window = windowMock;

    spyOn($window.localStorage, 'setItem');
    spyOn($window.localStorage, 'removeItem');
    spyOn(SessionStorage, 'get').and.returnValue('test');
    spyOn(SessionStorage, 'put');
  }));

  it('should call the SessionStorage service to set the accessToken', function () {
    TokenService.setAccessToken('test');
    expect(SessionStorage.put).toHaveBeenCalledWith('accessToken', 'test');
  });

  it('should call the SessionStorage service to set the refreshToken', function () {
    TokenService.setRefreshToken('test');
    expect(SessionStorage.put).toHaveBeenCalledWith('refreshToken', 'test');
  });
});
