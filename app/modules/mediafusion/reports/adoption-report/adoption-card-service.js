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
    vm.othersHeading = $translate.instant('mediaFusion.metrics.othersHeading');


    return {
      setClientTypePiechart: setClientTypePiechart,
      setDummyClientTypePiechart: setDummyClientTypePiechart,
      setNumberOfMeetsOnPremisesPiechart: setNumberOfMeetsOnPremisesPiechart,
      setDummyNumberOfMeetsOnPremisesPiechart: setDummyNumberOfMeetsOnPremisesPiechart,
      setTotalParticipantsPiechart: setTotalParticipantsPiechart,
      setDummyTotalParticipantsPiechart: setDummyTotalParticipantsPiechart,
    };

    function setClientTypePiechart(data) {
      data = formatDecimal(data.dataProvider);
      var chartData = CommonReportsGraphService.getBasePieChart(data);
      chartData.labelText = '[[name]]';
      chartData.balloonText = '[[name]]: [[percentage]]% ([[value]])';
      var chart = AmCharts.makeChart(vm.clientTypeChartDiv, chartData, 0);
      return chart;
    }

    function setNumberOfMeetsOnPremisesPiechart(data) {
      data = formatDecimal(data.dataProvider);
      var chartData = CommonReportsGraphService.getBasePieChart(data);
      chartData.labelText = '[[name]]';
      chartData.balloonText = '[[name]]: [[percentage]]% ([[value]])';
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
      data = formatDecimal(data.dataProvider);
      var chartData = CommonReportsGraphService.getBasePieChart(data);
      chartData.labelText = '[[name]]';
      chartData.balloonText = '[[name]]: [[percentage]]% ([[value]])';
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

    function formatDecimal(data) {
      var totalValue = 0;
      var sumPercentage = 0;
      var sumValue = 0;
      _.forEach(data, function (type) {
        totalValue = totalValue + type.value;
      });
      _.forEach(data, function (type) {
        type.percentage = _.round(100 * (type.value / totalValue));
      });
      if (data.length > 4) {
        data = _.sortBy(data, 'percentage').reverse();
        for (var i = data.length - 1; i > 3; i--) {
          sumPercentage = sumPercentage + data[i].percentage;
          sumValue = sumValue + data[i].value;
        }
        data = _.dropRight(data, data.length - 4);
        data = _.shuffle(data);
        data.push({ 'name': vm.othersHeading, 'value': sumValue, 'percentage': sumPercentage });
      }
      return data;
    }

  }
})();
