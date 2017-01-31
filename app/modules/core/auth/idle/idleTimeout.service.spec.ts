import idleTimeoutModule from './index';

describe('Service: IdleTimeoutService: ', function () {

  let Auth, FeatureToggleService, IdleTimeoutService, Config, $rootScope, $timeout, $log, $q, $window, $document;

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
    Auth = FeatureToggleService = IdleTimeoutService = Config = $timeout = $rootScope =  $log = $q = $window = $document = undefined;
  });

  function dependencies(_$document_, _$log_, _$q_, _$rootScope_, _$timeout_, _$window_, _Auth_,  _Config_, _FeatureToggleService_, _IdleTimeoutService_) {
    IdleTimeoutService = _IdleTimeoutService_;
    Auth = _Auth_;
    Config = _Config_;
    FeatureToggleService = _FeatureToggleService_;
    $timeout = _$timeout_;
    $window = _$window_;
    $rootScope = _$rootScope_;
    $document = _$document_;
    $log = _$log_;
    $q = _$q_;
  }

  function initSpies() {
    spyOn($log, 'debug');
    spyOn(Auth, 'logout').and.returnValue($q.resolve({}));
    spyOn(Auth, 'isLoggedIn').and.returnValue(true);
    spyOn($window.localStorage, 'setItem');
    spyOn($window.localStorage, 'removeItem');
    spyOn(FeatureToggleService, 'atlasIdleLogoutGetStatus').and.returnValue($q.resolve(false));
  }
  describe('Should with FT disabled:', () => {
    it('start the timer on init', () => {
      IdleTimeoutService.init();
      expect($log.debug).toHaveBeenCalledWith('Starting Tab Timer');
    });

    it('not wire events on login', () => {
      IdleTimeoutService.init();
      $rootScope.$broadcast('LOGIN');
      $rootScope.$digest();
      expect($log.debug).not.toHaveBeenCalledWith('Wiring up events');
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
      expect($log.debug).toHaveBeenCalledWith('Wiring up events');

    });

    it('log user out once the timout expires', () => {
      $timeout.flush();
      expect(Auth.logout).toHaveBeenCalled();
    });

    it('log user out ONLY after the timeout expires', () => {
      expect($log.debug).toHaveBeenCalledWith('Starting Tab Timer');
      expect(Auth.logout).not.toHaveBeenCalled();
      $timeout.flush();
      expect($log.debug).not.toHaveBeenCalledWith('broadcasting to keep alive');
      expect(Auth.logout).toHaveBeenCalled();
    });

    it('not reset the timer without user action', () => {

      expect($log.debug).toHaveBeenCalledWith('Starting Tab Timer');
      expect($log.debug).not.toHaveBeenCalledWith('broadcasting to keep alive');
    });

    it('reset the timer with user action', () => {
      let element = angular.element(IdleTimeoutService.$document);
      expect($log.debug).toHaveBeenCalledWith('Starting Tab Timer');
      element.triggerHandler('keydown');
      expect($log.debug).toHaveBeenCalledWith('broadcasting to keep alive');
      expect(Auth.logout).not.toHaveBeenCalled();
    });
  });
});
