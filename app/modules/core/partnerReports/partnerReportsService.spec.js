'use strict';

describe('Service: Partner Reports Service', function () {
  var $httpBackend, PartnerReportService, Config, Notification;
  var managedOrgsUrl, activeUsersDetailedUrl, mostActiveUsersUrl, mediaQualityUrl, callMetricsUrl, registeredEndpointsUrl;
  var activeUserDetailedResponse, activeUserDetailedAPI, mediaQualityResponse;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));

  var cacheValue = (parseInt(moment.utc().format('H')) >= 8);
  var dayFormat = "MMM DD";
  var timezone = "Etc/GMT";
  var timeFilter = {
    value: 0
  };

  var updateDates = function (data) {
    for (var i = data.length - 1; i >= 0; i--) {
      if (angular.isDefined(data[i].date)) {
        data[i].date = moment().tz(timezone).subtract(data.length - i, 'day').format();
      } else {
        data[i].modifiedDate = moment().tz(timezone).subtract(data.length - i, 'day').format(dayFormat);
      }
    }
    return data;
  };

  var customerData = getJSONFixture('core/json/partnerReports/customerResponse.json');
  var activeUserData = getJSONFixture('core/json/partnerReports/activeUserData.json');
  var callMetricsData = getJSONFixture('core/json/partnerReports/callMetricsData.json');
  var registeredEndpointsData = getJSONFixture('core/json/partnerReports/registeredEndpointData.json');
  var mediaQualityData = getJSONFixture('core/json/partnerReports/mediaQualityData.json');
  mediaQualityData.mediaQualityAPI.data[0].data[0].date = moment().tz(timezone).subtract(1, 'day').format();
  mediaQualityData.mediaQualityAPI.data[2].data[0].date = moment().tz(timezone).subtract(3, 'day').format();

  var error = {
    message: 'error'
  };

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _PartnerReportService_, UrlConfig, _Notification_) {
    $httpBackend = _$httpBackend_;
    PartnerReportService = _PartnerReportService_;
    Notification = _Notification_;

    spyOn(Notification, 'notify');

    managedOrgsUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/managedOrgs';

    var baseUrl = UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/reports/';
    activeUsersDetailedUrl = baseUrl + 'detailed/managedOrgs/activeUsers?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue;
    mostActiveUsersUrl = baseUrl + 'topn/managedOrgs/activeUsers?&intervalCount=7&intervalType=day&spanCount=7&spanType=day&cache=' + cacheValue;
    mediaQualityUrl = baseUrl + 'detailed/managedOrgs/callQuality?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue;
    callMetricsUrl = baseUrl + 'detailed/managedOrgs/callMetrics?&intervalCount=7&intervalType=day&spanCount=7&spanType=day&cache=' + cacheValue;
    registeredEndpointsUrl = baseUrl + 'trend/managedOrgs/registeredEndpoints?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue;

    angular.forEach(customerData.customerOptions, function (org, index, array) {
      mostActiveUsersUrl += '&orgId=' + org.value;
      mediaQualityUrl += '&orgId=' + org.value;
      callMetricsUrl += '&orgId=' + org.value;
      registeredEndpointsUrl += '&orgId=' + org.value;
    });

    activeUserDetailedResponse = updateDates(activeUserData.detailedResponse);
    activeUserDetailedAPI = activeUserData.detailedAPI;
    activeUserDetailedAPI.data[0].data = updateDates(activeUserDetailedAPI.data[0].data);
    activeUserDetailedAPI.data[1].data = updateDates(activeUserDetailedAPI.data[1].data);

    mediaQualityResponse = updateDates(mediaQualityData.mediaQualityResponse);
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', function () {
    expect(PartnerReportService).toBeDefined();
  });

  describe('Active User Services', function () {
    it('should getOverallActiveUserData', function () {
      $httpBackend.whenGET(activeUsersDetailedUrl).respond(updateDates(activeUserDetailedAPI));
      PartnerReportService.getOverallActiveUserData(timeFilter).then(function (response) {
        expect(response).toBe(undefined);
      });
      $httpBackend.flush();
    });

    it('should getActiveUserData for an existing customer', function () {
      $httpBackend.whenGET(activeUsersDetailedUrl).respond(activeUserDetailedAPI);

      PartnerReportService.getActiveUserData(customerData.customerOptions, timeFilter).then(function (response) {
        expect(response).toEqual({
          graphData: activeUserDetailedResponse,
          isActiveUsers: true,
          popData: activeUserData.activePopResponse,
          overallPopulation: 33
        });
      });
      $httpBackend.flush();
    });

    it('should notify an error for getActiveUserData and return empty data', function () {
      $httpBackend.whenGET(activeUsersDetailedUrl).respond(500, error);

      var activePopResponse = angular.copy(activeUserData.activePopResponse);
      activePopResponse[0].percentage = 0;

      PartnerReportService.getActiveUserData(customerData.customerOptions, timeFilter).then(function (response) {
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
        expect(response).toEqual({
          graphData: [],
          isActiveUsers: false,
          popData: activePopResponse,
          overallPopulation: 0
        });
      });
      $httpBackend.flush();
    });

    it('should getActiveTableData for an existing customer', function () {
      $httpBackend.whenGET(mostActiveUsersUrl).respond(activeUserData.mostActiveAPI);

      PartnerReportService.getActiveTableData(customerData.customerOptions, timeFilter).then(function (response) {
        expect(response).toEqual(activeUserData.mostActiveResponse);
      });
      $httpBackend.flush();
    });

    it('should notify an error for getActiveTableData and return empty', function () {
      $httpBackend.whenGET(mostActiveUsersUrl).respond(500, error);

      PartnerReportService.getActiveTableData(customerData.customerOptions, timeFilter).then(function (response) {
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
        expect(response).toEqual([]);
      });
      $httpBackend.flush();
    });
  });

  describe('Media Quality Services', function () {
    it('should get MediaQuality Metrics', function () {
      $httpBackend.whenGET(mediaQualityUrl).respond(mediaQualityData.mediaQualityAPI);
      PartnerReportService.getMediaQualityMetrics(customerData.customerOptions, timeFilter).then(function (response) {
        expect(response).toEqual(mediaQualityResponse);
      });
      $httpBackend.flush();
    });

    it('should get empty array for GET failure', function () {
      $httpBackend.whenGET(mediaQualityUrl).respond(500, error);
      PartnerReportService.getMediaQualityMetrics(customerData.customerOptions, timeFilter).then(function (response) {
        expect(response).toEqual([]);
      });
      $httpBackend.flush();
    });
  });

  describe('Call Metrics Services', function () {
    it('should get Call Metrics', function () {
      $httpBackend.whenGET(callMetricsUrl).respond(callMetricsData.callMetricsAPI);
      PartnerReportService.getCallMetricsData(customerData.customerOptions, timeFilter).then(function (response) {
        expect(response).toEqual(callMetricsData.callMetricsResponse);
      });
      $httpBackend.flush();
    });

    it('should get empty array for GET failure', function () {
      $httpBackend.whenGET(callMetricsUrl).respond(500, error);
      PartnerReportService.getCallMetricsData(customerData.customerOptions, timeFilter).then(function (data) {
        expect(data).toEqual(callMetricsData.emptyArray);
      });
      $httpBackend.flush();
    });
  });

  describe('Registered Endpoint Service', function () {
    it('should get registered endpoints for a customer with positive response', function () {
      $httpBackend.whenGET(registeredEndpointsUrl).respond(registeredEndpointsData.registeredEndpointsAPI);
      PartnerReportService.getRegisteredEndpoints(customerData.customerOptions, timeFilter).then(function (response) {
        expect(response).toEqual(registeredEndpointsData.registeredEndpointResponse);
      });
      $httpBackend.flush();
    });

    it('should return an empty array on error response', function () {
      $httpBackend.whenGET(registeredEndpointsUrl).respond(500);
      PartnerReportService.getRegisteredEndpoints(customerData.customerOptions, timeFilter).then(function (response) {
        expect(response).toEqual([]);
      });
      $httpBackend.flush();
    });
  });

  describe('Helper Services', function () {
    it('getCustomerList should return a list of customers', function () {
      $httpBackend.whenGET(managedOrgsUrl).respond({
        'organizations': angular.copy(customerData.customerResponse)
      });
      PartnerReportService.getCustomerList().then(function (list) {
        expect(list).toEqual(customerData.customerResponse);
      });
      $httpBackend.flush();
    });

    it('getCustomerList should flag an error when managedOrgs does not return data', function () {
      $httpBackend.whenGET(managedOrgsUrl).respond(500, error);
      PartnerReportService.getCustomerList().then(function (list) {
        expect(list).toEqual([]);
      });
      $httpBackend.flush();
    });
  });
});
