import {
  IExportMenu,
  IFilterObject,
  IDropdownBase,
  IReportCard,
  IReportDropdown,
  ISecondaryReport,
  ITimespan,
} from '../../partnerReports/partnerReportInterfaces';

import {
  IMetricsLabel,
} from './sparkReportInterfaces';

describe('Controller: Customer Reports Ctrl', function () {
  let controller;

  const dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
  const activeData = getJSONFixture('core/json/customerReports/activeUser.json');
  const ctrlData = getJSONFixture('core/json/partnerReports/ctrl.json');
  const roomData = getJSONFixture('core/json/customerReports/roomData.json');
  const fileData = getJSONFixture('core/json/customerReports/fileData.json');
  const mediaData = getJSONFixture('core/json/customerReports/mediaQuality.json');
  const metricsData = getJSONFixture('core/json/customerReports/callMetrics.json');
  const devicesJson = getJSONFixture('core/json/customerReports/devices.json');
  const defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
  const conversationData = getJSONFixture('core/json/customerReports/conversation.json');

  let activeOptions: IReportCard = _.cloneDeep(ctrlData.activeUserOptions);
  let secondaryActiveOptions: ISecondaryReport = _.cloneDeep(ctrlData.activeUserSecondaryOptions);
  let avgRoomsCard: IReportCard = _.cloneDeep(ctrlData.avgRoomsOptions);
  let deviceCard: IReportCard = _.cloneDeep(ctrlData.deviceOptions);
  let filesSharedCard: IReportCard = _.cloneDeep(ctrlData.filesSharedOptions);
  let mediaOptions: IReportCard = _.cloneDeep(ctrlData.mediaOptions);
  let metricsOptions: IReportCard = _.cloneDeep(ctrlData.callOptions);
  let metricsLabels: Array<IMetricsLabel> = _.cloneDeep(ctrlData.metricsLabels);
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

  let timeOptions: Array<ITimespan> = _.cloneDeep(defaults.timeFilter);
  let altTimeFilter: Array<ITimespan> = _.cloneDeep(defaults.altTimeFilter);
  let mediaArray: Array<IDropdownBase> = _.cloneDeep(mediaData.dropdownFilter);
  let mediaDropdown: IReportDropdown = {
    array: mediaArray,
    disabled: false,
    selected: mediaArray[0],
    click: (): void => {},
  };

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$rootScope',
                            '$scope',
                            '$timeout',
                            '$q',
                            '$controller',
                            'CardUtils',
                            'CommonReportService',
                            'SparkGraphService',
                            'SparkReportService',
                            'SparkLineReportService',
                            'DummySparkDataService',
                            'FeatureToggleService');

    spyOn(this.CardUtils, 'resize');
    spyOn(this.CommonReportService, 'createExportMenu').and.callThrough();
  });

  describe('FeatureToggleService returns false', function () {
    beforeEach(function () {
      spyOn(this.FeatureToggleService, 'atlasReportsUpdateGetStatus').and.returnValue(this.$q.when(false));

      spyOn(this.SparkGraphService, 'setActiveUsersGraph').and.returnValue({
        dataProvider: _.cloneDeep(dummyData.activeUser.one),
      });
      spyOn(this.SparkGraphService, 'setAvgRoomsGraph').and.returnValue({
        dataProvider: _.cloneDeep(roomData.response),
      });
      spyOn(this.SparkGraphService, 'setFilesSharedGraph').and.returnValue({
        dataProvider: _.cloneDeep(fileData.response),
      });
      spyOn(this.SparkGraphService, 'setMediaQualityGraph').and.returnValue({
        dataProvider: _.cloneDeep(mediaData.response),
      });
      spyOn(this.SparkGraphService, 'setMetricsGraph').and.returnValue({
        dataProvider: _.cloneDeep(metricsData.response.dataProvider),
      });
      spyOn(this.SparkGraphService, 'setDeviceGraph').and.returnValue({
        dataProvider: _.cloneDeep(devicesJson.response.graphData),
      });

      spyOn(this.SparkReportService, 'getActiveUserData').and.returnValue(this.$q.when(_.cloneDeep(activeData.activeResponse)));
      spyOn(this.SparkReportService, 'getMostActiveUserData').and.returnValue(this.$q.when(_.cloneDeep(activeData.mostActiveResponse)));
      spyOn(this.SparkReportService, 'getAvgRoomData').and.returnValue(this.$q.when(_.cloneDeep(roomData.response)));
      spyOn(this.SparkReportService, 'getFilesSharedData').and.returnValue(this.$q.when(_.cloneDeep(fileData.response)));
      spyOn(this.SparkReportService, 'getMediaQualityData').and.returnValue(this.$q.when(_.cloneDeep(mediaData.response)));
      spyOn(this.SparkReportService, 'getCallMetricsData').and.returnValue(this.$q.when(_.cloneDeep(metricsData.response)));
      spyOn(this.SparkReportService, 'getDeviceData').and.returnValue(this.$q.when(_.cloneDeep(devicesJson.response)));

      spyOn(this.DummySparkDataService, 'dummyActiveUserData').and.callThrough();
      spyOn(this.DummySparkDataService, 'dummyAvgRoomData').and.callThrough();
      spyOn(this.DummySparkDataService, 'dummyFilesSharedData').and.callThrough();
      spyOn(this.DummySparkDataService, 'dummyMediaData').and.callThrough();
      spyOn(this.DummySparkDataService, 'dummyMetricsData').and.callThrough();
      spyOn(this.DummySparkDataService, 'dummyDeviceData').and.callThrough();

      controller = this.$controller('SparkReportCtrl', {
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
        expect(this.DummySparkDataService.dummyActiveUserData).toHaveBeenCalledWith(timeOptions[0], false);
        expect(this.DummySparkDataService.dummyAvgRoomData).toHaveBeenCalledWith(timeOptions[0]);
        expect(this.DummySparkDataService.dummyFilesSharedData).toHaveBeenCalledWith(timeOptions[0]);
        expect(this.DummySparkDataService.dummyMediaData).toHaveBeenCalledWith(timeOptions[0]);
        expect(this.DummySparkDataService.dummyMetricsData).toHaveBeenCalled();
        expect(this.DummySparkDataService.dummyDeviceData).toHaveBeenCalledWith(timeOptions[0]);

        expect(this.SparkReportService.getActiveUserData).toHaveBeenCalledWith(timeOptions[0]);
        expect(this.SparkReportService.getMostActiveUserData).toHaveBeenCalledWith(timeOptions[0]);
        expect(this.SparkReportService.getAvgRoomData).toHaveBeenCalledWith(timeOptions[0]);
        expect(this.SparkReportService.getFilesSharedData).toHaveBeenCalledWith(timeOptions[0]);
        expect(this.SparkReportService.getMediaQualityData).toHaveBeenCalledWith(timeOptions[0]);
        expect(this.SparkReportService.getCallMetricsData).toHaveBeenCalledWith(timeOptions[0]);
        expect(this.SparkReportService.getDeviceData).toHaveBeenCalledWith(timeOptions[0]);

        expect(this.SparkGraphService.setActiveUsersGraph).toHaveBeenCalled();
        expect(this.SparkGraphService.setAvgRoomsGraph).toHaveBeenCalled();
        expect(this.SparkGraphService.setFilesSharedGraph).toHaveBeenCalled();
        expect(this.SparkGraphService.setMediaQualityGraph).toHaveBeenCalled();
        expect(this.SparkGraphService.setMetricsGraph).toHaveBeenCalled();
        expect(this.SparkGraphService.setDeviceGraph).toHaveBeenCalled();

        expect(this.CommonReportService.createExportMenu).toHaveBeenCalledTimes(12);
        expect(this.CardUtils.resize).toHaveBeenCalledTimes(2);
      });

      it('should set all page variables', function () {
        expect(controller.ALL).toEqual(ctrlData.ALL);
        expect(controller.ENGAGEMENT).toEqual(ctrlData.ENGAGEMENT);
        expect(controller.QUALITY).toEqual(ctrlData.QUALITY);
        expect(controller.displayEngagement).toBeTruthy();
        expect(controller.displayQuality).toBeTruthy();

        _.forEach(controller.exportArrays, (array: Array<IExportMenu>): void => {
          expect(array.length).toEqual(4);
        });

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

        let reportFilter: Array<IFilterObject> = _.cloneDeep(ctrlData.reportFilter);
        _.forEach(controller.filterArray, function (filter, index: number) {
          expect(filter.label).toEqual(reportFilter[index].label);
          expect(filter.id).toEqual(reportFilter[index].id);
          expect(filter.selected).toEqual(reportFilter[index].selected);
        });

        expect(controller.timeOptions).toEqual(timeOptions);
        expect(controller.timeSelected).toEqual(timeOptions[0]);
        expect(controller.timeUpdates.sliderUpdate).toEqual(jasmine.any(Function));
        expect(controller.timeUpdates.update).toEqual(jasmine.any(Function));
      });
    });

    describe('filter changes', function () {
      it('All graphs should update on time filter changes', function () {
        controller.timeSelected = timeOptions[1];
        controller.timeUpdates.update();
        this.$timeout.flush();
        expect(controller.timeSelected).toEqual(timeOptions[1]);

        expect(this.DummySparkDataService.dummyActiveUserData).toHaveBeenCalledWith(timeOptions[1], false);
        expect(this.DummySparkDataService.dummyAvgRoomData).toHaveBeenCalledWith(timeOptions[1]);
        expect(this.DummySparkDataService.dummyFilesSharedData).toHaveBeenCalledWith(timeOptions[1]);
        expect(this.DummySparkDataService.dummyMediaData).toHaveBeenCalledWith(timeOptions[1]);
        expect(this.DummySparkDataService.dummyMetricsData).toHaveBeenCalled();
        expect(this.DummySparkDataService.dummyDeviceData).toHaveBeenCalledWith(timeOptions[1]);

        expect(this.SparkReportService.getActiveUserData).toHaveBeenCalledWith(timeOptions[1]);
        expect(this.SparkReportService.getAvgRoomData).toHaveBeenCalledWith(timeOptions[1]);
        expect(this.SparkReportService.getFilesSharedData).toHaveBeenCalledWith(timeOptions[1]);
        expect(this.SparkReportService.getMediaQualityData).toHaveBeenCalledWith(timeOptions[1]);
        expect(this.SparkReportService.getCallMetricsData).toHaveBeenCalledWith(timeOptions[1]);
        expect(this.SparkReportService.getDeviceData).toHaveBeenCalledWith(timeOptions[1]);

        expect(this.SparkGraphService.setActiveUsersGraph).toHaveBeenCalled();
        expect(this.SparkGraphService.setAvgRoomsGraph).toHaveBeenCalled();
        expect(this.SparkGraphService.setFilesSharedGraph).toHaveBeenCalled();
        expect(this.SparkGraphService.setMediaQualityGraph).toHaveBeenCalled();
        expect(this.SparkGraphService.setMetricsGraph).toHaveBeenCalled();
        expect(this.SparkGraphService.setDeviceGraph).toHaveBeenCalled();
      });

      it('should update the media graph on mediaUpdate', function () {
        controller.timeSelected = timeOptions[2];
        expect(this.SparkGraphService.setMediaQualityGraph).toHaveBeenCalledTimes(2);
        controller.mediaDropdown.click();
        expect(this.SparkGraphService.setMediaQualityGraph).toHaveBeenCalledTimes(3);
      });

      it('should update the registered device graph on deviceUpdated', function () {
        expect(this.SparkGraphService.setDeviceGraph).toHaveBeenCalledTimes(2);
        controller.deviceDropdown.click();
        expect(this.SparkGraphService.setDeviceGraph).toHaveBeenCalledTimes(3);
      });
    });

    describe('helper functions', function () {
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
    });
  });

  describe('FeatureToggleService returns true', function () {
    let zoomFunction = jasmine.createSpy('zoom');
    let activeDropdownArray: Array<IDropdownBase> = _.cloneDeep(activeData.dropdownOptions);

    beforeEach(function () {
      spyOn(this.$rootScope, '$broadcast').and.callThrough();
      spyOn(this.FeatureToggleService, 'atlasReportsUpdateGetStatus').and.returnValue(this.$q.when(true));

      spyOn(this.SparkGraphService, 'setActiveLineGraph').and.returnValue({
        dataProvider: _.cloneDeep(activeData.activeLineResponse),
        zoomToIndexes: zoomFunction,
      });
      spyOn(this.SparkGraphService, 'showHideActiveLineGraph');

      spyOn(this.SparkLineReportService, 'getActiveUserData').and.returnValue(this.$q.when(_.cloneDeep(activeData.activeLineResponse)));
      spyOn(this.SparkLineReportService, 'getMostActiveUserData').and.returnValue(this.$q.when(_.cloneDeep(activeData.mostActiveResponse)));
      spyOn(this.SparkLineReportService, 'getConversationData').and.returnValue(this.$q.when({
        array: _.cloneDeep(conversationData.response),
        hasRooms: true,
        hasFiles: true,
      }));

      spyOn(this.DummySparkDataService, 'dummyActiveUserData').and.callThrough();
      spyOn(this.DummySparkDataService, 'dummyConversationData').and.callThrough();

      controller = this.$controller('SparkReportCtrl', {
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
        expect(this.DummySparkDataService.dummyActiveUserData).toHaveBeenCalledTimes(1);
        expect(this.DummySparkDataService.dummyConversationData).toHaveBeenCalledTimes(1);

        expect(this.SparkLineReportService.getActiveUserData).toHaveBeenCalledTimes(1);
        expect(this.SparkGraphService.setActiveLineGraph).toHaveBeenCalled();
        expect(zoomFunction).not.toHaveBeenCalled();

        expect(this.CommonReportService.createExportMenu).toHaveBeenCalledTimes(6);
        expect(this.SparkGraphService.showHideActiveLineGraph).toHaveBeenCalledTimes(2);
        expect(this.CardUtils.resize).toHaveBeenCalledTimes(1);
      });

      it('should set all page variables', function () {
        expect(controller.ALL).toEqual(ctrlData.ALL);
        expect(controller.ENGAGEMENT).toEqual(ctrlData.ENGAGEMENT);
        expect(controller.QUALITY).toEqual(ctrlData.QUALITY);
        expect(controller.displayEngagement).toBeTruthy();
        expect(controller.displayQuality).toBeTruthy();

        _.forEach(controller.exportArrays, (array: Array<IExportMenu>): void => {
          if (array) {
            expect(array.length).toBe(4);
          }
        });

        expect(controller.activeOptions).toEqual(activeOptions);
        let options = _.cloneDeep(secondaryActiveOptions);
        options.alternateTranslations = true;
        expect(controller.secondaryActiveOptions).toEqual(options);
        expect(controller.activeDropdown.array).toEqual(activeDropdownArray);
        expect(controller.activeDropdown.disabled).toBeTruthy();
        expect(controller.activeDropdown.selected).toEqual(activeDropdownArray[0]);
        expect(controller.activeDropdown.click).toEqual(jasmine.any(Function));

        expect(controller.avgRoomOptions).toEqual(avgRoomsCard);
        expect(controller.filesSharedOptions).toEqual(filesSharedCard);

        let reportFilter: Array<IFilterObject> = _.cloneDeep(ctrlData.reportFilter);
        _.forEach(controller.filterArray, function (filter, index: number) {
          expect(filter.label).toEqual(reportFilter[index].label);
          expect(filter.id).toEqual(reportFilter[index].id);
          expect(filter.selected).toEqual(reportFilter[index].selected);
        });

        expect(controller.timeOptions).toEqual(altTimeFilter);
        expect(controller.timeSelected).toEqual(altTimeFilter[0]);
        expect(controller.timeUpdates.sliderUpdate).toEqual(jasmine.any(Function));
        expect(controller.timeUpdates.update).toEqual(jasmine.any(Function));
      });
    });

    describe('filter changes', function () {
      it('All graphs should update on time filter changes', function () {
        expect(this.DummySparkDataService.dummyActiveUserData).toHaveBeenCalledTimes(1);
        expect(this.SparkLineReportService.getActiveUserData).toHaveBeenCalledTimes(1);
        controller.timeSelected = altTimeFilter[1];
        controller.timeUpdates.update();
        this.$timeout.flush();
        expect(controller.timeSelected).toEqual(altTimeFilter[1]);

        expect(this.DummySparkDataService.dummyActiveUserData).toHaveBeenCalledTimes(2);
        expect(this.SparkLineReportService.getActiveUserData).toHaveBeenCalledTimes(2);
        expect(this.SparkGraphService.setActiveLineGraph).toHaveBeenCalledTimes(4);
        expect(zoomFunction).toHaveBeenCalledTimes(2);
        expect(this.CardUtils.resize).toHaveBeenCalledTimes(2);

        controller.timeSelected = altTimeFilter[altTimeFilter.length - 1];
        controller.timeUpdates.sliderUpdate(5, 15);
        this.$timeout.flush();
        expect(controller.timeSelected).toEqual(altTimeFilter[altTimeFilter.length - 1]);

        expect(this.DummySparkDataService.dummyActiveUserData).toHaveBeenCalledTimes(2);
        expect(this.SparkLineReportService.getActiveUserData).toHaveBeenCalledTimes(2);
        expect(this.SparkGraphService.setActiveLineGraph).toHaveBeenCalledTimes(5);
        expect(zoomFunction).toHaveBeenCalledTimes(3);
        expect(this.CardUtils.resize).toHaveBeenCalledTimes(3);
      });

      it('should hide or show graphs as expected when changing the activeDropdown selection', function () {
        controller.activeDropdown.selected = activeDropdownArray[1];
        controller.activeDropdown.click();
        expect(this.SparkGraphService.showHideActiveLineGraph).toHaveBeenCalledTimes(3);
      });
    });
  });
});
