(function () {
  'use strict';

  angular.module('Mediafusion').service('ClusterInServiceGraphService', ClusterInServiceGraphService);

  var ChartColors = require('modules/core/config/chartColors').ChartColors;

  /* @ngInject */
  function ClusterInServiceGraphService($rootScope, $translate) {
    var vm = this;
    vm.legend = 'legend';
    vm.liveReportDiv = 'liveReportDiv';
    vm.liveReportExpandDiv = 'liveReportExpandDiv';
    vm.exportDiv = 'cs-export-div';
    return {
      setClusterInService: setClusterInService,
    };

    function setClusterInService(data, graphSize) {
      AmCharts.addInitHandler(function (chart) {
        // check if there are graphs with autoColor: true set
        for (var i = 0; i < chart.graphs.length; i++) {
          var graph = chart.graphs[i];
          if (graph.autoColor !== true) { continue; }
          var colorKey = 'autoColor-' + i;
          graph.lineColorField = colorKey;
          graph.fillColorsField = colorKey;
          for (var x = 0; x < chart.dataProvider.length; x++) {
            var color = chart.colors[x];
            chart.dataProvider[x][colorKey] = color;
          }
        }
      }, ['serial']);
      var chartData = {
        type: 'serial',
        dataProvider: data,
        valueAxes: [{
          gridColor: ChartColors.brandWhite,
          axisAlpha: 0.2,
          gridAlpha: 0,
          dashLength: 0,
          maximum: 100,
          minimum: 0,
          labelFunction: formatLabel,
        }],
        startDuration: 1,
        graphs: [{
          balloonText: '[[category]]: <b>[[value]]</b>',
          fillAlphas: 0.8,
          lineAlpha: 0.2,
          type: 'column',
          valueField: 'value',
          autoColor: true,
          fixedColumnWidth: 15,
          showHandOnHover: true,
        }],
        chartCursor: {
          cursorAlpha: 0,
          zoomable: false,
          oneBalloonOnly: false,
          categoryBalloonEnabled: false,
        },
        categoryField: 'key',
        categoryAxis: {
          gridPosition: 'start',
          axisAlpha: 0.1,
          gridAlpha: 0,
          position: 'left',
          tickPosition: 'start',
          labelsEnabled: true,
          color: ChartColors.brandWhite,
        },
        export: {
          enabled: true,
          divId: vm.exportDiv,
          fileName: 'Cluster_in_Service_' + new Date(),
          libs: {
            autoLoad: false,
          },
          menu: [{
            class: 'export-main',
            label: $translate.instant('reportsPage.downloadOptions'),
            title: $translate.instant('reportsPage.saveAs'),
            menu: ['save.data', 'PNG', 'JPG', 'PDF', 'CSV', 'XLSX'],
          }],
        },
        balloon: {
          enabled: true,
          fixedPosition: true,
        },
      };
      chartData.listeners = [{
        event: 'clickGraphItem',
        method: function (event) {
          $rootScope.$broadcast('clusterClickEvent', {
            data: event.item.category,
          });
        },
      }];
      var chart;
      if (graphSize === 'minimum') {
        chart = AmCharts.makeChart(vm.liveReportDiv, chartData);
        return chart;
      } else {
        chart = AmCharts.makeChart(vm.liveReportExpandDiv, chartData);
        return chart;
      }
    }
    function formatLabel(label) {
      return label + '%';
    }
  }
})();
