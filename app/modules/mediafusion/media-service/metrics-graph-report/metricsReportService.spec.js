'use strict';

describe('Service: Metrics Reports Service', function () {
  var $httpBackend, MetricsReportService, Config, Notification;
  var callVolumeUrl;

  /* var activeData = getJSONFixture('core/json/customerReports/activeUser.json');
   var activeUserData = activeData.activeDetailed;
   var responseActiveData = activeData.activeResponse;
   var mostActiveData = activeData.mostActive;
   var responseMostActiveData = activeData.mostActiveResponse;

   var roomData = getJSONFixture('core/json/customerReports/roomData.json');
   var groupRoomData = roomData.groupRooms;
   var avgRoomData = roomData.avgRooms;
   var oneToOneRoomData = roomData.oneTwoOneRooms;
   var responseRoomData = roomData.response;*/

  var callVolumeData = getJSONFixture('mediafusion/json/metrics-graph-report/callVolumeData.json');
  var callVolume = callVolumeData.callvolume;
  var callVolumeGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/callVolumeGraphData.json');
  var responsedata = callVolumeGraphData.graphData;

  beforeEach(module('Mediafusion'));

  var cacheValue = (parseInt(moment.utc().format('H')) >= 8);
  var dayFormat = "MMM DD";
  var timezone = "Etc/GMT";
  var timeFilter = {
    value: 0
  };

  var updateDates = function (data, filter, altDate) {
    for (var i = data.length - 1; i >= 0; i--) {
      if (filter === null || angular.isUndefined(filter)) {
        if (altDate === null || angular.isUndefined(altDate)) {
          data[i].date = moment().tz(timezone).subtract(data.length - i, 'day').format();
        } else {
          data[i][altDate] = moment().tz(timezone).subtract(data.length - i, 'day').format();
        }
      } else {
        data[i].modifiedDate = moment().tz(timezone).subtract(data.length - i, 'day').format(filter);
      }
    }
    return data;
  };

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('2c3c9f9e-73d9-4460-a668-047162ff1bac')
  };
  var error = {
    message: 'error'
  };

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _MetricsReportService_, _Config_, _Notification_, UrlConfig) {
    $httpBackend = _$httpBackend_;
    MetricsReportService = _MetricsReportService_;
    Config = _Config_;
    Notification = _Notification_;

    spyOn(Notification, 'notify');

    var baseUrl = 'https://athena-integration.wbx2.com/athena/api/v1/organizations/' + Authinfo.getOrgId();
    callVolumeUrl = baseUrl + '/call_volume?relativeTime=1d';

    callVolume = updateDates(callVolume);
    responsedata = updateDates(responsedata, dayFormat);

  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', function () {
    expect(MetricsReportService).toBeDefined();
  });

  it('getCallVolumeData should exist', function () {
    expect(MetricsReportService.getCallVolumeData).toBeDefined();
  });

  it('should exist', function () {
    expect(MetricsReportService.getAvailabilityData).toBeDefined();
  });

  /* describe('Active User Services', function () {
     it('should getActiveUserData', function () {
       $httpBackend.whenGET(callVolumeUrl).respond(callVolume);

       MetricsReportService.getCallVolumeData('All', timeFilter).then(function (response) {
         expect(response).toEqual({
           graphData: responsedata
         });
       });

       $httpBackend.flush();
     });

     it('should notify an error for getActiveUserData', function () {
       $httpBackend.whenGET(callVolumeUrl).respond(500, error);

       MetricsReportService.getCallVolumeData('All', timeFilter).then(function (response) {
         expect(response).toEqual({
           graphData: []
         });
         expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
       });

       $httpBackend.flush();
     });
   });*/

});
