'use strict';

describe('Service: Customer Reports Service', function () {
  var $httpBackend, CustomerReportService, Config, Notification;
  var avgRoomsUrl, groupRoomsUrl, oneToOneRoomsUrl;

  var roomData = getJSONFixture('core/json/customerReports/roomData.json');
  var groupRoomData = roomData.groupRooms;
  var avgRoomData = roomData.avgRooms;
  var oneToOneRoomData = roomData.oneTwoOneRooms;
  var responseRoomData = roomData.response;

  beforeEach(module('Core'));

  var cacheValue = (parseInt(moment.utc().format('H')) >= 8);
  var dayFormat = "MMM DD";
  var timezone = "Etc/GMT";
  var timeFilter = {
    value: 0
  };

  var updateDates = function (data, filter) {
    for (var i = data.length - 1; i >= 0; i--) {
      if (filter === null || angular.isUndefined(filter)) {
        data[i].date = moment().tz(timezone).subtract(data.length - i, 'day').format();
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

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _CustomerReportService_, _Config_, _Notification_) {
    $httpBackend = _$httpBackend_;
    CustomerReportService = _CustomerReportService_;
    Config = _Config_;
    Notification = _Notification_;

    spyOn(Notification, 'notify');

    var baseUrl = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/reports/';
    var customerView = '&isCustomerView=true';
    groupRoomsUrl = baseUrl + 'timeCharts/conversations?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue + customerView;
    avgRoomsUrl = baseUrl + 'timeCharts/avgConversations?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue + customerView;
    oneToOneRoomsUrl = baseUrl + 'timeCharts/convOneOnOne?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue + customerView;

    groupRoomData.data = updateDates(groupRoomData.data);
    avgRoomData.data = updateDates(avgRoomData.data);
    oneToOneRoomData.data = updateDates(oneToOneRoomData.data);
    responseRoomData = updateDates(responseRoomData, dayFormat);
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', function () {
    expect(CustomerReportService).toBeDefined();
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
});
