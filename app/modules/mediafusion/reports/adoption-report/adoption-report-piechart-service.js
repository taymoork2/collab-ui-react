(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .service('AdoptionPiechartService', AdoptionPiechartService);
  /* @ngInject */
  function AdoptionPiechartService(CommonReportsGraphService) {
    var vm = this;
    vm.clientTypeDonutDiv = 'clientTypeDonutDiv';
    vm.numberOfMeetsOnPremisesDonutDiv = 'numberOfMeetsOnPremisesDonutDiv';


    return {
      setClientTypePiechart: setClientTypePiechart,
      setDummyClientTypePiechart: setDummyClientTypePiechart,
      setNumberOfMeetsOnPremisesPiechart: setNumberOfMeetsOnPremisesPiechart,
      setDummyNumberOfMeetsOnPremisesPiechart: setDummyNumberOfMeetsOnPremisesPiechart,
    };

    function setClientTypePiechart(data) {
      var chartData = CommonReportsGraphService.getBasePieChart(data);
      var chart = AmCharts.makeChart(vm.clientTypeDonutDiv, chartData, 0);
      return chart;
    }

    function setNumberOfMeetsOnPremisesPiechart(data) {
      var chartData = CommonReportsGraphService.getBasePieChart(data);
      var chart = AmCharts.makeChart(vm.numberOfMeetsOnPremisesDonutDiv, chartData, 0);
      return chart;
    }

    function setDummyClientTypePiechart() {
      var chartData = CommonReportsGraphService.getDummyPieChart();
      var chart = AmCharts.makeChart(vm.clientTypeDonutDiv, chartData, 0);
      return chart;
    }

    function setDummyNumberOfMeetsOnPremisesPiechart() {
      var chartData = CommonReportsGraphService.getDummyPieChart();
      var chart = AmCharts.makeChart(vm.numberOfMeetsOnPremisesDonutDiv, chartData, 0);
      return chart;
    }

  }
})();
