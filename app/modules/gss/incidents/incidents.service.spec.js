'use strict';

describe('Service: IncidentsService', function () {
  var $httpBackend, IncidentsService;
  var testData = {
    serviceId: 'testServiceId',
    incidentId: 'testIncidentId',
    messageId: 'testMessageId',
    getResponse: {
      response: 'testResponse'
    },
    incidentForPost: {
      incidentId: 'testIncidentId',
      incidentData: {}
    },
    postResponse: {
      code: 'post succeed'
    },
    incidentForDelete: {
      incidentId: 'testIncidentId'
    },
    deleteResponse: {
      code: 'delete succeed'
    },
    incidentForPut: {
      incidentId: 'testIncidentId',
      incidentName: 'testIncidentName',
      impact: 'testImpact',
      messageId: 'testMessageId',
      message: {}
    },
    putResponse: {
      code: 'put succeed'
    }
  };

  beforeEach(angular.mock.module('GSS'));
  beforeEach(inject(dependencies));
  afterEach(function () {
    $httpBackend.flush();
    $httpBackend = IncidentsService = undefined;
  });
  afterAll(function () {
    testData = undefined;
  });

  function dependencies(_$httpBackend_, _IncidentsService_) {
    $httpBackend = _$httpBackend_;
    IncidentsService = _IncidentsService_;
  }

  it('getIncidents, should response with data', function () {
    $httpBackend.expectGET(/.*\/services\/.*/g).respond(200, testData.getResponse);

    IncidentsService.getIncidents(testData.serviceId)
      .then(function (res) {
        expect(res).toEqual(testData.getResponse);
      });
  });

  it('createIncident, succeed with response data', function () {
    $httpBackend.expectPOST(/.*\/services\/.*/g).respond(200, testData.postResponse);

    IncidentsService.createIncident(testData.serviceId, testData.incidentForPost)
      .then(function (res) {
        expect(res).toEqual(testData.postResponse);
      });
  });

  it('deleteIncident, succeed with response data', function () {
    $httpBackend.expectDELETE(/.*\/incidents\/.*/g).respond(200, testData.deleteResponse);

    IncidentsService.deleteIncident(testData.incidentForDelete.incidentId)
      .then(function (res) {
        expect(res).toEqual(testData.deleteResponse);
      });
  });

  it('getIncident, should response with data', function () {
    $httpBackend.expectGET(/.*\/incidents\/.*/g).respond(200, testData.getResponse);

    IncidentsService.getIncident(testData.incidentId)
      .then(function (res) {
        expect(res).toEqual(testData.getResponse);
      });
  });

  it('updateIncidentNameAndImpact, should response with data', function () {
    $httpBackend.expectPUT(/.*\/incidents\/.*/g).respond(200, testData.putResponse);

    IncidentsService.updateIncidentNameAndImpact(
      testData.incidentForPut.incidentId,
      testData.incidentForPut.incidentName,
      testData.incidentForPut.impact)
      .then(function (res) {
        expect(res).toEqual(testData.putResponse);
      });
  });

  it('getComponents, should response with data', function () {
    $httpBackend.expectGET(/.*\/services\/.*/g).respond(200, testData.getResponse);

    IncidentsService.getComponents(testData.serviceId)
      .then(function (res) {
        expect(res).toEqual(testData.getResponse);
      });
  });

  it('updateIncident, succeed with response data', function () {
    $httpBackend.expectPOST(/.*\/incidents\/.*/g).respond(200, testData.postResponse);

    IncidentsService.updateIncident(testData.incidentForPost.incidentId, testData.incidentForPost.incidentData)
      .then(function (res) {
        expect(res).toEqual(testData.postResponse);
      });
  });


  it('getAffectedComponents, should response with data', function () {
    $httpBackend.expectGET(/.*\/incidents\/messages\/.*/g).respond(200, testData.getResponse);

    IncidentsService.getAffectedComponents(testData.messageId)
      .then(function (res) {
        expect(res).toEqual(testData.getResponse);
      });
  });

  it('updateIncidentMessage, should response with data', function () {
    $httpBackend.expectPUT(/.*\/incidents\/messages\/.*/g).respond(200, testData.putResponse);

    IncidentsService.updateIncidentMessage(testData.incidentForPut.messageId, testData.incidentForPut.message)
      .then(function (res) {
        expect(res).toEqual(testData.putResponse);
      });
  });
});
