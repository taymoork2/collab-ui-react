(function () {
  'use strict';

  angular.module('Mediafusion').service('ClusterInServiceGraphService', ClusterInServiceGraphService);

  //var ChartColors = require('modules/core/config/chartColors').ChartColors;

  /* @ngInject */
  function ClusterInServiceGraphService($rootScope) {
    var vm = this;
    vm.liveReportDiv = 'liveReportDiv';
    return {
      setClusterInService: setClusterInService,
    };

    function setClusterInService(data) {
      //var tempData = graph(data);
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
        //theme: 'light',
        dataProvider: data,
        valueAxes: [{
          gridColor: '#FFFFFF',
          axisAlpha: 0.2,
          gridAlpha: 0,
          dashLength: 0,
          //integersOnly: true,
          maximum: 100,
          labelFunction: formatLabel,
        }],
        //gridAboveGraphs: true,
        startDuration: 1,
        graphs: [{
          balloonText: '[[category]]: <b>[[value]]</b>',
          fillAlphas: 0.8,
          lineAlpha: 0.2,
          type: 'column',
          valueField: 'value',
          autoColor: true,
          showHandOnHover: true,
        }],
        chartCursor: {
          cursorAlpha: 0,
          zoomable: false,
          //valueLineBalloonEnabled: true,
          //valueLineEnabled: true,
          categoryBalloonEnabled: false,
        },
        categoryField: 'key',
        categoryAxis: {
          gridPosition: 'start',
          axisAlpha: 0.1,
          gridAlpha: 0,
          position: 'left',
          tickPosition: 'start',
          //tickLength: 2,
          labelsEnabled: false,
        },
        /*export: {
          enabled: true,
        },
        balloon: {
          enabled: true,
        },*/
      };
      //chartData.graph.showHandOnHover = true;
      chartData.listeners = [{
        event: 'clickGraphItem',
        method: function (event) {
          $rootScope.$broadcast('clusterClickEvent', {
            data: event.item.category,
          });
        },
      }];
      var chart = AmCharts.makeChart(vm.liveReportDiv, chartData);
      return chart;
    }
    function formatLabel(label) {
      return label + '%';
    }
  }
})();
