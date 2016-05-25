'use strict';

describe('Service: AutoAttendantCeService', function () {
  var QueueHelperService, $httpBackend, HuronConfig, url, queueURL;
  // require('jasmine-collection-matchers');
  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  var queues = getJSONFixture('huron/json/autoAttendant/aaQueue.json');

  var successSpy;
  var failureSpy;

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_QueueHelperService_, _$httpBackend_, _HuronConfig_) {
    QueueHelperService = _QueueHelperService_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    url = HuronConfig.getCesUrl() + '/customers/' + Authinfo.getOrgId() + '/queues';
    queueURL = url + '/' + '662df48-b367-4c1e-3456-aa408aaa79a1';

    successSpy = jasmine.createSpy('success');
    failureSpy = jasmine.createSpy('failure');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('listQueues', function () {
    it('should list all call experiences', function () {
      $httpBackend.whenGET(url).respond(queues);
      QueueHelperService.listQueues().then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      var args = successSpy.calls.mostRecent().args;
      expect(angular.equals(args[0], queues)).toEqual(true);
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should NOT notify on Not Found 404', function () {
      $httpBackend.whenGET(url).respond(404);
      QueueHelperService.listQueues().then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on Internal Server Error 500', function () {
      $httpBackend.whenGET(url).respond(500);
      QueueHelperService.listQueues().then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

});
