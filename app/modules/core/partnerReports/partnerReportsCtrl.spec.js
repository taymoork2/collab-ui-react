'use strict';

describe('Controller: Partner Reports', function () {
  var controller, $scope;

  var activeUserData = getJSONFixture('core/json/partnerReports/activeUserData.json');
  var callMetricsData = getJSONFixture('core/json/partnerReports/callMetricsData.json');
  var ctrlData = getJSONFixture('core/json/partnerReports/ctrl.json');
  var customerData = getJSONFixture('core/json/partnerReports/customerResponse.json');
  var defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
  var dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
  var endpointsData = getJSONFixture('core/json/partnerReports/registeredEndpointData.json');
  var mediaQualityData = getJSONFixture('core/json/partnerReports/mediaQualityData.json');

  var timeOptions = _.clone(defaults.timeFilter);
  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue(customerData.customerOptions[3].value),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue(customerData.customerOptions[3].label)
  };

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));

  describe('PartnerReportCtrl - Expected Responses', function () {
    beforeEach(function () {
      this.initModules('Core', 'Huron');
      this.injectDependencies('$rootScope', '$controller', '$q', '$timeout', 'ReportService', 'GraphService', 'DummyReportService');
      $scope = this.$rootScope.$new();

      spyOn(this.$rootScope, '$broadcast').and.returnValue({});
      spyOn(this, '$timeout').and.callThrough();
      spyOn(this.ReportService, 'getOverallActiveUserData').and.returnValue(this.$q.when({}));
      spyOn(this.ReportService, 'getActiveUserData').and.returnValue(this.$q.when({
        graphData: _.clone(activeUserData.detailedResponse),
        isActiveUsers: true,
        popData: _.clone(activeUserData.activePopResponse),
        overallPopulation: 33
      }));
      spyOn(this.ReportService, 'getActiveTableData').and.returnValue(this.$q.when(_.clone(activeUserData.mostActiveResponse)));
      spyOn(this.ReportService, 'getCustomerList').and.returnValue(this.$q.when(_.clone(customerData.customerResponse)));
      spyOn(this.ReportService, 'getMediaQualityMetrics').and.returnValue(this.$q.when(_.clone(mediaQualityData.mediaQualityResponse)));
      spyOn(this.ReportService, 'getCallMetricsData').and.returnValue(this.$q.when(_.clone(callMetricsData.callMetricsResponse)));
      spyOn(this.ReportService, 'getRegisteredEndpoints').and.returnValue(this.$q.when(_.clone(endpointsData.registeredEndpointResponse)));

      spyOn(this.GraphService, 'getActiveUsersGraph').and.returnValue({
        dataProvider: _.clone(activeUserData.detailedResponse)
      });
      spyOn(this.GraphService, 'getMediaQualityGraph').and.returnValue({
        dataProvider: _.clone(mediaQualityData.mediaQualityResponse)
      });
      spyOn(this.GraphService, 'getActiveUserPopulationGraph').and.returnValue({
        dataProvider: _.clone(activeUserData.activePopResponse)
      });
      spyOn(this.GraphService, 'getCallMetricsDonutChart').and.returnValue({
        dataProvider: _.clone(callMetricsData.callMetricsResponse)
      });

      spyOn(this.DummyReportService, 'dummyActiveUserData').and.returnValue(_.clone(dummyData.activeUser.one));
      spyOn(this.DummyReportService, 'dummyActivePopulationData').and.returnValue(_.clone(dummyData.activeUserPopulation));
      spyOn(this.DummyReportService, 'dummyMediaQualityData').and.returnValue(_.clone(dummyData.mediaQuality.one));
      spyOn(this.DummyReportService, 'dummyCallMetricsData').and.returnValue(_.clone(dummyData.callMetrics));
      spyOn(this.DummyReportService, 'dummyEndpointData').and.returnValue(_.clone(dummyData.endpoints));

      controller = this.$controller('PartnerReportCtrl', {
        $scope: $scope,
        $timeout: this.$timeout,
        $q: this.$q,
        ReportService: this.ReportService,
        GraphService: this.GraphService,
        DummyReportService: this.DummyReportService,
        Authinfo: Authinfo
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

      expect(this.$rootScope.$broadcast).toHaveBeenCalledWith(ctrlData.activeUserSecondaryOptions.broadcast);
    });

    it('should set all page variables', function () {
      var activeUserOptions = _.clone(ctrlData.activeUserOptions);
      var activeUserSecondaryOptions = _.clone(ctrlData.activeUserSecondaryOptions);
      var populationOptions = _.clone(ctrlData.populationOptions);
      var mediaOptions = _.clone(ctrlData.mediaOptions);
      var endpointOptions = _.clone(ctrlData.endpointOptions);
      var callOptions = _.clone(ctrlData.callOptions);
      activeUserOptions.table = undefined;
      activeUserSecondaryOptions.table.data = _.clone(activeUserData.mostActiveResponse);
      populationOptions.table = undefined;
      mediaOptions.table = undefined;
      endpointOptions.table.data = _.clone(endpointsData.registeredEndpointResponse);
      callOptions.table = undefined;

      expect(controller.showEngagement).toEqual(true);
      expect(controller.showQuality).toEqual(true);
      expect(controller.allReports).toEqual(ctrlData.ALL);
      expect(controller.engagement).toEqual(ctrlData.ENGAGEMENT);
      expect(controller.quality).toEqual(ctrlData.QUALITY);

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
    });

    it('should resize page when resizeMostActive is called', function () {
      expect(this.$timeout.calls.count()).toBe(15);
      controller.resizeMostActive();
      expect(this.$timeout.calls.count()).toBe(17);
    });

    it('should update all graphs when updateReports is called', function () {
      controller.updateReports();
      $scope.$apply();

      expect(this.GraphService.getActiveUsersGraph.calls.mostRecent().args[0]).toEqual(_.clone(activeUserData.detailedResponse));
      expect(this.GraphService.getMediaQualityGraph.calls.mostRecent().args[0]).toEqual(_.clone(mediaQualityData.mediaQualityResponse));
      expect(this.GraphService.getActiveUserPopulationGraph.calls.mostRecent().args[0]).toEqual(_.clone(activeUserData.activePopResponse));
      expect(this.GraphService.getCallMetricsDonutChart.calls.mostRecent().args[0]).toEqual(_.clone(callMetricsData.callMetricsResponse));
    });

    it('should change visible cards when showHideCards is used', function () {
      controller.showHideCards(ctrlData.ENGAGEMENT);
      expect(controller.showEngagement).toEqual(true);
      expect(controller.showQuality).toEqual(false);

      controller.showHideCards(ctrlData.QUALITY);
      expect(controller.showEngagement).toEqual(false);
      expect(controller.showQuality).toEqual(true);

      controller.showHideCards(ctrlData.ALL);
      expect(controller.showEngagement).toEqual(true);
      expect(controller.showQuality).toEqual(true);
    });
  });

  describe('PartnerReportCtrl - Expected Empty Responses', function () {
    beforeEach(function () {
      this.initModules('Core', 'Huron');
      this.injectDependencies('$rootScope', '$controller', '$q', '$timeout', 'ReportService', 'GraphService', 'DummyReportService');
      $scope = this.$rootScope.$new();

      spyOn(this.ReportService, 'getOverallActiveUserData').and.returnValue(this.$q.when({}));
      spyOn(this.ReportService, 'getActiveUserData').and.returnValue(this.$q.when({
        graphData: [],
        isActiveUsers: false,
        popData: [],
        overallPopulation: 0
      }));
      spyOn(this.ReportService, 'getActiveTableData').and.returnValue(this.$q.when([]));
      spyOn(this.ReportService, 'getCustomerList').and.returnValue(this.$q.when([]));
      spyOn(this.ReportService, 'getMediaQualityMetrics').and.returnValue(this.$q.when([]));
      spyOn(this.ReportService, 'getCallMetricsData').and.returnValue(this.$q.when({
        dataProvider: [],
        displayData: {}
      }));
      spyOn(this.ReportService, 'getRegisteredEndpoints').and.returnValue(this.$q.when([]));

      spyOn(this.GraphService, 'getActiveUsersGraph').and.returnValue({
        dataProvider: _.clone(dummyData.activeUser.one)
      });
      spyOn(this.GraphService, 'getMediaQualityGraph').and.returnValue({
        dataProvider: _.clone(dummyData.mediaQuality.one)
      });
      spyOn(this.GraphService, 'getActiveUserPopulationGraph').and.returnValue({
        dataProvider: _.clone(dummyData.activeUserPopulation)
      });
      spyOn(this.GraphService, 'getCallMetricsDonutChart').and.returnValue({
        dataProvider: _.clone(dummyData.callMetrics)
      });

      spyOn(this.DummyReportService, 'dummyActiveUserData').and.returnValue(_.clone(dummyData.activeUser.one));
      spyOn(this.DummyReportService, 'dummyActivePopulationData').and.returnValue(_.clone(dummyData.activeUserPopulation));
      spyOn(this.DummyReportService, 'dummyMediaQualityData').and.returnValue(_.clone(dummyData.mediaQuality.one));
      spyOn(this.DummyReportService, 'dummyCallMetricsData').and.returnValue(_.clone(dummyData.callMetrics));
      spyOn(this.DummyReportService, 'dummyEndpointData').and.returnValue(_.clone(dummyData.endpoints));

      controller = this.$controller('PartnerReportCtrl', {
        $scope: $scope,
        $timeout: this.$timeout,
        $q: this.$q,
        ReportService: this.ReportService,
        GraphService: this.GraphService,
        DummyReportService: this.DummyReportService,
        Authinfo: Authinfo
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
      var activeUserOptions = _.clone(ctrlData.activeUserOptions);
      var activeUserSecondaryOptions = _.clone(ctrlData.activeUserSecondaryOptions);
      var populationOptions = _.clone(ctrlData.populationOptions);
      var mediaOptions = _.clone(ctrlData.mediaOptions);
      var endpointOptions = _.clone(ctrlData.endpointOptions);
      var callOptions = _.clone(ctrlData.callOptions);
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
      endpointOptions.table.data = _.clone(dummyData.endpoints);
      endpointOptions.table.dummy = true;
      callOptions.state = ctrlData.EMPTY;
      callOptions.table = undefined;
      $scope.$apply();

      expect(controller.activeUserReportOptions).toEqual(activeUserOptions);
      expect(controller.activeUserSecondaryReportOptions).toEqual(activeUserSecondaryOptions);
      expect(controller.populationReportOptions).toEqual(populationOptions);
      expect(controller.mediaReportOptions).toEqual(mediaOptions);
      expect(controller.endpointReportOptions).toEqual(endpointOptions);
      expect(controller.callMetricsReportOptions).toEqual(callOptions);
    });
  });
});
