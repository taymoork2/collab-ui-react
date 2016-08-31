/**
 * Created by pso on 16-8-23.
 */

'use strict';

describe('IncidentsWithSite service', function () {
  var $httpBackend;
  var IncidentsWithoutSiteService;
  var getNoSiteURL = 'https://dataservicesbts.webex.com/status/services/101/incidents';
  var mockData = [{}];
  function dependencies(_$httpBackend_, _IncidentsWithoutSiteService_) {
    $httpBackend = _$httpBackend_;
    IncidentsWithoutSiteService = _IncidentsWithoutSiteService_;
  }
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(inject(dependencies));

  it('should exist', function () {
    expect(IncidentsWithoutSiteService).toBeDefined();
  });



  it('Should get getActiveHostsURL', function () {
    $httpBackend.whenGET(getNoSiteURL).respond(mockData);
    IncidentsWithoutSiteService.query().$promise.then(function (data) {
      expect(data.toString()).toEqual(mockData.toString());
    });
    $httpBackend.flush();
  });
});
