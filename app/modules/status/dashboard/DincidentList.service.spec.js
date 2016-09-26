/**
 * Created by snzheng on 16/9/23.
 */

'use strict';

describe('DincidentListService service', function () {
  var $httpBackend;
  var DincidentListService;

  var getSiteURL = 'https://dataservicesbts.webex.com/status/services/1/incidents';
  var mockData = [{
    "incidentId": 267,
    "incidentName": "TEST",
    "serviceId": 1,
    "status": "resolved",
    "impact": "none",
    "email": "chaoluo@cisco.com",
    "lastModifiedTime": "2016-09-08T02:07:30Z"
  },
    { "incidentId": 301,
      "incidentName": "INC001",
      "serviceId": 1,
      "status": "resolved",
      "impact": "minor",
      "email": "chaoluo@cisco.com",
      "lastModifiedTime": "2016-09-08T08:20:59Z"
    },
    {
      "incidentId": 303,
      "incidentName": "TEST2",
      "serviceId": 1,
      "status": "investigating",
      "impact": "none",
      "email": "chaoluo@cisco.com",
      "lastModifiedTime": "2016-09-07T09:52:35Z"
    },
    {
      "incidentId": 269,
      "incidentName": "TEST3",
      "serviceId": 1,
      "status": "resolved",
      "impact": "critical",
      "email": "chaoluo@cisco.com",
      "lastModifiedTime": "2016-09-08T08:19:10Z"
    },
    { "incidentId": 271,
      "incidentName": "INC009",
      "serviceId": 1,
      "status": "investigating",
      "impact": "minor",
      "email": "chaoluo@cisco.com",
      "lastModifiedTime": "2016-09-09T09:10:11Z"
    },
    { "incidentId": 273,
      "incidentName": "abc",
      "serviceId": 1,
      "status": "investigating",
      "impact": "none",
      "email": "chaoluo@cisco.com",
      "lastModifiedTime": "2016-09-08T02:57:33Z"
    },
    {
      "incidentId": 317,
      "incidentName": "def",
      "serviceId": 1,
      "status": "investigating",
      "impact": "none",
      "email": "chaoluo@cisco.com",
      "lastModifiedTime": "2016-09-08T06:53:11Z"
    },
    {
      "incidentId": 319,
      "incidentName": "cc",
      "serviceId": 1,
      "status": "investigating",
      "impact": "none",
      "email": "chaoluo@cisco.com",
      "lastModifiedTime": "2016-09-08T07:44:08Z"
    },
    {
      "incidentId": 321,
      "incidentName": "again",
      "serviceId": 1,
      "status": "identified",
      "impact": "none",
      "email": "chaoluo@cisco.com",
      "lastModifiedTime": "2016-09-12T10:59:04Z"
    }];
  function dependencies(_$httpBackend_, _DincidentListService_) {
    $httpBackend = _$httpBackend_;
    DincidentListService = _DincidentListService_;
  }
  beforeEach(angular.mock.module('Status'));
  beforeEach(inject(dependencies));

  it('should exist', function () {
    expect(DincidentListService).toBeDefined();
  });

  it('Should get getActiveHostsURL', function () {
    $httpBackend.whenGET(getSiteURL).respond(mockData);
    DincidentListService.query({
      "siteId": 1
    }).$promise.then(function (data) {
      expect(data.toString()).toEqual(mockData.toString());
    }, function () {
    });
    $httpBackend.flush();
  });
});
