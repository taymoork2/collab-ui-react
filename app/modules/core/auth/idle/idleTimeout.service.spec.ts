import idleTimeoutModule from './index';

describe('Service: IdleTimeoutService: ', function () {

  let Auth, FeatureToggleService, IdleTimeoutService, Log, Config, $rootScope, $timeout, $q, $window, $document;

  beforeEach(() => {
    angular.mock.module(idleTimeoutModule);
    angular.mock.module($provide => {
      const Auth = {
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
    spyOn(Config, 'getEnv').and.returnValue('dev');
  }

  function getArgumentOccuranceNumberInCalls(allCalls, argument) {
    const callsWithArg = _.filter(allCalls, function (call) {
      return _.includes(call['args'], argument);
    });
    return callsWithArg.length;
  }

  describe('Should on initializing', () => {
    beforeEach(() => {
      IdleTimeoutService.init();
      $rootScope.$broadcast('Core::loginCompleted');
      $rootScope.$digest();
    });

    it('wire events on login', () => {
      expect(Log.debug).toHaveBeenCalledWith('IDLE TIMEOUT SERVICE: Wiring up events');
    });

    it('only do it once regardless of the number of login events', () => {
      $rootScope.$broadcast('Core::loginCompleted');
      $rootScope.$digest();
      $rootScope.$broadcast('Core::loginCompleted');
      $rootScope.$digest();
      expect(Log.debug).toHaveBeenCalledWith('IDLE TIMEOUT SERVICE: Wiring up events');
      expect(Log.debug).toHaveBeenCalledTimes(2);
      expect(getArgumentOccuranceNumberInCalls(Log.debug.calls.all(), 'IDLE TIMEOUT SERVICE: Wiring up events')).toBe(1);
    });

    it('log user out once the timeout expires', () => {
      $timeout.flush();
      expect(Auth.logout).toHaveBeenCalled();
    });

    it('after timeout expiration restart the timer again after user logs back in', () => {
      expect(getArgumentOccuranceNumberInCalls(Log.debug.calls.all(), 'IDLE TIMEOUT SERVICE: Wiring up events')).toBe(1);
      $timeout.flush();
      expect(Auth.logout).toHaveBeenCalled();
      expect(getArgumentOccuranceNumberInCalls(Log.debug.calls.all(), 'IDLE TIMEOUT SERVICE: Wiring up events')).toBe(1);
      $rootScope.$broadcast('Core::loginCompleted');
      $rootScope.$digest();
      expect(getArgumentOccuranceNumberInCalls(Log.debug.calls.all(), 'IDLE TIMEOUT SERVICE: Wiring up events')).toBe(2);
    });

    // idleTabTimeout: 1200000, //20 mins
    it('log user out ONLY after the timeout expires without user action', () => {
      expect(Log.debug).toHaveBeenCalledWith('IDLE TIMEOUT SERVICE: Starting Tab Timer');
      expect(Auth.logout).not.toHaveBeenCalled();
      $timeout.flush(1100000);
      expect(Auth.logout).not.toHaveBeenCalled();
      $timeout.flush(100000);
      expect(Log.debug).not.toHaveBeenCalledWith('IDLE TIMEOUT SERVICE: broadcasting to keep alive');
      expect(Auth.logout).toHaveBeenCalled();
    });

    it('reset the timer with user action', () => {
      const element = angular.element(IdleTimeoutService.$document);
      expect(Log.debug).toHaveBeenCalledWith('IDLE TIMEOUT SERVICE: Starting Tab Timer');
      $timeout.flush(1100000);
      element.triggerHandler('keydown');
      $timeout.flush(100000);
      expect(Log.debug).toHaveBeenCalledWith('IDLE TIMEOUT SERVICE: broadcasting to keep alive');
      expect(Auth.logout).not.toHaveBeenCalled();
    });
    it('reset the timer on IDLE_TIMEOUT_KEEP_ALIVE event', () => {
      expect(Log.debug).toHaveBeenCalledWith('IDLE TIMEOUT SERVICE: Starting Tab Timer');
      $timeout.flush(1100000);
      $rootScope.$broadcast('IDLE_TIMEOUT_KEEP_ALIVE');
      $rootScope.$digest();
      $timeout.flush(100000);
      expect(Log.debug).toHaveBeenCalledWith('IDLE TIMEOUT SERVICE: broadcasting to keep alive');
      expect(Auth.logout).not.toHaveBeenCalled();
    });
  });
});
