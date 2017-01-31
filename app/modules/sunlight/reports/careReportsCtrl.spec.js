'use strict';

describe('Controller: Care Reports Controller', function () {
  var controller, $q, $scope, $translate, $timeout, CareReportsService, DummyCareReportService, FeatureToggleService,
    Notification, SunlightReportService, deferredReportingData, deferredTableData;
  var timeOptions = [{
    value: 0,
    label: 'careReportsPage.today',
    description: 'careReportsPage.today2',
    intervalText: 'careReportsPage.todayInterval',
    categoryAxisTitle: 'careReportsPage.todayCategoryAxis'
  }, {
    value: 1,
    label: 'careReportsPage.yesterday',
    description: 'careReportsPage.yesterday2',
    intervalText: 'careReportsPage.yesterdayInterval',
    categoryAxisTitle: 'careReportsPage.yesterdayCategoryAxis'
  }, {
    value: 2,
    label: 'careReportsPage.week',
    description: 'careReportsPage.week2',
    intervalText: 'careReportsPage.weekInterval',
    categoryAxisTitle: 'careReportsPage.weekCategoryAxis'
  }, {
    value: 3,
    label: 'careReportsPage.month',
    description: 'careReportsPage.month2',
    intervalText: 'careReportsPage.monthInterval',
    categoryAxisTitle: 'careReportsPage.monthCategoryAxis'
  }, {
    value: 4,
    label: 'careReportsPage.threeMonths',
    description: 'careReportsPage.threeMonths2',
    intervalText: 'careReportsPage.threeMonthsInterval',
    categoryAxisTitle: 'careReportsPage.threeMonthsCategoryAxis'
  }];
  var mediaTypeOptions = [{
    name: 'all',
    label: 'careReportsPage.media_type_all'
  }, {
    name: 'chat',
    label: 'careReportsPage.media_type_chat'
  }, {
    name: 'callback',
    label: 'careReportsPage.media_type_callback'
  }, {
    name: 'voice',
    label: 'careReportsPage.media_type_voice'
  }

  ];
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));
  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue('SunlightConfigService test org')
  };
  beforeEach(
    inject(function ($controller, _$q_, _$translate_, _$timeout_, $rootScope, _CareReportsService_,
      _DummyCareReportService_, _FeatureToggleService_, _Notification_, _SunlightReportService_) {
      $scope = $rootScope.$new();
      $translate = _$translate_;
      $timeout = _$timeout_;
      $q = _$q_;
      SunlightReportService = _SunlightReportService_;
      Notification = _Notification_;
      FeatureToggleService = _FeatureToggleService_;
      DummyCareReportService = _DummyCareReportService_;
      CareReportsService = _CareReportsService_;
      deferredReportingData = _$q_.defer();
      deferredTableData = _$q_.defer();
      spyOn(SunlightReportService, 'getReportingData').and.returnValue(deferredReportingData.promise);
      spyOn(SunlightReportService, 'getAllUsersAggregatedData').and.returnValue(deferredTableData.promise);
      spyOn(DummyCareReportService, 'dummyOrgStatsData');
      spyOn(Notification, 'errorResponse');
      controller = $controller('CareReportsController', {
        $scope: $scope,
        $q: $q,
        $translate: $translate,
        SunlightReportService: SunlightReportService,
        Notification: Notification,
        FeatureToggleService: FeatureToggleService,
        DummyCareReportService: DummyCareReportService,
        CareReportsService: CareReportsService
      });

    })
  );

  afterEach(function () {
    DummyCareReportService.dummyOrgStatsData.calls.reset();
    SunlightReportService.getReportingData.calls.reset();
  });

  describe('CareReportsController - Callback feature enabled', function () {
    it('should default to all contact types', function (done) {
      spyOn(FeatureToggleService, 'atlasCareInboundTrialsGetStatus').and.returnValue($q.resolve(false));
      spyOn(FeatureToggleService, 'atlasCareCallbackTrialsGetStatus').and.returnValue($q.resolve(true));
      $timeout(function () {
        expect(SunlightReportService.getReportingData.calls.argsFor(0)).toEqual(['org_snapshot_stats', 0, 'all', true]);
        expect(controller.mediaTypeOptions[2].name).toEqual('callback');
        done();
      }, 100);
      $timeout.flush();
    });
  });

  describe('CareReportsController - Care Inbound feature enabled', function () {
    it('should default to all contact types', function (done) {
      spyOn(FeatureToggleService, 'atlasCareInboundTrialsGetStatus').and.returnValue($q.resolve(true));
      spyOn(FeatureToggleService, 'atlasCareCallbackTrialsGetStatus').and.returnValue($q.resolve(false));
      $timeout(function () {
        expect(SunlightReportService.getReportingData.calls.argsFor(0)).toEqual(['org_snapshot_stats', 0, 'all', true]);
        expect(controller.mediaTypeOptions[2].name).toEqual('voice');
        done();
      }, 100);
      $timeout.flush();
    });
  });

  describe('CareReportsController - Inbound and Callback disabled', function () {
    it('should default to chat contact type', function (done) {
      spyOn(FeatureToggleService, 'atlasCareInboundTrialsGetStatus').and.returnValue($q.resolve(false));
      spyOn(FeatureToggleService, 'atlasCareCallbackTrialsGetStatus').and.returnValue($q.resolve(false));
      $timeout(function () {
        expect(SunlightReportService.getReportingData.calls.argsFor(0)).toEqual(['org_snapshot_stats', 0, 'chat', true]);
        done();
      }, 100);
      $timeout.flush();
    });
  });


  describe('CareReportsController - Init', function () {
    it('should show five time options', function () {
      expect(controller).toBeDefined();
      expect(controller.timeOptions.length).toEqual(5);
    });

    it('should show two media type options', function () {
      expect(controller.mediaTypeOptions.length).toEqual(2);
    });

    it('should make calls to data services with correct options', function (done) {
      spyOn(FeatureToggleService, 'atlasCareInboundTrialsGetStatus').and.returnValue($q.resolve(false));
      spyOn(FeatureToggleService, 'atlasCareCallbackTrialsGetStatus').and.returnValue($q.resolve(false));
      $timeout(function () {
        expect(DummyCareReportService.dummyOrgStatsData.calls.argsFor(0)).toEqual([0]);
        expect(SunlightReportService.getReportingData.calls.argsFor(0)).toEqual(['org_snapshot_stats', 0, 'chat', true]);
        expect(SunlightReportService.getReportingData.calls.argsFor(1)).toEqual(['org_stats', 0, 'chat']);
        done();
      }, 100);
      $timeout.flush();
    });

    it('should show Today and Task Incoming, Task Aggregate and Average Csat graphs on Init', function () {
      $timeout(function () {
        expect(CareReportsService.showTaskIncomingDummy.calls.argsFor(0)[0]).toEqual('taskIncomingdiv');
        expect(CareReportsService.showAverageCsatDummy.calls.argsFor(0)[0]).toEqual('averageCsatDiv');
        expect(CareReportsService.showTaskAggregateDummy.calls.argsFor(0)[0]).toEqual('taskAggregateDiv');
        expect(CareReportsService.showTaskIncomingGraph.calls.argsFor(0)[0]).toEqual('taskIncomingdiv');
        expect(CareReportsService.showAverageCsatGraph.calls.argsFor(0)[0]).toEqual('averageCsatDiv');
        expect(CareReportsService.showTaskAggregateGraph.calls.argsFor(0)[0]).toEqual('taskAggregateDiv');
        expect(CareReportsService.showTaskTimeDummy).not.toHaveBeenCalled();
        expect(CareReportsService.showTaskTimeGraph).not.toHaveBeenCalled();
      }, 1000);
    });
  });

  describe('CareReportsController - Filters Update', function () {
    it('should send options for last week on selection', function () {
      controller.timeSelected = timeOptions[2];
      controller.mediaTypeSelected = mediaTypeOptions[1];
      controller.filtersUpdate();
      expect(DummyCareReportService.dummyOrgStatsData.calls.argsFor(0)).toEqual([2]);
      expect(SunlightReportService.getReportingData.calls.argsFor(0)).toEqual(['org_stats', 2, 'chat']);
      expect(SunlightReportService.getReportingData.calls.argsFor(1)).not.toEqual(['org_snapshot_stats', 1, 'chat']);

      $timeout(function () {
        expect(CareReportsService.showTaskIncomingDummy.calls.argsFor(0)[0]).toEqual('taskIncomingdiv');
        expect(CareReportsService.showTaskTimeDummy.calls.argsFor(0)[0]).toEqual('taskTimeDiv');
        expect(CareReportsService.showAverageCsatDummy.calls.argsFor(0)[0]).toEqual('averageCsatDiv');
        expect(CareReportsService.showTaskIncomingGraph.calls.argsFor(0)[0]).toEqual('taskIncomingdiv');
        expect(CareReportsService.showTaskTimeGraph.calls.argsFor(0)[0]).toEqual('taskTimeDiv');
        expect(CareReportsService.showAverageCsatGraph.calls.argsFor(0)[0]).toEqual('averageCsatDiv');
        expect(CareReportsService.showTaskAggregateDummy).not.toHaveBeenCalled();
        expect(CareReportsService.showTaskAggregateGraph).not.toHaveBeenCalled();
      }, 100);
    });

    it('should send options for last month on selection', function () {
      controller.timeSelected = timeOptions[3];
      controller.mediaTypeSelected = mediaTypeOptions[0];
      controller.filtersUpdate();
      expect(DummyCareReportService.dummyOrgStatsData.calls.argsFor(0)).toEqual([3]);
      expect(SunlightReportService.getReportingData.calls.argsFor(0)).toEqual(['org_stats', 3, 'all']);
      expect(SunlightReportService.getReportingData.calls.argsFor(1)).not.toEqual(['org_snapshot_stats', 1, 'all']);
    });

    it('should send options for last 3 months on selection', function () {
      controller.timeSelected = timeOptions[4];
      controller.mediaTypeSelected = mediaTypeOptions[2];
      controller.filtersUpdate();
      expect(DummyCareReportService.dummyOrgStatsData.calls.argsFor(0)).toEqual([4]);
      expect(SunlightReportService.getReportingData.calls.argsFor(0)).toEqual(['org_stats', 4, 'callback']);
      expect(SunlightReportService.getReportingData.calls.argsFor(1)).not.toEqual(['org_snapshot_stats', 1, 'callback']);
    });
  });

  describe('CareReportsController - Show Drill-down table data', function () {
    var notCalled = function () { fail('Callback function call unexpected.'); };
    var dummyStats = getJSONFixture('sunlight/json/features/careReport/sunlightReportStats.json');
    var allUserFifteenMinutesStats = dummyStats.reportUsersFifteenMinutesStats;
    var ciUserStats = dummyStats.ciUserStats;

    it('should fetch drill-down data on clicking show', function (done) {
      controller.timeSelected = timeOptions[0];
      controller.mediaTypeSelected = mediaTypeOptions[1];
      var testOnSuccess = function (data) {
        expect(data).toBeDefined();
        done();
      };
      controller.showTable(testOnSuccess, notCalled);
      expect(SunlightReportService.getAllUsersAggregatedData.calls.argsFor(0)).toEqual(['all_user_stats', 0, 'chat']);
      deferredReportingData.resolve(allUserFifteenMinutesStats.data);
      deferredTableData.resolve(ciUserStats);
      $scope.$digest();
    });

    it('should piggy-back on existing promise, if present ', function (done) {
      controller.timeSelected = timeOptions[0];
      controller.mediaTypeSelected = mediaTypeOptions[1];
      var data1 = null;
      var testOnSuccess = function (data) {
        expect(data).toBeDefined();
        data1 = data;
      };
      controller.showTable(testOnSuccess, notCalled);
      expect(SunlightReportService.getAllUsersAggregatedData.calls.argsFor(0)).toEqual(['all_user_stats', 0, 'chat']);
      deferredReportingData.resolve(allUserFifteenMinutesStats.data);
      deferredTableData.resolve(ciUserStats);
      $scope.$digest();

      var testOnSuccess2 = function (data) {
        expect(data).toEqual(data1);
        done();
      };
      controller.showTable(testOnSuccess2, notCalled);
      $scope.$digest();
    });

    it('should use existing table data, if already available', function (done) {
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
      controller.showTable(testOnSuccess, notCalled);
      $scope.$digest();
    });

    it('should fetch data afresh, if media type or time filters are updated', function (done) {

      controller.tableData = [{ name: 'Test User' }];
      controller.tableDataStatus = 'set';
      controller.tableDataPromise = undefined;

      controller.timeSelected = timeOptions[2];
      controller.mediaTypeSelected = mediaTypeOptions[0];
      controller.filtersUpdate();

      var testOnSuccess = function (data) {
        expect(data).not.toEqual([{ name: 'Test User' }]);
        done();
      };
      controller.showTable(testOnSuccess, notCalled);
      expect(SunlightReportService.getAllUsersAggregatedData.calls.argsFor(0)).toEqual(['all_user_stats', 2, 'all']);
      deferredReportingData.resolve(allUserFifteenMinutesStats.data);
      deferredTableData.resolve(ciUserStats);
      $scope.$digest();
    });

    it('should call error callback of drill-down data on error', function (done) {
      controller.timeSelected = timeOptions[3];
      controller.mediaTypeSelected = mediaTypeOptions[2];
      var testOnError = function (err) {
        expect(err).toEqual('testError');
        done();
      };
      controller.showTable(notCalled, testOnError);
      expect(SunlightReportService.getAllUsersAggregatedData.calls.argsFor(0)).toEqual(['all_user_stats', 3, 'callback']);
      deferredReportingData.resolve(allUserFifteenMinutesStats.data);
      deferredTableData.reject('testError');
      $scope.$digest();
    });
  });

  describe('CareReportsController - Filters Update Errors', function () {

    var failureResponse = {
      'status': 500,
      'statusText': 'Intenal Server Error'
    };

    it('should notify with error toaster on failure for yesterday', function (done) {
      deferredReportingData.reject();
      $scope.$apply();
      controller.timeSelected = timeOptions[0];
      controller.mediaTypeSelected = mediaTypeOptions[1];
      controller.filtersUpdate().catch(function () {
        expect(Notification.errorResponse).toHaveBeenCalledWith(failureResponse, jasmine.any(String), { dataType: 'Customer Satisfaction' });
        expect(Notification.errorResponse).toHaveBeenCalledWith(failureResponse, jasmine.any(String), { dataType: 'Contact Time Measure' });
        expect(Notification.errorResponse).toHaveBeenCalledWith(failureResponse, jasmine.any(String), { dataType: 'Total Completed Contacts' });
      }).finally(done());
    });

    it('should notify with error toaster on failure for today', function (done) {
      deferredReportingData.reject();
      $scope.$apply();
      controller.timeSelected = timeOptions[0];
      controller.mediaTypeSelected = mediaTypeOptions[1];
      controller.filtersUpdate().catch(function () {
        expect(Notification.errorResponse).toHaveBeenCalledWith(failureResponse, jasmine.any(String), { dataType: 'Customer Satisfaction' });
        expect(Notification.errorResponse).toHaveBeenCalledWith(failureResponse, jasmine.any(String), { dataType: 'Aggregated Contacts' });
        expect(Notification.errorResponse).toHaveBeenCalledWith(failureResponse, jasmine.any(String), { dataType: 'Total Completed Contacts' });
      }).finally(done());
    });
  });
});
