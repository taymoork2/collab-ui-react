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

  var validateService = {
    invalidate: function () {}
  };

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue(customerData.customerOptions[3].value),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue(customerData.customerOptions[3].label)
  };

  beforeEach(module('Core'));
  beforeEach(module('Huron'));

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
        tableData: activeUserData.mostActiveResponse,
        populationGraph: activeUserData.activePopResponse,
        overallPopulation: 0
      }));
      spyOn(PartnerReportService, 'getCustomerList').and.returnValue($q.when(customerData.customerResponse));
      spyOn(PartnerReportService, 'getMediaQualityMetrics').and.returnValue($q.when(mediaQualityData.mediaQualityResponse));
      spyOn(PartnerReportService, 'getCallMetricsData').and.returnValue($q.when({
        data: callMetricsData.callMetricsResponse
      }));
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

        expect(PartnerReportService.getOverallActiveUserData).toHaveBeenCalled();
        expect(PartnerReportService.getActiveUserData).toHaveBeenCalled();
        expect(PartnerReportService.getCustomerList).toHaveBeenCalled();
        expect(PartnerReportService.getMediaQualityMetrics).toHaveBeenCalled();
        expect(PartnerReportService.getRegisteredEndpoints).toHaveBeenCalled();

        expect(GraphService.getActiveUsersGraph).toHaveBeenCalled();
        expect(GraphService.getMediaQualityGraph).toHaveBeenCalled();
        expect(GraphService.getActiveUserPopulationGraph).toHaveBeenCalled();
        expect(GraphService.getCallMetricsDonutChart).toHaveBeenCalled();
      });

      it('should set all page variables', function () {
        expect(controller.activeUsersRefresh).toEqual('set');
        expect(controller.showMostActiveUsers).toBeFalsy();
        expect(controller.activeUserReverse).toBeTruthy();
        expect(controller.activeUsersTotalPages).toEqual(2);
        expect(controller.activeUserCurrentPage).toEqual(1);
        expect(controller.activeUserPredicate).toEqual(activeUsersSort[4]);
        expect(controller.activeButton).toEqual([1, 2, 3]);
        expect(controller.mostActiveUsers).toEqual(activeUserData.mostActiveResponse);

        expect(controller.customerOptions).toEqual(customerData.customerOptions);
        expect(controller.customerSelected).toEqual(customerData.customerOptions);
        expect(controller.timeSelected).toEqual(controller.timeOptions[0]);

        expect(controller.registeredEndpoints).toEqual(registeredEndpointsData.registeredEndpointResponse);
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
});
