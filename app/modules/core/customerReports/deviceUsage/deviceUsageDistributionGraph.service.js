(function () {
  'use strict';

  angular.module('Core')
    .service('DeviceUsageDistributionGraphService', DeviceUsageDistributionGraphService);

  /* @ngInject */
  function DeviceUsageDistributionGraphService($log, chartColors) {
    var distributionLimits;

    return {
      getUsageCharts: getUsageCharts,
      getUsageDistributionData: getUsageDistributionData,
      getDistributionLimits: getDistributionLimits
    };

    function getDistributionLimits() {
      return distributionLimits.slice();
    }

    function getUsageCharts(distributionData, categoryFieldKey) {

      var axis = {
        'axisColor': chartColors.grayLight,
        'gridColor': chartColors.grayLight,
        'color': chartColors.grayDarkest,
        'titleColor': chartColors.grayDarkest,
        'fontFamily': 'CiscoSansTT Light',
        'tickLength': 0
      };
      var catAxis = angular.copy(axis);
      catAxis.gridPosition = 'start';
      catAxis.title = 'Active in hours (in percentage of full week)';

      var valueAxes = [angular.copy(axis)];
      valueAxes[0].integersOnly = true;
      valueAxes[0].minimum = 0;
      valueAxes[0].title = "# of devices";

      var usageChart = {
        'type': 'serial',
        'addClassNames': true,
        'fontFamily': 'CiscoSansTT Extra Light',
        //'backgroundColor': chartColors.brandWhite,
        //'backgroundAlpha': 1,
        'balloon': {
          'adjustBorderColor': true,
          'borderThickness': 1,
          'fillAlpha': 1,
          //'fillColor': chartColors.brandWhite,
          'fixedPosition': true,
          'shadowAlpha': 0
        },
        'autoMargins': true,
        'usePrefixes': true,
        'titles': [{ 'text': 'Darling usage distribution last week (based on random dummy data)' }],
        'valueAxes': valueAxes,
        'categoryField': categoryFieldKey,
        'categoryAxis': catAxis,
        'legend': {
          'color': chartColors.grayDarkest,
          'align': 'center',
          'autoMargins': false,
          'switchable': false,
          'fontSize': 13,
          'markerLabelGap': 10,
          'markerType': 'square',
          'markerSize': 10,
          'position': 'bottom',
          'equalWidths': false,
          'horizontalGap': 5,
          'valueAlign': 'left',
          'valueWidth': 0,
          'verticalGap': 20
        },
        'export': {
          'enabled': true
        }
      };

      var titles = ["Video", "Whiteboard"];
      var valueFields = ["video", "whiteboard"];
      usageChart.graphs = usageGraphs(titles, valueFields);

      return usageChart;
    }

    function extractHours(rawDeviceData) {
      var usageData = [];
      _.each(rawDeviceData, function (deviceData) {
        usageData.push(deviceData.totalDuration);
      });
      return usageData;
    }

    function calculateDistributionLimits(divisions, maxHours) {
      distributionLimits = [];
      for (var x = 0; x <= divisions; x++) {
        distributionLimits.push(Math.round((maxHours / divisions) * x));
      }
      return distributionLimits;
    }

    function groupUsageDataByDistributionLimits(usageData) {
      var usageGroups = [];
      usageGroups[0] = usageData.filter(function (x) {
        return x === 0;
      });

      _.each(distributionLimits, function (limit, index) {
        usageGroups.push(usageData.filter(function (x) {
          if (index < distributionLimits.length - 1) {
            return x > distributionLimits[index] && x < distributionLimits[index + 1];
          } else {
            return x === distributionLimits[index];
          }
        }));
      });
      return usageGroups;
    }

    function getUsageDistributionData(rawDeviceData) {
      var result;
      var usageData = extractHours(rawDeviceData);
      var hoursPrWeek = 168;
      distributionLimits = calculateDistributionLimits(4, hoursPrWeek);
      $log.warn("Distribution limits", distributionLimits);

      var usageGroups = groupUsageDataByDistributionLimits(usageData);
      //TODO: Make sure identical devices are collected into one entry with sum of usages.

      $log.warn("Usage groups", usageGroups);

      result = [];
      var devicesWithNoUsage = usageGroups[0];
      result.push({ "alpha": 1.0, "video": devicesWithNoUsage.length, "balloon": true, "whiteboard": devicesWithNoUsage.length * 2, "sharing": Math.round(devicesWithNoUsage.length / 1.5, 1), "usageHours": "No use", "labelColor": chartColors.brandDanger, "description": "have not been used" });
      for (var i = 1; i < usageGroups.length - 1; i++) {
        var percentageSteps = 100 / (distributionLimits.length - 1);
        result.push({ "alpha": 1.0, "video": usageGroups[i].length, "balloon": true, "whiteboard": Math.round(usageGroups[i].length / 2, 1), "sharing": Math.round(usageGroups[i].length / 1.5, 1), "usageHours": distributionLimits[i - 1] + 1 + "-" + distributionLimits[i] + " <br>(" + (percentageSteps * (i - 1)) + "-" + (percentageSteps * i) + "%)", "description": "have between<br>" + ((i - 1) * 20) + " to " + (i * 20) + "% utilization" });
      }
      var devicesWithMaxUsage = usageGroups[usageGroups.length - 1];
      result.push({ "alpha": 1.0, "video": devicesWithMaxUsage.length, "balloon": true, "whiteboard": 0, "sharing": Math.round(devicesWithMaxUsage.length / 1.5, 1), "usageHours": "168<br>(100%)", "labelColor": chartColors.brandDanger, "description": "have 100% utilization" });
      return result;
    }

//    function calculateDistributionBasedOnMaxUsage(raw) {
//      $log.warn("RAW skewed", raw);
//      var min_lim = Math.max.apply(Math, raw) * 0.2;
//      var max_lim = Math.max.apply(Math, raw) * 0.8;
//      var max = Math.max.apply(Math, raw);
//      var mid_lim = min_lim + ((max_lim - min_lim) / 2);
//      return [roundToRelevantDecade(min_lim, max), roundToRelevantDecade(mid_lim, max), roundToRelevantDecade(max_lim, max), roundToRelevantDecade(max, max)];
//    }
//
//    function roundToRelevantDecade(n, max) {
//      if (max > 10000) {
//        return (parseInt(Math.ceil(n) / 1000, 10) + 1) * 1000;
//      } else if (max > 1000) {
//        return (parseInt(Math.ceil(n) / 100, 10) + 1) * 100;
//      } else if (max > 100) {
//        return (parseInt(Math.ceil(n) / 10, 10) + 1) * 10;
//      } else {
//        return parseInt(Math.ceil(n), 1);
//      }
//    }

    function usageGraphs(titles, valueFields) {
      var colors = [chartColors.primaryColorDarker, chartColors.primaryColorLight];
      var graphs = [];

      _.each(valueFields, function (val, i) {
        graphs.push({
          'type': 'column',
          'alphaField': "alpha",
          'lineAlpha': 0.0,
          'balloonColor': chartColors.grayLight,
          'columnWidth': 0.6,
          'title': titles[i],
          'fillColors': colors[i],
          'colorField': "color",
          'valueField': val,
          'legendColor': colors[i],
          'labelText': '[[value]]',
          'labelColorField': 'labelColor'
        });

        graphs[i].balloonText = '<span class="graph-text">[[value]] devices [[description]] for ' + graphs[i].title + '.';

        $log.warn("graphs[i]", graphs[i]);
      });

      return graphs;
    }

  }
})();
