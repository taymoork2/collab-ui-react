'use strict';

describe('Controller: Care Reports Controller', function () {
  var controller, $q, $scope, $translate, $timeout, CareReportsService, DummyCareReportService, FeatureToggleService,
    Notification, SunlightReportService, deferredReportingData, deferredTableData, deferredFeatureToggle,
    DrillDownReportProps, SunlightConfigService, deferredChatConfig;

  var timeOptions = [{
    value: 0,
    label: 'careReportsPage.today',
    description: 'careReportsPage.today2',
    intervalText: 'careReportsPage.todayInterval',
    categoryAxisTitle: 'careReportsPage.todayCategoryAxis',
  }, {
    value: 1,
    label: 'careReportsPage.yesterday',
    description: 'careReportsPage.yesterday2',
    intervalText: 'careReportsPage.yesterdayInterval',
    categoryAxisTitle: 'careReportsPage.yesterdayCategoryAxis',
  }, {
    value: 2,
    label: 'careReportsPage.week',
    description: 'careReportsPage.week2',
    intervalText: 'careReportsPage.weekInterval',
    categoryAxisTitle: 'careReportsPage.weekCategoryAxis',
  }, {
    value: 3,
    label: 'careReportsPage.month',
    description: 'careReportsPage.month2',
    intervalText: 'careReportsPage.monthInterval',
    categoryAxisTitle: 'careReportsPage.monthCategoryAxis',
  }, {
    value: 4,
    label: 'careReportsPage.threeMonths',
    description: 'careReportsPage.threeMonths2',
    intervalText: 'careReportsPage.threeMonthsInterval',
    categoryAxisTitle: 'careReportsPage.threeMonthsCategoryAxis',
  }];
  var mediaTypeOptions = [{
    name: 'all',
    label: 'careReportsPage.media_type_all',
  }, {
    name: 'chat',
    label: 'careReportsPage.media_type_chat',
  }, {
    name: 'callback',
    label: 'careReportsPage.media_type_callback',
  }, {
    name: 'voice',
    label: 'careReportsPage.media_type_voice',
  }, {
    name: 'webcall',
    label: 'careReportsPage.media_type_webcall',
  },

  ];
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', spiedAuthinfo);
  }));
  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue('SunlightConfigService test org'),
  };
  beforeEach(
    inject(function ($controller, _$q_, _$translate_, _$timeout_, $rootScope, _CareReportsService_,
      _DummyCareReportService_, _FeatureToggleService_, _Notification_, _SunlightReportService_, _DrillDownReportProps_, _SunlightConfigService_) {
      $scope = $rootScope.$new();
      $translate = _$translate_;
      $timeout = _$timeout_;
      $q = _$q_;
      SunlightReportService = _SunlightReportService_;
      Notification = _Notification_;
      FeatureToggleService = _FeatureToggleService_;
      DummyCareReportService = _DummyCareReportService_;
      CareReportsService = _CareReportsService_;
      DrillDownReportProps = _DrillDownReportProps_;
      SunlightConfigService = _SunlightConfigService_;

      deferredReportingData = _$q_.defer();
      deferredTableData = _$q_.defer();
      deferredFeatureToggle = _$q_.defer();
      deferredChatConfig = _$q_.defer();
      spyOn(SunlightReportService, 'getReportingData').and.returnValue(deferredReportingData.promise);
      spyOn(SunlightReportService, 'getAllUsersAggregatedData').and.returnValue(deferredTableData.promise);
      spyOn(DrillDownReportProps, 'taskIncomingDrilldownProps');
      spyOn(DrillDownReportProps, 'avgCsatDrilldownProps');
      spyOn(DrillDownReportProps, 'taskTimeDrilldownProps');
      spyOn(DummyCareReportService, 'dummyOrgStatsData');
      spyOn(Notification, 'errorResponse');
      spyOn(FeatureToggleService, 'atlasCareChatToVideoTrialsGetStatus').and.returnValue(deferredFeatureToggle.promise);
      spyOn(FeatureToggleService, 'atlasCareWebcallReportTrialsGetStatus').and.returnValue(deferredFeatureToggle.promise);
      Object.keys(CareReportsService).forEach(function (key) {
        spyOn(CareReportsService, key).and.returnValue([{}, {}]);
      });
      spyOn(SunlightConfigService, 'getChatConfig').and.returnValue(deferredChatConfig.promise);
      controller = $controller('CareReportsController', {
        $scope: $scope,
        $q: $q,
        $translate: $translate,
        SunlightReportService: SunlightReportService,
        Notification: Notification,
        FeatureToggleService: FeatureToggleService,
        DummyCareReportService: DummyCareReportService,
        CareReportsService: CareReportsService,
        DrillDownReportProps: DrillDownReportProps,
        SunlightConfigService: SunlightConfigService,
      });
    })
  );

  afterEach(function () {
    DummyCareReportService.dummyOrgStatsData.calls.reset();
    SunlightReportService.getReportingData.calls.reset();
    SunlightReportService.getAllUsersAggregatedData.calls.reset();
    $scope = $translate = $timeout = $q = SunlightReportService = Notification = FeatureToggleService = DummyCareReportService =
      CareReportsService = deferredReportingData = deferredTableData = deferredFeatureToggle = controller = deferredChatConfig = undefined;
  });

  afterAll(function () {
    timeOptions = mediaTypeOptions = spiedAuthinfo = undefined;
  });

  function verifyDummyDataTitle() {
    expect(CareReportsService.showTaskIncomingDummy.calls.argsFor(0)[4]).toBeUndefined();
    expect(CareReportsService.showTaskOfferedDummy.calls.argsFor(0)[3]).toBeUndefined();
    expect(CareReportsService.showAverageCsatDummy.calls.argsFor(0)[4]).toBeUndefined();
    expect(CareReportsService.showTaskAggregateDummy.calls.argsFor(0)[3]).toBeUndefined();
    expect(CareReportsService.showTaskTimeDummy.calls.argsFor(0)[4]).toBeUndefined();
  }

  function verifyRealDataTitle(title, isToday) {
    expect(CareReportsService.showTaskIncomingGraph.calls.argsFor(0)[4]).toEqual(title);
    expect(CareReportsService.showTaskOfferedGraph.calls.argsFor(0)[3]).toEqual(title);
    expect(CareReportsService.showAverageCsatGraph.calls.argsFor(0)[4]).toEqual(title);
    expect(CareReportsService.showTaskTimeGraph.calls.argsFor(0)[4]).toEqual(title);

    if (isToday) {
      expect(CareReportsService.showTaskAggregateGraph.calls.argsFor(0)[3]).toEqual(title);
    }
  }

  function verifyDummyData() {
    expect(CareReportsService.showTaskIncomingDummy.calls.argsFor(0)[0]).toEqual('taskIncomingdiv');
    expect(CareReportsService.showTaskOfferedDummy.calls.argsFor(0)[0]).toEqual('taskOffereddiv');
    expect(CareReportsService.showAverageCsatDummy.calls.argsFor(0)[0]).toEqual('averageCsatDiv');
    expect(CareReportsService.showTaskAggregateDummy.calls.argsFor(0)[0]).toEqual('taskAggregateDiv');
    expect(CareReportsService.showTaskTimeDummy.calls.argsFor(0)[0]).toEqual('taskTimeDiv');

    expect(CareReportsService.showTaskIncomingDummy.calls.argsFor(0)[1]).toEqual('taskIncomingBreakdownDiv');
    expect(CareReportsService.showAverageCsatDummy.calls.argsFor(0)[1]).toEqual('averageCsatBreakdownDiv');
    expect(CareReportsService.showTaskTimeDummy.calls.argsFor(0)[1]).toEqual('taskTimeBreakdownDiv');
  }

  function verifyRealData(isToday) {
    expect(CareReportsService.showTaskIncomingGraph.calls.argsFor(0)[0]).toEqual('taskIncomingdiv');
    expect(CareReportsService.showTaskOfferedGraph.calls.argsFor(0)[0]).toEqual('taskOffereddiv');
    expect(CareReportsService.showAverageCsatGraph.calls.argsFor(0)[0]).toEqual('averageCsatDiv');
    expect(CareReportsService.showTaskTimeGraph.calls.argsFor(0)[0]).toEqual('taskTimeDiv');

    expect(CareReportsService.showTaskIncomingGraph.calls.argsFor(0)[1]).toEqual('taskIncomingBreakdownDiv');
    expect(CareReportsService.showAverageCsatGraph.calls.argsFor(0)[1]).toEqual('averageCsatBreakdownDiv');
    expect(CareReportsService.showTaskTimeGraph.calls.argsFor(0)[1]).toEqual('taskTimeBreakdownDiv');
    if (isToday) {
      expect(CareReportsService.showTaskAggregateGraph.calls.argsFor(0)[0]).toEqual('taskAggregateDiv');
    }
  }

  describe('CareReportsController - Init', function () {
    it('should show five time options', function () {
      expect(controller).toBeDefined();
      expect(controller.timeOptions.length).toEqual(5);
    });

    it('should show two media type options', function () {
      expect(controller.mediaTypeOptions.length).toEqual(4);
    });

    it('should make calls to data services with correct options', function () {
      deferredFeatureToggle.resolve(false);
      deferredChatConfig.resolve({
        data: { videoCallEnabled: true },
      });
      $scope.$digest();
      $timeout.flush();
      expect(controller.mediaTypeOptions.length).toEqual(4);
      expect(controller.isVideoFeatureEnabled).toEqual(false);
      expect(DummyCareReportService.dummyOrgStatsData.calls.argsFor(0)).toEqual([0]);
      expect(SunlightReportService.getReportingData.calls.argsFor(0)).toEqual(['org_snapshot_stats', 0, 'chat', true]);
      expect(SunlightReportService.getReportingData.calls.argsFor(1)).toEqual(['org_stats', 0, 'chat']);
    });

    it('should make calls to data services with correct options when feature flags are true', function () {
      deferredFeatureToggle.resolve(true);
      deferredChatConfig.resolve({
        data: { videoCallEnabled: true },
      });
      $scope.$digest();
      $timeout.flush();
      expect(controller.mediaTypeOptions.length).toEqual(5);
      expect(controller.isVideoFeatureEnabled).toEqual(true);
      expect(DummyCareReportService.dummyOrgStatsData.calls.argsFor(0)).toEqual([0]);
      expect(SunlightReportService.getReportingData.calls.argsFor(0)).toEqual(['org_snapshot_stats', 0, 'chat', true]);
      expect(SunlightReportService.getReportingData.calls.argsFor(1)).toEqual(['org_stats', 0, 'chat']);
    });

    it('should show Today and Task Incoming, Task Aggregate and Average Csat graphs on Init', function () {
      deferredFeatureToggle.resolve(false);
      deferredChatConfig.resolve({
        data: { videoCallEnabled: true },
      });
      $scope.$digest();
      $timeout.flush();
      verifyDummyData();
      deferredReportingData.resolve([{}, {}]); $scope.$digest();
      verifyRealData(true);
    });
  });

  describe('CareReportsController - Graph title', function () {
    it('should set title for dummydata as empty and todays date for actual data', function () {
      var title = moment().format('MMM D');
      deferredFeatureToggle.resolve(false);
      deferredChatConfig.resolve({
        data: { videoCallEnabled: true },
      });
      $scope.$digest();
      $timeout.flush();
      verifyDummyDataTitle();
      deferredReportingData.resolve([{}, {}]); $scope.$digest();
      verifyRealDataTitle(title, true);
    });

    it('should set title for dummydata as empty and Yesterdays date for actual data', function () {
      controller.timeSelected = timeOptions[1];
      var title = (moment().subtract(1, 'days').format('MMM D'));

      deferredFeatureToggle.resolve(false);
      deferredChatConfig.resolve({
        data: { videoCallEnabled: true },
      });
      $scope.$digest();
      $timeout.flush();
      verifyDummyDataTitle();
      deferredReportingData.resolve([{}, {}]); $scope.$digest();
      verifyRealDataTitle(title);
    });

    it('should set title for dummydata as empty and undefined for actual data when time selected is not today or yesterday', function () {
      var randomIndex = Math.floor((Math.random() * 3) + 2);
      controller.timeSelected = timeOptions[randomIndex];
      deferredFeatureToggle.resolve(false);
      deferredChatConfig.resolve({
        data: { videoCallEnabled: true },
      });
      $scope.$digest();
      $timeout.flush();
      verifyDummyDataTitle();
      deferredReportingData.resolve([{}, {}]); $scope.$digest();
      verifyRealDataTitle();
    });
  });


  describe('CareReportsController - Filters Update', function () {
    it('should send options for last week on selection', function () {
      controller.timeSelected = timeOptions[2];
      controller.mediaTypeSelected = mediaTypeOptions[1];

      deferredFeatureToggle.resolve(false);
      deferredChatConfig.resolve({
        data: { videoCallEnabled: true },
      });
      $scope.$digest();
      $timeout.flush();
      expect(DummyCareReportService.dummyOrgStatsData.calls.argsFor(0)).toEqual([2]);
      expect(SunlightReportService.getReportingData.calls.argsFor(0)).toEqual(['org_stats', 2, 'chat']);
      expect(SunlightReportService.getReportingData.calls.argsFor(1)).not.toEqual(['org_snapshot_stats', 1, 'chat']);
      verifyDummyData();
      deferredReportingData.resolve([{}, {}]); $scope.$digest();
      verifyRealData();
      expect(CareReportsService.showTaskAggregateGraph).not.toHaveBeenCalled();
    });

    it('should send options for last month on selection', function () {
      controller.timeSelected = timeOptions[3];
      controller.mediaTypeSelected = mediaTypeOptions[0];
      controller.mediaTypeSelected.label = 'All Tasks';
      controller.filtersUpdate();
      $timeout.flush();
      expect(DummyCareReportService.dummyOrgStatsData.calls.argsFor(0)).toEqual([3]);
      expect(SunlightReportService.getReportingData.calls.argsFor(0)).toEqual(['org_stats', 3, 'all']);
      expect(SunlightReportService.getReportingData.calls.argsFor(1)).not.toEqual(['org_snapshot_stats', 1, 'all']);
    });

    it('should send options for last 3 months on selection', function () {
      controller.timeSelected = timeOptions[4];
      controller.mediaTypeSelected = mediaTypeOptions[2];
      controller.filtersUpdate();
      $timeout.flush();
      expect(DummyCareReportService.dummyOrgStatsData.calls.argsFor(0)).toEqual([4]);
      expect(SunlightReportService.getReportingData.calls.argsFor(0)).toEqual(['org_stats', 4, 'callback']);
      expect(SunlightReportService.getReportingData.calls.argsFor(1)).not.toEqual(['org_snapshot_stats', 1, 'callback']);
    });

    it('should send options for last 3 months on selection for video calls / webcall media type', function () {
      controller.timeSelected = timeOptions[4];
      controller.mediaTypeSelected = mediaTypeOptions[4];
      controller.filtersUpdate();
      $timeout.flush();
      expect(DummyCareReportService.dummyOrgStatsData.calls.argsFor(0)).toEqual([4]);
      expect(SunlightReportService.getReportingData.calls.argsFor(0)).toEqual(['org_stats', 4, 'webcall']);
      expect(SunlightReportService.getReportingData.calls.argsFor(1)).not.toEqual(['org_snapshot_stats', 1, 'webcall']);
    });
  });

  describe('CareReportsController - Show Drill-down table data', function () {
    var notCalled = function (err) { fail('Callback function call unexpected. ' + JSON.stringify(err)); };
    var dummyStats = getJSONFixture('sunlight/json/features/careReport/sunlightReportStats.json');
    var allUserFifteenMinutesStats = dummyStats.reportUsersFifteenMinutesStats;

    afterAll(function () {
      notCalled = dummyStats = allUserFifteenMinutesStats = undefined;
    });

    it('should fetch drill-down data on clicking show', function (done) {
      controller.timeSelected = timeOptions[0];
      controller.mediaTypeSelected = mediaTypeOptions[1];
      controller.filtersUpdate();
      $timeout.flush();
      var testOnSuccess = function (data) {
        expect(data).toBeDefined();
        done();
      };
      controller.showTable(testOnSuccess, notCalled, controller.mediaTypeSelected, controller.timeSelected);
      expect(SunlightReportService.getAllUsersAggregatedData.calls.argsFor(0)).toEqual(['all_user_stats', 0, 'chat']);
      deferredTableData.resolve({
        data: allUserFifteenMinutesStats.data,
        isWebcallDataPresent: {},
      });
      $scope.$digest();
    });

    it('should fetch drill-down data on clicking show for webcall media type', function (done) {
      controller.timeSelected = timeOptions[0];
      controller.mediaTypeSelected = mediaTypeOptions[4];
      controller.filtersUpdate();
      $timeout.flush();
      var testOnSuccess = function (data) {
        expect(data).toBeDefined();
        done();
      };
      controller.showTable(testOnSuccess, notCalled, controller.mediaTypeSelected, controller.timeSelected);
      expect(SunlightReportService.getAllUsersAggregatedData.calls.argsFor(0)).toEqual(['all_user_stats', 0, 'webcall']);
      deferredTableData.resolve({
        data: allUserFifteenMinutesStats.data,
        isWebcallDataPresent: {},
      });
      $scope.$digest();
    });

    it('should piggy-back on existing promise, if present ', function () {
      controller.timeSelected = timeOptions[0];
      controller.mediaTypeSelected = mediaTypeOptions[1];
      controller.filtersUpdate();
      $timeout.flush();
      var data1 = null;
      var testOnSuccess = function (data) {
        expect(data).toBeDefined();
        data1 = data;
      };
      controller.showTable(testOnSuccess, notCalled, controller.mediaTypeSelected, controller.timeSelected);
      expect(SunlightReportService.getAllUsersAggregatedData.calls.argsFor(0)).toEqual(['all_user_stats', 0, 'chat']);
      deferredTableData.resolve({
        data: allUserFifteenMinutesStats.data,
        isWebcallDataPresent: {},
      });

      var testOnSuccess2 = function (data) {
        expect(data).toEqual(data1);
      };
      controller.showTable(testOnSuccess2, notCalled, controller.mediaTypeSelected, controller.timeSelected);
      $scope.$digest();
    });

    xit('should use existing table data, if already available', function (done) {
      controller.tableData = [{ name: 'Test User' }];
      controller.tableDataStatus = 'set';
      controller.tableDataPromise = undefined;

      controller.timeSelected = timeOptions[0];
      controller.mediaTypeSelected = mediaTypeOptions[1];
      var testOnSuccess = function (data) {
        expect(data).toEqual([{ name: 'Test User' }]);
        expect(SunlightReportService.getAllUsersAggregatedData).not.toHaveBeenCalled();
        done();
      };
      controller.showTable(testOnSuccess, notCalled, controller.mediaTypeSelected, controller.timeSelected);
      $scope.$digest();
    });

    it('should ignore dirty data, if media type or time filters are updated', function (done) {
      controller.timeSelected = timeOptions[2];
      controller.mediaTypeSelected = mediaTypeOptions[0];
      controller.mediaTypeSelected.label = 'All Tasks';
      controller.filtersUpdate();
      $timeout.flush();

      var testOnError = function (err) {
        expect(_.get(err, 'reason')).toEqual('filtersChanged');
        done();
      };

      controller.showTable(notCalled, testOnError, controller.mediaTypeSelected, controller.timeSelected);
      expect(SunlightReportService.getAllUsersAggregatedData.calls.argsFor(0)).toEqual(['all_user_stats', 2, 'all']);

      controller.timeSelected = timeOptions[1];
      controller.mediaTypeSelected = mediaTypeOptions[1];
      controller.filtersUpdate();
      $timeout.flush();
      deferredTableData.resolve({
        data: allUserFifteenMinutesStats.data,
        isWebcallDataPresent: {},
      });
      $scope.$digest();
    });

    it('should fetch data afresh, if media type or time filters are updated', function (done) {
      controller.tableData = [{ name: 'Test User' }];
      controller.tableDataStatus = 'set';
      controller.tableDataPromise = undefined;

      controller.timeSelected = timeOptions[2];
      controller.mediaTypeSelected = mediaTypeOptions[0];
      controller.mediaTypeSelected.label = 'All Tasks';
      controller.filtersUpdate();
      $timeout.flush();

      var testOnSuccess = function (data) {
        expect(data).not.toEqual([{ name: 'Test User' }]);
        done();
      };
      controller.showTable(testOnSuccess, notCalled, controller.mediaTypeSelected, controller.timeSelected);
      expect(SunlightReportService.getAllUsersAggregatedData.calls.argsFor(0)).toEqual(['all_user_stats', 2, 'all']);
      deferredTableData.resolve({
        data: allUserFifteenMinutesStats.data,
        isWebcallDataPresent: {},
      });
      $scope.$digest();
    });

    it('should call error callback of drill-down data on error', function (done) {
      controller.timeSelected = timeOptions[3];
      controller.mediaTypeSelected = mediaTypeOptions[2];
      var testOnError = function (err) {
        expect(err).toEqual('testError');
        done();
      };
      controller.showTable(notCalled, testOnError, controller.mediaTypeSelected, controller.timeSelected);
      expect(SunlightReportService.getAllUsersAggregatedData.calls.argsFor(0)).toEqual(['all_user_stats', 3, 'callback']);
      deferredTableData.reject('testError');
      $scope.$digest();
    });
  });

  describe('CareReportsController - Filters Update Errors', function () {
    var failureResponse = {
      status: 500,
      statusText: 'Intenal Server Error',
    };

    afterAll(function () {
      failureResponse = undefined;
    });

    it('should notify with error toaster on failure for yesterday', function () {
      deferredReportingData.reject(failureResponse);
      $scope.$apply();
      controller.timeSelected = timeOptions[0];
      controller.mediaTypeSelected = mediaTypeOptions[1];
      controller.filtersUpdate();
      $timeout.flush();
      expect(Notification.errorResponse).toHaveBeenCalledWith(failureResponse, 'careReportsPage.taskDataGetError');
      expect(Notification.errorResponse).toHaveBeenCalledWith(failureResponse, 'careReportsPage.taskDataGetError');
      expect(Notification.errorResponse).toHaveBeenCalledWith(failureResponse, 'careReportsPage.taskDataGetError');
      expect(Notification.errorResponse).toHaveBeenCalledWith(failureResponse, 'careReportsPage.taskDataGetError');
    });

    it('should notify with error toaster on failure for today', function () {
      deferredReportingData.reject(failureResponse);
      $scope.$apply();
      controller.timeSelected = timeOptions[0];
      controller.mediaTypeSelected = mediaTypeOptions[1];
      controller.filtersUpdate();
      $timeout.flush();
      expect(Notification.errorResponse).toHaveBeenCalledWith(failureResponse, 'careReportsPage.taskDataGetError');
      expect(Notification.errorResponse).toHaveBeenCalledWith(failureResponse, 'careReportsPage.taskDataGetError');
      expect(Notification.errorResponse).toHaveBeenCalledWith(failureResponse, 'careReportsPage.taskDataGetError');
      expect(Notification.errorResponse).toHaveBeenCalledWith(failureResponse, 'careReportsPage.taskDataGetError');
    });
  });

  describe('Display of chat to video reports', function () {
    function setInitFlags(videoCallEnabled, mediaType) {
      deferredFeatureToggle.resolve(true);
      deferredChatConfig.resolve({
        data: { videoCallEnabled: videoCallEnabled },
      });
      $scope.$digest();
      $timeout.flush();
      controller.mediaTypeSelected = {
        name: mediaType,
      };
    }

    it('selectced mediaType is non chat', function () {
      setInitFlags(true, 'callback');
      expect(controller.shouldVideoDrillDownBeDisplayed(false)).toBe(false);
      controller.shouldDisplayBreakdown({});
      expect(controller.showChartWithoutBreakdown.taskIncoming).toBe(true);
      expect(controller.showChartWithoutBreakdown.avgCsat).toBe(true);
      expect(controller.showChartWithoutBreakdown.taskTime).toBe(true);
    });

    it('selectced mediaType chat, chat-to-video is enabled and data is present', function () {
      setInitFlags(true, 'chat');
      expect(controller.shouldVideoDrillDownBeDisplayed(true)).toBe(true);
      controller.shouldDisplayBreakdown({
        isNumHandledTaskPresent: true, isAvgCSATPresent: true, isAvgHandleTimePresent: true,
      });
      expect(controller.showChartWithoutBreakdown.taskIncoming).toBe(false);
      expect(controller.showChartWithoutBreakdown.avgCsat).toBe(false);
      expect(controller.showChartWithoutBreakdown.taskTime).toBe(false);
    });

    it('selectced mediaType chat, chat-to-video is enabled and data is not present', function () {
      setInitFlags(true, 'chat');
      expect(controller.shouldVideoDrillDownBeDisplayed(false)).toBe(true);
      controller.shouldDisplayBreakdown({
        isNumHandledTaskPresent: false, isAvgCSATPresent: false, isAvgHandleTimePresent: false,
      });
      expect(controller.showChartWithoutBreakdown.taskIncoming).toBe(false);
      expect(controller.showChartWithoutBreakdown.avgCsat).toBe(false);
      expect(controller.showChartWithoutBreakdown.taskTime).toBe(false);
    });

    it('selectced mediaType chat, chat-to-video is disabled and data is not present', function () {
      setInitFlags(false, 'chat');
      expect(controller.shouldVideoDrillDownBeDisplayed(false)).toBe(false);
      controller.shouldDisplayBreakdown({
        isNumHandledTaskPresent: false, isAvgCSATPresent: false, isAvgHandleTimePresent: false,
      });
      expect(controller.showChartWithoutBreakdown.taskIncoming).toBe(true);
      expect(controller.showChartWithoutBreakdown.avgCsat).toBe(true);
      expect(controller.showChartWithoutBreakdown.taskTime).toBe(true);
    });

    it('selectced mediaType chat, chat-to-video is disabled and data is present', function () {
      setInitFlags(false, 'chat');
      expect(controller.shouldVideoDrillDownBeDisplayed(true)).toBe(true);
      controller.shouldDisplayBreakdown({
        isNumHandledTaskPresent: true, isAvgCSATPresent: true, isAvgHandleTimePresent: true,
      });
      expect(controller.showChartWithoutBreakdown.taskIncoming).toBe(false);
      expect(controller.showChartWithoutBreakdown.avgCsat).toBe(false);
      expect(controller.showChartWithoutBreakdown.taskTime).toBe(false);
    });
  });
});
