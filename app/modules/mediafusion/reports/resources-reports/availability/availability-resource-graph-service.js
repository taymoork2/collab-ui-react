(function () {
  'use strict';

  angular.module('Mediafusion').service('AvailabilityResourceGraphService', AvailabilityResourceGraphService);

  var ChartColors = require('modules/core/config/chartColors').ChartColors;

  /* @ngInject */
  function AvailabilityResourceGraphService(CommonReportsGraphService, $translate, $rootScope) {
    var vm = this;
    vm.availabilitydiv = 'availabilitydiv';
    vm.exportDiv = 'availability-div';
    vm.AXIS = 'axis';
    vm.LEGEND = 'legend';

    vm.dateSelected = null;
    vm.zoomedEndTime = null;
    vm.zoomedStartTime = null;

    vm.allClusters = $translate.instant('mediaFusion.metrics.allclusters');
    vm.clusterTitle = $translate.instant('mediaFusion.metrics.clusterTitle');
    vm.startTime = $translate.instant('mediaFusion.metrics.startTime');
    vm.endTime = $translate.instant('mediaFusion.metrics.endTime');
    vm.nodes = $translate.instant('mediaFusion.metrics.nodes');
    vm.node = $translate.instant('mediaFusion.metrics.node');
    vm.availabilityStatus = $translate.instant('mediaFusion.metrics.availabilityStatus');
    vm.availabilityOfHost = $translate.instant('mediaFusion.metrics.availabilityOfHost');
    vm.availableTitle = $translate.instant('mediaFusion.metrics.availableTitle');
    vm.unavailableTitle = $translate.instant('mediaFusion.metrics.unavailableTitle');
    vm.partialTitle = $translate.instant('mediaFusion.metrics.partialTitle');

    vm.availabilityLegendCluster = [{ title: vm.availableTitle, color: ChartColors.metricDarkGreen }, { title: vm.unavailableTitle, color: ChartColors.negativeDarker }];
    vm.availabilityLegendAllcluster = [{ title: vm.availableTitle, color: ChartColors.metricDarkGreen }, { title: vm.unavailableTitle, color: ChartColors.negativeDarker }, { title: vm.partialTitle, color: ChartColors.attentionBase }];

    return {
      setAvailabilityGraph: setAvailabilityGraph,
    };

    function convertToLocalTime(startDate) {
      var localTime = moment.utc(startDate, 'YYYY-MM-DDTHH:mm:ssZ');
      localTime = moment.utc(localTime).toDate();
      localTime = moment(localTime);
      return localTime;
    }

    function setAvailabilityGraph(data, availabilityChart, selectedCluster, cluster, daterange, Idmap) {
      var isDummy = false;
      var tempData = _.cloneDeep(data);
      if (data.data[0].isDummy) {
        isDummy = true;
      }
      if (_.isUndefined(data.data[0].isDummy)) {
        var availabilityData = [];
        if (selectedCluster === vm.allClusters) {
          _.each(data.data[0].clusterCategories, function (clusterCategory) {
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
        return undefined;
      } else {
        availabilityChart = createAvailabilityGraph(tempData, selectedCluster, cluster, daterange, isDummy);
        availabilityChart.period = tempData.data[0].period;
        availabilityChart.startDate = startDate;
        if (isDummy) {
          availabilityChart.chartCursor.valueBalloonsEnabled = false;
          availabilityChart.chartCursor.valueLineBalloonEnabled = false;
          availabilityChart.chartCursor.categoryBalloonEnabled = false;
          availabilityChart.chartCursor.valueLineEnabled = false;
          availabilityChart.balloon.enabled = false;
        }
        availabilityChart.validateData();
        return availabilityChart;
      }
    }

    function createAvailabilityGraph(data, selectedCluster, cluster, daterange, isDummy) {
      // if there are no active users for this user
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }
      var legend;
      vm.dateSelected = daterange;
      if (selectedCluster === vm.allClusters) {
        legend = _.cloneDeep(vm.availabilityLegendAllcluster);
      } else {
        legend = _.cloneDeep(vm.availabilityLegendCluster);
      }
      if (!_.isUndefined(data.data[0].isDummy) && data.data[0].isDummy) {
        _.each(legend, function (value, key) {
          legend[key].color = '#AAB3B3';
        });
      }
      var valueAxis = CommonReportsGraphService.getBaseVariable(vm.AXIS);
      valueAxis.type = 'date';
      valueAxis.balloonTextFunction = function (date) {
        return moment(date.toString()).format('HH:mm, DD MMMM');
      };
      var catAxes = CommonReportsGraphService.getBaseVariable(vm.AXIS);
      catAxes.labelFunction = formatLabel;
      catAxes.autoGridCount = false;
      catAxes.gridCount = 10;
      catAxes.gridAlpha = 0.3;
      if (!isDummy) {
        catAxes.listeners = [{
          event: 'clickItem',
          method: function (event) {
            $rootScope.$broadcast('clusterClickEvent', {
              data: event.serialDataItem.category,
            });
          },
        }];
      }
      var exportFields = ['startTime', 'endTime', 'nodes', 'availability', 'category'];
      var columnNames = {};
      if (cluster === vm.allClusters) {
        columnNames = {
          startTime: vm.startTime,
          endTime: vm.endTime,
          nodes: vm.nodes,
          availability: vm.availabilityStatus,
          category: vm.clusterTitle,
        };
      } else {
        columnNames = {
          availability: vm.availabilityOfHost,
          startTime: vm.startTime,
          endTime: vm.endTime,
          category: vm.node,
        };
      }
      cluster = _.replace(cluster, /\s/g, '_');
      daterange = _.replace(daterange, /\s/g, '_');
      var ExportFileName = 'MediaService_Availability_' + cluster + '_' + daterange + '_' + new Date();
      var chartData = CommonReportsGraphService.getGanttGraph(data.data[0].clusterCategories, valueAxis, CommonReportsGraphService.getBaseExportForGraph(exportFields, ExportFileName, columnNames, vm.exportDiv), catAxes);
      chartData.legend = CommonReportsGraphService.getBaseVariable(vm.LEGEND);
      chartData.legend.color = ChartColors.grayDarkThree;
      chartData.legend.labelText = '[[title]]';
      chartData.legend.data = legend;
      chartData.graph.showHandOnHover = (selectedCluster === vm.allClusters);
      if (!isDummy) {
        chartData.listeners = [{
          event: 'clickGraphItem',
          method: function (event) {
            $rootScope.$broadcast('clusterClickEvent', {
              data: event.item.category,
            });
          },
        }];
      }

      var chart = AmCharts.makeChart(vm.availabilitydiv, chartData, 0);

      chart.addListener('init', function () {
        // listen for zoomed event and call 'handleZoom' method
        chart.valueAxis.addListener('axisZoomed', handleZoom);
        chart.categoryAxis.addListener('rollOverItem', function (event) {
          event.target.setAttr('cursor', 'default');
          event.chart.balloon.followCursor(true);
          event.chart.balloon.showBalloon(event.serialDataItem.category);
        });

        chart.categoryAxis.addListener('rollOutItem', function (event) {
          event.chart.balloon.hide();
        });
      });
      return chart;
    }

    // this method is called each time the selected period of the chart is changed
    function handleZoom(event) {
      vm.zoomedStartTime = moment(event.startValue);
      vm.zoomedEndTime = moment(event.endValue);
      var selectedTime = {
        startTime: vm.zoomedStartTime,
        endTime: vm.zoomedEndTime,
      };

      if ((_.isUndefined(vm.dateSelected.value) && vm.zoomedStartTime !== vm.dateSelected.startTime && vm.zoomedEndTime !== vm.dateSelected.endTime) || (vm.zoomedStartTime !== vm.dateSelected.startTime && vm.zoomedEndTime !== vm.dateSelected.endTime)) {
        $rootScope.$broadcast('zoomedTime', {
          data: selectedTime,
        });
      }
    }

    function formatLabel(label) {
      if (label.length > 10) {
        return (label.length <= 12) ? label : label.substring(0, 10) + '..';
      } else {
        return label;
      }
    }
  }
})();
