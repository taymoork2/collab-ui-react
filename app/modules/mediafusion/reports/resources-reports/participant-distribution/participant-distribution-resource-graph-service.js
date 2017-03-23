(function () {
  'use strict';

  angular.module('Mediafusion').service('ParticipantDistributionResourceGraphService', ParticipantDistributionResourceGraphService);
  /* @ngInject */
  function ParticipantDistributionResourceGraphService(CommonReportsGraphService, chartColors, $translate, $rootScope) {

    var vm = this;
    vm.participantDistributiondiv = 'participantDistributiondiv';
    vm.exportDiv = 'participant-export-div';
    vm.GUIDEAXIS = 'guideaxis';
    vm.AXIS = 'axis';
    vm.LEGEND = 'legend';
    vm.timeDiff = null;
    vm.dateSelected = null;
    vm.zoomedEndTime = null;
    vm.zoomedStartTime = null;

    vm.timeStamp = $translate.instant('mediaFusion.metrics.timeStamp');
    vm.allClusters = $translate.instant('mediaFusion.metrics.allclusters');
    vm.participants = $translate.instant('mediaFusion.metrics.participants');


    return {
      setParticipantDistributionGraph: setParticipantDistributionGraph,
    };

    function setParticipantDistributionGraph(response, participantDistributionChart, clusterSelected, clusterId, daterange, clusterMap) {
      var isDummy = false;
      var data = response.graphData;
      var graphs = getClusterName(response.graphs, clusterMap);
      if (data === null || data === 'undefined' || data.length === 0) {
        return undefined;
      } else {
        if (graphs[0].isDummy) {
          isDummy = true;
        }
        if (clusterId !== vm.allClusters && !isDummy) {
          var cluster = _.find(graphs, function (value) {
            return value.valueField === clusterId;
          });
          if (_.isUndefined(cluster)) {
            return undefined;
          }
        }

        var startDuration = 1;
        if (!data[0].balloon) {
          startDuration = 0;
        }

        participantDistributionChart = createParticipantDistributionGraph(data, graphs, clusterSelected, daterange, isDummy);
        participantDistributionChart.dataProvider = data;
        participantDistributionChart.graphs = graphs;
        participantDistributionChart.startDuration = startDuration;
        participantDistributionChart.balloon.enabled = true;
        participantDistributionChart.chartCursor.valueLineBalloonEnabled = true;
        participantDistributionChart.chartCursor.valueLineEnabled = true;
        participantDistributionChart.chartCursor.categoryBalloonEnabled = true;
        participantDistributionChart.chartCursor.oneBalloonOnly = true;
        participantDistributionChart.chartCursor.balloonColor = chartColors.grayLightTwo;
        participantDistributionChart.chartCursor.valueBalloonsEnabled = true;
        if (isDummy) {
          participantDistributionChart.chartCursor.valueLineBalloonEnabled = false;
          participantDistributionChart.chartCursor.valueLineEnabled = false;
          participantDistributionChart.chartCursor.categoryBalloonEnabled = false;
          participantDistributionChart.balloon.enabled = false;
        }
        participantDistributionChart.validateData();
        return participantDistributionChart;
      }
    }

    function createParticipantDistributionGraph(data, graphs, clusterSelected, daterange, isDummy) {
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }
      vm.dateSelected = daterange;
      var valueAxes = [CommonReportsGraphService.getBaseVariable(vm.GUIDEAXIS)];
      valueAxes[0].integersOnly = true;
      valueAxes[0].axisAlpha = 0.5;
      valueAxes[0].axisColor = '#1C1C1C';
      valueAxes[0].minimum = 0;
      valueAxes[0].autoGridCount = true;
      valueAxes[0].position = 'left';
      valueAxes[0].title = vm.participants;
      //valueAxes[0].titleRotation = 0;
      valueAxes[0].labelOffset = 28;

      var catAxis = CommonReportsGraphService.getBaseVariable(vm.AXIS);
      catAxis.gridPosition = 'start';
      catAxis.dataDateFormat = 'YYYY-MM-DDTJJ:NN:SS.QQQZ';
      catAxis.parseDates = true;
      catAxis.axisAlpha = 0.5;
      catAxis.axisColor = '#1C1C1C';
      catAxis.gridAlpha = 0.1;
      catAxis.minorGridAlpha = 0.1;
      catAxis.minorGridEnabled = false;
      var dateLabel = daterange.label;
      var dateValue = daterange.value;

      if (_.isUndefined(dateValue)) {
        vm.timeDiff = Math.floor(moment(vm.dateSelected.endTime).diff(moment(vm.dateSelected.startTime)) / 60000);
        if (vm.timeDiff <= 240) {
          catAxis.minPeriod = '1mm';
        } else if (vm.timeDiff > 240 && vm.timeDiff <= 1440) {
          catAxis.minPeriod = '10mm';
        } else if (vm.timeDiff > 1440 && vm.timeDiff <= 10080) {
          catAxis.minPeriod = 'hh';
        } else if (vm.timeDiff > 10080 && vm.timeDiff <= 43200) {
          catAxis.minPeriod = '3hh';
        } else if (vm.timeDiff > 43200) {
          catAxis.minPeriod = '8hh';
        }
      } else {
        if (dateValue === 0) {
          catAxis.minPeriod = '1mm';
        } else if (dateValue === 1) {
          catAxis.minPeriod = '10mm';
        } else if (dateValue === 2) {
          catAxis.minPeriod = 'hh';
        } else if (dateValue === 3) {
          catAxis.minPeriod = '3hh';
        } else if (dateValue === 4) {
          catAxis.minPeriod = '8hh';
        }
      }

      var startDuration = 1;
      if (!data[0].balloon) {
        startDuration = 0;
      }

      var columnNames = {
        'time': vm.timeStamp,
      };
      var exportFields = [];
      _.forEach(graphs, function (value) {
        columnNames[value.valueField] = value.title + ' ' + vm.participants;
      });
      for (var key in columnNames) {
        exportFields.push(key);
      }
      var cluster = _.replace(clusterSelected, /\s/g, '_');
      dateLabel = _.replace(dateLabel, /\s/g, '_');
      var ExportFileName = 'MediaService_ParticipantDistribution_' + cluster + '_' + dateLabel + '_' + new Date();

      if (!isDummy && clusterSelected === vm.allClusters) {
        graphs.push({
          'title': 'All',
          'id': 'all',
          'bullet': 'square',
          'bulletSize': 10,
          'lineColor': '#000000',
          'hidden': true,
        });

        graphs.push({
          'title': 'None',
          'id': 'none',
          'bullet': 'square',
          'bulletSize': 10,
          'lineColor': '#000000',
        });
      }
      var chartData = CommonReportsGraphService.getBaseStackSerialGraph(data, startDuration, valueAxes, graphs, 'time', catAxis, CommonReportsGraphService.getBaseExportForGraph(exportFields, ExportFileName, columnNames, vm.exportDiv));
      chartData.chartCursor.balloonPointerOrientation = 'vertical';
      chartData.legend = CommonReportsGraphService.getBaseVariable(vm.LEGEND);
      chartData.legend.labelText = '[[title]]';
      chartData.legend.useGraphSettings = true;

      chartData.legend.listeners = [{
        'event': 'hideItem',
        "method": legendHandler,
      }, {
        'event': 'showItem',
        'method': legendHandler,
      }];

      var chart = AmCharts.makeChart(vm.participantDistributiondiv, chartData);
      chart.addListener('clickGraph', handleClick);
      // listen for zoomed event and call "handleZoom" method
      chart.addListener('zoomed', handleZoom);
      return chart;
    }

    //method to handle the individual cluster click
    function handleClick(event) {
      var clickedCluster = event.target;
      $rootScope.$broadcast('clusterClickEvent', {
        data: clickedCluster.title,
      });
    }

    // this method is called each time the selected period of the chart is changed
    function handleZoom(event) {
      vm.zoomedStartTime = event.startDate;
      vm.zoomedEndTime = event.endDate;
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

    function getClusterName(graphs, clusterMap) {
      var tempData = [];
      _.forEach(graphs, function (value) {
        var clusterName = _.findKey(clusterMap, function (val) {
          return val === value.valueField;
        });
        if (!_.isUndefined(clusterName)) {
          value.title = clusterName;
          value.balloonText = '<span class="graph-text">' + value.title + ' ' + ' <span class="graph-number">[[value]]</span></span>' + ' <span class="graph-text"><span class="graph-text-color">[[' + value.descriptionField + ']]</span></span>';
          value.lineThickness = 2;
        }
        if (value.title !== value.valueField) {
          value.connect = false;
          tempData.push(value);
        }
      });
      tempData = _.sortBy(tempData, 'title');
      return tempData;
    }

    function legendHandler(evt) {
      if (evt.dataItem.id === 'all') {
        _.forEach(evt.chart.graphs, function (graph) {
          if (graph.id != 'all') {
            evt.chart.showGraph(graph);
          } else if (graph.id === 'all') {
            evt.chart.hideGraph(graph);
          }

        });
      } else if (evt.dataItem.id === 'none') {
        _.forEach(evt.chart.graphs, function (graph) {
          if (graph.id != 'all') {
            evt.chart.hideGraph(graph);
          } else if (graph.id === 'all') {
            evt.chart.showGraph(graph);
          }
        });
      }
    }
  }
})();
