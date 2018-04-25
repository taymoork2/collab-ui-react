(function () {
  'use strict';

  angular.module('Mediafusion').service('ClusterInServiceGraphService', ClusterInServiceGraphService);

  //var ChartColors = require('modules/core/config/chartColors').ChartColors;

  /* @ngInject */
  function ClusterInServiceGraphService() {
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
      var chart = AmCharts.makeChart(vm.liveReportDiv, {
        type: 'serial',
        //theme: 'light',
        dataProvider: data,
        valueAxes: [{
          gridColor: '#FFFFFF',
          //gridAlpha: 0.2,
          dashLength: 0,
          maximum: 100,
          minimum: 0,
        }],
        //gridAboveGraphs: true,
        startDuration: 0,
        graphs: [{
          balloonText: '[[category]]: <b>[[value]]</b>',
          fillAlphas: 0.8,
          lineAlpha: 0.2,
          type: 'column',
          valueField: 'value',
          autoColor: true,
        }],
        chartCursor: {
          cursorAlpha: 0,
          zoomable: false,
          //valueLineBalloonEnabled: true,
          //valueLineEnabled: true,
          categoryBalloonEnabled: true,
        },
        categoryField: 'key',
        categoryAxis: {
          gridPosition: 'start',
          gridAlpha: 0,
          tickPosition: 'start',
          //tickLength: 20,
          labelsEnabled: false,
        },
        /*export: {
          enabled: true,
        },
        balloon: {
          enabled: true,
        },*/
      });
      /*var chart = AmCharts.makeChart(vm.liveReportDiv, {
        type: 'serial',
        //theme: 'light',
        /*legend: {
          horizontalGap: 10,
          maxColumns: 1,
          position: 'right',
          //"useGraphSettings": true,
          markerSize: 10,
        },
        dataProvider: data,
        valueAxes: [{
          //"stackType": "regular",
          axisAlpha: 0.3,
          gridAlpha: 0,
        }],
        graphs: tempData,
        categoryField: 'key',
        categoryAxis: {
          gridPosition: 'start',
          axisAlpha: 0,
          gridAlpha: 0,
          position: 'left',
        },
        export: {
          enabled: true,
        },

      });
      /*chart.legend = CommonReportsGraphService.getBaseVariable(vm.LEGEND);
      if (chart.graphs[0].lineColor === chart.grayLightTwo) {
        chart.legend.color = chart.grayDarkThree;
      }
      chart.legend.labelText = '[[title]]';
      chart.legend.useGraphSettings = true;*/

      /*chart.legend.listeners = [{
        event: 'hideItem',
        method: legendHandler,
      }, {
        event: 'showItem',
        method: legendHandler,
      }];*/
      return chart;
    }

    /*function graph(data) {
      var tempData = [];
      _.each(data, function (value) {
        value.labelText = '<span>[[value]]</span>';
        value.type = 'column';
        value.valueField = 'value';
        tempData.push(value);
        return tempData;
      });
    }*/
  }
})();
