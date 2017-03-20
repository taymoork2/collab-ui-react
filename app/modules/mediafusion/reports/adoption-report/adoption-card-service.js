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
    vm.onPremiseHeading = $translate.instant('mediaFusion.metrics.onPremisesHeading');
    vm.overflowHeading = $translate.instant('mediaFusion.metrics.cloud_calls');
    vm.cloudCallHeading = $translate.instant('mediaFusion.metrics.totalCloud');


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

    function setTotalParticipantsPiechart(callsOnPremise, callsOverflow, cloudCalls) {
      var data = {};
      var dataProvider = [];
      cloudCalls = (cloudCalls - callsOverflow) < 0 ? 0 : (cloudCalls - callsOverflow);
      var total = cloudCalls + callsOverflow + callsOnPremise;
      dataProvider = [{
        'name': vm.onPremiseHeading,
        'color': '#22D5A3',
        'value': callsOnPremise,
      }, {
        'name': vm.overflowHeading,
        'color': '#1CA0AE',
        'value': callsOverflow,
      }, {
        'name': vm.cloudCallHeading,
        'color': '#1FBBCB',
        'value': cloudCalls,
      }];
      data['dataProvider'] = dataProvider;
      var chartData = CommonReportsGraphService.getBasePieChart(data);
      chartData.labelText = '[[name]]';
      chartData.allLabels = [{
        'text': vm.totalHeader + ' ' + total,
        'align': 'center',
        'y': 63,
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
