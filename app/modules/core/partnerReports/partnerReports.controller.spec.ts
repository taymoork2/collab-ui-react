import {
  IFilterObject,
  IReportCard,
  ITimespan,
  ISecondaryReport,
} from './partnerReportInterfaces';

describe('Controller: Partner Reports', () => {
  let controller, $scope;

  let activeUserData = getJSONFixture('core/json/partnerReports/activeUserData.json');
  let callMetricsData = getJSONFixture('core/json/partnerReports/callMetricsData.json');
  let ctrlData = getJSONFixture('core/json/partnerReports/ctrl.json');
  let customerData = getJSONFixture('core/json/partnerReports/customerResponse.json');
  let defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
  let dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
  let endpointsData = getJSONFixture('core/json/partnerReports/registeredEndpointData.json');
  let mediaQualityData = getJSONFixture('core/json/partnerReports/mediaQualityData.json');

  let timeOptions: Array<ITimespan> = _.cloneDeep(defaults.timeFilter);
  let Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue(customerData.customerOptions[3].value),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue(customerData.customerOptions[3].label),
  };

  describe('PartnerReportCtrl - Expected Responses', function () {
    let activeUserOptions: IReportCard = _.cloneDeep(ctrlData.activeUserOptions);
    let activeUserSecondaryOptions: ISecondaryReport = _.cloneDeep(ctrlData.activeUserSecondaryOptions);
    let populationOptions: IReportCard = _.cloneDeep(ctrlData.populationOptions);
    let mediaOptions: IReportCard = _.cloneDeep(ctrlData.mediaOptions);
    let endpointOptions: IReportCard = _.cloneDeep(ctrlData.endpointOptions);
    let callOptions: IReportCard = _.cloneDeep(ctrlData.callOptions);
    let reportFilter: Array<IFilterObject> = _.cloneDeep(ctrlData.reportFilter);
    activeUserOptions.table = undefined;
    activeUserSecondaryOptions.table.data = _.cloneDeep(activeUserData.mostActiveResponse);
    populationOptions.table = undefined;
    mediaOptions.table = undefined;
    endpointOptions.table.data = _.cloneDeep(endpointsData.registeredEndpointResponse);
    callOptions.table = undefined;

    beforeEach(function () {
      this.initModules('Core', 'Huron');
      this.injectDependencies('$rootScope', '$controller', '$q', '$timeout', 'ReportService', 'GraphService', 'DummyReportService');
      $scope = this.$rootScope.$new();

      spyOn(this.$rootScope, '$broadcast').and.returnValue({});
      spyOn(this, '$timeout').and.callThrough();
      spyOn(this.ReportService, 'getOverallActiveUserData').and.returnValue(this.$q.when({}));
      spyOn(this.ReportService, 'getActiveUserData').and.returnValue(this.$q.when({
        graphData: _.cloneDeep(activeUserData.detailedResponse),
        isActiveUsers: true,
        popData: _.cloneDeep(activeUserData.activePopResponse),
        overallPopulation: 33,
      }));
      spyOn(this.ReportService, 'getActiveTableData').and.returnValue(this.$q.when(_.cloneDeep(activeUserData.mostActiveResponse)));
      spyOn(this.ReportService, 'getCustomerList').and.returnValue(this.$q.when(_.cloneDeep(customerData.customerResponse)));
      spyOn(this.ReportService, 'getMediaQualityMetrics').and.returnValue(this.$q.when(_.cloneDeep(mediaQualityData.mediaQualityResponse)));
      spyOn(this.ReportService, 'getCallMetricsData').and.returnValue(this.$q.when(_.cloneDeep(callMetricsData.callMetricsResponse)));
      spyOn(this.ReportService, 'getRegisteredEndpoints').and.returnValue(this.$q.when(_.cloneDeep(endpointsData.registeredEndpointResponse)));

      spyOn(this.GraphService, 'getActiveUsersGraph').and.returnValue({
        dataProvider: _.cloneDeep(activeUserData.detailedResponse),
      });
      spyOn(this.GraphService, 'getMediaQualityGraph').and.returnValue({
        dataProvider: _.cloneDeep(mediaQualityData.mediaQualityResponse),
      });
      spyOn(this.GraphService, 'getActiveUserPopulationGraph').and.returnValue({
        dataProvider: _.cloneDeep(activeUserData.activePopResponse),
      });
      spyOn(this.GraphService, 'getCallMetricsDonutChart').and.returnValue({
        dataProvider: _.cloneDeep(callMetricsData.callMetricsResponse),
      });

      spyOn(this.DummyReportService, 'dummyActiveUserData').and.returnValue(_.cloneDeep(dummyData.activeUser.one));
      spyOn(this.DummyReportService, 'dummyActivePopulationData').and.returnValue(_.cloneDeep(dummyData.activeUserPopulation));
      spyOn(this.DummyReportService, 'dummyMediaQualityData').and.returnValue(_.cloneDeep(dummyData.mediaQuality.one));
      spyOn(this.DummyReportService, 'dummyCallMetricsData').and.returnValue(_.cloneDeep(dummyData.callMetrics));
      spyOn(this.DummyReportService, 'dummyEndpointData').and.returnValue(_.cloneDeep(dummyData.endpoints));

      controller = this.$controller('PartnerReportCtrl', {
        $scope: $scope,
        $timeout: this.$timeout,
        $q: this.$q,
        ReportService: this.ReportService,
        GraphService: this.GraphService,
        DummyReportService: this.DummyReportService,
        Authinfo: Authinfo,
      });
      $scope.$apply();
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

      expect(this.$rootScope.$broadcast).toHaveBeenCalledWith(ctrlData.activeUserSecondaryOptions.broadcast);
    });

    it('should set all page variables', function () {
      expect(controller.showEngagement).toEqual(true);
      expect(controller.showQuality).toEqual(true);
      expect(controller.ALL).toEqual(ctrlData.ALL);
      expect(controller.ENGAGEMENT).toEqual(ctrlData.ENGAGEMENT);
      expect(controller.QUALITY).toEqual(ctrlData.QUALITY);

      expect(controller.customerPlaceholder).toEqual('reportsPage.customerSelect');
      expect(controller.customerSingular).toEqual('reportsPage.customer');
      expect(controller.customerPlural).toEqual('reportsPage.customers');
      expect(controller.customerMax).toEqual(5);
      expect(controller.customerOptions).toEqual(customerData.customerOptions);
      expect(controller.customerSelected).toEqual(customerData.customerOptions);

      expect(controller.activeUserReportOptions).toEqual(activeUserOptions);
      expect(controller.activeUserSecondaryReportOptions).toEqual(activeUserSecondaryOptions);
      expect(controller.populationReportOptions).toEqual(populationOptions);
      expect(controller.mediaReportOptions).toEqual(mediaOptions);
      expect(controller.endpointReportOptions).toEqual(endpointOptions);
      expect(controller.callMetricsReportOptions).toEqual(callOptions);

      expect(controller.timeOptions).toEqual(timeOptions);
      expect(controller.timeSelected).toEqual(timeOptions[0]);

      _.forEach(controller.filterArray, function (filter: IFilterObject, index: number): void {
        expect(filter.label).toEqual(reportFilter[index].label);
        expect(filter.id).toEqual(reportFilter[index].id);
        expect(filter.selected).toEqual(reportFilter[index].selected);
      });
    });

    it('should resize page when resizeMostActive is called', function () {
      expect(this.$timeout.calls.count()).toBe(14);
      controller.resizeMostActive();
      expect(this.$timeout.calls.count()).toBe(15);
    });

    it('should update all graphs when updateReports is called', function () {
      controller.updateReports();
      $scope.$apply();

      expect(this.GraphService.getActiveUsersGraph.calls.mostRecent().args[0]).toEqual(_.cloneDeep(activeUserData.detailedResponse));
      expect(this.GraphService.getMediaQualityGraph.calls.mostRecent().args[0]).toEqual(_.cloneDeep(mediaQualityData.mediaQualityResponse));
      expect(this.GraphService.getActiveUserPopulationGraph.calls.mostRecent().args[0]).toEqual(_.cloneDeep(activeUserData.activePopResponse));
      expect(this.GraphService.getCallMetricsDonutChart.calls.mostRecent().args[0]).toEqual(_.cloneDeep(callMetricsData.callMetricsResponse));
    });

    it('should change visible cards when filterArray[x].toggle is used', function () {
      controller.filterArray[1].toggle();
      expect(controller.showEngagement).toEqual(true);
      expect(controller.showQuality).toEqual(false);

      controller.filterArray[2].toggle();
      expect(controller.showEngagement).toEqual(false);
      expect(controller.showQuality).toEqual(true);

      controller.filterArray[0].toggle();
      expect(controller.showEngagement).toEqual(true);
      expect(controller.showQuality).toEqual(true);
    });
  });

  describe('PartnerReportCtrl - Expected Empty Responses', function () {
    let activeUserOptions: IReportCard = _.cloneDeep(ctrlData.activeUserOptions);
    let activeUserSecondaryOptions: ISecondaryReport = _.cloneDeep(ctrlData.activeUserSecondaryOptions);
    let populationOptions: IReportCard = _.cloneDeep(ctrlData.populationOptions);
    let mediaOptions: IReportCard = _.cloneDeep(ctrlData.mediaOptions);
    let endpointOptions: IReportCard = _.cloneDeep(ctrlData.endpointOptions);
    let callOptions: IReportCard = _.cloneDeep(ctrlData.callOptions);
    activeUserOptions.state = ctrlData.EMPTY;
    activeUserOptions.table = undefined;
    activeUserSecondaryOptions.display = false;
    activeUserSecondaryOptions.state = ctrlData.EMPTY;
    activeUserSecondaryOptions.table.data = [];
    populationOptions.state = ctrlData.EMPTY;
    populationOptions.table = undefined;
    mediaOptions.state = ctrlData.EMPTY;
    mediaOptions.table = undefined;
    endpointOptions.state = ctrlData.EMPTY;
    endpointOptions.table.data = _.cloneDeep(dummyData.endpoints);
    endpointOptions.table.dummy = true;
    callOptions.state = ctrlData.EMPTY;
    callOptions.table = undefined;

    beforeEach(function () {
      this.initModules('Core', 'Huron');
      this.injectDependencies('$rootScope', '$controller', '$q', '$timeout', 'ReportService', 'GraphService', 'DummyReportService');
      $scope = this.$rootScope.$new();

      spyOn(this.ReportService, 'getOverallActiveUserData').and.returnValue(this.$q.when({}));
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

      spyOn(this.GraphService, 'getActiveUsersGraph').and.returnValue({
        dataProvider: _.cloneDeep(dummyData.activeUser.one),
      });
      spyOn(this.GraphService, 'getMediaQualityGraph').and.returnValue({
        dataProvider: _.cloneDeep(dummyData.mediaQuality.one),
      });
      spyOn(this.GraphService, 'getActiveUserPopulationGraph').and.returnValue({
        dataProvider: _.cloneDeep(dummyData.activeUserPopulation),
      });
      spyOn(this.GraphService, 'getCallMetricsDonutChart').and.returnValue({
        dataProvider: _.cloneDeep(dummyData.callMetrics),
      });

      spyOn(this.DummyReportService, 'dummyActiveUserData').and.returnValue(_.cloneDeep(dummyData.activeUser.one));
      spyOn(this.DummyReportService, 'dummyActivePopulationData').and.returnValue(_.cloneDeep(dummyData.activeUserPopulation));
      spyOn(this.DummyReportService, 'dummyMediaQualityData').and.returnValue(_.cloneDeep(dummyData.mediaQuality.one));
      spyOn(this.DummyReportService, 'dummyCallMetricsData').and.returnValue(_.cloneDeep(dummyData.callMetrics));
      spyOn(this.DummyReportService, 'dummyEndpointData').and.returnValue(_.cloneDeep(dummyData.endpoints));

      controller = this.$controller('PartnerReportCtrl', {
        $scope: $scope,
        $timeout: this.$timeout,
        $q: this.$q,
        ReportService: this.ReportService,
        GraphService: this.GraphService,
        DummyReportService: this.DummyReportService,
        Authinfo: Authinfo,
      });
      $scope.$apply();
    });

    it('should be created successfully and all expected calls completed', function () {
      expect(controller).toBeDefined();

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
      expect(controller.activeUserReportOptions).toEqual(activeUserOptions);
      expect(controller.activeUserSecondaryReportOptions).toEqual(activeUserSecondaryOptions);
      expect(controller.populationReportOptions).toEqual(populationOptions);
      expect(controller.mediaReportOptions).toEqual(mediaOptions);
      expect(controller.endpointReportOptions).toEqual(endpointOptions);
      expect(controller.callMetricsReportOptions).toEqual(callOptions);
    });
  });
});
