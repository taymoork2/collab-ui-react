import {
  IExportMenu,
  IFilterObject,
} from './partnerReportInterfaces';

describe('Controller: Partner Reports', () => {
  beforeEach(function () {
    this.initModules('Core', 'Huron');
    this.injectDependencies('$rootScope',
      '$scope',
      '$controller',
      '$q',
      '$timeout',
      'CardUtils',
      'ReportService',
      'GraphService',
      'DummyReportService',
      'FeatureToggleService');

    this.activeUserData = getJSONFixture('core/json/partnerReports/activeUserData.json');
    this.callMetricsData = getJSONFixture('core/json/partnerReports/callMetricsData.json');
    this.ctrlData = getJSONFixture('core/json/partnerReports/ctrl.json');
    this.customerData = getJSONFixture('core/json/partnerReports/customerResponse.json');
    this.defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
    this.dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
    this.endpointsData = getJSONFixture('core/json/partnerReports/registeredEndpointData.json');
    this.mediaQualityData = getJSONFixture('core/json/partnerReports/mediaQualityData.json');

    this.activeUserOptions = _.cloneDeep(this.ctrlData.activeUserOptions);
    this.activeUserSecondaryOptions = _.cloneDeep(this.ctrlData.activeUserSecondaryOptions);
    this.populationOptions = _.cloneDeep(this.ctrlData.populationOptions);
    this.mediaOptions = _.cloneDeep(this.ctrlData.mediaOptions);
    this.endpointOptions = _.cloneDeep(this.ctrlData.endpointOptions);
    this.callOptions = _.cloneDeep(this.ctrlData.callOptions);
    this.reportFilter = _.cloneDeep(this.ctrlData.reportFilter);

    let Authinfo = {
      getOrgId: jasmine.createSpy('getOrgId').and.returnValue(this.customerData.customerOptions[3].value),
      getOrgName: jasmine.createSpy('getOrgName').and.returnValue(this.customerData.customerOptions[3].label),
    };

    spyOn(this.CardUtils, 'resize');
    spyOn(this.FeatureToggleService, 'atlasReportsUpdateGetStatus').and.returnValue(this.$q.when(true));
    spyOn(this.$rootScope, '$broadcast').and.returnValue({});
    spyOn(this, '$timeout').and.callThrough();

    spyOn(this.ReportService, 'getOverallActiveUserData').and.returnValue(this.$q.when({}));

    spyOn(this.GraphService, 'getActiveUsersGraph').and.returnValue({
      dataProvider: _.cloneDeep(this.activeUserData.detailedResponse),
    });
    spyOn(this.GraphService, 'getMediaQualityGraph').and.returnValue({
      dataProvider: _.cloneDeep(this.mediaQualityData.mediaQualityResponse),
    });
    spyOn(this.GraphService, 'getActiveUserPopulationGraph').and.returnValue({
      dataProvider: _.cloneDeep(this.activeUserData.activePopResponse),
    });
    spyOn(this.GraphService, 'getCallMetricsDonutChart').and.returnValue({
      dataProvider: _.cloneDeep(this.callMetricsData.callMetricsResponse),
    });

    spyOn(this.DummyReportService, 'dummyActiveUserData').and.returnValue(_.cloneDeep(this.dummyData.activeUser.one));
    spyOn(this.DummyReportService, 'dummyActivePopulationData').and.returnValue(_.cloneDeep(this.dummyData.activeUserPopulation));
    spyOn(this.DummyReportService, 'dummyMediaQualityData').and.returnValue(_.cloneDeep(this.dummyData.mediaQuality.one));
    spyOn(this.DummyReportService, 'dummyCallMetricsData').and.returnValue(_.cloneDeep(this.dummyData.callMetrics));
    spyOn(this.DummyReportService, 'dummyEndpointData').and.returnValue(_.cloneDeep(this.dummyData.endpoints));

    this.initController = (): void => {
      this.controller = this.$controller('PartnerReportCtrl', {
        $scope: this.$scope,
        $timeout: this.$timeout,
        $q: this.$q,
        ReportService: this.ReportService,
        GraphService: this.GraphService,
        DummyReportService: this.DummyReportService,
        Authinfo: Authinfo,
      });
      this.$scope.$apply();
    };
  });

  describe('PartnerReportCtrl - Expected Responses', function () {

    beforeEach(function () {
      this.activeUserSecondaryOptions.table.data = _.cloneDeep(this.activeUserData.mostActiveResponse);
      this.endpointOptions.table.data = _.cloneDeep(this.endpointsData.registeredEndpointResponse);

      spyOn(this.ReportService, 'getActiveUserData').and.returnValue(this.$q.when({
        graphData: _.cloneDeep(this.activeUserData.detailedResponse),
        isActiveUsers: true,
        popData: _.cloneDeep(this.activeUserData.activePopResponse),
        overallPopulation: 33,
      }));
      spyOn(this.ReportService, 'getActiveTableData').and.returnValue(this.$q.when(_.cloneDeep(this.activeUserData.mostActiveResponse)));
      spyOn(this.ReportService, 'getCustomerList').and.returnValue(this.$q.when(_.cloneDeep(this.customerData.customerResponse)));
      spyOn(this.ReportService, 'getMediaQualityMetrics').and.returnValue(this.$q.when(_.cloneDeep(this.mediaQualityData.mediaQualityResponse)));
      spyOn(this.ReportService, 'getCallMetricsData').and.returnValue(this.$q.when(_.cloneDeep(this.callMetricsData.callMetricsResponse)));
      spyOn(this.ReportService, 'getRegisteredEndpoints').and.returnValue(this.$q.when(_.cloneDeep(this.endpointsData.registeredEndpointResponse)));

      this.initController();
    });

    it('should be created successfully and all expected calls completed', function () {
      expect(this.DummyReportService.dummyActiveUserData).toHaveBeenCalled();
      expect(this.DummyReportService.dummyActivePopulationData).toHaveBeenCalled();
      expect(this.DummyReportService.dummyMediaQualityData).toHaveBeenCalled();
      expect(this.DummyReportService.dummyCallMetricsData).toHaveBeenCalled();
      expect(this.DummyReportService.dummyEndpointData).toHaveBeenCalled();

      expect(this.ReportService.getOverallActiveUserData).toHaveBeenCalled();
      expect(this.ReportService.getActiveUserData).toHaveBeenCalled();
      expect(this.ReportService.getActiveTableData).toHaveBeenCalled();
      expect(this.ReportService.getCustomerList).toHaveBeenCalled();
      expect(this.ReportService.getMediaQualityMetrics).toHaveBeenCalled();
      expect(this.ReportService.getRegisteredEndpoints).toHaveBeenCalled();

      expect(this.GraphService.getActiveUsersGraph).toHaveBeenCalled();
      expect(this.GraphService.getMediaQualityGraph).toHaveBeenCalled();
      expect(this.GraphService.getActiveUserPopulationGraph).toHaveBeenCalled();
      expect(this.GraphService.getCallMetricsDonutChart).toHaveBeenCalled();

      expect(this.$rootScope.$broadcast).toHaveBeenCalledWith(this.ctrlData.activeUserSecondaryOptions.broadcast);
    });

    it('should set all page variables', function () {
      expect(this.controller.showEngagement).toEqual(true);
      expect(this.controller.showQuality).toEqual(true);
      expect(this.controller.ALL).toEqual(this.ctrlData.ALL);
      expect(this.controller.ENGAGEMENT).toEqual(this.ctrlData.ENGAGEMENT);
      expect(this.controller.QUALITY).toEqual(this.ctrlData.QUALITY);

      _.forEach(this.controller.exportArrays, (array: Array<IExportMenu>): void => {
        expect(array.length).toBe(4);
      });

      expect(this.controller.customerPlaceholder).toEqual('reportsPage.customerSelect');
      expect(this.controller.customerSingular).toEqual('reportsPage.customer');
      expect(this.controller.customerPlural).toEqual('reportsPage.customers');
      expect(this.controller.customerMax).toEqual(5);
      expect(this.controller.customerOptions).toEqual(this.customerData.customerOptions);
      expect(this.controller.customerSelected).toEqual(this.customerData.customerOptions);

      expect(this.controller.activeUserReportOptions).toEqual(this.activeUserOptions);
      expect(this.controller.activeUserSecondaryReportOptions).toEqual(this.activeUserSecondaryOptions);
      expect(this.controller.populationReportOptions).toEqual(this.populationOptions);
      expect(this.controller.mediaReportOptions).toEqual(this.mediaOptions);
      expect(this.controller.endpointReportOptions).toEqual(this.endpointOptions);
      expect(this.controller.callMetricsReportOptions).toEqual(this.callOptions);

      expect(this.controller.timeOptions).toEqual(this.defaults.timeFilter);
      expect(this.controller.timeSelected).toEqual(this.defaults.timeFilter[0]);

      _.forEach(this.controller.filterArray, (filter: IFilterObject, index: number): void => {
        expect(filter.label).toEqual(this.reportFilter[index].label);
        expect(filter.id).toEqual(this.reportFilter[index].id);
        expect(filter.selected).toEqual(this.reportFilter[index].selected);
      });
    });

    it('should resize page when resizeMostActive is called', function () {
      this.controller.resizeMostActive();
      expect(this.CardUtils.resize).toHaveBeenCalled();
    });

    it('should update all graphs when updateReports is called', function () {
      this.controller.updateReports();
      this.$scope.$apply();

      expect(this.GraphService.getActiveUsersGraph.calls.mostRecent().args[0]).toEqual(_.cloneDeep(this.activeUserData.detailedResponse));
      expect(this.GraphService.getMediaQualityGraph.calls.mostRecent().args[0]).toEqual(_.cloneDeep(this.mediaQualityData.mediaQualityResponse));
      expect(this.GraphService.getActiveUserPopulationGraph.calls.mostRecent().args[0]).toEqual(_.cloneDeep(this.activeUserData.activePopResponse));
      expect(this.GraphService.getCallMetricsDonutChart.calls.mostRecent().args[0]).toEqual(_.cloneDeep(this.callMetricsData.callMetricsResponse));
    });

    it('should change visible cards when filterArray[x].toggle is used', function () {
      this.controller.filterArray[1].toggle();
      expect(this.controller.showEngagement).toEqual(true);
      expect(this.controller.showQuality).toEqual(false);

      this.controller.filterArray[2].toggle();
      expect(this.controller.showEngagement).toEqual(false);
      expect(this.controller.showQuality).toEqual(true);

      this.controller.filterArray[0].toggle();
      expect(this.controller.showEngagement).toEqual(true);
      expect(this.controller.showQuality).toEqual(true);
    });
  });

  describe('PartnerReportCtrl - Expected Empty Responses', function () {
    beforeEach(function () {
      this.activeUserOptions.state = this.ctrlData.EMPTY;
      this.activeUserSecondaryOptions.display = false;
      this.activeUserSecondaryOptions.state = this.ctrlData.EMPTY;
      this.activeUserSecondaryOptions.table.data = [];
      this.populationOptions.state = this.ctrlData.EMPTY;
      this.mediaOptions.state = this.ctrlData.EMPTY;
      this.endpointOptions.state = this.ctrlData.EMPTY;
      this.endpointOptions.table.data = _.cloneDeep(this.dummyData.endpoints);
      this.endpointOptions.table.dummy = true;
      this.callOptions.state = this.ctrlData.EMPTY;

      spyOn(this.ReportService, 'getActiveUserData').and.returnValue(this.$q.when({
        graphData: [],
        isActiveUsers: false,
        popData: [],
        overallPopulation: 0,
      }));
      spyOn(this.ReportService, 'getActiveTableData').and.returnValue(this.$q.when([]));
      spyOn(this.ReportService, 'getCustomerList').and.returnValue(this.$q.when([]));
      spyOn(this.ReportService, 'getMediaQualityMetrics').and.returnValue(this.$q.when([]));
      spyOn(this.ReportService, 'getCallMetricsData').and.returnValue(this.$q.when({
        dataProvider: [],
        displayData: {},
      }));
      spyOn(this.ReportService, 'getRegisteredEndpoints').and.returnValue(this.$q.when([]));

      this.initController();
    });

    it('should be created successfully and all expected calls completed', function () {
      expect(this.controller).toBeDefined();

      expect(this.DummyReportService.dummyActiveUserData).toHaveBeenCalled();
      expect(this.DummyReportService.dummyActivePopulationData).toHaveBeenCalled();
      expect(this.DummyReportService.dummyMediaQualityData).toHaveBeenCalled();
      expect(this.DummyReportService.dummyCallMetricsData).toHaveBeenCalled();
      expect(this.DummyReportService.dummyEndpointData).toHaveBeenCalled();

      expect(this.ReportService.getOverallActiveUserData).toHaveBeenCalled();
      expect(this.ReportService.getActiveUserData).toHaveBeenCalled();
      expect(this.ReportService.getActiveTableData).toHaveBeenCalled();
      expect(this.ReportService.getCustomerList).toHaveBeenCalled();
      expect(this.ReportService.getMediaQualityMetrics).toHaveBeenCalled();
      expect(this.ReportService.getRegisteredEndpoints).toHaveBeenCalled();

      expect(this.GraphService.getActiveUsersGraph).toHaveBeenCalled();
      expect(this.GraphService.getMediaQualityGraph).toHaveBeenCalled();
      expect(this.GraphService.getActiveUserPopulationGraph).toHaveBeenCalled();
      expect(this.GraphService.getCallMetricsDonutChart).toHaveBeenCalled();
    });

    it('should set all page variables', function () {
      expect(this.controller.activeUserReportOptions).toEqual(this.activeUserOptions);
      expect(this.controller.activeUserSecondaryReportOptions).toEqual(this.activeUserSecondaryOptions);
      expect(this.controller.populationReportOptions).toEqual(this.populationOptions);
      expect(this.controller.mediaReportOptions).toEqual(this.mediaOptions);
      expect(this.controller.endpointReportOptions).toEqual(this.endpointOptions);
      expect(this.controller.callMetricsReportOptions).toEqual(this.callOptions);
    });
  });
});
