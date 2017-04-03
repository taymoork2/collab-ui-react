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
      data = formatOthersData(data.dataProvider);
      var chartData = CommonReportsGraphService.getBasePieChart(data);
      chartData.labelText = '[[name]]';
      chartData.balloonText = '[[name]]: [[percentage]]% ([[value]])';
      var chart = AmCharts.makeChart(vm.clientTypeChartDiv, chartData, 0);
      return chart;
    }

    function setNumberOfMeetsOnPremisesPiechart(data) {
      data = formatOthersData(data.dataProvider);
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
      data = formatOthersData(data.dataProvider);
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

    function formatOthersData(data) {
      var totalValue = 0;
      var newData = [];
      var sumPercentage = 0;
      var sumValue = 0;
      _.forEach(data, function (type) {
        totalValue = totalValue + type.value;
      });
      _.forEach(data, function (type) {
        type.percentage = 100 * (type.value / totalValue);
      });
      if (data.length > 5) {
        data = _.sortBy(data, 'percentage');
        _.forEach(data, function (point) {
          if (point.percentage < 5) {
            sumPercentage += point.percentage;
            sumValue += point.value;
          } else {
            newData.push(point);
          }
        });
        newData = _.shuffle(newData);
        newData.push({ 'name': vm.othersHeading, 'value': sumValue, 'percentage': sumPercentage });
      } else {
        newData = data;
      }
      _.forEach(newData, function (type) {
        type.percentage = _.round(type.percentage, 2);
      });
      return newData;
    }
  }
})();
