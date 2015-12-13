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
  var onlyCMI = [];
  var $q;

  var successSpy;
  var failureSpy;

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_AANumberAssignmentService_, _$httpBackend_, _HuronConfig_, _$q_, _AutoAttendantCeInfoModelService_) {
    AANumberAssignmentService = _AANumberAssignmentService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    url = HuronConfig.getCmiV2Url() + '/customers/' + Authinfo.getOrgId() + '/features/autoattendants';
    cmiAAAsignmentURL = url + '/' + '004' + '/numbers';
    $q = _$q_;

    successSpy = jasmine.createSpy('success');
    failureSpy = jasmine.createSpy('failure');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('checkAANumberAssignments', function () {
    it('should check all CMI Assigned Auto Attendants', function () {

      var resource = AutoAttendantCeInfoModelService.newResource();
      resource.setType(aCe.assignedResources.type);
      resource.setId(aCe.assignedResources.id);
      var resources = [];
      resources.push(resource);

      $httpBackend.whenGET(cmiAAAsignmentURL).respond(cmiAAAsignments);

      AANumberAssignmentService.checkAANumberAssignments(Authinfo.getOrgId(), '004', resources, cmiAAAsignments, onlyCMI).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      var args = successSpy.calls.mostRecent().args;
      expect(angular.equals(args[0], cmiAAAsignedNumbers)).toEqual(true);
      expect(failureSpy).not.toHaveBeenCalled();
    });

  });
  describe('setAANumberAssignmentWithErrorDetail', function () {
    it('should set AA Number Assignment to one in working', function () {

      var resource = AutoAttendantCeInfoModelService.newResource();
      resource.setType(aCe.assignedResources.type);
      resource.setId(aCe.assignedResources.id);
      resource.setNumber(aCe.assignedResources.number);

      var resources = [];
      resources.push(resource);

      var working = [];

      var failed = [];

      $httpBackend.whenPUT(cmiAAAsignmentURL).respond(200);

      AANumberAssignmentService.setAANumberAssignmentWithErrorDetail(Authinfo.getOrgId(), '004', resources, working, failed).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();

      var args = successSpy.calls.mostRecent().args;
      expect(working.length).toEqual(1);
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should set AA Number Assignment to one in failed', function () {

      var resource = AutoAttendantCeInfoModelService.newResource();
      resource.setType(aCe.assignedResources.type);
      resource.setId(aCe.assignedResources.id);
      resource.setNumber(aCe.assignedResources.number);

      var resources = [];
      resources.push(resource);

      var working = [];

      var failed = [];

      $httpBackend.whenPUT(cmiAAAsignmentURL).respond(500);

      AANumberAssignmentService.setAANumberAssignmentWithErrorDetail(Authinfo.getOrgId(), '004', resources, working, failed).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();

      var args = successSpy.calls.mostRecent().args;
      expect(working.length).toEqual(0);
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should set mix of working and failed', function () {

      // a good one
      var resource = AutoAttendantCeInfoModelService.newResource();
      resource.setType(aCe.assignedResources.type);
      resource.setId("1111111111");
      resource.setNumber("1111111111");

      var resources = [];
      resources.push(resource);

      // a bad one
      resource = AutoAttendantCeInfoModelService.newResource();
      resource.setType(aCe.assignedResources.type);
      resource.setId("bad");
      resource.setNumber("bad");

      resources.push(resource);

      // a good one
      resource = AutoAttendantCeInfoModelService.newResource();
      resource.setType(aCe.assignedResources.type);
      resource.setId("2222222222");
      resource.setNumber("2222222222");

      resources.push(resource);

      // a bad one
      resource = AutoAttendantCeInfoModelService.newResource();
      resource.setType(aCe.assignedResources.type);
      resource.setId("bad");
      resource.setNumber("bad");

      resources.push(resource);

      // a bad one
      resource = AutoAttendantCeInfoModelService.newResource();
      resource.setType(aCe.assignedResources.type);
      resource.setId("bad");
      resource.setNumber("bad");

      resources.push(resource);

      // a good one
      resource = AutoAttendantCeInfoModelService.newResource();
      resource.setType(aCe.assignedResources.type);
      resource.setId("3333333333");
      resource.setNumber("3333333333");

      resources.push(resource);

      var working = [];

      var failed = [];

      // CMI assignment will fail when there is any bad number in the list
      $httpBackend.when('PUT', cmiAAAsignmentURL).respond(function (method, url, data, headers) {
        if (JSON.stringify(data).indexOf("bad") > -1) {
          return [500, 'bad'];
        } else {
          return [200, 'good'];
        }
      });

      AANumberAssignmentService.setAANumberAssignmentWithErrorDetail(Authinfo.getOrgId(), '004', resources, working, failed).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();

      var args = successSpy.calls.mostRecent().args;

      expect(working.length).toEqual(3);
      expect(working[0].id).not.toEqual("bad");
      expect(working[1].id).not.toEqual("bad");
      expect(working[2].id).not.toEqual("bad");

      expect(failed.length).toEqual(3);
      expect(failed[0].id).toEqual("bad");
      expect(failed[1].id).toEqual("bad");
      expect(failed[2].id).toEqual("bad");
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
