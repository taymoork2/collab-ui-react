// TODO: convert this file to TypeScript

'use strict';

describe('Service: DoRestService', function () {
  var DoRestService, $httpBackend, HuronConfig;
  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1'),
  };

  var doRest = getJSONFixture('huron/json/autoAttendant/doRest.json');

  var successSpy;
  var failureSpy;
  var urlRest;
  var urlRestWithId;
  var idRest;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', Authinfo);
  }));

  beforeEach(inject(function (_DoRestService_, _$httpBackend_, _HuronConfig_) {
    DoRestService = _DoRestService_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    urlRest = HuronConfig.getCesUrl() + '/rest/customers/' + Authinfo.getOrgId() + '/restConfigs';
    idRest = '004';
    urlRestWithId = urlRest + '/' + idRest;
    successSpy = jasmine.createSpy('success');
    failureSpy = jasmine.createSpy('failure');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    DoRestService = $httpBackend = HuronConfig = urlRest = idRest = urlRestWithId = undefined;
  });

  describe('readDoRest', function () {
    it('should read a REST block successfully', function () {
      $httpBackend.whenGET(urlRestWithId).respond(200, doRest);
      DoRestService.readDoRest(idRest).then(successSpy).catch(failureSpy);
      $httpBackend.flush();
      var args = successSpy.calls.mostRecent().args;
      expect(angular.equals(args[0], doRest)).toBe(true);
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should notify on Bad Request Error 400', function () {
      $httpBackend.whenGET(urlRestWithId).respond(400);
      DoRestService.readDoRest(idRest).then(successSpy).catch(failureSpy);
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on CE Not Found Error 404', function () {
      $httpBackend.whenGET(urlRestWithId).respond(404);
      DoRestService.readDoRest(idRest).then(successSpy).catch(failureSpy);
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on Internal Server Error 500', function () {
      $httpBackend.whenGET(urlRestWithId).respond(500);
      DoRestService.readDoRest(idRest).then(successSpy).catch(failureSpy);
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('createDoRest', function () {
    it('should notify on success', function () {
      $httpBackend.whenPOST(urlRest).respond(201);
      DoRestService.createDoRest({}).then(successSpy).catch(failureSpy);
      $httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should notify on Bad Request Error 400', function () {
      $httpBackend.whenPOST(urlRest).respond(400);
      DoRestService.createDoRest({}).then(successSpy).catch(failureSpy);
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on Internal Server Error 500', function () {
      $httpBackend.whenPOST(urlRest).respond(500);
      DoRestService.createDoRest({}).then(successSpy).catch(failureSpy);
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('updateDoRest', function () {
    it('should notify on success', function () {
      $httpBackend.whenPUT(urlRestWithId).respond(200);
      DoRestService.updateDoRest(idRest, {}).then(successSpy).catch(failureSpy);
      $httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should notify on Bad Request Error 400', function () {
      $httpBackend.whenPUT(urlRestWithId).respond(400);
      DoRestService.updateDoRest(idRest, {}).then(successSpy).catch(failureSpy);
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on CE Not Found Error 404', function () {
      $httpBackend.whenPUT(urlRestWithId).respond(404);
      DoRestService.updateDoRest(idRest, {}).then(successSpy).catch(failureSpy);
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on Internal Server Error 500', function () {
      $httpBackend.whenPUT(urlRestWithId).respond(500);
      DoRestService.updateDoRest(idRest, {}).then(successSpy).catch(failureSpy);
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('deleteDoRest', function () {
    it('should notify on success', function () {
      $httpBackend.whenDELETE(urlRestWithId).respond(204);
      $httpBackend.whenDELETE(HuronConfig.getCmiV2Url() + '/customers/1/features/autoattendants/004/numbers').respond(200);
      DoRestService.deleteDoRest(idRest).then(successSpy).catch(failureSpy);
      $httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should notify on Bad Request error 400', function () {
      $httpBackend.whenDELETE(urlRestWithId).respond(400);
      DoRestService.deleteDoRest(idRest).then(successSpy).catch(failureSpy);
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on CE Not Found error 404', function () {
      $httpBackend.whenDELETE(urlRestWithId).respond(404);
      DoRestService.deleteDoRest(idRest).then(successSpy).catch(failureSpy);
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on Internal Server error 500', function () {
      $httpBackend.whenDELETE(urlRestWithId).respond(500);
      DoRestService.deleteDoRest(idRest).then(successSpy).catch(failureSpy);
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });
});
