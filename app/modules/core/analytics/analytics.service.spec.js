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
      spyOn(Analytics, 'checkIfTestOrg').and.returnValue(false);
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

  describe('when calling trial events', function () {
    it('should call _track when trackTrialSteps is called', function () {
      Analytics.trackTrialSteps(Analytics.eventNames.START, 'testUser');
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });
  });

  describe('when calling partner events', function () {
    it('should call _track when trackAssignPartner is called', function () {
      Analytics.trackAssignPartner('4567');
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });

    it('should call _track when trackRemovePartner is called', function () {
      Analytics.trackRemovePartner('4567');
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });

    it('should call _track when trackUserPatch is called', function () {
      Analytics.trackUserPatch('123');
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });
  });

  describe('when calling first time wizard events', function () {
    it('should call _track when trackSelectedCheckbox is called', function () {
      Analytics.trackSelectedCheckbox('123');
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });

    it('should call _track when trackConvertUser is called', function () {
      Analytics.trackConvertUser('1234');
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });
  });

});
