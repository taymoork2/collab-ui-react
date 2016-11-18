'use strict';

describe('Service: IncidentsService', function () {
  var $httpBackend, IncidentsService;
  var testData = {
    serviceId: 'testServiceId',
    getResponse: {
      incidentId: 'testIncidentId'
    },
    incidentForCreate: {
      incidentId: 'testIncidentId'
    },
    createResponse: {
      code: 'post succeed'
    },
    incidentForDelete: {
      incidentId: 'testIncidentId'
    },
    deleteResponse: {
      code: 'delete succeed'
    }
  };

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('GSS'));
  beforeEach(inject(dependencies));

  function dependencies(_$httpBackend_, _IncidentsService_) {
    $httpBackend = _$httpBackend_;
    IncidentsService = _IncidentsService_;
  }

  it('getIncidents should response with data', function () {
    $httpBackend.expectGET(/.*\/services.*/g).respond(200, testData.getResponse);

    IncidentsService.getIncidents(testData.serviceId)
      .then(function (res) {
        expect(res).toEqual(testData.getResponse);
      });

    $httpBackend.flush();
  });

  it('createIncident, succeed with response data', function () {
    $httpBackend.expectPOST(/.*\/services.*/g).respond(200, testData.createResponse);

    IncidentsService.createIncident(testData.serviceId, testData.incidentForCreate)
      .then(function (res) {
        expect(res).toEqual(testData.createResponse);
      });

    $httpBackend.flush();
  });

  it('deleteIncident, succeed with response data', function () {
    $httpBackend.expectDELETE(/.*\/incidents.*/g).respond(200, testData.deleteResponse);

    IncidentsService.deleteIncident(testData.incidentForDelete.incidentId)
      .then(function (res) {
        expect(res).toEqual(testData.deleteResponse);
      });

    $httpBackend.flush();
  });

});
