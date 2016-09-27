'use strict';

describe('Service: Customer Reports Service', function () {
  var $httpBackend, $q, CommonReportService, CustomerReportService;

  var activeData = getJSONFixture('core/json/customerReports/activeUser.json');
  var defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
  var devicesJson = getJSONFixture('core/json/customerReports/devices.json');
  var fileData = getJSONFixture('core/json/customerReports/fileData.json');
  var mediaData = getJSONFixture('core/json/customerReports/mediaQuality.json');
  var metricsData = getJSONFixture('core/json/customerReports/callMetrics.json');
  var roomData = getJSONFixture('core/json/customerReports/roomData.json');
  var rejectError = {
    status: 500,
  };

  var updateDates = function (data, filter, altDate) {
    for (var i = data.length - 1; i >= 0; i--) {
      if (filter) {
        data[i].date = moment().tz(defaults.timezone).subtract(data.length - i, defaults.DAY).format(filter);
      } else {
        if (altDate) {
          data[i][altDate] = moment().tz(defaults.timezone).subtract(data.length - i, defaults.DAY).format();
        } else {
          data[i].date = moment().tz(defaults.timezone).subtract(data.length - i, defaults.DAY).format();
        }
      }
    }
    return data;
  };

  beforeEach(angular.mock.module('Core'));
  beforeEach(inject(function (_$httpBackend_, _$q_, _CommonReportService_, _CustomerReportService_) {
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    CommonReportService = _CommonReportService_;
    CustomerReportService = _CustomerReportService_;

    spyOn(CommonReportService, 'returnErrorCheck').and.callFake(function (error, message, response) {
      return response;
    });
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('Active User Services', function () {
    var mostActiveResponseObject = {
      tableData: _.clone(activeData.mostActiveResponse),
      error: false
    };
    var mostActiveResponseError = {
      tableData: [],
      error: true
    };

    it('should return column data getActiveUserData where lineGraph is false', function () {
      spyOn(CommonReportService, 'getCustomerReport').and.returnValue($q.when({
        data: {
          data: [{
            data: updateDates(_.clone(activeData.activeDetailed))
          }]
        }
      }));

      CustomerReportService.getActiveUserData(defaults.timeFilter[0], false).then(function (response) {
        expect(response).toEqual({
          graphData: updateDates(_.clone(activeData.activeResponse), defaults.dayFormat, null),
          isActiveUsers: true
        });
      });
    });

    it('should return line data getActiveUserData where lineGraph is true', function () {
      spyOn(CommonReportService, 'getCustomerAltReportByType').and.returnValue($q.when({
        data: {
          data: updateDates(_.clone(activeData.activeLineData))
        }
      }));

      CustomerReportService.getActiveUserData(defaults.timeFilter[0], true).then(function (response) {
        expect(response).toEqual({
          graphData: updateDates(_.clone(activeData.activeLineResponse), defaults.dayFormat, null),
          isActiveUsers: true
        });
      });
    });

    it('should notify an error for getActiveUserData where lineGraph is false', function () {
      spyOn(CommonReportService, 'getCustomerReport').and.returnValue($q.reject(rejectError));

      CustomerReportService.getActiveUserData(defaults.timeFilter[0], false).then(function (response) {
        expect(response).toEqual({
          graphData: [],
          isActiveUsers: false
        });
      });
    });

    it('should notify an error for getActiveUserData where lineGraph is true', function () {
      spyOn(CommonReportService, 'getCustomerAltReportByType').and.returnValue($q.reject(rejectError));

      CustomerReportService.getActiveUserData(defaults.timeFilter[0], true).then(function (response) {
        expect(response).toEqual({
          graphData: [],
          isActiveUsers: false
        });
      });
    });

    it('should getMostActiveUserData when lineGraph is false', function () {
      spyOn(CommonReportService, 'getCustomerReportByType').and.returnValue($q.when({
        data: _.clone(activeData.mostActive),
      }));

      CustomerReportService.getMostActiveUserData(defaults.timeFilter[0], false).then(function (response) {
        expect(response).toEqual(mostActiveResponseObject);
      });
    });

    it('should notify an error for getMostActiveUserData when lineGraph is false', function () {
      spyOn(CommonReportService, 'getCustomerReportByType').and.returnValue($q.reject(rejectError));

      CustomerReportService.getMostActiveUserData(defaults.timeFilter[0], false).then(function (response) {
        expect(response).toEqual(mostActiveResponseError);
      });
    });

    it('should getMostActiveUserData', function () {
      spyOn(CommonReportService, 'getCustomerAltReportByType').and.returnValue($q.when({
        data: _.clone(activeData.mostActive),
      }));

      CustomerReportService.getMostActiveUserData(defaults.timeFilter[0], true).then(function (response) {
        expect(response).toEqual(mostActiveResponseObject);
      });
    });

    it('should notify an error for getMostActiveUserData', function () {
      spyOn(CommonReportService, 'getCustomerAltReportByType').and.returnValue($q.reject(rejectError));

      CustomerReportService.getMostActiveUserData(defaults.timeFilter[0], true).then(function (response) {
        expect(response).toEqual(mostActiveResponseError);
      });
    });
  });

  describe('Rooms Service', function () {
    it('should getAvgRoomData', function () {
      spyOn(CommonReportService, 'getCustomerReport').and.callFake(function (options) {
        var data = updateDates(_.clone(roomData.groupRooms.data));
        if (options.type === 'convOneOnOne') {
          data = updateDates(_.clone(roomData.oneTwoOneRooms.data));
        } else if (options.type === 'avgConversations') {
          data = updateDates(_.clone(roomData.avgRooms.data));
        }
        return $q.when({
          data: {
            data: data
          },
        });
      });

      CustomerReportService.getAvgRoomData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual(updateDates(_.clone(roomData.response), defaults.dayFormat));
      });
    });

    it('should notify an error for getAvgRoomData', function () {
      spyOn(CommonReportService, 'getCustomerReport').and.returnValue($q.reject(rejectError));

      CustomerReportService.getAvgRoomData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual([]);
      });
    });
  });

  describe('File Service', function () {
    it('should getFilesSharedData', function () {
      spyOn(CommonReportService, 'getCustomerReport').and.callFake(function (options) {
        var data = updateDates(_.clone(fileData.content.data));
        if (options.type === 'contentShareSizes') {
          data = updateDates(_.clone(fileData.contentSize.data));
        }
        return $q.when({
          data: {
            data: data
          },
        });
      });

      CustomerReportService.getFilesSharedData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual(updateDates(_.clone(fileData.response), defaults.dayFormat));
      });
    });

    it('should notify an error for getFilesSharedData', function () {
      spyOn(CommonReportService, 'getCustomerReport').and.returnValue($q.reject(rejectError));

      CustomerReportService.getFilesSharedData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual([]);
      });
    });
  });

  describe('Media Service', function () {
    it('should getMediaQualityData', function () {
      spyOn(CommonReportService, 'getCustomerReport').and.returnValue($q.when({
        data: {
          data: [{
            data: updateDates(_.clone(mediaData.callQuality.data[0].data))
          }]
        },
      }));

      CustomerReportService.getMediaQualityData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual(updateDates(_.clone(mediaData.response), defaults.dayFormat));
      });
    });

    it('should notify an error for getMediaQualityData', function () {
      spyOn(CommonReportService, 'getCustomerReport').and.returnValue($q.reject(rejectError));

      CustomerReportService.getMediaQualityData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual([]);
      });
    });
  });

  describe('Call Metrics Service', function () {
    it('should getCallMetricsData', function () {
      spyOn(CommonReportService, 'getCustomerReport').and.returnValue($q.when({
        data: _.clone(metricsData.data),
      }));

      CustomerReportService.getCallMetricsData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual(_.clone(metricsData.response));
      });
    });

    it('should notify an error for getCallMetricsData', function () {
      spyOn(CommonReportService, 'getCustomerReport').and.returnValue($q.reject(rejectError));

      CustomerReportService.getCallMetricsData(defaults.timeFilter[0]).then(function (response) {
        expect(response.dataProvider).toEqual([]);
      });
    });
  });

  describe('Registered Endpoints Service', function () {
    var devicesData = _.clone(devicesJson.deviceData);
    _.forEach(devicesData, function (item) {
      item.details = updateDates(item.details, null, 'recordTime');
    });

    var deviceResponse = _.clone(devicesJson.response);
    _.forEach(deviceResponse.graphData, function (item) {
      item.graph = updateDates(item.graph, defaults.dayFormat);
    });

    it('should getDeviceData', function () {
      spyOn(CommonReportService, 'getCustomerReportByType').and.returnValue($q.when({
        data: {
          data: devicesData
        },
      }));

      CustomerReportService.getDeviceData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual(deviceResponse);
      });
    });

    it('should notify an error for getDeviceData', function () {
      spyOn(CommonReportService, 'getCustomerReportByType').and.returnValue($q.reject(rejectError));

      CustomerReportService.getDeviceData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual({
          graphData: [],
          filterArray: []
        });
      });
    });
  });
});
