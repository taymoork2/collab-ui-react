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
      var selectedIndex = vm.timeSelected.value;
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
      var selectedIndex = vm.timeSelected.value;
      setFilterBasedCategoryAxisTitle(selectedIndex);
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
            var report = {};
            vm.taskIncomingStatus = SET;
<<<<<<< c9fa033cc3790e9f666aeb9915d09a761754b969
            report.data = data;
            report.divId = 'taskIncomingdiv';

            if (selectedIndex == 0) {

              report.legendTitles = ['Handled', 'Assigned', 'In-Queue', 'Abandoned'];
              report.valueFields = ['numTasksHandledState', 'numTasksAssignedState', 'numTasksQueuedState', 'numTasksAbandonedState'];
              report.colors = [chartColors.colorLightGreen, chartColors.colorLightYellow, chartColors.colorLightYellow, chartColors.colorLightRed];
              report.fillColors = [chartColors.colorLightGreenFill, chartColors.colorLightYellowFill, chartColors.colorLightYellowFill, chartColors.colorLightRedFill];
              report.enableExport = true;
              report.showBaloon = [false, false, false, true];
              report.dashLengths = [0, 0, 2, 0];
              report.cursorAlpha = 1;
              report.fillAlphas = 0.1;

              report.balloonText = '<span class="graph-text">Abandoned [[numTasksAbandonedState]]</span>' +
                '<br>' +
                '<span class="graph-text">In-Queue [[numTasksQueuedState]]</span>' +
                '<br> ' +
                '<span class="graph-text">Assigned [[numTasksAssignedState]]</span>' +
                '<br>' +
                '<span class="graph-text">Handled [[numTasksHandledState]]</span>';

              setTaskIncomingGraph(report);
            } else {
              report.legendTitles = ['Handled', 'Abandoned'];
              report.valueFields = ['numTasksHandledState', 'numTasksAbandonedState'];
              report.colors = [chartColors.colorLightGreen, chartColors.colorLightRed];
              report.fillColors = [chartColors.colorLightGreenFill, chartColors.colorLightRedFill];
              report.enableExport = true;
              report.showBaloon = [false, true];
              report.dashLengths = [0, 0];
              report.cursorAlpha = 1;
              report.fillAlphas = 0.1;
              report.balloonText = '<span class="graph-text">Abandoned [[value]]</span>' +
                '<br>' +
                '<span class="graph-text">Handled [[numTasksHandledState]]</span>';
            }
            setTaskIncomingGraph(report);
=======
            CareReportsService.setTaskIncomingGraphs(data, vm.timeSelected.categoryAxisTitle, vm.timeSelected.value);
>>>>>>> display dummy data
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

    function setTaskIncomingGraph(data) {

      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }

      var valueAxes = [CareReportsGraphService.getBaseVariable('axis')];
      valueAxes[0].title = 'Tasks';
      valueAxes[0].stackType = 'regular';
      valueAxes[0].position = 'left';

      var catAxis = CareReportsGraphService.getBaseVariable('axis');
      catAxis.startOnAxis = true;
      catAxis.title = vm.categoryAxisTitle;

      var exportReport = CareReportsGraphService.getBaseVariable('export');
      exportReport.enabled = data.enableExport;

      var chartCursor = CareReportsGraphService.getBaseVariable('chartCursor');
      chartCursor.cursorAlpha = data.cursorAlpha;

      var selectedIndex = vm.timeSelected.value;
      var chartData = CareReportsGraphService.getBaseSerialGraph(data, valueAxes, taskIncomingGraphs(data), 'createdTime', catAxis, exportReport, chartCursor, selectedIndex);

      return AmCharts.makeChart(data.divId, chartData);
    }

    function taskIncomingGraphs(data) {
      var graphs = [];

      var dashLengths = [0, 0, 2, 0];
      var pattern = {
        "url": "Linepattern.png",
        width: 10,
        height: 10
      };

      for (var i = 0; i < data.valueFields.length; i++) {
        graphs.push(CareReportsGraphService.getBaseVariable('graph'));
        graphs[i].title = data.legendTitles[i];
        graphs[i].fillColors = data.colors[i];
        graphs[i].lineColor = data.colors[i];
        graphs[i].valueField = data.valueFields[i];
        graphs[i].balloonText = data.balloonText;
        graphs[i].fillAlphas = data.fillAlphas;
        graphs[i].showBalloon = data.showBaloon[i];
        graphs[i].dashLength = dashLengths[i];
        if (dashLengths[i] > 0) {
          graphs[i].pattern = pattern;
          graphs[i].fillAlphas = 1;
        }
        graphs[i].plotAreaBorderAlpha = 0;
        graphs[i].marginTop = 10;
        graphs[i].marginLeft = 0;
      }

      return graphs;
    }

    function setDummyData() {
      var dummyData = DummyCareReportService.dummyOrgStatsData(vm.timeSelected.value);
      CareReportsService.setTaskIncomingDummyData(dummyData, vm.timeSelected.categoryAxisTitle, vm.timeSelected.value);
<<<<<<< c9fa033cc3790e9f666aeb9915d09a761754b969
    }

    function setTaskIncomingDummyData() {
      var dummyReport = {};
      var selectedIndex = vm.timeOptions.indexOf(vm.timeSelected);
      dummyReport.divId = 'taskIncomingdiv';
=======
>>>>>>> display dummy data
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
