'use strict';

describe('Service: Analytics', function () {
  var Config, Analytics, Authinfo, Orgservice, $q, $scope, $state;
  var trialData = getJSONFixture('core/json/trials/trialData.json');

  beforeEach(angular.mock.module(require('./index')));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_$q_, $rootScope, _$state_, _Config_, _Analytics_, _Authinfo_, _Orgservice_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    $state = _$state_;
    Config = _Config_;
    Analytics = _Analytics_;
    Authinfo = _Authinfo_;
    Orgservice = _Orgservice_;
  }

  function initSpies() {
    spyOn(Config, 'isProd');
    spyOn(Analytics, '_init').and.returnValue($q.when());
    spyOn(Analytics, '_track').and.callFake(_.noop);
    spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
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
      Analytics.trackTrialSteps(Analytics.eventNames.START, 'someState', '123');
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });
    it('should send correct trial data', function () {
      Analytics.trackTrialSteps(Analytics.eventNames.START, 'someState', '123', trialData.enabled);
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
      var props = Analytics._track.calls.mostRecent().args[1];
      expect(props.duration).toBeDefined();
      expect(props.servicesArray).toBeDefined();
    });
  });

  describe('when calling partner events', function () {
    it('should call _track when trackPartnerActions is called to remove', function () {
      Analytics.trackPartnerActions(Analytics.sections.PARTNER.eventNames.REMOVE, 'removePage', '123');
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });

    it('should call _track when trackUserPatch is called to patch', function () {
      Analytics.trackPartnerActions(Analytics.sections.PARTNER.eventNames.PATCH, '123', '456');
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });
  });

  describe('when calling first time wizard events', function () {
    it('should call _track when trackSelectedCheckbox is called', function () {
      Analytics.trackUserOnboarding(Analytics.sections.USER_ONBOARDING.eventNames.CMR_CHECKBOX, 'somePage', '123', { licenseId: '345' });
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });

    it('should call _track when trackConvertUser is called', function () {
      Analytics.trackUserOnboarding(Analytics.sections.USER_ONBOARDING.eventNames.CONVERT_USER, 'somePage', '123', {});
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });
  });

  describe('when calling track error', function () {
    beforeEach(function () {
      spyOn(Authinfo, 'getUserId').and.returnValue('111');
      spyOn(Authinfo, 'getOrgId').and.returnValue('999');
      _.set($state, '$current.name', 'my-state');
    });
    it('should send necessary properties in event', function () {
      var error = new Error('Something went wrong');
      Analytics.trackError(error, 'some cause');
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalledWith('Runtime Error', jasmine.objectContaining({
        message: 'Something went wrong',
        cause: 'some cause',
        userId: '111',
        orgId: '999',
        state: 'my-state'
      }));
    });
  });
});
