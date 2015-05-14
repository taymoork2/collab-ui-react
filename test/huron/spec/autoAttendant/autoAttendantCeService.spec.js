'use strict';

describe('Service: AutoAttendantCeService', function () {
  var AutoAttendantCeService, $httpBackend, HuronConfig, url, callExperienceURL;
  // require('jasmine-collection-matchers');
  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  var callExperiences = [{
    "callExperienceName": "Oleg's Call Experience 1",
    "callExperienceURL": "https://ces.hitest.huron-dev.com/api/v1/customers/6662df48-b367-4c1e-9c3c-aa408aaa79a1/callExperiences/c16a6027-caef-4429-b3af-9d61ddc7964b",
    "assignedResources": [{
      "id": "212b075f-0a54-4040-bd94-d2aa247bd9f9",
      "type": "directoryNumber",
      "trigger": "incomingCall"
    }]
  }, {
    "callExperienceName": "AA2",
    "callExperienceURL": "https://ces.hitest.huron-dev.com/api/v1/customers/6662df48-b367-4c1e-9c3c-aa408aaa79a1/callExperiences/0c192613-a960-43bb-9101-b9bc80be049c",
    "assignedResources": [{
      "id": "00097a86-45ef-44a7-aa78-6d32a0ca1d3b",
      "type": "directoryNumber",
      "trigger": "incomingCall"
    }]
  }];

  var callExperience = {
    "callExperienceName": "AAA2",
    "assignedResources": [{
      "id": "00097a86-45ef-44a7-aa78-6d32a0ca1d3b",
      "type": "directoryNumber",
      "trigger": "incomingCall"
    }],
    "actionSets": [{
      "name": "regularOpenActions",
      "actions": [{
        "play": {
          "url": "file1.avi"
        }
      }, {
        "runActionsOnInput": {
          "description": "",
          "prompts": {
            "description": "",
            "playList": [{
              "url": "file2.avi"
            }]
          },
          "timeoutInSeconds": 30,
          "inputs": [{
            "description": "operator",
            "input": "1",
            "actions": [{
              "route": {
                "destination": "1111"
              }
            }]
          }, {
            "description": "",
            "input": "default",
            "actions": [{
              "repeatActionsOnInput": {}
            }]
          }]
        }
      }]
    }]
  };

  var successSpy;
  var failureSpy;

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

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
