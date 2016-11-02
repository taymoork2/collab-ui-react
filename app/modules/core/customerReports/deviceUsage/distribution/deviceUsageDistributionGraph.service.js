(function () {
  'use strict';

  angular.module('Core')
    .service('DeviceUsageDistributionGraphService', DeviceUsageDistributionGraphService);

  /* @ngInject */
  function DeviceUsageDistributionGraphService($log, chartColors) {
    var distributionPoints;

    return {
      getUsageCharts: getUsageCharts,
      getUsageDistributionDataForGraph: getUsageDistributionDataForGraph,
      getDistributionPoints: getDistributionPoints
    };

    function getDistributionPoints(rawDeviceData) {
      var noOfDistributionPoints = 10;
      //var hoursPrWeek = 168;
      //var max = hoursPrWeek;
      var max = _.maxBy(rawDeviceData, function (o) { return o.totalDuration; });
      distributionPoints = calculateDistributionPoints(noOfDistributionPoints, max.totalDuration);
      //distributionPoints = [0, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 168];
      $log.warn("Distribution points", distributionPoints);
      return distributionPoints.slice();
    }

    function getUsageDistributionGroups(rawDeviceData) {
      $log.info("rawDeviceData", rawDeviceData);
      var usageData = extractHours(rawDeviceData);
      $log.info("after extracting hours", usageData);
      var distributionPoints = getDistributionPoints(rawDeviceData);
      var usageGroups = groupUsageDataWithinDistributionBuckets(usageData, distributionPoints);
      $log.warn("Usage groups after putting into distribution buckets", usageGroups);
      return usageGroups;
    }

    function getUsageDistributionDataForGraph(rawDeviceData) {
      //console.log("getUsageDistributionDataForGraph", rawDeviceData);
      var result = [];
      var usageGroups = getUsageDistributionGroups(rawDeviceData);
      for (var i = 0; i < usageGroups.length - 1; i++) {
        var noOfDevices = usageGroups[i].length;
        result.push({
          "alpha": 1.0,
          "video": noOfDevices,
          "balloon": true,
          //"whiteboard": 30 + Math.round(noOfDevices / 1.2, 1),
          //"sharing": Math.round(noOfDevices / 1.5, 1),
          "usageHours": "< " + distributionPoints[i + 1] + " hours",
          "description": "have between<br>" + ((i - 1) * 20) + " to " + (i * 20) + "% utilization"
        });
      }
      return result;
    }

    function groupUsageDataWithinDistributionBuckets(usageData, distributionPoints) {
      var usageGroups = [];
      _.each(distributionPoints, function (limit, index) {
        var withinBucket = usageData.filter(function (sample) {
          return sample >= distributionPoints[index] && sample < distributionPoints[index + 1];
        });
        usageGroups.push(withinBucket);
      });
      return usageGroups;
    }

    function calculateDistributionPoints(divisions, maxHours) {
      distributionPoints = [];
      for (var x = 1; x <= divisions; x++) {
        distributionPoints.push(Math.round((maxHours / divisions) * x));
      }
      distributionPoints.unshift(1);
      distributionPoints.unshift(0);
      return distributionPoints;
    }

    function extractHours(rawDeviceData) {
      var usageData = [];
      _.each(rawDeviceData, function (deviceData) {
        usageData.push(deviceData.totalDuration);
      });
      return usageData;
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
      catAxis.title = '';

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
        'titles': [{ 'text': 'Darling usage distribution' }],
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

//      var titles = ["Video", "Whiteboard"];
//      var valueFields = ["video", "whiteboard"];

      var titles = ["Video"];
      var valueFields = ["video"];
      usageChart.graphs = usageGraphs(titles, valueFields);

      return usageChart;
    }

    function usageGraphs(titles, valueFields) {
      var colors = [chartColors.colorPeopleBase, chartColors.colorPeopleLighter];
      var graphs = [];

      _.each(valueFields, function (val, i) {
        graphs.push({
          'type': 'column', //line', //smoothedLine', //column',
          'fillAlphas': 0.6,
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
