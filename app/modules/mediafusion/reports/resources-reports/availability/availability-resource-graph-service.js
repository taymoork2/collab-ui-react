(function () {
  'use strict';

  angular.module('Mediafusion').service('AvailabilityResourceGraphService', AvailabilityResourceGraphService);
  /* @ngInject */
  function AvailabilityResourceGraphService(CommonReportsGraphService, chartColors, $translate, $rootScope) {

    var availabilitydiv = 'availabilitydiv';
    var AXIS = 'axis';
    var LEGEND = 'legend';

    var allClusters = $translate.instant('mediaFusion.metrics.allclusters');
    var clusterTitle = $translate.instant('mediaFusion.metrics.clusterTitle');
    var startTime = $translate.instant('mediaFusion.metrics.startTime');
    var endTime = $translate.instant('mediaFusion.metrics.endTime');
    var nodes = $translate.instant('mediaFusion.metrics.nodes');
    var node = $translate.instant('mediaFusion.metrics.node');
    var availabilityStatus = $translate.instant('mediaFusion.metrics.availabilityStatus');
    var availabilityOfHost = $translate.instant('mediaFusion.metrics.availabilityOfHost');
    var availableTitle = $translate.instant('mediaFusion.metrics.availableTitle');
    var unavailableTitle = $translate.instant('mediaFusion.metrics.unavailableTitle');
    var partialTitle = $translate.instant('mediaFusion.metrics.partialTitle');

    var availabilityLegendCluster = [{ 'title': availableTitle, 'color': chartColors.metricDarkGreen }, { 'title': unavailableTitle, 'color': chartColors.negativeDarker }];
    var availabilityLegendAllcluster = [{ 'title': availableTitle, 'color': chartColors.metricDarkGreen }, { 'title': unavailableTitle, 'color': chartColors.negativeDarker }, { 'title': partialTitle, 'color': chartColors.attentionBase }];

    return {
      setAvailabilityGraph: setAvailabilityGraph
    };

    function convertToLocalTime(startDate) {
      var localTime = moment.utc(startDate, 'YYYY-MM-DDTHH:mm:ssZ');
      localTime = moment.utc(localTime).toDate();
      localTime = moment(localTime);
      return localTime;
    }

    function setAvailabilityGraph(data, availabilityChart, selectedCluster, cluster, daterange, Idmap) {
      var tempData = angular.copy(data);
      if (_.isUndefined(data.data[0].isDummy)) {
        var availabilityData = [];
        if (selectedCluster === allClusters) {
          _.forEach(data.data[0].clusterCategories, function (clusterCategory) {
            var clusterName = _.findKey(Idmap, function (val) {
              return val === clusterCategory.category;
            });
            if (!_.isUndefined(clusterName)) {
              clusterCategory.category = clusterName;
              availabilityData.push(clusterCategory);
            }
          });
          if (availabilityData.length === 0) {
            return false;
          }
          availabilityData = _.sortBy(availabilityData, 'category');
          tempData.data[0].clusterCategories = availabilityData;
        }
      }
      var startDate = tempData.data[0].startTime;
      startDate = convertToLocalTime(startDate);
      if (tempData === null || tempData === 'undefined' || tempData.length === 0) {
        return;
      } else {
        availabilityChart = createAvailabilityGraph(tempData, selectedCluster, cluster, daterange);
        availabilityChart.period = tempData.data[0].period;
        availabilityChart.startDate = startDate;
        availabilityChart.validateData();
        return availabilityChart;
      }
    }

    function createAvailabilityGraph(data, selectedCluster, cluster, daterange) {
      // if there are no active users for this user
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }
      var legend;
      if (selectedCluster === allClusters) {
        legend = angular.copy(availabilityLegendAllcluster);
      } else {
        legend = angular.copy(availabilityLegendCluster);
      }
      if (!_.isUndefined(data.data[0].isDummy) && data.data[0].isDummy) {
        _.forEach(legend, function (value, key) {
          legend[key].color = '#AAB3B3';
        });
      }
      var valueAxis = CommonReportsGraphService.getBaseVariable(AXIS);
      valueAxis.type = 'date';
      valueAxis.balloonTextFunction = function (date) {
        return moment(date.toString()).format('HH:mm, DD MMMM');
      };
      var catAxes = CommonReportsGraphService.getBaseVariable(AXIS);
      catAxes.labelFunction = formatLabel;
      catAxes.autoGridCount = false;
      catAxes.gridCount = 10;
      catAxes.gridAlpha = 0.3;
      catAxes.listeners = [{
        "event": "clickItem",
        "method": function (event) {
          $rootScope.$broadcast('clusterClickEvent', {
            data: event.serialDataItem.category
          });
        }
      }];
      var exportFields = ['startTime', 'endTime', 'nodes', 'availability', 'category'];
      var columnNames = {};
      if (cluster === allClusters) {
        columnNames = {
          'startTime': startTime,
          'endTime': endTime,
          'nodes': nodes,
          'availability': availabilityStatus,
          'category': clusterTitle,
        };
      } else {
        columnNames = {
          'availability': availabilityOfHost,
          'startTime': startTime,
          'endTime': endTime,
          'category': node,
        };
      }
      cluster = _.replace(cluster, /\s/g, '_');
      daterange = _.replace(daterange, /\s/g, '_');
      var ExportFileName = 'MediaService_Availability_' + cluster + '_' + daterange + '_' + new Date();
      var chartData = CommonReportsGraphService.getGanttGraph(data.data[0].clusterCategories, valueAxis, CommonReportsGraphService.getBaseExportForGraph(exportFields, ExportFileName, columnNames), catAxes);
      chartData.legend = CommonReportsGraphService.getBaseVariable(LEGEND);
      chartData.legend.labelText = '[[title]]';
      chartData.legend.data = legend;
      chartData.graph.showHandOnHover = true;
      chartData.listeners = [{
        "event": "clickGraphItem",
        "method": function (event) {
          $rootScope.$broadcast('clusterClickEvent', {
            data: event.item.category
          });
        }
      }];
      var chart = AmCharts.makeChart(availabilitydiv, chartData, 0);
      chart.addListener("init", function () {
        chart.categoryAxis.addListener("rollOverItem", function (event) {
          event.target.setAttr("cursor", "default");
          event.chart.balloon.followCursor(true);
          event.chart.balloon.showBalloon(event.serialDataItem.category);
        });

        chart.categoryAxis.addListener("rollOutItem", function (event) {
          event.chart.balloon.hide();
        });
      });
      return chart;
    }

    function formatLabel(label) {
      if (label.length > 10) {
        return label.substring(0, 10) + "..";
      } else {
        return label;
      }
    }
  }
})();
