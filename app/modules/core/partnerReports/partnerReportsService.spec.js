'use strict';

describe('Service: Partner Reports Service', function () {
  var $httpBackend, PartnerReportService, Config, Notification;
  var managedOrgsUrl, activeUsersDetailedUrl, mostActiveUsersUrl, mediaQualityUrl, callMetricsUrl, registeredEndpointsUrl;

  beforeEach(module('Core'));
  beforeEach(module('Huron'));

  var cacheValue = (parseInt(moment.utc().format('H')) >= 8);
  var dayFormat = "MMM DD";
  var timezone = "Etc/GMT";
  var timeFilter = {
    value: 0
  };

  var updateDates = function (response) {
    var data = response.data[0].data;
    for (var i = data.length - 1; i >= 0; i--) {
      data[i].date = moment().tz(timezone).subtract(data.length - i, 'day').format();
    }
    response.data[0].data = data;
    return response;
  };

  var customers = getJSONFixture('core/json/partnerReports/customerResponse.json');
  var activeUserDetailedData = getJSONFixture('core/json/partnerReports/activeUserDetailedResponse.json');
  var mostActiveUserData = getJSONFixture('core/json/partnerReports/mostActiveUserResponse.json');
  var customerData = {
    'organizations': getJSONFixture('core/json/partnerReports/customerResponse.json')
  };
  var callMetricsData = getJSONFixture('core/json/partnerReports/callMetricsData.json');
  var registeredEndpointsData = getJSONFixture('core/json/partnerReports/registeredEndpointData.json');

  var error = {
    message: 'error'
  };
  var customer = [{
    value: customers[0].customerOrgId,
    label: customers[0].customerName,
    isAllowedToManage: true
  }];
  var customerResponse = {
    customerName: customers[0].customerName,
    customerId: customers[0].customerOrgId,
    percentage: 0,
    balloon: true,
    labelColorField: '#444'
  };
  var nullCustomer = {
    value: 0,
    label: ""
  };
  var customerDatapoint = {
    modifiedDate: moment().tz(timezone).subtract(7, 'day').format(dayFormat),
    totalRegisteredUsers: 14,
    activeUsers: 14,
    percentage: 100
  };
  var customerPopulation = {
    customerName: 'Test Org One',
    customerId: 'a7cba512-7b62-4f0a-a869-725b413680e4',
    percentage: 99,
    balloon: true,
    labelColorField: '#444'
  };
  var zeroPopulation = {
    customerName: 'Test Org One',
    customerId: 'a7cba512-7b62-4f0a-a869-725b413680e4',
    percentage: 0
  };
  var customerTableDataPoint = {
    orgName: 'Test Org One',
    numCalls: 5,
    totalActivity: 14,
    sparkMessages: 9,
    userName: 'havard.nigardsoy@vijugroup.com'
  };
  var posEndpointResponse = [{
    orgId: customers[0].customerOrgId,
    deviceRegistrationCountTrend: '4',
    yesterdaysDeviceRegistrationCount: '2',
    registeredDevicesTrend: '+5',
    yesterdaysRegisteredDevices: '2',
    maxRegisteredDevices: '3',
    minRegisteredDevices: '2',
    customer: 'Test Org One',
    direction: 'positive'
  }];
  var negEndpointResponse = [{
    orgId: customers[0].customerOrgId,
    deviceRegistrationCountTrend: '-4',
    yesterdaysDeviceRegistrationCount: '2',
    registeredDevicesTrend: '-5',
    yesterdaysRegisteredDevices: '2',
    maxRegisteredDevices: '3',
    minRegisteredDevices: '2',
    customer: 'Test Org One',
    direction: 'negative'
  }];
  var mediaQualityGraphData = {
    "data": [{
      "orgId": "7e88d491-d6ca-4786-82ed-cbe9efb02ad2",
      "orgName": "Huron Int Test 1",
      "data": [{
        "date": moment().tz(timezone).subtract(1, 'day').format(),
        "details": {
          "totalCount": "200",
          "totalDurationSum": "3605",
          "totalDurationAvg": "1",
          "goodQualityCount": "194",
          "goodQualityDurationSum": "3585",
          "goodQualityDurationAvg": "18.479381",
          "fairQualityCount": "5",
          "fairQualityDurationSum": "10",
          "fairQualityDurationAvg": "2",
          "poorQualityCount": "1",
          "poorQualityDurationSum": "10",
          "poorQualityDurationAvg": "10"
        }
      }]
    }],
    "date": "2015-04-20"
  };

  var emptyCallMetricsArray = {
    dataProvider: [],
    displayData: {}
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
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', function () {
    expect(PartnerReportService).toBeDefined();
  });

  describe('Active User Services', function () {
    describe('should getOverallActiveUserData', function () {
      beforeEach(function () {
        $httpBackend.whenGET(activeUsersDetailedUrl).respond(updateDates(activeUserDetailedData));
      });

      it('just the detailed data', function () {
        PartnerReportService.getOverallActiveUserData(timeFilter).then(function (response) {
          expect(response).toBe(undefined);
        });
        $httpBackend.flush();
      });
    });

    describe('should getActiveUserData', function () {
      beforeEach(function () {
        $httpBackend.whenGET(mostActiveUsersUrl + customers[0].customerOrgId).respond(mostActiveUserData);
        $httpBackend.whenGET(activeUsersDetailedUrl).respond(updateDates(activeUserDetailedData));
      });

      it('for an existing customer', function () {
        PartnerReportService.getActiveUserData(customer, timeFilter).then(function (response) {
          expect(response.graphData[0].modifiedDate).toEqual(customerDatapoint.modifiedDate);
          expect(response.graphData[0].totalRegisteredUsers).toEqual(customerDatapoint.totalRegisteredUsers);
          expect(response.graphData[0].activeUsers).toEqual(customerDatapoint.activeUsers);
          expect(response.graphData[0].percentage).toEqual(customerDatapoint.percentage);

          expect(response.tableData[0]).toEqual(customerTableDataPoint);
          expect(response.populationGraph[0]).toEqual(customerPopulation);
          expect(response.overallPopulation).toEqual(99);
        });
        $httpBackend.flush();
      });
    });

    describe('should notify an error for getActiveUserData', function () {
      it('and return empty table data', function () {
        $httpBackend.whenGET(mostActiveUsersUrl + customers[0].customerOrgId).respond(500, error);
        $httpBackend.whenGET(activeUsersDetailedUrl).respond(updateDates(activeUserDetailedData));

        PartnerReportService.getActiveUserData(customer, timeFilter).then(function (response) {
          expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');

          expect(response.graphData[0].modifiedDate).toEqual(customerDatapoint.modifiedDate);
          expect(response.graphData[0].totalRegisteredUsers).toEqual(customerDatapoint.totalRegisteredUsers);
          expect(response.graphData[0].activeUsers).toEqual(customerDatapoint.activeUsers);
          expect(response.graphData[0].percentage).toEqual(customerDatapoint.percentage);

          expect(response.tableData).toEqual([]);
          expect(response.populationGraph[0]).toEqual(customerPopulation);
          expect(response.overallPopulation).toEqual(99);
        });
        $httpBackend.flush();
      });

      it('and return empty graph data', function () {
        $httpBackend.whenGET(mostActiveUsersUrl + customers[0].customerOrgId).respond(mostActiveUserData);
        $httpBackend.whenGET(activeUsersDetailedUrl).respond(500, error);

        PartnerReportService.getActiveUserData(customer, timeFilter).then(function (response) {
          expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
          expect(response.graphData).toEqual([]);
          expect(response.tableData[0]).toEqual(customerTableDataPoint);
          expect(response.populationGraph[0]).toEqual(customerResponse);
          expect(response.overallPopulation).toEqual(0);
        });
        $httpBackend.flush();
      });

      it('and return empty graph and table data', function () {
        $httpBackend.whenGET(activeUsersDetailedUrl).respond(500, error);

        PartnerReportService.getActiveUserData(nullCustomer, timeFilter).then(function (response) {
          expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
          expect(response.graphData).toEqual([]);
          expect(response.tableData).toEqual([]);
          expect(response.populationGraph).toEqual([]);
          expect(response.overallPopulation).toEqual(0);
        });
        $httpBackend.flush();
      });
    });
  });

  describe('Helper Services', function () {
    it('getCustomerList should return a list of customers', function () {
      $httpBackend.whenGET(managedOrgsUrl).respond(customerData);
      PartnerReportService.getCustomerList().then(function (list) {
        expect(list).toEqual(customers);
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

  describe('Media Quality Services', function () {
    it('should get MediaQuality Metrics', function () {
      $httpBackend.whenGET(mediaQualityUrl + customers[0].customerOrgId).respond(mediaQualityGraphData);
      PartnerReportService.getMediaQualityMetrics(customer, timeFilter).then(function (data) {
        expect(data[6].totalDurationSum).toBe(parseInt(mediaQualityGraphData.data[0].data[0].details.totalDurationSum));
        expect(data[6].goodQualityDurationSum).toEqual(parseInt(mediaQualityGraphData.data[0].data[0].details.goodQualityDurationSum));
        expect(data[6].fairQualityDurationSum).toEqual(parseInt(mediaQualityGraphData.data[0].data[0].details.fairQualityDurationSum));
        expect(data[6].poorQualityDurationSum).toEqual(parseInt(mediaQualityGraphData.data[0].data[0].details.poorQualityDurationSum));

        expect(data[0].totalDurationSum).toBe(0);
        expect(data[0].goodQualityDurationSum).toBe(0);
        expect(data[0].fairQualityDurationSum).toBe(0);
        expect(data[0].poorQualityDurationSum).toBe(0);
      });
      $httpBackend.flush();
    });

    it('should get empty array for GET failure', function () {
      $httpBackend.whenGET(mediaQualityUrl + customers[0].customerOrgId).respond(500, error);
      PartnerReportService.getMediaQualityMetrics(customer, timeFilter).then(function (data) {
        expect(data).toEqual([]);
      });
      $httpBackend.flush();
    });
  });

  describe('Call Metrics Services', function () {
    it('should get Call Metrics', function () {
      $httpBackend.whenGET(callMetricsUrl + customers[0].customerOrgId).respond(callMetricsData);
      PartnerReportService.getCallMetricsData(customer, timeFilter).then(function (data) {
        expect(data.dataProvider.length).toBe(2);
      });
      $httpBackend.flush();
    });

    it('should get empty array for GET failure', function () {
      $httpBackend.whenGET(callMetricsUrl + customers[0].customerOrgId).respond(500, error);
      PartnerReportService.getCallMetricsData(customer, timeFilter).then(function (data) {
        expect(data).toEqual(emptyCallMetricsArray);
      });
      $httpBackend.flush();
    });
  });

  describe('Registered Endpoint Service', function () {
    it('should get registered endpoints for a customer with positive response', function () {
      $httpBackend.whenGET(registeredEndpointsUrl + customers[0].customerOrgId).respond({
        data: [registeredEndpointsData.data[0]]
      });
      PartnerReportService.getRegisteredEndpoints(customer, timeFilter).then(function (response) {
        expect(response).toEqual(posEndpointResponse);
      });
      $httpBackend.flush();
    });

    it('should get registered endpoints for a customer with negative response', function () {
      $httpBackend.whenGET(registeredEndpointsUrl + customers[0].customerOrgId).respond({
        data: [registeredEndpointsData.data[1]]
      });
      PartnerReportService.getRegisteredEndpoints(customer, timeFilter).then(function (response) {
        expect(response).toEqual(negEndpointResponse);
      });
      $httpBackend.flush();
    });

    it('should return an empty array on error response', function () {
      $httpBackend.whenGET(registeredEndpointsUrl + customers[0].customerOrgId).respond(500);
      PartnerReportService.getRegisteredEndpoints(customer, timeFilter).then(function (response) {
        expect(response).toEqual([]);
      });
      $httpBackend.flush();
    });
  });
});
