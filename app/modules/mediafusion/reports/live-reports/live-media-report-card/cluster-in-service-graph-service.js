(function () {
  'use strict';

  angular.module('Mediafusion').service('ClusterInServiceGraphService', ClusterInServiceGraphService);

  //var ChartColors = require('modules/core/config/chartColors').ChartColors;

  /* @ngInject */
  function ClusterInServiceGraphService($rootScope, $translate) {
    var vm = this;
    vm.liveReportDiv = 'liveReportDiv';
    vm.exportDiv = 'cs-export-div';
    vm.resize = resize;
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
          //maximum: 100,
          //minimum: 0.1,
          //minMaxMultiplier: 1.5,
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
          oneBalloonOnly: false,
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
      /*chart.addListener('rollOverGraphItem', function (event) {
        var b = 'document.getElementById(balloon)';
        b.innerHTML = event.item.category + ': <b>' + event.item.values.value + '</b>';
        b.style.display = 'block';
      });*/
      vm.parentchart = chart;
      return chart;
    }
    function formatLabel(label) {
      return label + '%';
    }
    function resize() {
      AmCharts.addInitHandler(function (chart) {
        // set base values
        //var categoryWidth = 25;

        // calculate bottom margin based on number of data points
        //var chartHeight = categoryWidth * chart.dataProvider.length;

        // set the value
        chart.div.style.height = 400 + 'px';
        chart.div.style.width = 250 + 'px';
      }, ['serial']);
      setClusterInService();
    }
  }
})();
