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
    vm.redirectHeading = $translate.instant('mediaFusion.metrics.redirectedcalls');

    vm.desktop = $translate.instant('mediaFusion.metrics.clientType.desktop');
    vm.mobile = $translate.instant('mediaFusion.metrics.mobile');
    vm.tp = $translate.instant('mediaFusion.metrics.clientType.tp');
    vm.mac = $translate.instant('mediaFusion.metrics.clientType.mac');
    vm.windowsDesk = $translate.instant('mediaFusion.metrics.clientType.windowsDesk');

    vm.sparkDesktop = $translate.instant('mediaFusion.metrics.clientType.sparkDesktop');
    vm.sparkMobile = $translate.instant('mediaFusion.metrics.clientType.sparkMobile');
    vm.sparkDevices = $translate.instant('mediaFusion.metrics.clientType.sparkDevices');

    vm.android = $translate.instant('mediaFusion.metrics.clientType.android');
    vm.blackberry = $translate.instant('mediaFusion.metrics.clientType.blackberry');
    vm.ipad = $translate.instant('mediaFusion.metrics.clientType.ipad');
    vm.iphone = $translate.instant('mediaFusion.metrics.clientType.iphone');
    vm.windows = $translate.instant('mediaFusion.metrics.clientType.windows');

    vm.sip = $translate.instant('mediaFusion.metrics.clientType.sip');
    vm.uc = $translate.instant('mediaFusion.metrics.clientType.uc');
    vm.jabber = $translate.instant('mediaFusion.metrics.clientType.jabber');
    vm.board = $translate.instant('mediaFusion.metrics.clientType.board');

    vm.sparkDesktopList = [vm.desktop, vm.mac, vm.windowsDesk];
    vm.sparkMobileList = [vm.android, vm.blackberry, vm.ipad, vm.iphone, vm.windows];
    vm.sipList = [vm.sip, vm.uc];
    vm.sparkDevicesList = [vm.tp, vm.board];
    vm.jabber = [vm.jabber];


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
      var totalMeets = 0;
      data = formatData(data.dataProvider);
      _.each(data, function (val) {
        totalMeets += val.value;
      });
      totalMeets = formatTotal(totalMeets);
      var chartData = CommonReportsGraphService.getBasePieChart(data);
      chartData.labelText = '[[name]]';
      chartData.balloonText = '[[name]]: [[percentage]]% ([[value]])';
      chartData.allLabels = [{
        text: totalMeets,
        align: 'center',
        y: 63,
      }];
      var chart = AmCharts.makeChart(vm.numberOfMeetsOnPremisesChartDiv, chartData, 0);
      return chart;
    }

    function setTotalParticipantsPiechart(callsOnPremise, callsOverflow, cloudCalls, isAllCluster) {
      var data = {};
      var dataProvider = [];
      cloudCalls = (cloudCalls - callsOverflow) < 0 ? 0 : (cloudCalls - callsOverflow);
      var total = cloudCalls + callsOverflow + callsOnPremise;
      total = formatTotal(total);
      var secondHeading = isAllCluster ? vm.overflowHeading : vm.redirectHeading;
      dataProvider = [{
        name: vm.onPremiseHeading,
        color: '#22D5A3',
        value: callsOnPremise,
      }, {
        name: secondHeading,
        color: '#1FBBCA',
        value: callsOverflow,
      }, {
        name: vm.cloudCallHeading,
        color: '#FD713E',
        value: cloudCalls,
      }];
      data['dataProvider'] = dataProvider;
      data = formatData(data.dataProvider);
      var chartData = CommonReportsGraphService.getBasePieChart(data);
      chartData.labelText = '[[name]]';
      chartData.balloonText = '[[name]]: [[percentage]]% ([[value]])';
      chartData.allLabels = [{
        text: total,
        align: 'center',
        y: 63,
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

    function setDummyTotalParticipantsPiechart(isAllZero) {
      var chartData = CommonReportsGraphService.getDummyPieChart();
      chartData.labelText = '[[name]]';
      if (isAllZero) {
        chartData.allLabels = [{
          text: 0,
          align: 'center',
          y: 63,
        }];
      }
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
      var newData = [];
      var clientPercents = calculateClientPercentage(data);

      vm.sparkDesktopList = [vm.desktop, vm.mac, vm.windowsDesk];
      vm.sparkMobileList = [vm.android, vm.blackberry, vm.ipad, vm.iphone, vm.windows];
      vm.sipList = [vm.sip, vm.uc];
      vm.sparkDevicesList = [vm.tp, vm.board];
      vm.jabber = [vm.jabber];

      if (clientPercents.sparkDesktopValue > 0) {
        newData.push({
          name: vm.sparkDesktop,
          value: clientPercents.sparkDesktopValue,
          percentage: clientPercents.sparkDesktopPercentage,
          color: '#23C1E2',
        });
      }
      if (clientPercents.sparkMobileValue > 0) {
        newData.push({
          name: vm.sparkMobile,
          value: clientPercents.sparkMobileValue,
          percentage: clientPercents.sparkMobilePercentage,
          color: '#FEB32B',
        });
      }
      if (clientPercents.sipValue > 0) {
        newData.push({
          name: vm.sip,
          value: clientPercents.sipValue,
          percentage: clientPercents.sipPercentage,
          color: '#D349D5',
        });
      }
      if (clientPercents.sparkDevicesValue > 0) {
        newData.push({
          name: vm.sparkDevices,
          value: clientPercents.sparkDevicesValue,
          percentage: clientPercents.sparkDevicesPercentage,
          color: '#336E7B',
        });
      }
      if (clientPercents.jabberValue > 0) {
        newData.push({
          name: vm.jabber,
          value: clientPercents.jabberValue,
          percentage: clientPercents.jabberPercentage,
          color: '#16a085',
        });
      }
      if (clientPercents.othersValue > 0) {
        newData.push({
          name: vm.othersHeading,
          value: clientPercents.othersValue,
          percentage: clientPercents.othersPercentage,
          color: '#FD416A',
        });
      }

      return newData;
    }

    function calculateClientPercentage(data) {
      var totalValue = 0;
      var sparkDesktopPercentage = 0;
      var sparkDesktopValue = 0;
      var sparkMobilePercentage = 0;
      var sparkMobileValue = 0;
      var sparkDevicesPercentage = 0;
      var sparkDevicesValue = 0;
      var sipPercentage = 0;
      var sipValue = 0;
      var jabberPercentage = 0;
      var jabberValue = 0;
      var othersPercentage = 0;
      var othersValue = 0;

      data = _.sortBy(data, 'percentage');
      _.each(data, function (type) {
        totalValue += type.value;
      });
      _.each(data, function (type) {
        type.percentage = 100 * (type.value / totalValue);
        if (_.includes(vm.sparkDesktopList, type.name)) {
          sparkDesktopPercentage += type.percentage;
          sparkDesktopValue += type.value;
        } else if (_.includes(vm.sparkMobileList, type.name)) {
          sparkMobilePercentage += type.percentage;
          sparkMobileValue += type.value;
        } else if (_.includes(vm.sparkDevicesList, type.name)) {
          sparkDevicesPercentage += type.percentage;
          sparkDevicesValue += type.value;
        } else if (_.includes(vm.sipList, type.name)) {
          sipPercentage += type.percentage;
          sipValue += type.value;
        } else if (_.includes(vm.jabber, type.name)) {
          jabberPercentage += type.percentage;
          jabberValue += type.value;
        } else {
          othersPercentage += type.percentage;
          othersValue += type.value;
        }
      });

      return {
        sparkDesktopPercentage: _.round(sparkDesktopPercentage, 2),
        sparkDesktopValue: sparkDesktopValue,
        sparkMobilePercentage: _.round(sparkMobilePercentage, 2),
        sparkMobileValue: sparkMobileValue,
        sparkDevicesPercentage: _.round(sparkDevicesPercentage, 2),
        sparkDevicesValue: sparkDevicesValue,
        jabberPercentage: _.round(jabberPercentage, 2),
        jabberValue: jabberValue,
        sipPercentage: _.round(sipPercentage, 2),
        sipValue: sipValue,
        othersPercentage: _.round(othersPercentage, 2),
        othersValue: othersValue,
      };
    }

    function formatTotal(value) {
      if (value <= 1000) {
        return value.toString();
      }
      var numDigits = ('' + value).length;
      var suffixIndex = Math.floor(numDigits / 3);
      var normalisedValue = value / Math.pow(1000, suffixIndex);
      var precision = 3;
      if (normalisedValue < 1) {
        precision = 1;
      }
      var suffixes = ['', 'k', 'm', 'bn'];
      if (normalisedValue < 1) {
        return _.round(normalisedValue * 1000) + suffixes[suffixIndex - 1];
      } else {
        return normalisedValue.toPrecision(precision) + suffixes[suffixIndex];
      }
    }
  }
})();
