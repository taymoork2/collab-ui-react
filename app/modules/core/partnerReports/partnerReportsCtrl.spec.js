'use strict';

describe('Controller: Partner Reports', function () {
  var controller, $scope, $q, $translate, PartnerReportService, GraphService, DummyReportService;
  var activeUsersSort = ['userName', 'orgName', 'numCalls', 'sparkMessages', 'totalActivity'];

  var dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
  var customerData = getJSONFixture('core/json/partnerReports/customerResponse.json');
  var activeUserData = getJSONFixture('core/json/partnerReports/activeUserData.json');
  var callMetricsData = getJSONFixture('core/json/partnerReports/callMetricsData.json');
  var registeredEndpointsData = getJSONFixture('core/json/partnerReports/registeredEndpointData.json');
  var mediaQualityData = getJSONFixture('core/json/partnerReports/mediaQualityData.json');

  var timeOptions = [{
    value: 0,
    label: 'reportsPage.week',
    description: 'reportsPage.week2'
  }, {
    value: 1,
    label: 'reportsPage.month',
    description: 'reportsPage.month2'
  }, {
    value: 2,
    label: 'reportsPage.threeMonths',
    description: 'reportsPage.threeMonths2'
  }];

  var validateService = {
    invalidate: function () {}
  };

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue(customerData.customerOptions[3].value),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue(customerData.customerOptions[3].label)
  };

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));

  describe('PartnerReportCtrl - Expected Responses', function () {
    beforeEach(inject(function ($rootScope, $controller, _$q_, _$translate_, _PartnerReportService_, _GraphService_, _DummyReportService_) {
      $scope = $rootScope.$new();
      $q = _$q_;
      $translate = _$translate_;
      PartnerReportService = _PartnerReportService_;
      GraphService = _GraphService_;
      DummyReportService = _DummyReportService_;

      spyOn(PartnerReportService, 'getOverallActiveUserData').and.returnValue($q.when({}));
      spyOn(PartnerReportService, 'getActiveUserData').and.returnValue($q.when({
        graphData: activeUserData.detailedResponse,
        isActiveUsers: true,
        popData: activeUserData.activePopResponse,
        overallPopulation: 33
      }));
      spyOn(PartnerReportService, 'getActiveTableData').and.returnValue($q.when(activeUserData.mostActiveResponse));
      spyOn(PartnerReportService, 'getCustomerList').and.returnValue($q.when(customerData.customerResponse));
      spyOn(PartnerReportService, 'getMediaQualityMetrics').and.returnValue($q.when(mediaQualityData.mediaQualityResponse));
      spyOn(PartnerReportService, 'getCallMetricsData').and.returnValue($q.when(callMetricsData.callMetricsResponse));
      spyOn(PartnerReportService, 'getRegisteredEndpoints').and.returnValue($q.when(registeredEndpointsData.registeredEndpointResponse));

      spyOn(GraphService, 'getActiveUsersGraph').and.returnValue({
        'dataProvider': activeUserData.detailedResponse,
        invalidateSize: validateService.invalidate
      });

      spyOn(GraphService, 'getMediaQualityGraph').and.returnValue({
        'dataProvider': mediaQualityData.mediaQualityResponse,
        invalidateSize: validateService.invalidate
      });

      spyOn(GraphService, 'getActiveUserPopulationGraph').and.returnValue({
        'dataProvider': activeUserData.activePopResponse,
        invalidateSize: validateService.invalidate
      });

      spyOn(GraphService, 'getCallMetricsDonutChart').and.returnValue({
        'dataProvider': callMetricsData.callMetricsResponse,
        invalidateSize: validateService.invalidate
      });

      spyOn(DummyReportService, 'dummyActiveUserData').and.returnValue(dummyData.activeUser.one);
      spyOn(DummyReportService, 'dummyActivePopulationData').and.returnValue(dummyData.activeUserPopulation);
      spyOn(DummyReportService, 'dummyMediaQualityData').and.returnValue(dummyData.mediaQuality.one);
      spyOn(DummyReportService, 'dummyCallMetricsData').and.returnValue(dummyData.callMetrics);
      spyOn(DummyReportService, 'dummyEndpointData').and.returnValue(dummyData.endpoints);

      controller = $controller('PartnerReportCtrl', {
        $scope: $scope,
        $translate: $translate,
        $q: $q,
        PartnerReportService: PartnerReportService,
        GraphService: GraphService,
        DummyReportService: DummyReportService,
        Authinfo: Authinfo
      });
      $scope.$apply();
    }));

    describe('Initializing Controller', function () {
      it('should be created successfully and all expected calls completed', function () {
        expect(controller).toBeDefined();

        expect(DummyReportService.dummyActiveUserData).toHaveBeenCalled();
        expect(DummyReportService.dummyActivePopulationData).toHaveBeenCalled();
        expect(DummyReportService.dummyMediaQualityData).toHaveBeenCalled();
        expect(DummyReportService.dummyCallMetricsData).toHaveBeenCalled();
        expect(DummyReportService.dummyEndpointData).toHaveBeenCalled();

        expect(PartnerReportService.getOverallActiveUserData).toHaveBeenCalled();
        expect(PartnerReportService.getActiveUserData).toHaveBeenCalled();
        expect(PartnerReportService.getActiveTableData).toHaveBeenCalled();
        expect(PartnerReportService.getCustomerList).toHaveBeenCalled();
        expect(PartnerReportService.getMediaQualityMetrics).toHaveBeenCalled();
        expect(PartnerReportService.getRegisteredEndpoints).toHaveBeenCalled();

        expect(GraphService.getActiveUsersGraph).toHaveBeenCalled();
        expect(GraphService.getMediaQualityGraph).toHaveBeenCalled();
        expect(GraphService.getActiveUserPopulationGraph).toHaveBeenCalled();
        expect(GraphService.getCallMetricsDonutChart).toHaveBeenCalled();
      });

      it('should set all page variables', function () {
        expect(controller.showEngagement).toEqual(true);
        expect(controller.showQuality).toEqual(true);

        expect(controller.customerPlaceholder).toEqual('reportsPage.customerSelect');
        expect(controller.customerSingular).toEqual('reportsPage.customer');
        expect(controller.customerPlural).toEqual('reportsPage.customers');
        expect(controller.customerMax).toEqual(5);
        expect(controller.customerOptions).toEqual(customerData.customerOptions);
        expect(controller.customerSelected).toEqual(customerData.customerOptions);

        expect(controller.activeUsersRefresh).toEqual('set');
        expect(controller.mostActiveRefresh).toEqual('set');
        expect(controller.activeUserPopulationRefresh).toEqual('set');
        expect(controller.showMostActiveUsers).toBeFalsy();
        expect(controller.activeUserReverse).toBeTruthy();
        expect(controller.activeUsersTotalPages).toEqual(2);
        expect(controller.activeUserCurrentPage).toEqual(1);
        expect(controller.activeUserPredicate).toEqual(activeUsersSort[4]);
        expect(controller.activeButton).toEqual([1, 2, 3]);
        expect(controller.mostActiveUsers).toEqual(activeUserData.mostActiveResponse);
        expect(controller.mostActiveTitle).toEqual('activeUsers.mostActiveUsers');
        expect(controller.displayMostActive).toBeTruthy();
        expect(controller.showMostActiveUsers).toBeFalsy();
        expect(controller.mostActiveDescription).toEqual('activeUsers.mostActiveDescription');
        expect(controller.activeUserDescription).toEqual('activeUsers.description');
        expect(controller.mostActiveDescription).toEqual('activeUsers.mostActiveDescription');

        expect(controller.mediaQualityPopover).toEqual('mediaQuality.packetLossDefinition');
        expect(controller.mediaQualityRefresh).toEqual('set');

        expect(controller.callMetricsRefresh).toEqual('set');
        expect(controller.callMetricsDescription).toEqual('callMetrics.callMetricsDesc');

        expect(controller.endpointRefresh).toEqual('set');
        expect(controller.registeredEndpoints).toEqual(registeredEndpointsData.registeredEndpointResponse);
        expect(controller.dummyTable).toBeFalsy();
        expect(controller.endpointDescription).toEqual('registeredEndpoints.description');
        expect(controller.trend).toEqual('registeredEndpoints.trend');
        expect(controller.devices).toEqual('registeredEndpoints.maxRegisteredDevices');

        expect(controller.timeOptions).toEqual(timeOptions);
        expect(controller.timeSelected).toEqual(timeOptions[0]);
      });
    });

    describe('activePage', function () {
      it('should return true when called with the same value as activeUserCurrentPage', function () {
        expect(controller.activePage(1)).toBeTruthy();
      });

      it('should return false when called with a different value as activeUserCurrentPage', function () {
        expect(controller.activePage(3)).toBeTruthy();
      });
    });

    describe('changePage', function () {
      it('should change the value of activeUserCurrentPage', function () {
        controller.changePage(3);
        expect(controller.activeUserCurrentPage).toEqual(3);
      });
    });

    describe('isRefresh', function () {
      it('should return true when sent "refresh"', function () {
        expect(controller.isRefresh('refresh')).toBeTruthy();
      });

      it('should return false when sent "set" or "empty"', function () {
        expect(controller.isRefresh('set')).toBeFalsy();
        expect(controller.isRefresh('empty')).toBeFalsy();
      });
    });

    describe('isEmpty', function () {
      it('should return true when sent "empty"', function () {
        expect(controller.isEmpty('empty')).toBeTruthy();
      });

      it('should return false when sent "set" or "refresh"', function () {
        expect(controller.isEmpty('set')).toBeFalsy();
        expect(controller.isEmpty('refresh')).toBeFalsy();
      });
    });

    describe('mostActiveSort', function () {
      it('should sort by userName', function () {
        controller.mostActiveSort(0);
        expect(controller.activeUserPredicate).toBe(activeUsersSort[0]);
        expect(controller.activeUserReverse).toBeFalsy();
      });

      it('should sort by orgName', function () {
        controller.mostActiveSort(1);
        expect(controller.activeUserPredicate).toBe(activeUsersSort[1]);
        expect(controller.activeUserReverse).toBeFalsy();
      });

      it('should sort by calls', function () {
        controller.mostActiveSort(2);
        expect(controller.activeUserPredicate).toBe(activeUsersSort[2]);
        expect(controller.activeUserReverse).toBeTruthy();
      });

      it('should sort by messages', function () {
        controller.mostActiveSort(3);
        expect(controller.activeUserPredicate).toBe(activeUsersSort[3]);
        expect(controller.activeUserReverse).toBeTruthy();
      });
    });

    describe('Most Active Paging', function () {
      it('pageForward should change carousel button numbers', function () {
        controller.activeUsersTotalPages = 4;
        controller.activeUserCurrentPage = 1;

        controller.pageForward();
        expect(controller.activeButton[0]).toBe(1);
        expect(controller.activeButton[1]).toBe(2);
        expect(controller.activeButton[2]).toBe(3);
        expect(controller.activeUserCurrentPage).toBe(2);

        controller.pageForward();
        expect(controller.activeButton[0]).toBe(2);
        expect(controller.activeButton[1]).toBe(3);
        expect(controller.activeButton[2]).toBe(4);
        expect(controller.activeUserCurrentPage).toBe(3);
      });

      it('pageBackward should change carousel button numbers', function () {
        controller.activeUsersTotalPages = 4;
        controller.activeButton[0] = 2;
        controller.activeButton[1] = 3;
        controller.activeButton[2] = 4;
        controller.activeUserCurrentPage = 3;

        controller.pageBackward();
        expect(controller.activeButton[0]).toBe(1);
        expect(controller.activeButton[1]).toBe(2);
        expect(controller.activeButton[2]).toBe(3);
        expect(controller.activeUserCurrentPage).toBe(2);

        controller.pageBackward();
        expect(controller.activeButton[0]).toBe(1);
        expect(controller.activeButton[1]).toBe(2);
        expect(controller.activeButton[2]).toBe(3);
        expect(controller.activeUserCurrentPage).toBe(1);
      });
    });

    describe('updateReports', function () {
      it('should update all graphs when updateReports is called', function () {
        controller.updateReports();
        $scope.$apply();

        expect(GraphService.getActiveUsersGraph).toHaveBeenCalled();
        expect(GraphService.getMediaQualityGraph).toHaveBeenCalled();
        expect(GraphService.getActiveUserPopulationGraph).toHaveBeenCalled();
        expect(GraphService.getCallMetricsDonutChart).toHaveBeenCalled();
      });
    });
  });

  describe('PartnerReportCtrl - Expected Empty Responses', function () {
    beforeEach(inject(function ($rootScope, $controller, _$q_, _$translate_, _PartnerReportService_, _GraphService_, _DummyReportService_) {
      $scope = $rootScope.$new();
      $q = _$q_;
      $translate = _$translate_;
      PartnerReportService = _PartnerReportService_;
      GraphService = _GraphService_;
      DummyReportService = _DummyReportService_;

      spyOn(PartnerReportService, 'getOverallActiveUserData').and.returnValue($q.when({}));
      spyOn(PartnerReportService, 'getActiveUserData').and.returnValue($q.when({
        graphData: [],
        isActiveUsers: false,
        popData: [],
        overallPopulation: 0
      }));
      spyOn(PartnerReportService, 'getActiveTableData').and.returnValue($q.when([]));
      spyOn(PartnerReportService, 'getCustomerList').and.returnValue($q.when([]));
      spyOn(PartnerReportService, 'getMediaQualityMetrics').and.returnValue($q.when([]));
      spyOn(PartnerReportService, 'getCallMetricsData').and.returnValue($q.when({
        dataProvider: [],
        displayData: {}
      }));
      spyOn(PartnerReportService, 'getRegisteredEndpoints').and.returnValue($q.when([]));

      spyOn(GraphService, 'getActiveUsersGraph').and.returnValue({
        'dataProvider': dummyData.activeUser.one,
        invalidateSize: validateService.invalidate
      });

      spyOn(GraphService, 'getMediaQualityGraph').and.returnValue({
        'dataProvider': dummyData.mediaQuality.one,
        invalidateSize: validateService.invalidate
      });

      spyOn(GraphService, 'getActiveUserPopulationGraph').and.returnValue({
        'dataProvider': dummyData.activeUserPopulation,
        invalidateSize: validateService.invalidate
      });

      spyOn(GraphService, 'getCallMetricsDonutChart').and.returnValue({
        'dataProvider': dummyData.callMetrics,
        invalidateSize: validateService.invalidate
      });

      spyOn(DummyReportService, 'dummyActiveUserData').and.returnValue(dummyData.activeUser.one);
      spyOn(DummyReportService, 'dummyActivePopulationData').and.returnValue(dummyData.activeUserPopulation);
      spyOn(DummyReportService, 'dummyMediaQualityData').and.returnValue(dummyData.mediaQuality.one);
      spyOn(DummyReportService, 'dummyCallMetricsData').and.returnValue(dummyData.callMetrics);
      spyOn(DummyReportService, 'dummyEndpointData').and.returnValue(dummyData.endpoints);

      controller = $controller('PartnerReportCtrl', {
        $scope: $scope,
        $translate: $translate,
        $q: $q,
        PartnerReportService: PartnerReportService,
        GraphService: GraphService,
        DummyReportService: DummyReportService,
        Authinfo: Authinfo
      });
      $scope.$apply();
    }));

    describe('Initializing Controller', function () {
      it('should be created successfully and all expected calls completed', function () {
        expect(controller).toBeDefined();

        expect(DummyReportService.dummyActiveUserData).toHaveBeenCalled();
        expect(DummyReportService.dummyActivePopulationData).toHaveBeenCalled();
        expect(DummyReportService.dummyMediaQualityData).toHaveBeenCalled();
        expect(DummyReportService.dummyCallMetricsData).toHaveBeenCalled();
        expect(DummyReportService.dummyEndpointData).toHaveBeenCalled();

        expect(PartnerReportService.getOverallActiveUserData).toHaveBeenCalled();
        expect(PartnerReportService.getActiveUserData).toHaveBeenCalled();
        expect(PartnerReportService.getActiveTableData).toHaveBeenCalled();
        expect(PartnerReportService.getCustomerList).toHaveBeenCalled();
        expect(PartnerReportService.getMediaQualityMetrics).toHaveBeenCalled();
        expect(PartnerReportService.getRegisteredEndpoints).toHaveBeenCalled();

        expect(GraphService.getActiveUsersGraph).toHaveBeenCalled();
        expect(GraphService.getMediaQualityGraph).toHaveBeenCalled();
        expect(GraphService.getActiveUserPopulationGraph).toHaveBeenCalled();
        expect(GraphService.getCallMetricsDonutChart).toHaveBeenCalled();
      });

      it('should set all page variables', function () {
        expect(controller.customerOptions).toEqual([customerData.customerOptions[3]]);
        expect(controller.customerSelected).toEqual([customerData.customerOptions[3]]);

        expect(controller.activeUsersRefresh).toEqual('empty');
        expect(controller.mostActiveRefresh).toEqual('empty');
        expect(controller.activeUserPopulationRefresh).toEqual('empty');
        expect(controller.activeUserReverse).toBeTruthy();
        expect(controller.activeUsersTotalPages).toEqual(0);
        expect(controller.mostActiveUsers).toEqual([]);
        expect(controller.displayMostActive).toBeFalsy();

        expect(controller.mediaQualityRefresh).toEqual('empty');
        expect(controller.callMetricsRefresh).toEqual('empty');
        expect(controller.endpointRefresh).toEqual('empty');
        expect(controller.registeredEndpoints).toEqual(dummyData.endpoints);
        expect(controller.dummyTable).toBeTruthy();
      });
    });
  });
});
