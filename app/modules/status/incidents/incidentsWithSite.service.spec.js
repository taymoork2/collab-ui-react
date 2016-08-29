/**
 * Created by pso on 16-8-23.
 */

'use strict'

describe('IncidentsWithSite service',function(){
  var $httpBackend;
  var IncidentsWithSiteService;

  var getSiteURL ='https://dataservicesbts.webex.com/status/services/1/incidents';
  var mockData=[
    {
      incidentId: 221,
      incidentName: "INC001",
      serviceId: 1,
      status: "identified",
      impact: "none",
      email: "chaoluo@cisco.com",
      lastModifiedTime: "2016-08-22T06:43:12Z"
    },
    {
      incidentId: 223,
      incidentName: "INC002",
      serviceId: 1,
      status: "monitoring",
      impact: "none",
      email: "chaoluo@cisco.com",
      lastModifiedTime: "2016-08-22T07:00:20Z"
    },
    {
      incidentId: 225,
      incidentName: "INC003",
      serviceId: 1,
      status: "resolved",
      impact: "none",
      email: "chaoluo@cisco.com",
      lastModifiedTime: "2016-08-22T06:31:15Z"
    },
    {
      incidentId: 227,
      incidentName: "INC004",
      serviceId: 1,
      status: "resolved",
      impact: "none",
      email: "chaoluo@cisco.com",
      lastModifiedTime: "2016-08-22T06:31:27Z"
    }
  ];
  function dependencies(_$httpBackend_,_IncidentsWithSiteService_){
    $httpBackend=_$httpBackend_;
    IncidentsWithSiteService=_IncidentsWithSiteService_;
  }
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(inject(dependencies));

  it('should exist', function () {
    expect(IncidentsWithSiteService).toBeDefined();
  });



  it('Should get getActiveHostsURL', function () {
    $httpBackend.whenGET(getSiteURL).respond(mockData);
    IncidentsWithSiteService.query({"siteId": 1}).$promise.then(function (data) {

      expect(data.toString()).toEqual(mockData.toString());


    });
    $httpBackend.flush();
  });


})
