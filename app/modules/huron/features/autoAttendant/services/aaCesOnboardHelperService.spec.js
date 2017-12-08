'use strict';

describe('Service: AACesOnboardHelperService', function () {
  var AACesOnboardHelperService, $httpBackend, HuronConfig, url;
  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1'),
  };

  var aaCesOnBoardingStatus = {
    csOnboardingStatus: 'SUCCESS',
  };

  var successSpy;
  var failureSpy;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', Authinfo);
  }));

  beforeEach(inject(function (_AACesOnboardHelperService_, _$httpBackend_, _HuronConfig_) {
    AACesOnboardHelperService = _AACesOnboardHelperService_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    url = HuronConfig.getCesUrl() + '/customers/' + Authinfo.getOrgId() + '/config';

    successSpy = jasmine.createSpy('success');
    failureSpy = jasmine.createSpy('failure');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('isCesOnBoarded', function () {
    it('should list all call experiences', function () {
      $httpBackend.whenGET(url).respond(200, aaCesOnBoardingStatus);
      AACesOnboardHelperService.isCesOnBoarded().then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      var args = successSpy.calls.mostRecent().args;
      expect(angular.equals(args[0], aaCesOnBoardingStatus)).toBe(true);
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should NOT notify on Not Found 404', function () {
      $httpBackend.whenGET(url).respond(404);
      AACesOnboardHelperService.isCesOnBoarded().then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on Internal Server Error 500', function () {
      $httpBackend.whenGET(url).respond(500);
      AACesOnboardHelperService.isCesOnBoarded().then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });
});
