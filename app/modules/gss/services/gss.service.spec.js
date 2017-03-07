'use strict';

describe('Service: GSSService', function () {
  var $httpBackend, GSSService;
  var testData = {
    serviceId: 'testServiceId',
    serviceName: 'testServiceName',
    serviceDesc: 'testServiceDescription',
    getResponse: {
      serviceId: 'testServiceId',
    },
    addResponse: {
      code: 'post succeed',
    },
    deleteResponse: {
      code: 'delete succeed',
    },
    modifyResponse: {
      code: 'put succeed',
    },
  };

  beforeEach(angular.mock.module('GSS'));
  afterEach(destructDI);
  afterAll(function () {
    testData = undefined;
  });
  beforeEach(inject(dependencies));

  function dependencies(_$httpBackend_, _GSSService_) {
    $httpBackend = _$httpBackend_;
    GSSService = _GSSService_;
  }

  function destructDI() {
    $httpBackend = GSSService = undefined;
  }

  it('getServices should response with data', function () {
    $httpBackend.expectGET(/.*\/services.*/g).respond(200, testData.getResponse);

    GSSService.getServices()
      .then(function (res) {
        expect(res).toEqual(testData.getResponse);
      });

    $httpBackend.flush();
  });

  it('getServiceId, setServiceId', function () {
    GSSService.setServiceId(testData.serviceId);

    expect(GSSService.getServiceId()).toEqual(testData.serviceId);
  });

  it('addService, succeed with response data', function () {
    $httpBackend.expectPOST(/.*\/services.*/g).respond(200, testData.addResponse);

    GSSService.addService(testData.serviceName, testData.serviceDesc)
      .then(function (res) {
        expect(res).toEqual(testData.addResponse);
      });

    $httpBackend.flush();
  });

  it('deleteService, succeed with response data', function () {
    $httpBackend.expectDELETE(/.*\/services.*/g).respond(200, testData.deleteResponse);

    GSSService.deleteService(testData.serviceId)
      .then(function (res) {
        expect(res).toEqual(testData.deleteResponse);
      });

    $httpBackend.flush();
  });

  it('modifyService, succeed with response data', function () {
    $httpBackend.expectPUT(/.*\/services.*/g).respond(200, testData.modifyResponse);

    GSSService.modifyService(testData.serviceId, testData.serviceName, testData.serviceDesc)
      .then(function (res) {
        expect(res).toEqual(testData.modifyResponse);
      });

    $httpBackend.flush();
  });

  it('compare version', function () {
    $httpBackend.expectGET(/.*\/compareVersion.*/g).respond(200, true);
    GSSService.syncCheck()
      .then(function (res) {
        expect(res).toBeTruthy();
      });
    $httpBackend.flush();
  });

  it('sync up the data with AWS', function () {
    $httpBackend.expectPOST(/.*\/syncUpFromAWS.*/g).respond(200, true);
    GSSService.syncUp()
      .then(function (res) {
        expect(res).toBeTruthy();
      });
    $httpBackend.flush();
  });

});
