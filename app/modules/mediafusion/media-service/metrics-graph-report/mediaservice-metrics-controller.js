(function () {
  'use strict';
  angular.module('Mediafusion').controller('MediaServiceMetricsContoller', MediaServiceMetricsContoller);
  /* @ngInject */
  function MediaServiceMetricsContoller($timeout, $translate, MediaFusionAnalyticsService, MetricsReportService, MetricsGraphService) {
    var vm = this;
    vm.ABORT = 'ABORT';
    vm.REFRESH = 'refresh';
    vm.SET = 'set';
    vm.EMPTY = 'empty';
    vm.clusterFilter = null;
    vm.timeFilter = null;
    vm.callVolumeChart = null;
    vm.availabilityChart = null;
    vm.utilizationChart = null;
    vm.getClusters = getClusters;
    vm.clusterUpdate = clusterUpdate;
    vm.timeUpdate = timeUpdate;
    vm.isRefresh = isRefresh;
    vm.isEmpty = isEmpty;
    vm.setAllGraphs = setAllGraphs;
    vm.setCallVolumeData = setCallVolumeData;
    vm.setAvailabilityData = setAvailabilityData;
    vm.setUtilizationData = setUtilizationData;
    vm.resizeCards = resizeCards;
    vm.delayedResize = delayedResize;
    vm.setDummyData = setDummyData;
    vm.callVolumeStatus = vm.REFRESH;
    vm.availabilityStatus = vm.REFRESH;
    vm.utilizationStatus = vm.REFRESH;
    vm.clusterOptions = ['All'];
    vm.clusterSelected = vm.clusterOptions[0];
    getClusters();
    vm.timeOptions = [{
      value: 0,
      label: $translate.instant('mediaFusion.metrics.today'),
      description: $translate.instant('mediaFusion.metrics.today2')
    }, {
      value: 1,
      label: $translate.instant('mediaFusion.metrics.week'),
      description: $translate.instant('mediaFusion.metrics.week2')
    }, {
      value: 2,
      label: $translate.instant('mediaFusion.metrics.month'),
      description: $translate.instant('mediaFusion.metrics.month2')
    }, {
      value: 3,
      label: $translate.instant('mediaFusion.metrics.threeMonths'),
      description: $translate.instant('mediaFusion.metrics.threeMonths2')
    }];
    vm.timeSelected = vm.timeOptions[0];

    init();

    function init() {
      $timeout(function () {
        setDummyData();
        setAllGraphs();
      }, 30);
    }

    function getClusters() {
      MediaFusionAnalyticsService.getClusters(function (data, status) {
        if (data.success) {
          vm.clusterData = data;
          _.each(data, function (clusterData) {
            vm.clusterOptions.push(clusterData.name);
          });
          vm.clusterSelected = vm.clusterOptions[0];
        }
      });
    }

    function clusterUpdate() {
      vm.callVolumeStatus = vm.REFRESH;
      vm.availabilityStatus = vm.REFRESH;
      vm.utilizationStatus = vm.REFRESH;
      setDummyData();
      setAllGraphs();
    }

    function timeUpdate() {
      vm.callVolumeStatus = vm.REFRESH;
      vm.availabilityStatus = vm.REFRESH;
      vm.utilizationStatus = vm.REFRESH;
      setDummyData();
      setAllGraphs();
    }
    // Graph data status checks
    function isRefresh(tab) {
      return tab === vm.REFRESH;
    }

    function isEmpty(tab) {
      return tab === vm.EMPTY;
    }

    function setAllGraphs() {
      setUtilizationData();
      setCallVolumeData();
      setAvailabilityData();
    }

    function resizeCards() {
      $timeout(function () {
        $('.cs-card-layout').masonry('destroy');
        $('.cs-card-layout').masonry({
          itemSelector: '.cs-card',
          columnWidth: '.cs-card',
          isResizable: true,
          percentPosition: true
        });
      }, 0);
    }

    function delayedResize() {
      // delayed resize necessary to fix any overlapping cards on smaller screens
      $timeout(function () {
        $('.cs-card-layout').masonry('layout');
      }, 500);
    }

    function setDummyData() {
      setCallVolumeGraph(DummyMetricsReportService.dummyCallVolumeData(vm.timeSelected));
      setAvailabilityGraph(DummyMetricsReportService.dummyAvailabilityData(vm.timeSelected));
      setUtilizationGraph(DummyMetricsReportService.dummyUtilizationData(vm.timeSelected));
      resizeCards();
    }

    function setCallVolumeGraph(data) {
      var tempCallVolumeChart = MetricsGraphService.setCallVolumeGraph(data, vm.callVolumeChart);
      if (tempCallVolumeChart !== null && angular.isDefined(tempCallVolumeChart)) {
        vm.callVolumeChart = tempCallVolumeChart;
      }
    }

    function setCallVolumeData() {
      MetricsReportService.getCallVolumeData(vm.timeSelected, vm.clusterSelected).then(function (response) {
        if (response === vm.ABORT) {
          return;
        } else if (response.graphData.length === 0) {
          vm.callVolumeStatus = vm.EMPTY;
        } else {
          setCallVolumeGraph(response.graphData);
          vm.callVolumeStatus = vm.SET;
        }
        resizeCards();
      });
    }

    function setAvailabilityGraph(data) {
      var tempAvailabilityChart = MetricsGraphService.setAvailabilityGraph(data, vm.availabilityChart, vm.clusterSelected);
      if (tempAvailabilityChart !== null && angular.isDefined(tempAvailabilityChart)) {
        vm.availabilityChart = tempAvailabilityChart;
      }
    }

    function setAvailabilityData() {
      MetricsReportService.getAvailabilityData(vm.timeSelected, vm.clusterSelected).then(function (response) {
        if (response === vm.ABORT) {
          return;
        } else if (!angular.isDefined(response.data) || !angular.isArray(response.data) || response.data.length === 0 || !angular.isDefined(response.data[0].clusterCategories) || response.data[0].clusterCategories.length === 0) {
          vm.availabilityStatus = vm.EMPTY;
        } else {
          setAvailabilityGraph(response);
          vm.availabilityStatus = vm.SET;
        }
        resizeCards();
      });
    }

    function setUtilizationGraph(data) {
      var tempUtilizationChart = MetricsGraphService.setUtilizationGraph(data, vm.utilizationChart);
      if (tempUtilizationChart !== null && angular.isDefined(tempUtilizationChart)) {
        vm.UtilizationChart = tempUtilizationChart;
      }
    }

    function setUtilizationData() {
      MetricsReportService.getUtilizationData(vm.timeSelected, vm.clusterSelected).then(function (response) {
        if (response === vm.ABORT) {
          return;
        } else if (!angular.isDefined(response.graphData) || response.graphData.length === 0) {
          vm.utilizationStatus = vm.EMPTY;
        } else {
          setUtilizationGraph(response.graphData);
          vm.utilizationStatus = vm.SET;
        }
        resizeCards();
      });
    }

  }
})();
