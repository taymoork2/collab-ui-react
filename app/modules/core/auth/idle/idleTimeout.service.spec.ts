import idleTimeoutModule from './index';

describe('Service: IdleTimeoutService: ', function () {

  let Auth, FeatureToggleService, IdleTimeoutService, Log, Config, $rootScope, $timeout,  $q, $window, $document;

  beforeEach(() => {
    angular.mock.module(idleTimeoutModule);
    angular.mock.module($provide => {
      let Auth = {
          isLoggedIn: () => true,
          logout: () => { },
      };
      $provide.value('Auth', Auth);
    });
    inject(dependencies);
    initSpies();
  });

  afterEach(() => {
    Auth = FeatureToggleService = IdleTimeoutService = Config = Log = $timeout = $rootScope = $q = $window = $document = undefined;
  });

  function dependencies(_$document_, _$q_, _$rootScope_, _$timeout_, _$window_, _Auth_, _Config_, _FeatureToggleService_, _IdleTimeoutService_, _Log_) {
    IdleTimeoutService = _IdleTimeoutService_;
    Auth = _Auth_;
    Config = _Config_;
    FeatureToggleService = _FeatureToggleService_;
    $timeout = _$timeout_;
    $window = _$window_;
    $rootScope = _$rootScope_;
    $document = _$document_;
    Log = _Log_;
    $q = _$q_;
  }

  function initSpies() {
    spyOn(Log, 'debug');
    spyOn(Auth, 'logout').and.returnValue($q.resolve({}));
    spyOn(Auth, 'isLoggedIn').and.returnValue(true);
    spyOn($window.localStorage, 'setItem');
    spyOn($window.localStorage, 'removeItem');
    spyOn(FeatureToggleService, 'atlasIdleLogoutGetStatus').and.returnValue($q.resolve(false));
  }
  describe('Should with FT disabled:', () => {
    it('start the timer on init', () => {
      IdleTimeoutService.init();
      expect(Log.debug).toHaveBeenCalledWith('Starting Tab Timer');
    });

    it('not wire events on login', () => {
      IdleTimeoutService.init();
      $rootScope.$broadcast('LOGIN');
      $rootScope.$digest();
      expect(Log.debug).not.toHaveBeenCalledWith('Wiring up events');
    });
  });

  describe('Should with FT enabled', () => {
    beforeEach(() => {
      FeatureToggleService.atlasIdleLogoutGetStatus.and.returnValue($q.resolve(true));
      IdleTimeoutService.init();
      $rootScope.$broadcast('LOGIN');
      $rootScope.$digest();
    });

    it('wire events on login', () => {
      expect(Log.debug).toHaveBeenCalledWith('Wiring up events');

    });

    it('log user out once the timout expires', () => {
      $timeout.flush();
      expect(Auth.logout).toHaveBeenCalled();
    });
    // idleTabTimeout: 1200000, //20 mins
    it('log user out ONLY after the timeout expires without user action', () => {
      expect(Log.debug).toHaveBeenCalledWith('Starting Tab Timer');
      expect(Auth.logout).not.toHaveBeenCalled();
      $timeout.flush(1100000);
      expect(Auth.logout).not.toHaveBeenCalled();
      $timeout.flush(100000);
      expect(Log.debug).not.toHaveBeenCalledWith('broadcasting to keep alive');
      expect(Auth.logout).toHaveBeenCalled();
    });

    it('reset the timer with user action', () => {
      let element = angular.element(IdleTimeoutService.$document);
      expect(Log.debug).toHaveBeenCalledWith('Starting Tab Timer');
      $timeout.flush(1100000);
      element.triggerHandler('keydown');
      $timeout.flush(100000);
      expect(Log.debug).toHaveBeenCalledWith('broadcasting to keep alive');
      expect(Auth.logout).not.toHaveBeenCalled();
    });
  });
});
