(function () {
  'use strict';
  angular.module('Mediafusion').service('DummyMetricsReportService', DummyMetricsReportService);
  /* @ngInject */
  function DummyMetricsReportService($translate, chartColors) {
    var timeFormat = "YYYY-MM-DDTHH:mm:ss";
    var dayFormat = "MMM DD";
    var monthFormat = "MMMM";
    var dummyPopulation = null;
    var customers = null;
    return {
      dummyCallVolumeData: dummyCallVolumeData,
      dummyAvailabilityData: dummyAvailabilityData,
      dummyUtilizationData: dummyUtilizationData
    };

    function dummyAvailabilityData(filter) {
      var data;
      var start;
      var end;
      var duration;
      var color = chartColors.dummyGray;
      var period;
      if (filter.value === 0) {
        end = moment().utc().format(timeFormat);
        start = moment().utc().subtract(1, 'days').format(timeFormat);
        duration = 1440;
        period = "mm";
      } else if (filter.value === 1) {
        end = moment().utc().format(timeFormat);
        start = moment().utc().subtract(7, 'days').format(timeFormat);
        duration = 168;
        period = "hh";
      } else if (filter.value === 2) {
        end = moment().utc().format(timeFormat);
        start = moment().utc().subtract(1, 'months').format(timeFormat);
        period = "hh";
        duration = 744;
      } else {
        end = moment().utc().format(timeFormat);
        start = moment().utc().subtract(3, 'months').format(timeFormat);
        period = "hh";
        duration = 2260;
      }
      data = [{
        "isDummy": true,
        "orgId": "2c3c9f9e-73d9-4460-a668-047162ff1bac",
        "period": period,
        "clusterCategories": [{
          "category": "Cluster/Host",
          "segments": [{
            "start": 1,
            "duration": duration,
            "color": color,
            "task": "No data"
          }]
        }, {
          "category": "Cluster/Host",
          "segments": [{
            "start": 1,
            "duration": duration,
            "color": color,
            "task": "No data"
          }]
        }, {
          "category": "Cluster/Host",
          "segments": [{
            "start": 1,
            "duration": duration,
            "color": color,
            "task": "No data"
          }]
        }],
        "startTime": start,
        "endTime": end
      }];
      var returnData;
      returnData = {
        'data': data
      };
      return returnData;
    }

    function dummyCallVolumeData(filter) {
      var dummyGraphVal = [];
      var abs = 0;
      if (filter.value === 0) {
        for (var i = 288; i >= 1; i--) {
          dummyGraphVal.push({
            timestamp: moment().subtract(i * 5, 'minutes').format(timeFormat),
            call_reject: Math.floor((Math.random() * 100) + 1),
            active_calls: Math.floor((Math.random() * 100) + 1),
            balloon: false,
            colorOne: chartColors.dummyGrayLight,
            colorTwo: chartColors.dummyGray
          });
        }
      } else if (filter.value === 1) {
        for (var i = 168; i >= 1; i--) {
          dummyGraphVal.push({
            timestamp: moment().subtract(i, 'hours').format(timeFormat),
            call_reject: Math.floor((Math.random() * 100) + 1),
            active_calls: Math.floor((Math.random() * 100) + 1),
            balloon: false,
            colorOne: chartColors.dummyGrayLight,
            colorTwo: chartColors.dummyGray
          });
        }
      } else if (filter.value === 2) {
        for (var i = 180; i >= 0; i--) {
          dummyGraphVal.push({
            timestamp: moment().subtract(i * 3, 'hours').format(timeFormat),
            call_reject: Math.floor((Math.random() * 100) + 1),
            active_calls: Math.floor((Math.random() * 100) + 1),
            balloon: false,
            colorOne: chartColors.dummyGrayLight,
            colorTwo: chartColors.dummyGray
          });
        }
      } else {
        for (var i = 270; i >= 0; i--) {
          dummyGraphVal.push({
            timestamp: moment().subtract(i * 8, 'hours').format(timeFormat),
            call_reject: Math.floor((Math.random() * 100) + 1),
            active_calls: Math.floor((Math.random() * 100) + 1),
            balloon: false,
            colorOne: chartColors.dummyGrayLight,
            colorTwo: chartColors.dummyGray
          });
        }
      }
      return dummyGraphVal;
    }

    function dummyUtilizationData(filter) {
      var dummyGraphVal = [];
      var abs = 0;
      if (filter.value === 0) {
        for (var i = 288; i >= 1; i--) {
          dummyGraphVal.push({
            timestamp: moment().subtract(i * 5, 'minutes').format(timeFormat),
            average_cpu: Math.floor((Math.random() * 10) + 1),
            peak_cpu: Math.floor((Math.random() * 10) + 1),
            balloon: false,
            colorOne: chartColors.dummyGrayLight,
            colorTwo: chartColors.dummyGray
          });
        }
      } else if (filter.value === 1) {
        for (var i = 168; i >= 1; i--) {
          dummyGraphVal.push({
            timestamp: moment().subtract(i, 'hours').format(timeFormat),
            average_cpu: Math.floor((Math.random() * 10) + 1),
            peak_cpu: Math.floor((Math.random() * 10) + 1),
            balloon: false,
            colorOne: chartColors.dummyGrayLight,
            colorTwo: chartColors.dummyGray
          });
        }
      } else if (filter.value === 2) {
        for (var i = 180; i >= 0; i--) {
          dummyGraphVal.push({
            timestamp: moment().subtract(i * 3, 'hours').format(timeFormat),
            average_cpu: Math.floor((Math.random() * 10) + 1),
            peak_cpu: Math.floor((Math.random() * 10) + 1),
            balloon: false,
            colorOne: chartColors.dummyGrayLight,
            colorTwo: chartColors.dummyGray
          });
        }
      } else {
        for (var i = 270; i >= 0; i--) {
          dummyGraphVal.push({
            timestamp: moment().subtract(i * 8, 'hours').format(timeFormat),
            average_cpu: Math.floor((Math.random() * 10) + 1),
            peak_cpu: Math.floor((Math.random() * 10) + 1),
            balloon: false,
            colorOne: chartColors.dummyGrayLight,
            colorTwo: chartColors.dummyGray
          });
        }
      }
      return dummyGraphVal;
    }
  }
})();
