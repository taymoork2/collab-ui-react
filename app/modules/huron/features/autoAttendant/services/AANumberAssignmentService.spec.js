'use strict';

describe('Service: AANumberAssignmentService', function () {
  var AANumberAssignmentService, $httpBackend, HuronConfig, AutoAttendantCeInfoModelService;
  var url, cmiAAAsignmentURL;
  // require('jasmine-collection-matchers');
  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  var aCe = getJSONFixture('huron/json/autoAttendant/aCallExperience.json');

  var cmiAAAsignedNumbers = [{
    "number": "2578",
    "type": "NUMBER_FORMAT_EXTENSION",
    "uuid": "29d70a54-cf0a-4279-ad75-09116eedb7a7"
  }];

  var cmiAAAsignment = {
    "numbers": cmiAAAsignedNumbers,
    "url": "https://cmi.huron-int.com/api/v2/customers/3338d491-d6ca-4786-82ed-cbe9efb02ad2/features/autoattendants/23a42558-6485-4dab-9505-704b6204410c/numbers"
  };

  var cmiAAAsignments = [cmiAAAsignment];

  var successSpy;
  var failureSpy;

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_AANumberAssignmentService_, _$httpBackend_, _HuronConfig_, _AutoAttendantCeInfoModelService_) {
    AANumberAssignmentService = _AANumberAssignmentService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    url = HuronConfig.getCmiV2Url() + '/customers/' + Authinfo.getOrgId() + '/features/autoattendants';
    cmiAAAsignmentURL = url + '/' + '004' + '/numbers';

    successSpy = jasmine.createSpy('success');
    failureSpy = jasmine.createSpy('failure');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('getListOfAANumberAssignments', function () {
    it('should list all CMI Assigned Auto Attendants', function () {

      $httpBackend.whenGET(cmiAAAsignmentURL).respond(cmiAAAsignments);

      AANumberAssignmentService.getListOfAANumberAssignments(Authinfo.getOrgId(), '004').then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      var args = successSpy.calls.mostRecent().args;
      expect(angular.equals(args[0], cmiAAAsignedNumbers)).toEqual(true);
      expect(failureSpy).not.toHaveBeenCalled();
    });

  });

  describe('setAANumberAssignment', function () {
    it('should notify on success', function () {

      var resource = AutoAttendantCeInfoModelService.newResource();
      resource.setType(aCe.assignedResources.type);
      resource.setId(aCe.assignedResources.id);
      var resources = [];
      resources.push(resource);

      $httpBackend.whenPUT(cmiAAAsignmentURL).respond(200);
      AANumberAssignmentService.setAANumberAssignment(Authinfo.getOrgId(), '004', resources).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

  });

  describe('deleteAANumberAssignments', function () {
    it('should notify on success', function () {

      $httpBackend.whenDELETE(cmiAAAsignmentURL).respond(200);
      AANumberAssignmentService.deleteAANumberAssignments(Authinfo.getOrgId(), '004').then(
        successSpy,
        failureSpy
      );

      $httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });
  });

});
