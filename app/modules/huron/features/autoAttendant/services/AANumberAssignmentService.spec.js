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

  describe('formatAAResourcesBasedOnList', function () {
    it('should correctly format resources based on passed-in list', function () {

      var resource = AutoAttendantCeInfoModelService.newResource();
      resource.setType(aCe.assignedResources.type);
      resource.setId("14084744458");
      resource.setNumber("14084744458");
      var resources = [];
      resources.push(resource);

      var externalNumberList = [];
      externalNumberList.push({
        id: "268CD1E7-432E-60E2-4342-1DAF1B52C856",
        number: "+14084744458"
      });

      var formattedResources = AANumberAssignmentService.formatAAResourcesBasedOnList(resources, externalNumberList);
    });

  });

  describe('formatAAResourcesBasedOnCMI', function () {
    it('should correctly format resources based on CMI call', function () {

      var resource = AutoAttendantCeInfoModelService.newResource();
      resource.setType("externalNumber");
      resource.setId("14084744458");
      resource.setNumber("14084744458");
      var resources = [];
      resources.push(resource);

      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools?order=pattern').respond(200, [{
        'pattern': '+14084744458',
        'uuid': '9999999991-id'
      }, {
        'pattern': '+8888888881',
        'uuid': '8888888881-id'
      }]);

      AANumberAssignmentService.formatAAResourcesBasedOnCMI(resources).then(
        successSpy,
        failureSpy
      );

      $httpBackend.flush();

      var formattedResources = successSpy.calls.mostRecent().args[0];
      expect(angular.equals(formattedResources[0].number, '+14084744458')).toEqual(true);
      expect(failureSpy).not.toHaveBeenCalled();
    });

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

      $httpBackend.whenPUT(cmiAAAsignmentURL).respond(200);

      AANumberAssignmentService.setAANumberAssignmentWithErrorDetail(Authinfo.getOrgId(), '004', resources).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();

      var args = successSpy.calls.mostRecent().args;
      expect(args[0].workingResources.length).toEqual(1);
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should fail when no numbers can be set at all', function () {

      var resource = AutoAttendantCeInfoModelService.newResource();
      resource.setType(aCe.assignedResources.type);
      resource.setId(aCe.assignedResources.id);
      resource.setNumber(aCe.assignedResources.number);

      var resources = [];
      resources.push(resource);

      $httpBackend.whenPUT(cmiAAAsignmentURL).respond(500);

      AANumberAssignmentService.setAANumberAssignmentWithErrorDetail(Authinfo.getOrgId(), '004', resources).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();

      expect(failureSpy).toHaveBeenCalled();
    });

    it('should set mix of working and failed', function () {

      function addResource(resources, val) {
        var resource = AutoAttendantCeInfoModelService.newResource();
        resource.setType(aCe.assignedResources.type);
        resource.setId(val);
        resource.setNumber(val);
        resources.push(resource);
      }
      var resources = [];

      // a good one
      addResource(resources, "1111111111");

      // a bad one
      addResource(resources, "bad");

      // a good one
      addResource(resources, "2222222222");

      // a bad one
      addResource(resources, "bad");

      // a bad one
      addResource(resources, "bad");

      // a good one
      addResource(resources, "3333333333");

      // CMI assignment will fail when there is any bad number in the list
      $httpBackend.when('PUT', cmiAAAsignmentURL).respond(function (method, url, data, headers) {
        if (JSON.stringify(data).indexOf("bad") > -1) {
          return [500, 'bad'];
        } else {
          return [200, 'good'];
        }
      });

      AANumberAssignmentService.setAANumberAssignmentWithErrorDetail(Authinfo.getOrgId(), '004', resources).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();

      var args = successSpy.calls.mostRecent().args;

      expect(args[0].workingResources.length).toEqual(3);
      expect(args[0].workingResources[0].id).not.toEqual("bad");
      expect(args[0].workingResources[1].id).not.toEqual("bad");
      expect(args[0].workingResources[2].id).not.toEqual("bad");

      expect(args[0].failedResources.length).toEqual(3);
      expect(args[0].failedResources[0].id).toEqual("bad");
      expect(args[0].failedResources[1].id).toEqual("bad");
      expect(args[0].failedResources[2].id).toEqual("bad");
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
