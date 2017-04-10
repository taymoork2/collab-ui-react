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
      data = formatClientTypePieData(data.dataProvider);
      var chartData = CommonReportsGraphService.getBasePieChart(data);
      chartData.labelText = '[[name]]';
      chartData.balloonText = '[[name]]: [[percentage]]% ([[value]])';
      var chart = AmCharts.makeChart(vm.clientTypeChartDiv, chartData, 0);
      return chart;
    }

    function setNumberOfMeetsOnPremisesPiechart(data) {
      data = formatData(data.dataProvider);
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
      total = formatTotal(total);
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
      data = formatData(data.dataProvider);
      var chartData = CommonReportsGraphService.getBasePieChart(data);
      chartData.labelText = '[[name]]';
      chartData.balloonText = '[[name]]: [[percentage]]% ([[value]])';
      chartData.allLabels = [{
        'text': total,
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

    function formatData(data) {
      var totalValue = 0;
      _.each(data, function (type) {
        totalValue += type.value;
      });
      _.each(data, function (type) {
        type.percentage = 100 * (type.value / totalValue);
        type.percentage = _.round(type.percentage, 2);
      });
      return data;
    }

    function formatClientTypePieData(data) {
      var totalValue = 0;
      var newData = [];
      var desktopList = [$translate.instant('mediaFusion.metrics.clientType.desktop')];
      var desktopPercentage = 0;
      var desktopValue = 0;
      var mobileList = [$translate.instant('mediaFusion.metrics.clientType.android'),
        $translate.instant('mediaFusion.metrics.clientType.blackberry'),
        $translate.instant('mediaFusion.metrics.clientType.ipad'),
        $translate.instant('mediaFusion.metrics.clientType.iphone'),
        $translate.instant('mediaFusion.metrics.clientType.windows'),
      ];
      var mobilePercentage = 0;
      var mobileValue = 0;
      var tpList = [$translate.instant('mediaFusion.metrics.clientType.sip'),
        $translate.instant('mediaFusion.metrics.clientType.tp'),
        $translate.instant('mediaFusion.metrics.clientType.uc'),
        $translate.instant('mediaFusion.metrics.clientType.jabber'),
        $translate.instant('mediaFusion.metrics.clientType.board'),
      ];
      var tpPercentage = 0;
      var tpValue = 0;
      var othersPercentage = 0;
      var othersValue = 0;

      data = _.sortBy(data, 'percentage');
      _.each(data, function (type) {
        totalValue += type.value;
      });
      _.each(data, function (type) {
        type.percentage = 100 * (type.value / totalValue);
        if (_.includes(desktopList, type.name)) {
          desktopPercentage += type.percentage;
          desktopValue += type.value;
        } else if (_.includes(mobileList, type.name)) {
          mobilePercentage += type.percentage;
          mobileValue += type.value;
        } else if (_.includes(tpList, type.name)) {
          tpPercentage += type.percentage;
          tpValue += type.value;
        } else {
          othersPercentage += type.percentage;
          othersValue += type.value;
        }
      });

      if (desktopValue > 0) {
        newData.push({
          'name': $translate.instant('mediaFusion.metrics.clientType.desktop'),
          'value': desktopValue,
          'percentage': _.round(desktopPercentage, 2),
        });
      }
      if (mobileValue > 0) {
        newData.push({
          'name': $translate.instant('mediaFusion.metrics.mobile'),
          'value': mobileValue,
          'percentage': _.round(mobilePercentage, 2),
        });
      }
      if (tpValue > 0) {
        newData.push({
          'name': $translate.instant('mediaFusion.metrics.clientType.tp'),
          'value': tpValue,
          'percentage': _.round(tpPercentage, 2),
        });
      }
      if (othersValue > 0) {
        newData.push({
          'name': vm.othersHeading,
          'value': othersValue,
          'percentage': _.round(othersPercentage, 2),
        });
      }

      return newData;

    }

    function formatTotal(value) {
      if (value <= 1000) {
        return value.toString();
      }
      var numDigits = ("" + value).length;
      var suffixIndex = Math.floor(numDigits / 3);
      var normalisedValue = value / Math.pow(1000, suffixIndex);
      var precision = 3;
      if (normalisedValue < 1) {
        precision = 1;
      }
      var suffixes = ["", "k", "m", "bn"];
      if (normalisedValue < 1) {
        return _.round(normalisedValue * 1000) + suffixes[suffixIndex - 1];
      } else {
        return normalisedValue.toPrecision(precision) + suffixes[suffixIndex];
      }
    }
  }
})();
