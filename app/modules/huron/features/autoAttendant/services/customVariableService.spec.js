'use strict';

describe('Service: CustomVariableService', function () {
  var CustomVariableService, $httpBackend, HuronConfig, url, callExperienceURL, URL, ceId;
  // require('jasmine-collection-matchers');
  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1'),
  };

  var customVarJson = getJSONFixture('huron/json/autoAttendant/aaCustomVariables.json');
  var successSpy;
  var failureSpy;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_CustomVariableService_, _$httpBackend_, _HuronConfig_) {
    CustomVariableService = _CustomVariableService_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    ceId = '1111';
    url = HuronConfig.getCesUrl() + '/customers/' + Authinfo.getOrgId() + '/callExperiences';
    callExperienceURL = url + '/' + ceId;
    URL = callExperienceURL + '/customVariables';

    successSpy = jasmine.createSpy('success');
    failureSpy = jasmine.createSpy('failure');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });


  describe('listCustomVariables', function () {
    it('should list all call experiences', function () {
      $httpBackend.whenGET(URL).respond(200, customVarJson);
      CustomVariableService.listCustomVariables(ceId).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      var args = successSpy.calls.mostRecent().args;
      expect(angular.equals(args[0], customVarJson)).toEqual(true);
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should notify on Not Found Error 404', function () {
      $httpBackend.whenGET(URL).respond(404);
      CustomVariableService.listCustomVariables(ceId).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on Internal Server Error 500', function () {
      $httpBackend.whenGET(URL).respond(500);
      CustomVariableService.listCustomVariables(ceId, '').then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });
});
