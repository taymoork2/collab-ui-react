'use strict';

describe('Controller: Customer Reports Ctrl', function () {
  var controller, $scope, WebexReportService, WebExApiGatewayService, Userservice, $document;

  var dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
  var activeData = getJSONFixture('core/json/customerReports/activeUser.json');
  var ctrlData = getJSONFixture('core/json/partnerReports/ctrl.json');
  var roomData = getJSONFixture('core/json/customerReports/roomData.json');
  var fileData = getJSONFixture('core/json/customerReports/fileData.json');
  var mediaData = getJSONFixture('core/json/customerReports/mediaQuality.json');
  var metricsData = getJSONFixture('core/json/customerReports/callMetrics.json');
  var devicesJson = getJSONFixture('core/json/customerReports/devices.json');
  var defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');

  var activeOptions = _.cloneDeep(ctrlData.activeUserOptions);
  var secondaryActiveOptions = _.cloneDeep(ctrlData.activeUserSecondaryOptions);
  var avgRoomsCard = _.cloneDeep(ctrlData.avgRoomsOptions);
  var deviceCard = _.cloneDeep(ctrlData.deviceOptions);
  var filesSharedCard = _.cloneDeep(ctrlData.filesSharedOptions);
  var mediaOptions = _.cloneDeep(ctrlData.mediaOptions);
  var metricsOptions = _.cloneDeep(ctrlData.callOptions);
  var metricsLabels = _.cloneDeep(ctrlData.metricsLabels);
  activeOptions.description = 'activeUsers.customerPortalDescription';
  activeOptions.table = undefined;
  secondaryActiveOptions.description = 'activeUsers.customerMostActiveDescription';
  secondaryActiveOptions.search = true;
  secondaryActiveOptions.sortOptions = _.cloneDeep(activeData.sortOptions);
  secondaryActiveOptions.table.headers = _.cloneDeep(activeData.headers);
  secondaryActiveOptions.table.data = _.cloneDeep(activeData.mostActiveResponse);
  avgRoomsCard.table = undefined;
  deviceCard.table = undefined;
  filesSharedCard.table = undefined;
  mediaOptions.description = 'mediaQuality.descriptionCustomer';
  mediaOptions.table = undefined;
  metricsOptions.description = 'callMetrics.customerDescription';
  metricsOptions.table = undefined;

  var timeOptions = _.cloneDeep(defaults.timeFilter);
  var mediaArray = _.cloneDeep(mediaData.dropdownFilter);
  var mediaDropdown = {
    array: mediaArray,
    disabled: false,
    selected: mediaArray[0]
  };

  var headerTabs = [{
    title: 'mediaFusion.page_title',
    state: 'reports-metrics'
  }, {
    title: 'reportsPage.sparkReports',
    state: 'reports'
  }, {
    title: 'reportsPage.careTab',
    state: 'reports.care'
  }];

  beforeEach(function () {
    this.initModules('Core', 'Huron', 'Sunlight', 'Mediafusion');
    this.injectDependencies('$rootScope',
                            '$timeout',
                            '$q',
                            '$httpBackend',
                            '$controller',
                            'Authinfo',
                            'CustomerGraphService',
                            'CustomerReportService',
                            'DummyCustomerReportService',
                            'FeatureToggleService',
                            'MediaServiceActivationV2');
    $scope = this.$rootScope.$new();
    /* global document */
    $document = angular.element(document);
    $document.find('body').append('<div class="cs-card-layout"></div>');

    this.$httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200, {});
    spyOn(this.$rootScope, '$broadcast').and.callThrough();
    spyOn(this.Authinfo, 'isCare').and.returnValue(true);

    spyOn(this.CustomerGraphService, 'setActiveUsersGraph').and.returnValue({
      'dataProvider': _.cloneDeep(dummyData.activeUser.one)
    });
    spyOn(this.CustomerGraphService, 'setAvgRoomsGraph').and.returnValue({
      'dataProvider': _.cloneDeep(roomData.response)
    });
    spyOn(this.CustomerGraphService, 'setFilesSharedGraph').and.returnValue({
      'dataProvider': _.cloneDeep(fileData.response)
    });
    spyOn(this.CustomerGraphService, 'setMediaQualityGraph').and.returnValue({
      'dataProvider': _.cloneDeep(mediaData.response)
    });
    spyOn(this.CustomerGraphService, 'setMetricsGraph').and.returnValue({
      'dataProvider': _.cloneDeep(metricsData.response.dataProvider)
    });
    spyOn(this.CustomerGraphService, 'setDeviceGraph').and.returnValue({
      'dataProvider': _.cloneDeep(devicesJson.response.graphData)
    });

    spyOn(this.CustomerReportService, 'getActiveUserData').and.returnValue(this.$q.when(_.cloneDeep(activeData.activeResponse)));
    spyOn(this.CustomerReportService, 'getMostActiveUserData').and.returnValue(this.$q.when({
      tableData: _.cloneDeep(activeData.mostActiveResponse),
      error: false
    }));
    spyOn(this.CustomerReportService, 'getAvgRoomData').and.returnValue(this.$q.when(_.cloneDeep(roomData.response)));
    spyOn(this.CustomerReportService, 'getFilesSharedData').and.returnValue(this.$q.when(_.cloneDeep(fileData.response)));
    spyOn(this.CustomerReportService, 'getMediaQualityData').and.returnValue(this.$q.when(_.cloneDeep(mediaData.response)));
    spyOn(this.CustomerReportService, 'getCallMetricsData').and.returnValue(this.$q.when(_.cloneDeep(metricsData.response)));
    spyOn(this.CustomerReportService, 'getDeviceData').and.returnValue(this.$q.when(_.cloneDeep(devicesJson.response)));

    var dummyMetrics = _.cloneDeep(metricsData.response);
    dummyMetrics.dummy = true;

    spyOn(this.DummyCustomerReportService, 'dummyActiveUserData').and.returnValue(dummyData.activeUser.one);
    spyOn(this.DummyCustomerReportService, 'dummyAvgRoomData').and.returnValue(dummyData.avgRooms.one);
    spyOn(this.DummyCustomerReportService, 'dummyFilesSharedData').and.returnValue(dummyData.filesShared.one);
    spyOn(this.DummyCustomerReportService, 'dummyMediaData').and.returnValue(dummyData.mediaQuality.one);
    spyOn(this.DummyCustomerReportService, 'dummyMetricsData').and.returnValue(dummyMetrics);
    spyOn(this.DummyCustomerReportService, 'dummyDeviceData').and.returnValue(_.cloneDeep(devicesJson.dummyData));

    spyOn(this.FeatureToggleService, 'atlasMediaServiceMetricsGetStatus').and.returnValue(this.$q.when(true));
    spyOn(this.FeatureToggleService, 'atlasCareTrialsGetStatus').and.returnValue(this.$q.when(true));
    spyOn(this.MediaServiceActivationV2, 'getMediaServiceState').and.returnValue(this.$q.resolve(true));

    // Webex Requirements
    WebexReportService = {
      initReportsObject: function () {}
    };

    WebExApiGatewayService = {
      siteFunctions: function (url) {
        var defer = this.$q.defer();
        defer.resolve({
          siteUrl: url
        });
        return defer.promise;
      }
    };

    Userservice = {
      getUser: function (user) {
        expect(user).toBe('me');
      }
    };

    controller = this.$controller('CustomerReportsCtrl', {
      $state: this.$state,
      $q: this.$q,
      CustomerReportService: this.CustomerReportService,
      DummyCustomerReportService: this.DummyCustomerReportService,
      CustomerGraphService: this.CustomerGraphService,
      WebexReportService: WebexReportService,
      WebExApiGatewayService: WebExApiGatewayService,
      Userservice: Userservice,
      FeatureToggleService: this.FeatureToggleService,
      MediaServiceActivationV2: this.MediaServiceActivationV2
    });

    $scope.$apply();
    this.$httpBackend.flush();
    this.$timeout.flush();
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('Initializing Controller', function () {
    it('should be created successfully and all expected calls completed', function () {
      expect(this.DummyCustomerReportService.dummyActiveUserData).toHaveBeenCalledWith(timeOptions[0], false);
      expect(this.DummyCustomerReportService.dummyAvgRoomData).toHaveBeenCalledWith(timeOptions[0]);
      expect(this.DummyCustomerReportService.dummyFilesSharedData).toHaveBeenCalledWith(timeOptions[0]);
      expect(this.DummyCustomerReportService.dummyMediaData).toHaveBeenCalledWith(timeOptions[0]);
      expect(this.DummyCustomerReportService.dummyMetricsData).toHaveBeenCalled();
      expect(this.DummyCustomerReportService.dummyDeviceData).toHaveBeenCalledWith(timeOptions[0]);

      expect(this.CustomerReportService.getActiveUserData).toHaveBeenCalledWith(timeOptions[0], false);
      expect(this.CustomerReportService.getMostActiveUserData).toHaveBeenCalledWith(timeOptions[0]);
      expect(this.CustomerReportService.getAvgRoomData).toHaveBeenCalledWith(timeOptions[0]);
      expect(this.CustomerReportService.getFilesSharedData).toHaveBeenCalledWith(timeOptions[0]);
      expect(this.CustomerReportService.getMediaQualityData).toHaveBeenCalledWith(timeOptions[0]);
      expect(this.CustomerReportService.getCallMetricsData).toHaveBeenCalledWith(timeOptions[0]);
      expect(this.CustomerReportService.getDeviceData).toHaveBeenCalledWith(timeOptions[0]);

      expect(this.CustomerGraphService.setActiveUsersGraph).toHaveBeenCalled();
      expect(this.CustomerGraphService.setAvgRoomsGraph).toHaveBeenCalled();
      expect(this.CustomerGraphService.setFilesSharedGraph).toHaveBeenCalled();
      expect(this.CustomerGraphService.setMediaQualityGraph).toHaveBeenCalled();
      expect(this.CustomerGraphService.setMetricsGraph).toHaveBeenCalled();
      expect(this.CustomerGraphService.setDeviceGraph).toHaveBeenCalled();
    });

    it('should set all page variables', function () {
      expect(controller.showWebexTab).toBeFalsy();

      expect(controller.pageTitle).toEqual('reportsPage.pageTitle');
      expect(controller.ALL).toEqual(ctrlData.ALL);
      expect(controller.ENGAGEMENT).toEqual(ctrlData.ENGAGEMENT);
      expect(controller.QUALITY).toEqual(ctrlData.QUALITY);
      expect(controller.displayEngagement).toBeTruthy();
      expect(controller.displayQuality).toBeTruthy();

      expect(controller.activeOptions).toEqual(activeOptions);
      expect(controller.secondaryActiveOptions).toEqual(secondaryActiveOptions);

      expect(controller.avgRoomOptions).toEqual(avgRoomsCard);
      expect(controller.filesSharedOptions).toEqual(filesSharedCard);

      expect(controller.deviceOptions).toEqual(deviceCard);
      _.forEach(_.cloneDeep(devicesJson.response.filterArray), function (filter) {
        expect(controller.deviceDropdown.array).toContain(filter);
      });
      expect(controller.deviceDropdown.disabled).toEqual(false);
      expect(controller.deviceDropdown.selected).toEqual(controller.deviceDropdown.array[0]);

      expect(controller.mediaOptions).toEqual(mediaOptions);
      expect(controller.mediaDropdown.array).toEqual(mediaDropdown.array);
      expect(controller.mediaDropdown.disabled).toEqual(mediaDropdown.disabled);
      expect(controller.mediaDropdown.selected).toEqual(mediaDropdown.selected);

      expect(controller.metricsOptions).toEqual(metricsOptions);
      expect(controller.metricsLabels).toEqual(metricsLabels);

      var reportFilter = _.cloneDeep(ctrlData.reportFilter);
      _.forEach(controller.filterArray, function (filter, index) {
        expect(filter.label).toEqual(reportFilter[index].label);
        expect(filter.id).toEqual(reportFilter[index].id);
        expect(filter.selected).toEqual(reportFilter[index].selected);
      });

      expect(controller.headerTabs).toEqual(headerTabs);
      expect(controller.timeOptions).toEqual(timeOptions);
      expect(controller.timeSelected).toEqual(timeOptions[0]);
    });
  });

  describe('filter changes', function () {
    it('All graphs should update on time filter changes', function () {
      controller.timeSelected = timeOptions[1];
      controller.timeUpdate();
      expect(controller.timeSelected).toEqual(timeOptions[1]);

      expect(this.DummyCustomerReportService.dummyActiveUserData).toHaveBeenCalledWith(timeOptions[1], false);
      expect(this.DummyCustomerReportService.dummyAvgRoomData).toHaveBeenCalledWith(timeOptions[1]);
      expect(this.DummyCustomerReportService.dummyFilesSharedData).toHaveBeenCalledWith(timeOptions[1]);
      expect(this.DummyCustomerReportService.dummyMediaData).toHaveBeenCalledWith(timeOptions[1]);
      expect(this.DummyCustomerReportService.dummyMetricsData).toHaveBeenCalled();
      expect(this.DummyCustomerReportService.dummyDeviceData).toHaveBeenCalledWith(timeOptions[1]);

      expect(this.CustomerReportService.getActiveUserData).toHaveBeenCalledWith(timeOptions[1], false);
      expect(this.CustomerReportService.getAvgRoomData).toHaveBeenCalledWith(timeOptions[1]);
      expect(this.CustomerReportService.getFilesSharedData).toHaveBeenCalledWith(timeOptions[1]);
      expect(this.CustomerReportService.getMediaQualityData).toHaveBeenCalledWith(timeOptions[1]);
      expect(this.CustomerReportService.getCallMetricsData).toHaveBeenCalledWith(timeOptions[1]);
      expect(this.CustomerReportService.getDeviceData).toHaveBeenCalledWith(timeOptions[1]);

      expect(this.CustomerGraphService.setActiveUsersGraph).toHaveBeenCalled();
      expect(this.CustomerGraphService.setAvgRoomsGraph).toHaveBeenCalled();
      expect(this.CustomerGraphService.setFilesSharedGraph).toHaveBeenCalled();
      expect(this.CustomerGraphService.setMediaQualityGraph).toHaveBeenCalled();
      expect(this.CustomerGraphService.setMetricsGraph).toHaveBeenCalled();
      expect(this.CustomerGraphService.setDeviceGraph).toHaveBeenCalled();
    });

    it('should update the media graph on mediaUpdate', function () {
      controller.timeSelected = timeOptions[2];
      expect(this.CustomerGraphService.setMediaQualityGraph).toHaveBeenCalledTimes(2);
      controller.mediaDropdown.click();
      expect(this.CustomerGraphService.setMediaQualityGraph).toHaveBeenCalledTimes(3);
    });

    it('should update the registered device graph on deviceUpdated', function () {
      expect(this.CustomerGraphService.setDeviceGraph).toHaveBeenCalledTimes(2);
      controller.deviceDropdown.click();
      expect(this.CustomerGraphService.setDeviceGraph).toHaveBeenCalledTimes(3);
    });
  });

  describe('helper functions', function () {
    it('getDescription and getHeader should return translated strings', function () {
      expect(controller.getDescription('text')).toEqual('text');
      expect(controller.getHeader('text')).toEqual('text');
    });

    it('resetCards should alter the visible filterArray[x].toggle based on filters', function () {
      controller.filterArray[1].toggle(ctrlData.ENGAGEMENT);
      expect(controller.displayEngagement).toBeTruthy();
      expect(controller.displayQuality).toBeFalsy();

      controller.filterArray[2].toggle(ctrlData.QUALITY);
      expect(controller.displayEngagement).toBeFalsy();
      expect(controller.displayQuality).toBeTruthy();

      controller.filterArray[0].toggle(ctrlData.ALL);
      expect(controller.displayEngagement).toBeTruthy();
      expect(controller.displayQuality).toBeTruthy();
    });

    it('isRefresh should return true when sent "refresh" and false for all other options', function () {
      expect(controller.isRefresh(ctrlData.REFRESH)).toBeTruthy();

      expect(controller.isRefresh(ctrlData.SET)).toBeFalsy();
      expect(controller.isRefresh(ctrlData.EMPTY)).toBeFalsy();
      expect(controller.isRefresh(ctrlData.ERROR)).toBeFalsy();
    });

    it('isEmpty should return true when sent "empty" and false for all other options', function () {
      expect(controller.isEmpty(ctrlData.EMPTY)).toBeTruthy();

      expect(controller.isEmpty(ctrlData.SET)).toBeFalsy();
      expect(controller.isEmpty(ctrlData.REFRESH)).toBeFalsy();
      expect(controller.isEmpty(ctrlData.ERROR)).toBeFalsy();
    });

    it('isError should return true when sent "error" and false for all other options', function () {
      expect(controller.isError(ctrlData.ERROR)).toBeTruthy();

      expect(controller.isError(ctrlData.SET)).toBeFalsy();
      expect(controller.isError(ctrlData.REFRESH)).toBeFalsy();
      expect(controller.isError(ctrlData.EMPTY)).toBeFalsy();
    });
  });

  describe('webex tests', function () {
    it('should show spark tab but not webex tab', function () {
      expect(controller.tab).not.toBeDefined();
    });

    it('should not have anything in the dropdown for webex reports', function () {
      expect(controller.webexOptions.length).toBe(0);
    });
  });
});
