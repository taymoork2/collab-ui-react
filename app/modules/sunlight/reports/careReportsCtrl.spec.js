'use strict';

describe('Controller: Care Reports Controller', function () {
  var controller, $scope, $translate, $timeout, CareReportsService, DummyCareReportService, Notification, SunlightReportService, deferred;
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
      _DummyCareReportService_, _Notification_, _SunlightReportService_) {
      $scope = $rootScope.$new();
      $translate = _$translate_;
      $timeout = _$timeout_;
      SunlightReportService = _SunlightReportService_;
      Notification = _Notification_;
      DummyCareReportService = _DummyCareReportService_;
      CareReportsService = _CareReportsService_;
      deferred = _$q_.defer();
      spyOn(SunlightReportService, 'getReportingData').and.returnValue(deferred.promise);
      spyOn(DummyCareReportService, 'dummyOrgStatsData');
      spyOn(Notification, 'errorResponse');
      controller = $controller('CareReportsController', {
        $translate: $translate,
        SunlightReportService: SunlightReportService,
        Notification: Notification,
        DummyCareReportService: DummyCareReportService,
        CareReportsService: CareReportsService
      });

    })
  );

  afterEach(function () {
    DummyCareReportService.dummyOrgStatsData.calls.reset();
    SunlightReportService.getReportingData.calls.reset();
  });

  describe('CareReportsController - Init', function () {

    it('should show five time options', function () {
      expect(controller).toBeDefined();
      expect(controller.timeOptions.length).toEqual(5);
    });

    it('should make calls to data services with correct options', function () {
      $timeout(function () {
        expect(DummyCareReportService.dummyOrgStatsData.calls.argsFor(0)).toEqual([1]);
        expect(SunlightReportService.getReportingData.calls.argsFor(0)).toEqual(['org_stats', 1, 'chat']);
        expect(SunlightReportService.getReportingData.calls.argsFor(1)).toEqual(['org_snapshot_stats', 1, 'chat']);
      }, 1000);
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

  describe('CareReportsController - Time Update', function () {
    it('should send options for last week on selection', function () {
      controller.timeSelected = timeOptions[2];
      controller.timeUpdate();
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
      controller.timeUpdate();
      expect(DummyCareReportService.dummyOrgStatsData.calls.argsFor(0)).toEqual([3]);
      expect(SunlightReportService.getReportingData.calls.argsFor(0)).toEqual(['org_stats', 3, 'chat']);
      expect(SunlightReportService.getReportingData.calls.argsFor(1)).not.toEqual(['org_snapshot_stats', 1, 'chat']);
    });

    it('should send options for last 3 months on selection', function () {
      controller.timeSelected = timeOptions[4];
      controller.timeUpdate();
      expect(DummyCareReportService.dummyOrgStatsData.calls.argsFor(0)).toEqual([4]);
      expect(SunlightReportService.getReportingData.calls.argsFor(0)).toEqual(['org_stats', 4, 'chat']);
      expect(SunlightReportService.getReportingData.calls.argsFor(1)).not.toEqual(['org_snapshot_stats', 1, 'chat']);
    });
  });

  describe('CareReportsController - Time Update', function () {

    var failureResponse = {
      'status': 500,
      'statusText': 'Intenal Server Error'
    };

    it('should notify with error toaster on failure for yesterday', function (done) {
      deferred.reject();
      $scope.$apply();
      controller.timeSelected = timeOptions[0];
      controller.timeUpdate().catch(function () {
        expect(Notification.errorResponse).toHaveBeenCalledWith(failureResponse, jasmine.any(String), { dataType: 'Customer Satisfaction' });
        expect(Notification.errorResponse).toHaveBeenCalledWith(failureResponse, jasmine.any(String), { dataType: 'Contact Time Measure' });
        expect(Notification.errorResponse).toHaveBeenCalledWith(failureResponse, jasmine.any(String), { dataType: 'Total Completed Contacts' });
      }).finally(done());
    });

    it('should notify with error toaster on failure for today', function (done) {
      deferred.reject();
      $scope.$apply();
      controller.timeSelected = timeOptions[0];
      controller.timeUpdate().catch(function () {
        expect(Notification.errorResponse).toHaveBeenCalledWith(failureResponse, jasmine.any(String), { dataType: 'Customer Satisfaction' });
        expect(Notification.errorResponse).toHaveBeenCalledWith(failureResponse, jasmine.any(String), { dataType: 'Aggregated Contacts' });
        expect(Notification.errorResponse).toHaveBeenCalledWith(failureResponse, jasmine.any(String), { dataType: 'Total Completed Contacts' });
      }).finally(done());
    });

  });
});
