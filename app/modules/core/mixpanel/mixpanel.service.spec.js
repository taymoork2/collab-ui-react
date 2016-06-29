'use strict';

describe('Service: Mixpanel', function () {
  var Config, Mixpanel, Orgservice, $q, $scope, $window;

  beforeEach(angular.mock.module('Core'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_$q_, $rootScope, _$window_, _Config_, _Mixpanel_, _Orgservice_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    $window = _$window_;
    Config = _Config_;
    Mixpanel = _Mixpanel_;
    Orgservice = _Orgservice_;
  }

  function initSpies() {
    spyOn(Config, 'isProd');
    spyOn(Mixpanel, '_init').and.returnValue($q.when());
    spyOn(Mixpanel, '_track').and.callFake(_.noop);
    spyOn(Orgservice, 'getOrg').and.callFake(function (callback, oid) {
      callback({
        success: true,
        isTestOrg: true
      }, 200);
    });
  }

  function setIsProd(isProd) {
    return function () {
      Config.isProd.and.returnValue(isProd);
    };
  }

  describe('when Production is false', function () {
    beforeEach(setIsProd(false));

    it('should call _track', function () {
      Mixpanel.trackEvent('myState', {});
      $scope.$apply();
      expect(Mixpanel._track).toHaveBeenCalled();
    });

    it('should not call _track if it is also not a test org', function () {
      Mixpanel._init.and.returnValue($q.reject());
      spyOn(Mixpanel, 'getTestOrg').and.returnValue(false);
      expect(Mixpanel._track).not.toHaveBeenCalled();
    });
  });

  describe('when Production is true', function () {
    beforeEach(setIsProd(true));

    it('should call _track', function () {
      Mixpanel.trackEvent('myState', {});
      $scope.$apply();
      expect(Mixpanel._track).toHaveBeenCalled();
    });
  });

});
