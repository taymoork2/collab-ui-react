'use strict';

describe('Service: Analytics', function () {
  var Config, Analytics, Orgservice, $q, $scope, $window;

  beforeEach(module('Core'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_$q_, $rootScope, _$window_, _Config_, _Analytics_, _Orgservice_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    $window = _$window_;
    Config = _Config_;
    Analytics = _Analytics_;
    Orgservice = _Orgservice_;
  }

  function initSpies() {
    spyOn(Config, 'isProd');
    spyOn(Analytics, '_init').and.returnValue($q.when());
    spyOn(Analytics, '_track').and.callFake(_.noop);
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
      Analytics.trackEvent('myState', {});
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });

    it('should not call _track if it is also not a test org', function () {
      Analytics._init.and.returnValue($q.reject());
      spyOn(Analytics, 'getTestOrg').and.returnValue(false);
      expect(Analytics._track).not.toHaveBeenCalled();
    });
  });

  describe('when Production is true', function () {
    beforeEach(setIsProd(true));

    it('should call _track', function () {
      Analytics.trackEvent('myState', {});
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });
  });

});
