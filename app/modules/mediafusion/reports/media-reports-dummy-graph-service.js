(function () {
  'use strict';

  angular.module('Mediafusion').service('MediaReportsDummyGraphService', MediaReportsDummyGraphService);

  var ChartColors = require('modules/core/config/chartColors').ChartColors;

  /* @ngInject */
  function MediaReportsDummyGraphService($translate) {
    var vm = this;
    vm.average_utilzation = $translate.instant('mediaFusion.metrics.avgutilization');
    vm.client_types = $translate.instant('mediaFusion.metrics.clientTypes');
    vm.locations = $translate.instant('mediaFusion.metrics.location');
    vm.onPremisesHeading = $translate.instant('mediaFusion.metrics.onPremisesHeading');
    vm.cloudHeading = $translate.instant('mediaFusion.metrics.cloudHeading');
    vm.clusterHeading = $translate.instant('mediaFusion.metrics.clusterTitle');
    vm.clusterNodeHeading = $translate.instant('mediaFusion.metrics.clusterNodeTitle');
    vm.timeFormat = 'YYYY-MM-DDTHH:mm:ss';
    return {
      dummyCallVolumeData: dummyCallVolumeData,
      dummyAvailabilityData: dummyAvailabilityData,
      dummyLineChartData: dummyLineChartData,
      dummyUtilizationGraph: dummyUtilizationGraph,
      dummyClusterLineChartGraph: dummyClusterLineChartGraph,
      dummyClientTypeGraph: dummyClientTypeGraph,
      dummyMeetingLocationGraph: dummyMeetingLocationGraph,
      dummyNumberOfParticipantGraph: dummyNumberOfParticipantGraph,
    };

    function dummyAvailabilityData(filter) {
      var data;
      var start;
      var end;
      var duration;
      var color = ChartColors.grayLightTwo;
      var period;
      if (filter.value === 0) {
        end = moment().utc().format(vm.timeFormat);
        start = moment().utc().subtract(4, 'hours').format(vm.timeFormat);
        duration = 240;
        period = 'mm';
      } else if (filter.value === 1) {
        end = moment().utc().format(vm.timeFormat);
        start = moment().utc().subtract(1, 'days').format(vm.timeFormat);
        duration = 1440;
        period = 'mm';
      } else if (filter.value === 2) {
        end = moment().utc().format(vm.timeFormat);
        start = moment().utc().subtract(7, 'days').format(vm.timeFormat);
        duration = 168;
        period = 'hh';
      } else if (filter.value === 3) {
        end = moment().utc().format(vm.timeFormat);
        start = moment().utc().subtract(1, 'months').format(vm.timeFormat);
        period = 'hh';
        duration = 744;
      } else {
        end = moment().utc().format(vm.timeFormat);
        start = moment().utc().subtract(3, 'months').format(vm.timeFormat);
        period = 'hh';
        duration = 2260;
      }
      data = [{
        isDummy: true,
        orgId: '2c3c9f9e-73d9-4460-a668-047162ff1bac',
        period: period,
        clusterCategories: [{
          category: vm.clusterNodeHeading,
          segments: [{
            start: 1,
            duration: duration,
            color: color,
            startTime: start,
            endTime: end,
          }],
        }, {
          category: vm.clusterNodeHeading,
          segments: [{
            start: 1,
            duration: duration,
            color: color,
            startTime: start,
            endTime: end,
          }],
        }, {
          category: vm.clusterNodeHeading,
          segments: [{
            start: 1,
            duration: duration,
            color: color,
            startTime: start,
            endTime: end,
          }],
        }],
        startTime: start,
        endTime: end,
      }];
      var returnData;
      returnData = {
        data: data,
      };
      return returnData;
    }

    function dummyCallVolumeData(filter) {
      var dummyGraphVal = [];
      if (filter.value === 0) {
        for (var i = 240; i >= 1; i--) {
          dummyGraphVal.push({
            timestamp: moment().utc().subtract(i, 'minutes').format(vm.timeFormat),
            call_reject: Math.floor((Math.random() * 1) + 1),
            active_calls: Math.floor((Math.random() * 1) + 1),
            balloon: false,
            colorOne: ChartColors.grayLightThree,
            colorTwo: ChartColors.grayLightTwo,
          });
        }
      } else if (filter.value === 1) {
        for (i = 288; i >= 1; i--) {
          dummyGraphVal.push({
            timestamp: moment().utc().subtract(i * 5, 'minutes').format(vm.timeFormat),
            call_reject: Math.floor((Math.random() * 1) + 1),
            active_calls: Math.floor((Math.random() * 1) + 1),
            balloon: false,
            colorOne: ChartColors.grayLightThree,
            colorTwo: ChartColors.grayLightTwo,
          });
        }
      } else if (filter.value === 2) {
        for (i = 168; i >= 1; i--) {
          dummyGraphVal.push({
            timestamp: moment().utc().subtract(i, 'hours').format(vm.timeFormat),
            call_reject: Math.floor((Math.random() * 1) + 1),
            active_calls: Math.floor((Math.random() * 1) + 1),
            balloon: false,
            colorOne: ChartColors.grayLightThree,
            colorTwo: ChartColors.grayLightTwo,
          });
        }
      } else if (filter.value === 3) {
        for (i = 180; i >= 0; i--) {
          dummyGraphVal.push({
            timestamp: moment().utc().subtract(i * 3, 'hours').format(vm.timeFormat),
            call_reject: Math.floor((Math.random() * 1) + 1),
            active_calls: Math.floor((Math.random() * 1) + 1),
            balloon: false,
            colorOne: ChartColors.grayLightThree,
            colorTwo: ChartColors.grayLightTwo,
          });
        }
      } else {
        for (i = 270; i >= 0; i--) {
          dummyGraphVal.push({
            timestamp: moment().utc().subtract(i * 8, 'hours').format(vm.timeFormat),
            call_reject: Math.floor((Math.random() * 1) + 1),
            active_calls: Math.floor((Math.random() * 1) + 1),
            balloon: false,
            colorOne: ChartColors.grayLightThree,
            colorTwo: ChartColors.grayLightTwo,
          });
        }
      }
      return dummyGraphVal;
    }

    function dummyLineChartData(filter) {
      var dummyGraphVal = [];
      if (filter.value === 0) {
        for (var i = 240; i >= 1; i--) {
          dummyGraphVal.push({
            time: moment().utc().subtract(i, 'minutes').format(vm.timeFormat),
            field: Math.floor((Math.random() * 10) + 1),
            balloon: false,
          });
        }
      } else if (filter.value === 1) {
        for (i = 288; i >= 1; i--) {
          dummyGraphVal.push({
            time: moment().utc().subtract(i * 5, 'minutes').format(vm.timeFormat),
            field: Math.floor((Math.random() * 10) + 1),
            balloon: false,
          });
        }
      } else if (filter.value === 2) {
        for (i = 168; i >= 1; i--) {
          dummyGraphVal.push({
            time: moment().utc().subtract(i, 'hours').format(vm.timeFormat),
            field: Math.floor((Math.random() * 10) + 1),
            balloon: false,
          });
        }
      } else if (filter.value === 3) {
        for (i = 180; i >= 0; i--) {
          dummyGraphVal.push({
            time: moment().utc().subtract(i * 3, 'hours').format(vm.timeFormat),
            field: Math.floor((Math.random() * 10) + 1),
            balloon: false,
          });
        }
      } else {
        for (i = 270; i >= 0; i--) {
          dummyGraphVal.push({
            time: moment().utc().subtract(i * 8, 'hours').format(vm.timeFormat),
            field: Math.floor((Math.random() * 10) + 1),
            balloon: false,
          });
        }
      }
      return dummyGraphVal;
    }

    function dummyUtilizationGraph() {
      var dummyGraph = [];
      dummyGraph.push({
        title: vm.average_utilzation,
        valueField: 'field',
        dashLength: 4,
        lineColor: ChartColors.grayLightTwo,
        showBalloon: false,
        isDummy: true,
      });
      return dummyGraph;
    }

    function dummyClusterLineChartGraph() {
      var dummyGraph = [];
      dummyGraph.push({
        title: vm.clusterHeading,
        valueField: 'field',
        lineColor: ChartColors.grayLightTwo,
        showBalloon: false,
        isDummy: true,
      });
      return dummyGraph;
    }

    function dummyClientTypeGraph() {
      var dummyGraph = [];
      dummyGraph.push({
        title: vm.client_types,
        valueField: 'field',
        lineColor: ChartColors.grayLightTwo,
        showBalloon: false,
        isDummy: true,
      });
      return dummyGraph;
    }

    function dummyNumberOfParticipantGraph() {
      var dummyGraph = [];
      dummyGraph.push({
        title: vm.cloudHeading,
        valueField: 'field',
        lineColor: ChartColors.grayLightTwo,
        showBalloon: false,
        isDummy: true,
      }, {
        title: vm.onPremisesHeading,
        valueField: 'field',
        lineColor: ChartColors.grayLightTwo,
        showBalloon: false,
        isDummy: true,
      });
      return dummyGraph;
    }

    function dummyMeetingLocationGraph() {
      var dummyGraph = [];
      dummyGraph.push({
        title: vm.locations,
        valueField: 'field',
        lineColor: ChartColors.grayLightTwo,
        showBalloon: false,
        isDummy: true,
      });
      return dummyGraph;
    }
  }
})();
