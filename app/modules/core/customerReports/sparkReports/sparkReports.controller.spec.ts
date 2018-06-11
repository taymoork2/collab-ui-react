import sparkReports from './index';
import {
  IExportDropdown,
  IFilterObject,
  IDropdownBase,
  IReportLabel,
} from '../../partnerReports/partnerReportInterfaces';
import { IMetricsData } from './sparkReportInterfaces';

describe('Controller: Customer Reports Ctrl', function () {
  beforeEach(function () {
    this.initModules(sparkReports);
    this.injectDependencies('$rootScope',
      '$scope',
      '$timeout',
      '$q',
      '$controller',
      'CardUtils',
      'CommonReportService',
      'ReportPrintService',
      'ReportConstants',
      'SparkGraphService',
      'SparkReportService',
      'SparkLineReportService',
      'DummySparkDataService',
      'FeatureToggleService');

    spyOn(this.CardUtils, 'resize');
    spyOn(this.ReportPrintService, 'printCustomerPage');
    spyOn(this.ReportPrintService, 'createExportMenu').and.callThrough();

    this.dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
    this.activeData = getJSONFixture('core/json/customerReports/activeUser.json');
    this.ctrlData = getJSONFixture('core/json/partnerReports/ctrl.json');
    this.roomData = getJSONFixture('core/json/customerReports/roomData.json');
    this.fileData = getJSONFixture('core/json/customerReports/fileData.json');
    this.mediaData = getJSONFixture('core/json/customerReports/mediaQuality.json');
    this.metricsData = getJSONFixture('core/json/customerReports/callMetrics.json');
    this.devicesJson = getJSONFixture('core/json/customerReports/devices.json');
    this.defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
    this.conversationData = getJSONFixture('core/json/customerReports/conversation.json');
    this.dummyCdrData = getJSONFixture('core/json/customerReports/cdrData.json');

    this.activeOptions = _.cloneDeep(this.ctrlData.activeUserOptions);
    this.activeOptions.description = 'activeUsers.customerPortalDescription';
    this.secondaryActiveOptions = _.cloneDeep(this.ctrlData.activeUserSecondaryOptions);
    this.secondaryActiveOptions.description = 'activeUsers.customerMostActiveDescription';
    this.secondaryActiveOptions.missingUsersErrorDescription = 'activeUsers.missingUsersError';
    this.secondaryActiveOptions.search = true;
    this.secondaryActiveOptions.sortOptions = _.cloneDeep(this.activeData.sortOptions);
    this.secondaryActiveOptions.table.headers = _.cloneDeep(this.activeData.headers);
    this.secondaryActiveOptions.table.data = _.cloneDeep(this.activeData.mostActiveResponse);

    this.avgRoomsCard = _.cloneDeep(this.ctrlData.avgRoomsOptions);
    this.deviceCard = _.cloneDeep(this.ctrlData.deviceOptions);
    this.filesSharedCard = _.cloneDeep(this.ctrlData.filesSharedOptions);
    this.mediaOptions = _.cloneDeep(this.ctrlData.mediaOptions);
    this.mediaOptions.description = 'mediaQuality.descriptionCustomer';
    this.metricsOptions = _.cloneDeep(this.ctrlData.callOptions);
    this.metricsOptions.description = 'callMetrics.customerDescription';

    this.metricsLabels = _.cloneDeep(this.ctrlData.metricsLabels);
    this.qualityLabels = _.cloneDeep(this.ctrlData.qualityLabels);

    this.mediaArray = _.cloneDeep(this.mediaData.dropdownFilter);
    this.mediaDropdown = {
      array: this.mediaArray,
      disabled: false,
      selected: this.mediaArray[0],
      click: (): void => {},
    };
  });

  describe('FeatureToggleService returns false', function () {
    beforeEach(function () {
      spyOn(this.FeatureToggleService, 'atlasReportsUpdateGetStatus').and.returnValue(this.$q.resolve(false));

      spyOn(this.SparkGraphService, 'setActiveUsersGraph').and.returnValue({
        dataProvider: _.cloneDeep(this.dummyData.activeUser.one),
      });
      spyOn(this.SparkGraphService, 'setAvgRoomsGraph').and.returnValue({
        dataProvider: _.cloneDeep(this.roomData.response),
      });
      spyOn(this.SparkGraphService, 'setFilesSharedGraph').and.returnValue({
        dataProvider: _.cloneDeep(this.fileData.response),
      });
      spyOn(this.SparkGraphService, 'setMediaQualityGraph').and.returnValue({
        dataProvider: _.cloneDeep(this.mediaData.response),
      });
      spyOn(this.SparkGraphService, 'setMetricsGraph').and.returnValue({
        dataProvider: _.cloneDeep(this.metricsData.response.dataProvider),
      });
      spyOn(this.SparkGraphService, 'setDeviceGraph').and.returnValue({
        dataProvider: _.cloneDeep(this.devicesJson.response.graphData),
      });

      spyOn(this.SparkReportService, 'getActiveUserData').and.returnValue(this.$q.resolve({
        graphData: _.cloneDeep(this.activeData.activeResponse),
        isActiveUsers: true,
      }));
      spyOn(this.SparkReportService, 'getMostActiveUserData').and.returnValue(this.$q.resolve(_.cloneDeep(this.activeData.mostActiveResponse)));
      spyOn(this.SparkReportService, 'getAvgRoomData').and.returnValue(this.$q.resolve(_.cloneDeep(this.roomData.response)));
      spyOn(this.SparkReportService, 'getFilesSharedData').and.returnValue(this.$q.resolve(_.cloneDeep(this.fileData.response)));
      spyOn(this.SparkReportService, 'getMediaQualityData').and.returnValue(this.$q.resolve(_.cloneDeep(this.mediaData.response)));
      spyOn(this.SparkReportService, 'getCallMetricsData').and.returnValue(this.$q.resolve(_.cloneDeep(this.metricsData.response)));
      spyOn(this.SparkReportService, 'getDeviceData').and.returnValue(this.$q.resolve(_.cloneDeep(this.devicesJson.response)));

      spyOn(this.DummySparkDataService, 'dummyActiveUserData').and.callThrough();
      spyOn(this.DummySparkDataService, 'dummyAvgRoomData').and.callThrough();
      spyOn(this.DummySparkDataService, 'dummyFilesSharedData').and.callThrough();
      spyOn(this.DummySparkDataService, 'dummyMediaData').and.callThrough();
      spyOn(this.DummySparkDataService, 'dummyMetricsData').and.callThrough();
      spyOn(this.DummySparkDataService, 'dummyDeviceData').and.callThrough();

      this.controller = this.$controller('SparkReportCtrl', {
        $scope: this.$scope,
        $q: this.$q,
        CommonReportService: this.CommonReportService,
        SparkReportService: this.SparkReportService,
        DummySparkDataService: this.DummySparkDataService,
        SparkGraphService: this.SparkGraphService,
      });
      this.$scope.$apply();
      this.$timeout.flush();
    });

    describe('Initializing Controller', function () {
      it('should be created successfully and all expected calls completed', function () {
        expect(this.DummySparkDataService.dummyActiveUserData).toHaveBeenCalledWith(this.defaults.timeFilter[0], false);
        expect(this.DummySparkDataService.dummyAvgRoomData).toHaveBeenCalledWith(this.defaults.timeFilter[0]);
        expect(this.DummySparkDataService.dummyFilesSharedData).toHaveBeenCalledWith(this.defaults.timeFilter[0]);
        expect(this.DummySparkDataService.dummyMediaData).toHaveBeenCalledWith(this.defaults.timeFilter[0], false);
        expect(this.DummySparkDataService.dummyMetricsData).toHaveBeenCalledTimes(1);
        expect(this.DummySparkDataService.dummyDeviceData).toHaveBeenCalledWith(this.defaults.timeFilter[0], false);

        expect(this.SparkReportService.getActiveUserData).toHaveBeenCalledWith(this.defaults.timeFilter[0]);
        expect(this.SparkReportService.getMostActiveUserData).toHaveBeenCalledWith(this.defaults.timeFilter[0]);
        expect(this.SparkReportService.getAvgRoomData).toHaveBeenCalledWith(this.defaults.timeFilter[0]);
        expect(this.SparkReportService.getFilesSharedData).toHaveBeenCalledWith(this.defaults.timeFilter[0]);
        expect(this.SparkReportService.getMediaQualityData).toHaveBeenCalledWith(this.defaults.timeFilter[0]);
        expect(this.SparkReportService.getCallMetricsData).toHaveBeenCalledWith(this.defaults.timeFilter[0]);
        expect(this.SparkReportService.getDeviceData).toHaveBeenCalledWith(this.defaults.timeFilter[0]);

        expect(this.SparkGraphService.setActiveUsersGraph).toHaveBeenCalled();
        expect(this.SparkGraphService.setAvgRoomsGraph).toHaveBeenCalled();
        expect(this.SparkGraphService.setFilesSharedGraph).toHaveBeenCalled();
        expect(this.SparkGraphService.setMediaQualityGraph).toHaveBeenCalled();
        expect(this.SparkGraphService.setMetricsGraph).toHaveBeenCalled();
        expect(this.SparkGraphService.setDeviceGraph).toHaveBeenCalled();

        expect(this.ReportPrintService.createExportMenu).toHaveBeenCalledTimes(12);
        expect(this.CardUtils.resize).toHaveBeenCalledTimes(2);
      });

      it('should set all page variables', function () {
        expect(this.controller.ALL).toEqual(this.ctrlData.ALL);
        expect(this.controller.ENGAGEMENT).toEqual(this.ctrlData.ENGAGEMENT);
        expect(this.controller.QUALITY).toEqual(this.ctrlData.QUALITY);
        expect(this.controller.DETAILS).toEqual(this.ctrlData.DETAILS);
        expect(this.controller.displayEngagement).toBeTruthy();
        expect(this.controller.displayQuality).toBeTruthy();

        _.forEach(this.controller.exportArrays, (dropdown: IExportDropdown): void => {
          expect(dropdown.header).toEqual(this.ctrlData.exportMenu.header);
          expect(dropdown.menu.length).toEqual(3);
        });

        expect(this.controller.activeOptions).toEqual(this.activeOptions);
        expect(this.controller.secondaryActiveOptions).toEqual(this.secondaryActiveOptions);

        expect(this.controller.avgRoomOptions).toEqual(this.avgRoomsCard);
        expect(this.controller.filesSharedOptions).toEqual(this.filesSharedCard);

        expect(this.controller.deviceOptions).toEqual(this.deviceCard);
        _.forEach(_.cloneDeep(this.devicesJson.response.filterArray), (filter: IDropdownBase): void => {
          expect(this.controller.deviceDropdown.array).toContain(filter);
        });
        expect(this.controller.deviceDropdown.disabled).toEqual(false);
        expect(this.controller.deviceDropdown.selected).toEqual(this.controller.deviceDropdown.array[0]);

        expect(this.controller.mediaOptions).toEqual(this.mediaOptions);
        expect(this.controller.mediaDropdown.array).toEqual(this.mediaDropdown.array);
        expect(this.controller.mediaDropdown.disabled).toEqual(this.mediaDropdown.disabled);
        expect(this.controller.mediaDropdown.selected).toEqual(this.mediaDropdown.selected);

        expect(this.controller.metricsOptions).toEqual(this.metricsOptions);
        _.forEach(this.controller.metricsLabels, (label: IReportLabel, index: number): void => {
          expect(label.class).toBeUndefined();
          expect(label.click).toBeUndefined();
          expect(label.hidden).toEqual(this.metricsLabels[index].hidden);
          expect(label.number).toEqual(this.metricsLabels[index].number);
          expect(label.text).toEqual(this.metricsLabels[index].text);
        });

        const reportFilter: IFilterObject[] = _.cloneDeep(this.ctrlData.reportFilter);
        _.forEach(this.controller.filterArray, (filter: IFilterObject, index: number): void => {
          expect(filter.label).toEqual(reportFilter[index].label);
          expect(filter.id).toEqual(reportFilter[index].id);
          expect(filter.selected).toEqual(reportFilter[index].selected);
        });

        expect(this.controller.timeOptions).toEqual(this.defaults.timeFilter);
        expect(this.controller.timeSelected).toEqual(this.defaults.timeFilter[0]);
        expect(this.controller.timeUpdates.sliderUpdate).toEqual(jasmine.any(Function));
        expect(this.controller.timeUpdates.update).toEqual(jasmine.any(Function));
      });
    });

    describe('filter changes', function () {
      it('All graphs should update on time filter changes', function () {
        this.controller.timeSelected = this.defaults.timeFilter[1];
        this.controller.timeUpdates.update();
        this.$timeout.flush();
        expect(this.controller.timeSelected).toEqual(this.defaults.timeFilter[1]);

        expect(this.DummySparkDataService.dummyActiveUserData).toHaveBeenCalledWith(this.defaults.timeFilter[1], false);
        expect(this.DummySparkDataService.dummyAvgRoomData).toHaveBeenCalledWith(this.defaults.timeFilter[1]);
        expect(this.DummySparkDataService.dummyFilesSharedData).toHaveBeenCalledWith(this.defaults.timeFilter[1]);
        expect(this.DummySparkDataService.dummyMediaData).toHaveBeenCalledWith(this.defaults.timeFilter[1], false);
        expect(this.DummySparkDataService.dummyMetricsData).toHaveBeenCalled();
        expect(this.DummySparkDataService.dummyDeviceData).toHaveBeenCalledWith(this.defaults.timeFilter[1], false);

        expect(this.SparkReportService.getActiveUserData).toHaveBeenCalledWith(this.defaults.timeFilter[1]);
        expect(this.SparkReportService.getAvgRoomData).toHaveBeenCalledWith(this.defaults.timeFilter[1]);
        expect(this.SparkReportService.getFilesSharedData).toHaveBeenCalledWith(this.defaults.timeFilter[1]);
        expect(this.SparkReportService.getMediaQualityData).toHaveBeenCalledWith(this.defaults.timeFilter[1]);
        expect(this.SparkReportService.getCallMetricsData).toHaveBeenCalledWith(this.defaults.timeFilter[1]);
        expect(this.SparkReportService.getDeviceData).toHaveBeenCalledWith(this.defaults.timeFilter[1]);

        expect(this.SparkGraphService.setActiveUsersGraph).toHaveBeenCalled();
        expect(this.SparkGraphService.setAvgRoomsGraph).toHaveBeenCalled();
        expect(this.SparkGraphService.setFilesSharedGraph).toHaveBeenCalled();
        expect(this.SparkGraphService.setMediaQualityGraph).toHaveBeenCalled();
        expect(this.SparkGraphService.setMetricsGraph).toHaveBeenCalled();
        expect(this.SparkGraphService.setDeviceGraph).toHaveBeenCalled();
      });

      it('should update the registered device graph on deviceUpdated', function () {
        expect(this.SparkGraphService.setDeviceGraph).toHaveBeenCalledTimes(2);
        this.controller.deviceDropdown.click();
        expect(this.SparkGraphService.setDeviceGraph).toHaveBeenCalledTimes(3);
      });

      it('should update the media graph on mediaUpdate', function () {
        this.controller.mediaArray = this.mediaArray[1];
        expect(this.SparkGraphService.setMediaQualityGraph).toHaveBeenCalledTimes(2);
        this.controller.mediaDropdown.click();
        expect(this.SparkGraphService.setMediaQualityGraph).toHaveBeenCalledTimes(3);
      });
    });

    describe('helper functions', function () {
      it('resetCards should alter the visible filterArray[x].toggle based on filters', function () {
        this.controller.filterArray[1].toggle(this.ctrlData.ENGAGEMENT);
        expect(this.controller.displayEngagement).toBeTruthy();
        expect(this.controller.displayQuality).toBeFalsy();
        expect(this.controller.displayDetails).toBeFalsy();

        this.controller.filterArray[2].toggle(this.ctrlData.QUALITY);
        expect(this.controller.displayEngagement).toBeFalsy();
        expect(this.controller.displayQuality).toBeTruthy();
        expect(this.controller.displayDetails).toBeFalsy();

        this.controller.filterArray[0].toggle(this.ctrlData.ALL);
        expect(this.controller.displayEngagement).toBeTruthy();
        expect(this.controller.displayQuality).toBeTruthy();
        expect(this.controller.displayDetails).toBeFalsy();
      });
    });
  });

  describe('FeatureToggleService returns true', function () {
    beforeEach(function () {
      this.zoomFunction = jasmine.createSpy('zoom');
      this.activeDropdownArray = _.cloneDeep(this.activeData.dropdownOptions);

      spyOn(this.$rootScope, '$broadcast').and.callThrough();
      spyOn(this.FeatureToggleService, 'atlasReportsUpdateGetStatus').and.returnValue(this.$q.resolve(true));

      spyOn(this.SparkGraphService, 'setActiveLineGraph').and.returnValue({
        dataProvider: _.cloneDeep(this.activeData.activeLineResponse),
        zoomToIndexes: this.zoomFunction,
      });
      spyOn(this.SparkGraphService, 'setRoomGraph').and.returnValue({
        dataProvider: _.cloneDeep(this.conversationData.response),
        zoomToIndexes: this.zoomFunction,
      });
      spyOn(this.SparkGraphService, 'setFilesGraph').and.returnValue({
        dataProvider: _.cloneDeep(this.conversationData.response),
        zoomToIndexes: this.zoomFunction,
      });
      spyOn(this.SparkGraphService, 'setQualityGraph').and.returnValue({
        dataProvider: _.cloneDeep(this.mediaData.response),
        zoomToIndexes: this.zoomFunction,
      });
      spyOn(this.SparkGraphService, 'setDeviceLineGraph').and.returnValue({
        dataProvider: _.cloneDeep(this.devicesJson.response.graphData),
        zoomToIndexes: this.zoomFunction,
      });
      spyOn(this.SparkGraphService, 'setMetricsGraph').and.returnValue({
        dataProvider: _.cloneDeep(this.metricsData.response.dataProvider),
      });
      spyOn(this.SparkGraphService, 'showHideActiveLineGraph');

      spyOn(this.SparkLineReportService, 'getActiveUserData').and.returnValue(this.$q.resolve({
        graphData: _.cloneDeep(this.activeData.activeLineResponse),
        isActiveUsers: true,
      }));
      spyOn(this.SparkLineReportService, 'getMediaQualityData').and.returnValue(this.$q.resolve(_.cloneDeep(this.mediaData.response)));
      spyOn(this.SparkLineReportService, 'getMostActiveUserData').and.returnValue(this.$q.resolve(_.cloneDeep(this.activeData.mostActiveResponse)));
      spyOn(this.SparkLineReportService, 'getConversationData').and.returnValue(this.$q.resolve({
        array: _.cloneDeep(this.conversationData.response),
        hasRooms: true,
        hasFiles: true,
      }));
      spyOn(this.SparkLineReportService, 'getDeviceData').and.returnValue(this.$q.resolve(_.cloneDeep(this.devicesJson.response)));

      const lineResponse: IMetricsData[] = [];
      for (let i = 0; i < 7; i++) {
        lineResponse.push(_.cloneDeep(this.metricsData.lineResponse));
      }
      spyOn(this.SparkLineReportService, 'getMetricsData').and.returnValue(this.$q.resolve(lineResponse));

      spyOn(this.DummySparkDataService, 'dummyActiveUserData').and.callThrough();
      spyOn(this.DummySparkDataService, 'dummyConversationData').and.callThrough();
      spyOn(this.DummySparkDataService, 'dummyMediaData').and.callThrough();
      spyOn(this.DummySparkDataService, 'dummyMetricsData').and.callThrough();
      spyOn(this.DummySparkDataService, 'dummyDeviceData').and.callThrough();

      this.controller = this.$controller('SparkReportCtrl', {
        $scope: this.$scope,
        $q: this.$q,
        CommonReportService: this.CommonReportService,
        SparkReportService: this.SparkReportService,
        DummySparkDataService: this.DummySparkDataService,
        SparkGraphService: this.SparkGraphService,
      });

      this.$scope.$apply();
      this.$timeout.flush();
    });

    describe('Initializing Controller', function () {
      beforeEach(function () {
        this.secondaryOptions = _.cloneDeep(this.secondaryActiveOptions);
        this.secondaryOptions.alternateTranslations = true;
      });

      it('should be created successfully and all expected calls completed', function () {
        expect(this.DummySparkDataService.dummyActiveUserData).toHaveBeenCalledTimes(1);
        expect(this.DummySparkDataService.dummyConversationData).toHaveBeenCalledTimes(1);
        expect(this.DummySparkDataService.dummyMediaData).toHaveBeenCalledTimes(1);
        expect(this.DummySparkDataService.dummyMetricsData).toHaveBeenCalledTimes(1);
        expect(this.DummySparkDataService.dummyDeviceData).toHaveBeenCalledTimes(1);

        expect(this.SparkLineReportService.getActiveUserData).toHaveBeenCalledTimes(1);
        expect(this.SparkGraphService.setActiveLineGraph).toHaveBeenCalledTimes(2);
        expect(this.$rootScope.$broadcast).toHaveBeenCalledWith(this.secondaryOptions.broadcast);
        expect(this.$rootScope.$broadcast).toHaveBeenCalledTimes(4);

        expect(this.SparkLineReportService.getConversationData).toHaveBeenCalledTimes(1);
        expect(this.SparkGraphService.setRoomGraph).toHaveBeenCalledTimes(2);
        expect(this.SparkGraphService.setFilesGraph).toHaveBeenCalledTimes(2);

        expect(this.SparkLineReportService.getMediaQualityData).toHaveBeenCalledTimes(1);
        expect(this.SparkGraphService.setQualityGraph).toHaveBeenCalledTimes(2);

        expect(this.SparkLineReportService.getMetricsData).toHaveBeenCalledTimes(1);
        expect(this.SparkGraphService.setMetricsGraph).toHaveBeenCalledTimes(2);

        expect(this.SparkLineReportService.getDeviceData).toHaveBeenCalledTimes(1);
        expect(this.SparkGraphService.setDeviceLineGraph).toHaveBeenCalledTimes(2);

        expect(this.zoomFunction).not.toHaveBeenCalled();

        expect(this.ReportPrintService.createExportMenu).toHaveBeenCalledTimes(12);
        expect(this.SparkGraphService.showHideActiveLineGraph).toHaveBeenCalledTimes(2);
        expect(this.CardUtils.resize).toHaveBeenCalledTimes(1);
      });

      it('should set all page variables', function () {
        expect(this.controller.ALL).toEqual(this.ctrlData.ALL);
        expect(this.controller.ENGAGEMENT).toEqual(this.ctrlData.ENGAGEMENT);
        expect(this.controller.QUALITY).toEqual(this.ctrlData.QUALITY);
        expect(this.controller.displayEngagement).toBeTruthy();
        expect(this.controller.displayQuality).toBeTruthy();

        _.forEach(this.controller.exportArrays, (dropdown: IExportDropdown): void => {
          expect(dropdown.header).toEqual(this.ctrlData.exportMenu.header);
          expect(dropdown.menu.length).toEqual(3);
        });

        expect(this.controller.activeOptions).toEqual(this.activeOptions);
        expect(this.controller.secondaryActiveOptions).toEqual(this.secondaryOptions);
        expect(this.controller.activeDropdown.array).toEqual(this.activeDropdownArray);
        expect(this.controller.activeDropdown.disabled).toBeFalsy();
        expect(this.controller.activeDropdown.selected).toEqual(this.activeDropdownArray[0]);
        expect(this.controller.activeDropdown.click).toEqual(jasmine.any(Function));

        expect(this.controller.avgRoomOptions).toEqual(this.avgRoomsCard);
        expect(this.controller.filesSharedOptions).toEqual(this.filesSharedCard);

        expect(this.controller.mediaOptions).toEqual(this.mediaOptions);
        expect(this.controller.mediaDropdown.array).toEqual(this.mediaDropdown.array);
        expect(this.controller.mediaDropdown.disabled).toEqual(this.mediaDropdown.disabled);
        expect(this.controller.mediaDropdown.selected).toEqual(this.mediaDropdown.selected);
        _.forEach(this.controller.qualityLabels, (label: IReportLabel, index: number): void => {
          expect(label.class).toEqual(this.qualityLabels[index].class);
          expect(label.click).toEqual(jasmine.any(Function));
          expect(label.hidden).toEqual(this.qualityLabels[index].hidden);
          expect(label.number).toEqual(this.qualityLabels[index].number);
          expect(label.text).toEqual(this.qualityLabels[index].text);
        });
        expect(this.controller.qualityTooltip).toEqual({
          title: 'mediaQuality.avgMinutes',
          text: 'mediaQuality.minTooltip',
        });

        expect(this.controller.metricsOptions).toEqual(this.metricsOptions);
        _.forEach(this.controller.metricsLabels, (label: IReportLabel, index: number): void => {
          expect(label.class).toBeUndefined();
          expect(label.click).toBeUndefined();
          expect(label.hidden).toEqual(this.metricsLabels[index].hidden);
          expect(label.number).toEqual(this.metricsLabels[index].number);
          expect(label.text).toEqual(this.metricsLabels[index].text);
        });

        expect(this.controller.deviceOptions).toEqual(this.deviceCard);
        _.forEach(_.cloneDeep(this.devicesJson.response.filterArray), (filter: IDropdownBase): void => {
          expect(this.controller.deviceDropdown.array).toContain(filter);
        });
        expect(this.controller.deviceDropdown.disabled).toEqual(false);
        expect(this.controller.deviceDropdown.selected).toEqual(this.devicesJson.response.filterArray[0]);

        const reportFilter: IFilterObject[] = _.cloneDeep(this.ctrlData.reportFilter);
        _.forEach(this.controller.filterArray, (filter: IFilterObject, index: number): void => {
          expect(filter.label).toEqual(reportFilter[index].label);
          expect(filter.id).toEqual(reportFilter[index].id);
          expect(filter.selected).toEqual(reportFilter[index].selected);
        });

        expect(this.controller.timeOptions).toEqual(this.defaults.altTimeFilter);
        expect(this.controller.timeSelected).toEqual(this.defaults.altTimeFilter[0]);
        expect(this.controller.timeUpdates.sliderUpdate).toEqual(jasmine.any(Function));
        expect(this.controller.timeUpdates.update).toEqual(jasmine.any(Function));
      });
    });

    describe('filter changes', function () {
      it('All graphs should update on time filter changes', function () {
        this.controller.timeSelected = this.defaults.altTimeFilter[1];
        this.controller.timeUpdates.update();
        this.$timeout.flush();
        expect(this.controller.timeSelected).toEqual(this.defaults.altTimeFilter[1]);

        expect(this.DummySparkDataService.dummyActiveUserData).toHaveBeenCalledTimes(2);
        expect(this.SparkLineReportService.getActiveUserData).toHaveBeenCalledTimes(2);
        expect(this.SparkGraphService.setActiveLineGraph).toHaveBeenCalledTimes(3);
        expect(this.$rootScope.$broadcast).toHaveBeenCalledTimes(6);

        expect(this.SparkLineReportService.getConversationData).toHaveBeenCalledTimes(2);
        expect(this.SparkGraphService.setRoomGraph).toHaveBeenCalledTimes(3);
        expect(this.SparkGraphService.setFilesGraph).toHaveBeenCalledTimes(3);

        expect(this.SparkLineReportService.getMediaQualityData).toHaveBeenCalledTimes(2);
        expect(this.SparkGraphService.setQualityGraph).toHaveBeenCalledTimes(3);

        expect(this.SparkLineReportService.getMetricsData).toHaveBeenCalledTimes(2);
        expect(this.SparkGraphService.setMetricsGraph).toHaveBeenCalledTimes(3);

        expect(this.SparkLineReportService.getDeviceData).toHaveBeenCalledTimes(2);
        expect(this.SparkGraphService.setDeviceLineGraph).toHaveBeenCalledTimes(3);

        expect(this.zoomFunction).toHaveBeenCalledTimes(10);
        expect(this.CardUtils.resize).toHaveBeenCalledTimes(2);
      });

      it('should hide or show graphs as expected when changing the activeDropdown selection', function () {
        this.controller.activeDropdown.selected = this.activeDropdownArray[1];
        this.controller.activeDropdown.click();
        expect(this.SparkGraphService.showHideActiveLineGraph).toHaveBeenCalledTimes(3);
      });

      it('should update the media graph on mediaUpdate', function () {
        this.controller.mediaArray = this.mediaArray[1];
        expect(this.SparkGraphService.setQualityGraph).toHaveBeenCalledTimes(2);
        this.controller.mediaDropdown.click();
        expect(this.SparkGraphService.setQualityGraph).toHaveBeenCalledTimes(3);
      });

      it('should update the registered device graph on deviceUpdated', function () {
        expect(this.SparkGraphService.setDeviceLineGraph).toHaveBeenCalledTimes(2);
        this.controller.deviceDropdown.click();
        expect(this.SparkGraphService.setDeviceLineGraph).toHaveBeenCalledTimes(3);
      });
    });

    it('should call the resport print service when the download page option is triggered', function () {
      this.controller.exportFullPage();
      expect(this.ReportPrintService.printCustomerPage).toHaveBeenCalledWith(this.ReportConstants.ALL, this.controller.timeSelected, {
        min: this.controller.timeSelected.min,
        max: this.controller.timeSelected.max,
      }, jasmine.any(Object), {
        active: this.controller.activeOptions,
        rooms: this.controller.avgRoomOptions,
        files: this.controller.filesSharedOptions,
        media: this.controller.mediaOptions,
        device: this.controller.deviceOptions,
        metrics: this.controller.metricsOptions,
      }, {
        active: this.controller.activeDropdown,
        media: this.controller.mediaDropdown,
        device: this.controller.deviceDropdown,
      }, {
        media: this.controller.qualityLabels,
        metrics: this.controller.metricsLabels,
      });
    });
  });

  describe('FeatureToggleService returns true for I802', function () {
    beforeEach(function () {
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
      spyOn(this.SparkReportService, 'getCDRReport').and.returnValue(this.$q.resolve(this.dummyCdrData));
      this.controller = this.$controller('SparkReportCtrl as nav', {
        $scope: this.$scope,
        $q: this.$q,
        CommonReportService: this.CommonReportService,
        SparkReportService: this.SparkReportService,
        DummySparkDataService: this.DummySparkDataService,
        SparkGraphService: this.SparkGraphService,
      });
      this.$scope.$apply();
    });

    it('should have details tab present', function() {
      expect(this.controller.ALL).toEqual(this.ctrlData.ALL);
      expect(this.controller.ENGAGEMENT).toEqual(this.ctrlData.ENGAGEMENT);
      expect(this.controller.QUALITY).toEqual(this.ctrlData.QUALITY);
      expect(this.controller.DETAILS).toEqual(this.ctrlData.DETAILS);
      expect(this.controller.filterArray.length).toEqual(4);
    });

    it('should have adjusted the startDate and endDate as time filter is Last 7 days', function() {
      const sDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
      const sTime = moment().subtract(7, 'days').format('h:mm A');
      const eDate = moment().format('YYYY-MM-DD');
      const eTime = moment().format('h:mm A');
      expect(this.controller.startDate).toEqual(sDate);
      expect(this.controller.endDate).toEqual(eDate);
      expect(this.controller.startTime).toEqual(sTime);
      expect(this.controller.endTime).toEqual(eTime);
    });

    it('should have adjusted the startDate and endDate on time filter Changes', function() {
      this.controller.timeSelected = this.defaults.timeFilter[1];
      this.controller.timeUpdates.update();
      this.$timeout.flush();
      const sDate = moment().subtract(4, 'weeks').format('YYYY-MM-DD');
      const sTime = moment().subtract(4, 'weeks').format('h:mm A');
      const eDate = moment().format('YYYY-MM-DD');
      const eTime = moment().format('h:mm A');
      expect(this.controller.startDate).toEqual(sDate);
      expect(this.controller.endDate).toEqual(eDate);
      expect(this.controller.startTime).toEqual(sTime);
      expect(this.controller.endTime).toEqual(eTime);
    });

    it('resetCards should alter the visible filterArray[x].toggle based on filters equals \'Details\'', function () {
      this.controller.filterArray[3].toggle(this.ctrlData.DETAILS);
      this.SparkReportService.getCDRReport.and.returnValue(this.$q.resolve(this.dummyCdrData));
      this.$scope.$apply();
      expect(this.controller.displayDetails).toBeTruthy();
      expect(this.controller.gridOptions).toBeDefined();
    });

    it('should gridOptions.data have data loaded', function() {
      this.controller.filterArray[3].toggle(this.ctrlData.DETAILS);
      this.SparkReportService.getCDRReport.and.returnValue(this.$q.resolve(this.dummyCdrData));
      this.$scope.$apply();
      expect(this.controller.gridOptions.data.length).toEqual(5);
    });
  });

  describe('FeatureToggleService returns false for I802', function () {
    beforeEach(function () {
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
      spyOn(this.SparkReportService, 'getCDRReport').and.returnValue(this.$q.resolve(this.dummyCdrData));
      this.controller = this.$controller('SparkReportCtrl as nav', {
        $scope: this.$scope,
        $q: this.$q,
        CommonReportService: this.CommonReportService,
        SparkReportService: this.SparkReportService,
        DummySparkDataService: this.DummySparkDataService,
        SparkGraphService: this.SparkGraphService,
      });
      this.$scope.$apply();
    });

    it('should not have details tab present', function() {
      expect(this.controller.filterArray.length).toEqual(3);
      expect(this.controller.displayDetails).toBeFalsy();
    });

    it('gridOptions.data should not have data loaded', function() {
      this.SparkReportService.getCDRReport.and.returnValue(this.$q.resolve(this.dummyCdrData));
      this.$scope.$apply();
      expect(this.controller.gridOptions).toBeUndefined();
    });
  });
});
