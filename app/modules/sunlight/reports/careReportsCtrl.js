(function () {
  'use strict';

  angular.module('Sunlight').controller('CareReportsController', CareReportsController);
  /* @ngInject */
  function CareReportsController($timeout, $translate, CardUtils, CareReportsService, DummyCareReportService, FeatureToggleService, Notification, ReportConstants, SunlightReportService) {
    var vm = this;
    var REFRESH = 'refresh';
    var SET = 'set';
    var EMPTY = 'empty';

    vm.dataStatus = REFRESH;
    vm.snapshotDataStatus = REFRESH;
    vm.taskIncomingDescription = "";
    vm.taskTimeDescription = "";
    vm.averageCsatDescription = "";

    vm.allReports = 'all';
    vm.engagement = 'engagement';
    vm.quality = 'quality';
    vm.currentFilter = vm.allReports;
    vm.displayEngagement = true;
    vm.displayQuality = true;

    vm.filterArray = _.cloneDeep(ReportConstants.filterArray);
    vm.filterArray[0].toggle = function () {
      resetCards(vm.allReports);
    };
    vm.filterArray[1].toggle = function () {
      resetCards(vm.engagement);
    };
    vm.filterArray[2].toggle = function () {
      resetCards(vm.quality);
    };

    vm.timeFilter = null;

    var options = ['today', 'yesterday', 'week', 'month', 'threeMonths'];
    vm.timeOptions = _.map(options, function (name, i) {
      return {
        value: i,
        label: $translate.instant('careReportsPage.' + name),
        description: $translate.instant('careReportsPage.' + name + '2'),
        taskStatus: $translate.instant('careReportsPage.' + name + 'TaskStatus'),
        intervalTxt: $translate.instant('careReportsPage.' + name + 'Interval'),
        categoryAxisTitle: $translate.instant('careReportsPage.' + name + 'CategoryAxis')
      };
    });

    vm.timeSelected = vm.timeOptions[0];
    vm.filtersUpdate = filtersUpdate;

    var mediaTypes = ['all', 'chat', 'callback'];
    vm.mediaTypeOptions = _.map(mediaTypes, function (name, i) {
      return {
        value: i,
        name: name,
        label: $translate.instant('careReportsPage.media_type_' + name)
      };
    });

    vm.mediaTypeSelected = vm.mediaTypeOptions[1];

    vm.callbackFeature = false;

    function filtersUpdate() {
      vm.dataStatus = REFRESH;
      vm.snapshotDataStatus = REFRESH;
      setFilterBasedTextForCare();

      showReportsWithDummyData();
      var promise = showReportsWithRealData();
      resizeCards();
      delayedResize();
      return promise;
    }

    function setFilterBasedTextForCare() {
      vm.taskIncomingDescription = $translate.instant('taskIncoming.description', {
        time: vm.timeSelected.description,
        interval: vm.timeSelected.intervalTxt,
        taskStatus: vm.timeSelected.taskStatus
      });

      vm.taskTimeDescription = $translate.instant('taskTime.description', {
        time: vm.timeSelected.description,
        interval: vm.timeSelected.intervalTxt
      });

      vm.averageCsatDescription = $translate.instant('averageCsat.description', {
        time: vm.timeSelected.description,
        interval: vm.timeSelected.intervalTxt
      });
    }

    function showReportsWithRealData() {
      var isToday = (vm.timeSelected.value === 0);
      if (isToday) {
        showSnapshotReportWithRealData();
      }
      var categoryAxisTitle = vm.timeSelected.categoryAxisTitle;
      return SunlightReportService.getReportingData('org_stats', vm.timeSelected.value, vm.mediaTypeSelected.name)
        .then(function (data) {
          if (data.length === 0) {
            vm.dataStatus = EMPTY;
          } else {
            vm.dataStatus = SET;
            CareReportsService.showTaskIncomingGraph('taskIncomingdiv', data, categoryAxisTitle, isToday);
            CareReportsService.showTaskTimeGraph('taskTimeDiv', data, categoryAxisTitle, isToday);
            CareReportsService.showAverageCsatGraph('averageCsatDiv', data, categoryAxisTitle, isToday);
            resizeCards();
          }
        }, function (data) {
          vm.dataStatus = EMPTY;
          Notification.errorResponse(data, $translate.instant('careReportsPage.taskDataGetError', { dataType: 'Customer Satisfaction' }));
          if (!isToday) {
            Notification.errorResponse(data, $translate.instant('careReportsPage.taskDataGetError', { dataType: 'Contact Time Measure' }));
          }
          Notification.errorResponse(data, $translate.instant('careReportsPage.taskDataGetError', { dataType: 'Total Completed Contacts' }));
        });
    }

    function showSnapshotReportWithRealData() {
      var isSnapshot = true;
      SunlightReportService.getReportingData('org_snapshot_stats', vm.timeSelected.value, vm.mediaTypeSelected.name, isSnapshot)
        .then(function (data) {
          if (data.length === 0) {
            vm.snapshotDataStatus = EMPTY;
          } else {
            vm.snapshotDataStatus = SET;
            CareReportsService.showTaskAggregateGraph('taskAggregateDiv', data, vm.timeSelected.categoryAxisTitle);
            resizeCards();
          }
        }, function (data) {
          vm.snapshotDataStatus = EMPTY;
          Notification.errorResponse(data, $translate.instant('careReportsPage.taskDataGetError', { dataType: 'Aggregated Contacts' }));
        });
    }

    // Graph data status checks
    vm.isRefresh = function (tab) {
      return tab === REFRESH;
    };

    vm.isEmpty = function (tab) {
      return tab === EMPTY;
    };

    function showReportsWithDummyData() {
      var dummyData = DummyCareReportService.dummyOrgStatsData(vm.timeSelected.value);
      var categoryAxisTitle = vm.timeSelected.categoryAxisTitle;
      var isToday = (vm.timeSelected.value === 0);
      CareReportsService.showTaskIncomingDummy('taskIncomingdiv', dummyData, categoryAxisTitle, isToday);
      CareReportsService.showTaskTimeDummy('taskTimeDiv', dummyData, categoryAxisTitle, isToday);
      CareReportsService.showAverageCsatDummy('averageCsatDiv', dummyData, categoryAxisTitle, isToday);
      CareReportsService.showTaskAggregateDummy('taskAggregateDiv', dummyData, categoryAxisTitle, isToday);
      resizeCards();
    }

    function resizeCards() {
      CardUtils.resize();
    }

    function delayedResize() {
      CardUtils.resize(500);
    }

    function resetCards(filter) {
      if (vm.currentFilter !== filter) {
        vm.displayEngagement = false;
        vm.displayQuality = false;
        if (filter === vm.allReports || filter === vm.engagement) {
          vm.displayEngagement = true;
        }
        if (filter === vm.allReports || filter === vm.quality) {
          vm.displayQuality = true;
        }
        vm.currentFilter = filter;
      }
      resizeCards();
      delayedResize();
    }

    $timeout(function () {
      FeatureToggleService.atlasCareCallbackTrialsGetStatus()
        .then(function (enabled) {
          vm.callbackFeature = enabled;
          if (vm.callbackFeature) {
            vm.mediaTypeSelected = vm.mediaTypeOptions[0];
          }
          filtersUpdate();
        });
    }, 30);
  }
})();
