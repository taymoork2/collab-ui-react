'use strict';

describe('Service: Partner Reports Service', function () {
  var $httpBackend, PartnerReportService, Config, Notification;
  var managedOrgsUrl, activeUsersDetailedUrl, mostActiveUsersUrl, mediaQualityUrl, callMetricsUrl, registeredEndpointsUrl;
  var activeUserDetailedResponse, activeUserDetailedAPI, mediaQualityResponse;

  beforeEach(module('Core'));
  beforeEach(module('Huron'));

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

  var error = {
    message: 'error'
  };

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _PartnerReportService_, _Config_, _Notification_) {
    $httpBackend = _$httpBackend_;
    PartnerReportService = _PartnerReportService_;
    Config = _Config_;
    Notification = _Notification_;

    spyOn(Notification, 'notify');

    managedOrgsUrl = Config.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/managedOrgs';

    var baseUrl = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/reports/';
    activeUsersDetailedUrl = baseUrl + 'detailed/managedOrgs/activeUsers?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue;
    mostActiveUsersUrl = baseUrl + 'topn/managedOrgs/activeUsers?&intervalCount=7&intervalType=day&spanCount=7&spanType=day&cache=' + cacheValue + '&orgId=';
    mediaQualityUrl = baseUrl + 'detailed/managedOrgs/callQuality?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue + '&orgId=';
    callMetricsUrl = baseUrl + 'detailed/managedOrgs/callMetrics?&intervalCount=7&intervalType=day&spanCount=7&spanType=day&cache=' + cacheValue + '&orgId=';
    registeredEndpointsUrl = baseUrl + 'trend/managedOrgs/registeredEndpoints?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue + '&orgId=';

    activeUserDetailedResponse = updateDates(activeUserData.detailedResponse);
    activeUserDetailedAPI = activeUserData.detailedAPI;
    activeUserDetailedAPI.data[0].data = updateDates(activeUserDetailedAPI.data[0].data);

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
      $httpBackend.whenGET(mostActiveUsersUrl + customerData.customerOptions[0].value).respond(activeUserData.mostActiveAPI);
      $httpBackend.whenGET(activeUsersDetailedUrl).respond(activeUserDetailedAPI);

      PartnerReportService.getActiveUserData(customerData.customerOptions[0], timeFilter).then(function (response) {
        expect(response.graphData).toEqual(activeUserDetailedResponse);
        expect(response.tableData).toEqual(activeUserData.mostActiveResponse);
        expect(response.populationGraph).toEqual(activeUserData.activePopResponse);
        expect(response.overallPopulation).toEqual(99);
      });
      $httpBackend.flush();
    });

    describe('should notify an error for getActiveUserData', function () {
      it('and return empty table data', function () {
        $httpBackend.whenGET(mostActiveUsersUrl + customerData.customerOptions[0].value).respond(500, error);
        $httpBackend.whenGET(activeUsersDetailedUrl).respond(activeUserDetailedAPI);

        PartnerReportService.getActiveUserData(customerData.customerOptions[0], timeFilter).then(function (response) {
          expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
          expect(response.graphData).toEqual(activeUserDetailedResponse);
          expect(response.tableData).toEqual([]);
          expect(response.populationGraph).toEqual(activeUserData.activePopResponse);
          expect(response.overallPopulation).toEqual(99);
        });
        $httpBackend.flush();
      });

      it('and return empty graph data', function () {
        $httpBackend.whenGET(mostActiveUsersUrl + customerData.customerOptions[0].value).respond(activeUserData.mostActiveAPI);
        $httpBackend.whenGET(activeUsersDetailedUrl).respond(500, error);

        var activePopResponse = angular.copy(activeUserData.activePopResponse);
        activePopResponse[0].percentage = 0;

        PartnerReportService.getActiveUserData(customerData.customerOptions[0], timeFilter).then(function (response) {
          expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
          expect(response.graphData).toEqual([]);
          expect(response.tableData).toEqual(activeUserData.mostActiveResponse);
          expect(response.populationGraph).toEqual(activePopResponse);
          expect(response.overallPopulation).toEqual(0);
        });
        $httpBackend.flush();
      });
    });
  });

  describe('Media Quality Services', function () {
    it('should get MediaQuality Metrics', function () {
      $httpBackend.whenGET(mediaQualityUrl + customerData.customerOptions[0].value).respond(mediaQualityData.mediaQualityAPI);
      PartnerReportService.getMediaQualityMetrics(customerData.customerOptions[0], timeFilter).then(function (response) {
        expect(response).toEqual(mediaQualityResponse);
      });
      $httpBackend.flush();
    });

    it('should get empty array for GET failure', function () {
      $httpBackend.whenGET(mediaQualityUrl + customerData.customerOptions[0].value).respond(500, error);
      PartnerReportService.getMediaQualityMetrics(customerData.customerOptions[0], timeFilter).then(function (response) {
        expect(response).toEqual([]);
      });
      $httpBackend.flush();
    });
  });

  describe('Call Metrics Services', function () {
    it('should get Call Metrics', function () {
      $httpBackend.whenGET(callMetricsUrl + customerData.customerOptions[0].value).respond(callMetricsData.callMetricsAPI);
      PartnerReportService.getCallMetricsData(customerData.customerOptions[0], timeFilter).then(function (response) {
        expect(response).toEqual(callMetricsData.callMetricsResponse);
      });
      $httpBackend.flush();
    });

    it('should get empty array for GET failure', function () {
      $httpBackend.whenGET(callMetricsUrl + customerData.customerOptions[0].value).respond(500, error);
      PartnerReportService.getCallMetricsData(customerData.customerOptions[0], timeFilter).then(function (data) {
        expect(data).toEqual(callMetricsData.emptyArray);
      });
      $httpBackend.flush();
    });
  });

  describe('Registered Endpoint Service', function () {
    it('should get registered endpoints for a customer with positive response', function () {
      $httpBackend.whenGET(registeredEndpointsUrl + customerData.customerOptions[0].value).respond(registeredEndpointsData.registeredEndpointsAPI.positive);
      PartnerReportService.getRegisteredEndpoints(customerData.customerOptions[0], timeFilter).then(function (response) {
        expect(response).toEqual(registeredEndpointsData.registeredEndpointResponse.positive);
      });
      $httpBackend.flush();
    });

    it('should get registered endpoints for a customer with negative response', function () {
      $httpBackend.whenGET(registeredEndpointsUrl + customerData.customerOptions[0].value).respond(registeredEndpointsData.registeredEndpointsAPI.negative);
      PartnerReportService.getRegisteredEndpoints(customerData.customerOptions[0], timeFilter).then(function (response) {
        expect(response).toEqual(registeredEndpointsData.registeredEndpointResponse.negative);
      });
      $httpBackend.flush();
    });

    it('should return an empty array on error response', function () {
      $httpBackend.whenGET(registeredEndpointsUrl + customerData.customerOptions[0].value).respond(500);
      PartnerReportService.getRegisteredEndpoints(customerData.customerOptions[0], timeFilter).then(function (response) {
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
