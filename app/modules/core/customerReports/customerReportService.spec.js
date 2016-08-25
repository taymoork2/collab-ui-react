'use strict';

describe('Service: Customer Reports Service', function () {
  var $httpBackend, CustomerReportService, Notification;
  var avgRoomsUrl, groupRoomsUrl, oneToOneRoomsUrl, contentUrl, contentSizeUrl, mediaUrl, metricsUrl, activeUserDetailedUrl, mostActiveUrl, devicesUrl;

  var activeData = getJSONFixture('core/json/customerReports/activeUser.json');
  var activeUserData = activeData.activeDetailed;
  var responseActiveData = activeData.activeResponse;
  var mostActiveData = activeData.mostActive;
  var responseMostActiveData = activeData.mostActiveResponse;

  var roomData = getJSONFixture('core/json/customerReports/roomData.json');
  var groupRoomData = roomData.groupRooms;
  var avgRoomData = roomData.avgRooms;
  var oneToOneRoomData = roomData.oneTwoOneRooms;
  var responseRoomData = roomData.response;

  var fileData = getJSONFixture('core/json/customerReports/fileData.json');
  var contentData = fileData.content;
  var contentSizeData = fileData.contentSize;
  var responseFileData = fileData.response;

  var mediaData = getJSONFixture('core/json/customerReports/mediaQuality.json');
  var mediaContent = mediaData.callQuality;
  var mediaResponse = mediaData.response;

  var metricsData = getJSONFixture('core/json/customerReports/callMetrics.json');
  var metricsContent = metricsData.data;
  var metricsResponse = metricsData.response;

  var devicesJson = getJSONFixture('core/json/customerReports/devices.json');
  var devicesData = devicesJson.deviceData;
  var deviceResponse = devicesJson.response;

  beforeEach(angular.mock.module('Core'));

  var cacheValue = (parseInt(moment.utc().format('H'), 10) >= 8);
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
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };
  var error = {
    message: 'error'
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _CustomerReportService_, _Notification_, UrlConfig) {
    $httpBackend = _$httpBackend_;
    CustomerReportService = _CustomerReportService_;
    Notification = _Notification_;

    spyOn(Notification, 'notify');

    var baseUrl = UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/reports/';
    var customerView = '&isCustomerView=true';
    groupRoomsUrl = baseUrl + 'timeCharts/conversations?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue + customerView;
    avgRoomsUrl = baseUrl + 'timeCharts/avgConversations?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue + customerView;
    oneToOneRoomsUrl = baseUrl + 'timeCharts/convOneOnOne?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue + customerView;
    contentUrl = baseUrl + 'timeCharts/contentShared?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue + customerView;
    contentSizeUrl = baseUrl + 'timeCharts/contentShareSizes?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue + customerView;
    mediaUrl = baseUrl + 'detailed/callQuality?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue;
    metricsUrl = baseUrl + 'detailed/callMetrics?&intervalCount=7&intervalType=day&spanCount=7&spanType=day&cache=' + cacheValue;
    activeUserDetailedUrl = baseUrl + 'detailed/activeUsers?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue;
    mostActiveUrl = baseUrl + 'useractivity?type=weeklyUsage&cache=' + cacheValue;
    devicesUrl = baseUrl + 'trend/registeredEndpointsByDeviceType?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue;

    activeUserData.data[0].data = updateDates(activeUserData.data[0].data);
    responseActiveData = updateDates(responseActiveData, dayFormat);

    groupRoomData.data = updateDates(groupRoomData.data);
    avgRoomData.data = updateDates(avgRoomData.data);
    oneToOneRoomData.data = updateDates(oneToOneRoomData.data);
    responseRoomData = updateDates(responseRoomData, dayFormat);

    contentData.data = updateDates(contentData.data);
    contentSizeData.data = updateDates(contentSizeData.data);
    responseFileData = updateDates(responseFileData, dayFormat);

    mediaContent.data[0].data = updateDates(mediaContent.data[0].data);
    mediaResponse = updateDates(mediaResponse, dayFormat);

    angular.forEach(devicesData.data[0].data, function (item) {
      item.details = updateDates(item.details, null, 'recordTime');
    });
    angular.forEach(deviceResponse.graphData, function (item) {
      item.graph = updateDates(item.graph, dayFormat);
    });
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', function () {
    expect(CustomerReportService).toBeDefined();
  });

  describe('Active User Services', function () {
    it('should getActiveUserData', function () {
      $httpBackend.whenGET(activeUserDetailedUrl).respond(activeUserData);

      CustomerReportService.getActiveUserData(timeFilter).then(function (response) {
        expect(response).toEqual({
          graphData: responseActiveData,
          isActiveUsers: true
        });
      });

      $httpBackend.flush();
    });

    it('should notify an error for getActiveUserData', function () {
      $httpBackend.whenGET(activeUserDetailedUrl).respond(500, error);

      CustomerReportService.getActiveUserData(timeFilter).then(function (response) {
        expect(response).toEqual({
          graphData: [],
          isActiveUsers: false
        });
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      $httpBackend.flush();
    });

    it('should getMostActiveUserData', function () {
      $httpBackend.whenGET(mostActiveUrl).respond(mostActiveData);

      CustomerReportService.getMostActiveUserData(timeFilter).then(function (response) {
        expect(response).toEqual(responseMostActiveData);
      });

      $httpBackend.flush();
    });

    it('should notify an error for getMostActiveUserData', function () {
      $httpBackend.whenGET(mostActiveUrl).respond(500, error);

      CustomerReportService.getMostActiveUserData(timeFilter).then(function (response) {
        expect(response).toEqual([]);
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      $httpBackend.flush();
    });
  });

  describe('Rooms Service', function () {
    it('should getAvgRoomData', function () {
      $httpBackend.whenGET(groupRoomsUrl).respond(groupRoomData);
      $httpBackend.whenGET(avgRoomsUrl).respond(avgRoomData);
      $httpBackend.whenGET(oneToOneRoomsUrl).respond(oneToOneRoomData);

      CustomerReportService.getAvgRoomData(timeFilter).then(function (response) {
        expect(response).toEqual(responseRoomData);
      });

      $httpBackend.flush();
    });

    it('should notify an error for getAvgRoomData', function () {
      $httpBackend.whenGET(groupRoomsUrl).respond(500, error);
      $httpBackend.whenGET(avgRoomsUrl).respond(500, error);
      $httpBackend.whenGET(oneToOneRoomsUrl).respond(500, error);

      CustomerReportService.getAvgRoomData(timeFilter).then(function (response) {
        expect(response).toEqual([]);
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      $httpBackend.flush();
    });
  });

  describe('File Service', function () {
    it('should getFilesSharedData', function () {
      $httpBackend.whenGET(contentUrl).respond(contentData);
      $httpBackend.whenGET(contentSizeUrl).respond(contentSizeData);

      CustomerReportService.getFilesSharedData(timeFilter).then(function (response) {
        expect(response).toEqual(responseFileData);
      });

      $httpBackend.flush();
    });

    it('should notify an error for getFilesSharedData', function () {
      $httpBackend.whenGET(contentUrl).respond(500, error);
      $httpBackend.whenGET(contentSizeUrl).respond(500, error);

      CustomerReportService.getFilesSharedData(timeFilter).then(function (response) {
        expect(response).toEqual([]);
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      $httpBackend.flush();
    });
  });

  describe('Media Service', function () {
    it('should getMediaQualityData', function () {
      $httpBackend.whenGET(mediaUrl).respond(mediaContent);

      CustomerReportService.getMediaQualityData(timeFilter).then(function (response) {
        expect(response).toEqual(mediaResponse);
      });

      $httpBackend.flush();
    });

    it('should notify an error for getMediaQualityData', function () {
      $httpBackend.whenGET(mediaUrl).respond(500, error);

      CustomerReportService.getMediaQualityData(timeFilter).then(function (response) {
        expect(response).toEqual([]);
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      $httpBackend.flush();
    });
  });

  describe('Call Metrics Service', function () {
    it('should getCallMetricsData', function () {
      $httpBackend.whenGET(metricsUrl).respond(metricsContent);

      CustomerReportService.getCallMetricsData(timeFilter).then(function (response) {
        expect(response).toEqual(metricsResponse);
      });

      $httpBackend.flush();
    });

    it('should notify an error for getCallMetricsData', function () {
      $httpBackend.whenGET(metricsUrl).respond(500, error);

      CustomerReportService.getCallMetricsData(timeFilter).then(function (response) {
        expect(response.dataProvider).toEqual([]);
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      $httpBackend.flush();
    });
  });

  describe('Registered Endpoints Service', function () {
    it('should getDeviceData', function () {
      $httpBackend.whenGET(devicesUrl).respond(devicesData);

      CustomerReportService.getDeviceData(timeFilter).then(function (response) {
        expect(response).toEqual(deviceResponse);
      });

      $httpBackend.flush();
    });

    it('should notify an error for getDeviceData', function () {
      $httpBackend.whenGET(devicesUrl).respond(500, error);

      CustomerReportService.getDeviceData(timeFilter).then(function (response) {
        expect(response).toEqual({
          graphData: [],
          filterArray: []
        });
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      $httpBackend.flush();
    });
  });
});
