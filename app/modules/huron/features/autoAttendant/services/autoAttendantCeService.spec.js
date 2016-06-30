'use strict';

describe('Service: AutoAttendantCeService', function () {
  var AutoAttendantCeService, $httpBackend, HuronConfig, url, callExperienceURL;
  // require('jasmine-collection-matchers');
  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  var callExperiences = getJSONFixture('huron/json/autoAttendant/callExperiences.json');
  var callExperience = getJSONFixture('huron/json/autoAttendant/aCallExperience.json');

  var successSpy;
  var failureSpy;

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_AutoAttendantCeService_, _$httpBackend_, _HuronConfig_) {
    AutoAttendantCeService = _AutoAttendantCeService_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    url = HuronConfig.getCesUrl() + '/customers/' + Authinfo.getOrgId() + '/callExperiences';
    callExperienceURL = url + '/' + '004';

    successSpy = jasmine.createSpy('success');
    failureSpy = jasmine.createSpy('failure');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('listCes', function () {
    it('should list all call experiences', function () {
      $httpBackend.whenGET(url).respond(callExperiences);
      AutoAttendantCeService.listCes().then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      var args = successSpy.calls.mostRecent().args;
      expect(angular.equals(args[0], callExperiences)).toEqual(true);
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should NOT notify on Not Found 404', function () {
      $httpBackend.whenGET(url).respond(404);
      AutoAttendantCeService.listCes().then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on Internal Server Error 500', function () {
      $httpBackend.whenGET(url).respond(500);
      AutoAttendantCeService.listCes().then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('readCe', function () {
    it('should notify on success', function () {
      $httpBackend.whenGET(callExperienceURL).respond(200, callExperience);
      AutoAttendantCeService.readCe(callExperienceURL).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      var args = successSpy.calls.mostRecent().args;
      expect(angular.equals(args[0], callExperience)).toEqual(true);
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should notify on Bad Request Error 400', function () {
      $httpBackend.whenGET(callExperienceURL).respond(400);
      AutoAttendantCeService.readCe(callExperienceURL).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on CE Not Found Error 404', function () {
      $httpBackend.whenGET(callExperienceURL).respond(404);
      AutoAttendantCeService.readCe(callExperienceURL).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on Internal Server Error 500', function () {
      $httpBackend.whenGET(callExperienceURL).respond(500);
      AutoAttendantCeService.readCe(callExperienceURL, '').then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('createCe', function () {
    it('should notify on success', function () {
      $httpBackend.whenPOST(url).respond(201);
      AutoAttendantCeService.createCe({}).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should notify on Bad Request Error 400', function () {
      $httpBackend.whenPOST(url).respond(400);
      AutoAttendantCeService.createCe({}).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on Internal Server Error 500', function () {
      $httpBackend.whenPOST(url).respond(500);
      AutoAttendantCeService.createCe({}).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('updateCe', function () {
    it('should notify on success', function () {
      $httpBackend.whenPUT(callExperienceURL).respond(200);
      AutoAttendantCeService.updateCe(callExperienceURL, {}).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should notify on Bad Request Error 400', function () {
      $httpBackend.whenPUT(callExperienceURL).respond(400);
      AutoAttendantCeService.updateCe(callExperienceURL, {}).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on CE Not Found Error 404', function () {
      $httpBackend.whenPUT(callExperienceURL).respond(404);
      AutoAttendantCeService.updateCe(callExperienceURL, {}).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on Internal Server Error 500', function () {
      $httpBackend.whenPUT(callExperienceURL).respond(500);
      AutoAttendantCeService.updateCe(callExperienceURL, {}).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

  });

  describe('deleteCe', function () {
    it('should notify on success', function () {
      $httpBackend.whenDELETE(callExperienceURL).respond(204);

      $httpBackend.whenDELETE(HuronConfig.getCmiV2Url() + '/customers/1/features/autoattendants/004/numbers').respond(200);

      AutoAttendantCeService.deleteCe(callExperienceURL).then(
        successSpy,
        failureSpy
      );

      $httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should notify on Bad Request error 400', function () {
      $httpBackend.whenDELETE(callExperienceURL).respond(400);
      AutoAttendantCeService.deleteCe(callExperienceURL).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on CE Not Found error 404', function () {
      $httpBackend.whenDELETE(callExperienceURL).respond(404);
      AutoAttendantCeService.deleteCe(callExperienceURL).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on Internal Server error 500', function () {
      $httpBackend.whenDELETE(callExperienceURL).respond(500);
      AutoAttendantCeService.deleteCe(callExperienceURL).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

});
