/**
 * Created by pso on 16-8-23.
 */

'use strict';

describe('IncidentsWithoutSite service', function () {
  //var $httpBackend;
  var IncidentsWithoutSiteService;
  //var getNoSiteURL = 'https://dataservicesbts.webex.com/status/services/101/incidents';
 // var mockData = [{}];
  function dependencies(_IncidentsWithoutSiteService_) {
  //  $httpBackend = _$httpBackend_;
    IncidentsWithoutSiteService = _IncidentsWithoutSiteService_;
  }
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(inject(dependencies));

  it('should exist', function () {
    expect(IncidentsWithoutSiteService).toBeDefined();
  });
  it('Should getIncidentMsg', function () {
    IncidentsWithoutSiteService.getIncidentMsg({ incidentId: 267 }).$promise.then(function (data) {
      expect(data).not.toBeEmpty();
      expect(data.incidentName).toEqual("TEST");
    }, function () {
    });
  });
  it('Should modifyIncident', function () {
    IncidentsWithoutSiteService.modifyIncident({ incidentId: 267 }).$promise.then(function (data) {
      expect(data).not.toBeEmpty();
    }, function () {
    });
  });
});
