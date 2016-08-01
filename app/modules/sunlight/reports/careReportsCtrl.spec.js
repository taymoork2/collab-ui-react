'use strict';

describe('Controller: Care Reports Controller', function () {
  var controller, $scope, $translate, $timeout, SunlightReportService, DummyCareReportService, $q, deferred;
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
  beforeEach(
    inject(function ($rootScope, $controller, _$q_, _$translate_, _$timeout_, _SunlightReportService_, _DummyCareReportService_) {
      $q = _$q_;
      $scope = $rootScope.$new();
      $translate = _$translate_;
      $timeout = _$timeout_;
      SunlightReportService = _SunlightReportService_;
      DummyCareReportService = _DummyCareReportService_;
      deferred = _$q_.defer();
      spyOn(SunlightReportService, 'getReportingData').and.returnValue(deferred.promise);
      spyOn(DummyCareReportService, 'dummyOrgStatsData');
      controller = $controller('CareReportsController', {
        $translate: $translate,
        SunlightReportService: SunlightReportService,
        DummyCareReportService: DummyCareReportService
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
      }, 30);
    });

  });

  describe('CareReportsController - Time Update', function () {
    it('should send options for last week on selection', function () {
      controller.timeSelected = timeOptions[2];
      controller.timeUpdate();
      expect(DummyCareReportService.dummyOrgStatsData.calls.argsFor(0)).toEqual([2]);
      expect(SunlightReportService.getReportingData.calls.argsFor(0)).toEqual(['org_stats', 2, 'chat']);
    });

    it('should send options for last month on selection', function () {
      controller.timeSelected = timeOptions[3];
      controller.timeUpdate();
      expect(DummyCareReportService.dummyOrgStatsData.calls.argsFor(0)).toEqual([3]);
      expect(SunlightReportService.getReportingData.calls.argsFor(0)).toEqual(['org_stats', 3, 'chat']);
    });

    it('should send options for last 3 months on selection', function () {
      controller.timeSelected = timeOptions[4];
      controller.timeUpdate();
      expect(DummyCareReportService.dummyOrgStatsData.calls.argsFor(0)).toEqual([4]);
      expect(SunlightReportService.getReportingData.calls.argsFor(0)).toEqual(['org_stats', 4, 'chat']);
    });
  });
});
