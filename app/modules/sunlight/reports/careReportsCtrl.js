(function () {
  'use strict';
  angular.module('Sunlight').controller('CareReportsController', CareReportsController);
  /* @ngInject */
  function CareReportsController($timeout, $translate, CareReportsService, DummyCareReportService, Notification, SunlightReportService) {
    var vm = this;
    var REFRESH = 'refresh';
    var SET = 'set';
    var EMPTY = 'empty';

    vm.taskIncomingData = [];
    vm.taskIncomingStatus = REFRESH;
    vm.taskIncomingDescription = "";

    vm.allReports = 'all';
    vm.engagement = 'engagement';
    vm.quality = 'quality';
    vm.currentFilter = vm.allReports;
    vm.displayEngagement = true;
    vm.displayQuality = true;
    vm.resetCards = resetCards;

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
    vm.timeUpdate = timeUpdate;

    function timeUpdate() {
      vm.taskIncomingStatus = REFRESH;
      setFilterBasedTextForCare();

      setDummyData();
      setAllGraphs();
    }

    function init() {
      var selectedIndex = vm.timeSelected.value;
      setFilterBasedTextForCare();
      $timeout(function () {
        setDummyData();
        setAllGraphs();
      }, 30);
    }

    function setFilterBasedTextForCare() {
      vm.taskIncomingDescription = $translate.instant('taskIncoming.description', {
        time: vm.timeSelected.description,
        interval: vm.timeSelected.intervalTxt,
        taskStatus: vm.timeSelected.taskStatus
      });
    }

    function setAllGraphs() {
      setTaskIncomingGraphs();
    }

    function setTaskIncomingGraphs() {
      SunlightReportService.getReportingData('org_stats', vm.timeSelected.value, 'chat')
        .then(function (data) {
          if (data.length === 0) {
            vm.taskIncomingStatus = EMPTY;
          } else {
            vm.taskIncomingStatus = SET;
            CareReportsService.setTaskIncomingGraphs(data, vm.timeSelected.categoryAxisTitle, vm.timeSelected.value);
          }
        }, function (response) {
          vm.taskIncomingStatus = EMPTY;
          Notification.error($translate.instant('careReportsPage.taskIncomingError'));
        });
    }

    // Graph data status checks
    vm.isRefresh = function (tab) {
      return tab === REFRESH;
    };

    vm.isEmpty = function (tab) {
      return tab === EMPTY;
    };

    function setDummyData() {
      var dummyData = DummyCareReportService.dummyOrgStatsData(vm.timeSelected.value);
      CareReportsService.setTaskIncomingDummyData(dummyData, vm.timeSelected.categoryAxisTitle, vm.timeSelected.value);
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
    }

    init();
  }
})();
