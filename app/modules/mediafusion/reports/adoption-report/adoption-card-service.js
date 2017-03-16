(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .service('AdoptionCardService', AdoptionCardService);
  /* @ngInject */
  function AdoptionCardService($translate, CommonReportsGraphService) {
    var vm = this;
    vm.clientTypeChartDiv = 'clientTypeChartDiv';
    vm.numberOfMeetsOnPremisesChartDiv = 'numberOfMeetsOnPremisesChartDiv';
    vm.totalParticipantsChartDiv = 'totalParticipantsChartDiv';
    vm.totalHeader = $translate.instant('mediaFusion.metrics.clientType.total');
    vm.total_cloud_title = $translate.instant('mediaFusion.metrics.totalCloud');
    vm.overflow_title = $translate.instant('mediaFusion.metrics.cloud_calls');
    vm.cloud_calls_title = $translate.instant('mediaFusion.metrics.totalCloud');


    return {
      setClientTypePiechart: setClientTypePiechart,
      setDummyClientTypePiechart: setDummyClientTypePiechart,
      setNumberOfMeetsOnPremisesPiechart: setNumberOfMeetsOnPremisesPiechart,
      setDummyNumberOfMeetsOnPremisesPiechart: setDummyNumberOfMeetsOnPremisesPiechart,
      setTotalParticipantsPiechart: setTotalParticipantsPiechart,
      setDummyTotalParticipantsPiechart: setDummyTotalParticipantsPiechart,
    };

    function setClientTypePiechart(data) {
      var chartData = CommonReportsGraphService.getBasePieChart(data);
      chartData.labelText = '[[name]]';
      var chart = AmCharts.makeChart(vm.clientTypeChartDiv, chartData, 0);
      return chart;
    }

    function setNumberOfMeetsOnPremisesPiechart(data) {
      var chartData = CommonReportsGraphService.getBasePieChart(data);
      chartData.labelText = '[[name]]';
      var chart = AmCharts.makeChart(vm.numberOfMeetsOnPremisesChartDiv, chartData, 0);
      return chart;
    }

    function setTotalParticipantsPiechart(callsOnPremise, callsOverflow, cloudCalls, total) {
      var data = {};
      var dataProvider = [];
      dataProvider = [{
        "name": vm.total_cloud_title,
        "color": "#22D5A3",
        "value": callsOnPremise,
      }, {
        "name": vm.overflow_title,
        "color": "#1CA0AE",
        "value": callsOverflow,
      }, {
        "name": vm.cloud_calls_title,
        "color": "#1FBBCB",
        "value": cloudCalls,
      }];
      data['dataProvider'] = dataProvider;
      var chartData = CommonReportsGraphService.getBasePieChart(data);
      chartData.labelText = '[[name]]';
      chartData.allLabels = [{
        "text": vm.totalHeader + " " + total,
        "align": "center",
        "y": 63,
      }];
      var chart = AmCharts.makeChart(vm.totalParticipantsChartDiv, chartData, 0);
      return chart;
    }

    function setDummyClientTypePiechart() {
      var chartData = CommonReportsGraphService.getDummyPieChart();
      var chart = AmCharts.makeChart(vm.clientTypeChartDiv, chartData, 0);
      return chart;
    }

    function setDummyNumberOfMeetsOnPremisesPiechart() {
      var chartData = CommonReportsGraphService.getDummyPieChart();
      var chart = AmCharts.makeChart(vm.numberOfMeetsOnPremisesChartDiv, chartData, 0);
      return chart;
    }

    function setDummyTotalParticipantsPiechart(data) {
      var chartData = CommonReportsGraphService.getDummyPieChart(data);
      chartData.labelText = '[[name]]';
      var chart = AmCharts.makeChart(vm.totalParticipantsChartDiv, chartData, 0);
      return chart;
    }

  }
})();
