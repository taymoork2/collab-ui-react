(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .controller('MediaSeriveMeetingsReportsCtrl', MediaSeriveMeetingsReportsCtrl);

  /* @ngInject */
  function MediaSeriveMeetingsReportsCtrl($translate, $scope, $interval, Notification, MeetingsReportService, MeetingsGraphService, $timeout) {
    var vm = this;

    vm.noData = $translate.instant('mediaFusion.metrics.nodata');
    vm.allClusters = $translate.instant('mediaFusion.metrics.allclusters');

    vm.timeUpdate = timeUpdate;

    vm.clusterOptions = [vm.allClusters];
    vm.clusterSelected = vm.clusterOptions[0];
    vm.clusterId = vm.clusterOptions[0];

    vm.timeOptions = [{
      value: 0,
      label: $translate.instant('mediaFusion.metrics.today'),
      description: $translate.instant('mediaFusion.metrics.today2')
    }, {
      value: 1,
      label: $translate.instant('mediaFusion.metrics.week'),
      description: $translate.instant('mediaFusion.metrics.week2')
    }, {
      value: 2,
      label: $translate.instant('mediaFusion.metrics.month'),
      description: $translate.instant('mediaFusion.metrics.month2')
    }, {
      value: 3,
      label: $translate.instant('mediaFusion.metrics.threeMonths'),
      description: $translate.instant('mediaFusion.metrics.threeMonths2')
    }];

    vm.timeSelected = vm.timeOptions[0];
    vm.displayDate = displayDate;
    vm.Map = {};

    vm.meetingTypeChartOptions = {
      id: 'meetingtype',
      desc: $translate.instant('mediaFusion.meetings-report.meeting-type-title'),
      noData: false,
      loading: true
    };

    vm.meetingTypeDurationChartOptions = {
      id: 'meetingtypeduration',
      desc: $translate.instant('mediaFusion.meetings-report.meeting-duration-title'),
      noData: false,
      loading: true
    };

    displayDate();

    function displayDate() {
      var date1 = new Date();
      var date2 = new Date();
      var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      if (vm.timeSelected.value === 0) {

        vm.label = vm.timeSelected.label;
        vm.date = date1.getHours() + ':' + (date1.getMinutes() < 10 ? '0' : '') + date1.getMinutes() + ' ' + month[date1.getMonth()] + ' ' + date1.getDate() + ',' + date1.getFullYear();
        vm.date = $translate.instant('mediaFusion.metrics.lastRefresh') + ' ' + vm.date;

      } else if (vm.timeSelected.value === 1) {

        vm.label = vm.timeSelected.label;
        date1.setDate(date1.getDate() - 7);
        var prevdate = new Date(date1);
        vm.date = month[prevdate.getMonth()] + ' ' + prevdate.getDate() + ',' + ' ' + prevdate.getFullYear() + ' ' + '-' + ' ' + month[date2.getMonth()] + ' ' + date2.getDate() + ',' + ' ' + date2.getFullYear();

      } else if (vm.timeSelected.value === 2) {

        vm.label = vm.timeSelected.label;
        date1.setMonth(date1.getMonth() - 1);
        prevdate = new Date(date1);
        vm.date = month[prevdate.getMonth()] + ' ' + prevdate.getDate() + ',' + ' ' + prevdate.getFullYear() + ' ' + '-' + ' ' + month[date2.getMonth()] + ' ' + date2.getDate() + ',' + ' ' + date2.getFullYear();

      } else {

        vm.label = vm.timeSelected.label;
        date1.setMonth(date1.getMonth() - 3);
        prevdate = new Date(date1);
        vm.date = month[prevdate.getMonth()] + ' ' + prevdate.getDate() + ',' + ' ' + prevdate.getFullYear() + ' ' + '-' + ' ' + month[date2.getMonth()] + ' ' + date2.getDate() + ',' + ' ' + date2.getFullYear();

      }
    }

    function timeUpdate() {
      displayDate();
      setAllGraphs();
    }

    function loadDatas() {
      timeUpdate();
    }

    function setAllGraphs() {
      setMeetingMetricsData();
      setMeetingPieData();
    }

    loadDatas();

    // Code for auto reload the rest calls every 5 minutes
    var interval = $interval(timeUpdate, 300000);
    $scope.$on('$destroy', function () {
      $interval.cancel(interval);
    });


    function setMeetingPieData() {
      $timeout(function () {
        setMeetingTypeData();
        setMeetingTypeDurationData();
      }, 1000);
    }

    function setMeetingTypeDurationData() {
      vm.meetingTypeDurationChartOptions.loading = true;
      MeetingsReportService.getMeetingTypeDurationData(vm.timeSelected, vm.clusterSelected).then(function (data) {
        if (_.isUndefined(data) || data.length === 0 || _.isUndefined(data.dataProvider) || data.dataProvider.length === 0) {
          setDummyPieChart(vm.meetingTypeDurationChartOptions);
        } else {
          var dataProviderTemp = [];
          _.forEach(data.dataProvider, function (value) {
            value.value = Math.ceil(value.value / 60);
            dataProviderTemp.push(value);
          });
          data.dataProvider = dataProviderTemp;
          setMeetingPieGraph(data, vm.meetingTypeDurationChartOptions);
          vm.meetingTypeDurationChartOptions.loading = false;
          vm.meetingTypeDurationChartOptions.noData = false;
        }
      }, function () {
        setDummyPieChart(vm.meetingTypeDurationChartOptions);
        Notification.error('mediaFusion.genericError');
      });
    }

    function setMeetingTypeData() {
      vm.meetingTypeChartOptions.loading = true;
      MeetingsReportService.getMeetingTypeData(vm.timeSelected, vm.clusterSelected).then(function (data) {
        if (_.isUndefined(data) || data.length === 0 || _.isUndefined(data.dataProvider) || data.dataProvider.length === 0) {
          setDummyPieChart(vm.meetingTypeChartOptions);
        } else {
          setMeetingPieGraph(data, vm.meetingTypeChartOptions);
          vm.meetingTypeChartOptions.loading = false;
          vm.meetingTypeChartOptions.noData = false;
        }
      }, function () {
        setDummyPieChart(vm.meetingTypeChartOptions);
        Notification.error('mediaFusion.genericError');
      });
    }

    function setMeetingPieGraph(data, chartOptions) {
      var pieChart = MeetingsGraphService.getMeetingPieGraph(data, chartOptions.chart, chartOptions.id, chartOptions.noData);
      chartOptions.chart = pieChart;
      return;
    }

    function setDummyPieChart(chartOptions) {
      MeetingsGraphService.getMeetingDummyPieGraph(chartOptions.id);
      chartOptions.loading = false;
      chartOptions.noData = true;
      return;
    }

    function setMeetingMetricsData() {
      MeetingsReportService.getMeetingMetrics(vm.timeSelected, vm.clusterSelected).then(function (data) {
        if (_.isUndefined(data) || data.length === 0) {
          vm.totalMeeting = vm.noData;
          vm.totalMinutes = vm.noData;
        } else {
          if (_.isUndefined(data.totalMeetings)) {
            vm.totalMeeting = vm.noData;
          } else {
            vm.totalMeeting = data.totalMeetings;
          }
          if (_.isUndefined(data.totalMeetingDuration)) {
            vm.totalMinutes = vm.noData;
          } else {
            vm.totalMinutes = Math.ceil(data.totalMeetingDuration / 60);
          }
        }
      }, function () {
        vm.totalMeeting = vm.noData;
        vm.totalMinutes = vm.noData;
        Notification.error('mediaFusion.genericError');
      });
    }
  }
})();
