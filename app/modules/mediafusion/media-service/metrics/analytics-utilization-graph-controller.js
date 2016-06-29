(function () {
  'use strict';

  /* @ngInject */
  function AnalyticsUtilizationGraphController(MediaFusionAnalyticsService, $stateParams, $log) {

    var vm = this;
    vm.clusterName = 'default-cluster-name';
    vm.startTime = 'default-given-start-time';
    vm.endTime = 'default-given-end-time';
    vm.getClusters = getClusters;
    vm.plotGraphForHost = plotGraphForHost;
    vm.getHosts = getHosts;
    //

    vm.cpuUtlization = [];
    vm.activeMediaCount = [];
    vm.cpuCallReject = [];

    vm.optionsCluster = [];
    vm.selectPlaceholderCluster = vm.optionsCluster[0];
    vm.selectedCluster = '';
    vm.clusterData = [];

    vm.optionsTime = [
      '1h',
      '2h',
      '6h',
      '12h',
      '1d',
      '7d'
    ];
    vm.timePlaceholderCluster = '';
    vm.selectedTime = '1h';
    vm.fromDate = null;
    vm.toDate = null;
    vm.dateRange = false;
    vm.optionsHost = [
      'Cluster',
    ];
    vm.selectPlaceholderHost = vm.optionsHost[0];
    vm.selectedHost = '';
    vm.hostData = [];

    if (!angular.equals($stateParams.cluster, {}) && $stateParams.cluster != '' && $stateParams.cluster !== undefined) {
      vm.clusterName = $stateParams.cluster;
      vm.selectedCluster = vm.clusterName;
    }

    if (!angular.equals($stateParams.startTime, {}) && $stateParams.startTime != '' && $stateParams.startTime !== undefined) {
      vm.startTime = $stateParams.startTime;
    }

    if (!angular.equals($stateParams.endTime, {}) && $stateParams.endTime !== undefined && $stateParams.endTime != '') {
      vm.endTime = $stateParams.endTime;
      getClustersOnly();
      //getHostsOnly(vm.selectedCluster);
      getActiveMediaCounts(vm.selectedCluster, vm.startTime, vm.endTime);
      getClusterAvailability(vm.selectedCluster, vm.startTime, vm.endTime);
      getCallRejects(vm.selectedCluster, vm.startTime, vm.endTime);
      vm.fromDate = vm.startTime;
      vm.toDate = vm.endTime;
      vm.selectedTime = 'select';

    } else {

      getClusters();
    }

    //vm.optionsCluster = 'GraphCtrl.clusterData';

    function getClusters() {
      MediaFusionAnalyticsService.getClusters(function (data, status) {
        if (data.success) {
          vm.clusterData = data;
          _.each(data, function (clusterData) {
            vm.optionsCluster.push(clusterData.name);
            //$log.log("value of cluster" + clusterData.name);
          });
          vm.selectPlaceholderCluster = vm.optionsCluster[0];
          vm.selectedCluster = vm.optionsCluster[0];
          plotGraphForCluster();
          getHosts(vm.selectedCluster);
          //$log.log("the value of clusterData 1 is" + vm.clusterData);
        } else {
          $log.debug('Status: ' + status);
        }
      });
    }

    function getClustersOnly() {
      MediaFusionAnalyticsService.getClusters(function (data, status) {
        if (data.success) {
          vm.clusterData = data;
          _.each(data, function (clusterData) {
            vm.optionsCluster.push(clusterData.name);
            //$log.log("value of cluster" + clusterData.name);
          });
          vm.selectPlaceholderCluster = vm.optionsCluster[0];
          vm.selectedCluster = vm.clusterName;
          //plotGraphForCluster();
          getHostsOnly(vm.selectedCluster);
          //$log.log("the value of clusterData 1 is" + vm.clusterData);
        } else {
          $log.debug('Status: ' + status);
        }
      });
    }

    function getHosts() {
      MediaFusionAnalyticsService.getHosts(vm.selectedCluster, function (data, status) {
        //$log.log("selectedCluster" + vm.selectedCluster);
        if (data.success) {
          vm.hostData = data;
          vm.optionsHost = [
            'Cluster',
          ];
          _.each(data, function (hostData) {

            vm.optionsHost.push(hostData.name);
            //$log.log("value of host" + vm.optionsHost);
          });
          vm.selectPlaceholderHost = vm.optionsHost[0];
          vm.selectedHost = vm.optionsHost[0];
          plotGraphForHost();
          //$log.log("the value of hostData 1 is" + vm.hostData);
        } else {
          $log.debug('Status: ' + status);
        }
      });
    }

    function getHostsOnly() {
      MediaFusionAnalyticsService.getHosts(vm.selectedCluster, function (data, status) {
        //$log.log("selectedCluster" + vm.selectedCluster);
        if (data.success) {
          vm.hostData = data;
          vm.optionsHost = [
            'Cluster',
          ];
          _.each(data, function (hostData) {

            vm.optionsHost.push(hostData.name);
            //$log.log("value of host" + vm.optionsHost);
          });
          vm.selectPlaceholderHost = vm.optionsHost[0];
          vm.selectedHost = vm.optionsHost[0];
          //$log.log("the value of hostData 1 is" + vm.hostData);
        } else {
          $log.debug('Status: ' + status);
        }
      });
    }

    function plotGraphForCluster() {
      //$log.log("plot plotGraphForCluster called");
      //$log.log("the value of cluster is " + vm.selectedCluster);
      //$log.log("the value of time is " + vm.selectedTime);
      getRelativeTimeActiveMediaCount(vm.selectedCluster, vm.selectedTime);
      getRelativeTimeClusterAvailability(vm.selectedCluster, vm.selectedTime);
      getRelativeTimeCallReject(vm.selectedCluster, vm.selectedTime);

    }

    function plotGraphForHost() {
      //$log.log("plot plotGraphForHost called");
      //$log.log("the value of host is " + vm.selectedHost);
      //$log.log("the value of time is " + vm.selectedTime);
      if (vm.selectedTime !== 'select') {
        if (vm.selectedHost != 'Cluster') {
          getRelativeTimeClusterAvailabilityForHost(vm.selectedCluster, vm.selectedHost, vm.selectedTime);
          getRelativeTimeActiveMediaCountForHost(vm.selectedCluster, vm.selectedHost, vm.selectedTime);
          getRelativeTimeCallRejectForHost(vm.selectedCluster, vm.selectedHost, vm.selectedTime);
        } else {
          getRelativeTimeClusterAvailability(vm.selectedCluster, vm.selectedTime);
          getRelativeTimeActiveMediaCount(vm.selectedCluster, vm.selectedTime);
          getRelativeTimeCallReject(vm.selectedCluster, vm.selectedTime);
        }
      } else {
        if (vm.fromDate !== vm.toDate) {
          if (vm.selectedHost != 'Cluster') {
            getActiveMediaCountForHost(vm.selectedCluster, vm.selectedHost, vm.fromDate, vm.toDate);
            getClusterAvailabilityForHost(vm.selectedCluster, vm.selectedHost, vm.fromDate, vm.toDate);
            getCallRejectsForHost(vm.selectedCluster, vm.selectedHost, vm.fromDate, vm.toDate);
          } else {
            getActiveMediaCounts(vm.selectedCluster, vm.fromDate, vm.toDate);
            getClusterAvailability(vm.selectedCluster, vm.fromDate, vm.toDate);
            getCallRejects(vm.selectedCluster, vm.fromDate, vm.toDate);
          }
        } else {

          if (vm.selectedHost != 'Cluster') {
            getActiveMediaCountForHost(vm.selectedCluster, vm.selectedHost, vm.startTime, vm.endTime);
            getClusterAvailabilityForHost(vm.selectedCluster, vm.selectedHost, vm.startTime, vm.endTime);
            getCallRejectsForHost(vm.selectedCluster, vm.selectedHost, vm.startTime, vm.endTime);
          } else {
            getActiveMediaCounts(vm.selectedCluster, vm.startTime, vm.endTime);
            getClusterAvailability(vm.selectedCluster, vm.startTime, vm.endTime);
            getCallRejects(vm.selectedCluster, vm.startTime, vm.endTime);
          }

        }
      }

    }

    vm.changeDate = function () {

      //$log.log(" cluster is " + vm.fromDate);
      //$log.log(" time is " + vm.toDate);

      var date1 = new Date(vm.fromDate).getTime();
      var date2 = new Date(vm.toDate).getTime();
      var diff = date2 - date1;
      if (diff < 0) {
        vm.dateRange = true;
      } else {
        vm.dateRange = false;

        if (vm.selectedHost != 'Cluster') {
          $log.log(" cluster is " + vm.selectedHost);
          getActiveMediaCountForHost(vm.selectedCluster, vm.selectedHost, vm.fromDate, vm.toDate);
          getClusterAvailabilityForHost(vm.selectedCluster, vm.selectedHost, vm.fromDate, vm.toDate);
          getCallRejectsForHost(vm.selectedCluster, vm.selectedHost, vm.fromDate, vm.toDate);
          vm.selectedTime = 'select';
        } else {
          $log.log(" cluster is " + vm.selectedHost);
          getActiveMediaCounts(vm.selectedCluster, vm.fromDate, vm.toDate);
          getClusterAvailability(vm.selectedCluster, vm.fromDate, vm.toDate);
          getCallRejects(vm.selectedCluster, vm.fromDate, vm.toDate);
          vm.selectedTime = 'select';

        }
      }

    };

    function getActiveMediaCounts(cluster, starttime, endtime) {

      MediaFusionAnalyticsService.getActiveMediaCount(cluster, starttime, endtime, function (data, status) {

        if (data.success) {

          vm.activeMediaCount = data[0].values;
          plotActiveMediaCount();

        } else {
          $log.debug('Status: ' + status);
        }

      });
    }

    function getActiveMediaCountForHost(cluster, hostname, starttime, endtime) {

      MediaFusionAnalyticsService.getActiveMediaCountForHost(cluster, hostname, starttime, endtime, function (data, status) {

        if (data.success) {

          vm.activeMediaCount = data[0].values;
          plotActiveMediaCount();

        } else {
          $log.debug('Status: ' + status);
        }

      });
    }

    function getRelativeTimeActiveMediaCount(cluster, relativetime) {

      MediaFusionAnalyticsService.getRelativeTimeActiveMediaCount(cluster, relativetime, function (data, status) {

        if (data.success) {

          vm.activeMediaCount = data[0].values;
          plotActiveMediaCount();

        } else {
          $log.debug('Status: ' + status);
        }

      });
    }

    function getRelativeTimeActiveMediaCountForHost(cluster, hostname, relativetime) {

      MediaFusionAnalyticsService.getRelativeTimeActiveMediaCountForHost(cluster, hostname, relativetime, function (data, status) {

        if (data.success) {

          vm.activeMediaCount = data[0].values;
          plotActiveMediaCount();

        } else {
          $log.debug('Status: ' + status);
        }

      });
    }

    function plotActiveMediaCount() {

      vm.chartNew = AmCharts.makeChart("linusActiveMediaCountDiv", {
        "type": "serial",
        "theme": "light",
        "autoMargins": true,
        "autoMarginOffset": 25,

        "dataProvider": vm.activeMediaCount,

        "valueAxes": [{
          "axisAlpha": 0,
          "position": "left",
          "title": "Active Media Count",
          "integersOnly": true,

        }],

        "graphs": [{
          "id": "g1",
          "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
          //"bullet": "round",
          "title": "Active Media Count",
          //"bulletSize": 0,
          "lineColor": "#089282",
          "lineThickness": 3,
          "valueField": "value",

        }],

        "chartCursor": {
          "categoryBalloonDateFormat": "JJ:NN, DD MMMM",
          "cursorAlpha": 0,
          "valueLineEnabled": true,
          "valueLineBalloonEnabled": true,
          "valueLineAlpha": 0.5,
          "fullWidth": true,
          "graphBulletAlpha": 0,
          "graphBulletSize": 1
        },
        "dataDateFormat": "YYYY-MM-DDTJJ:NN:SSZ",
        "categoryField": "timestamp",
        "categoryAxis": {
          "minPeriod": "mm",
          "parseDates": true,
          "title": "Time(UTC)",
          "minorGridAlpha": 0.1,
          "minorGridEnabled": false,
          "axisColor": "#DADADA"
        },
      });

    }

    function getClusterAvailability(cluster, starttime, endtime) {

      MediaFusionAnalyticsService.getClusterAvailability(cluster, starttime, endtime, function (data, status) {

        if (data.success) {

          vm.availabilityCount = data[0].values;
          plotClusterAvailability();

        } else {
          $log.debug('Status: ' + status);
        }

      });
    }

    function getClusterAvailabilityForHost(cluster, hostname, starttime, endtime) {

      MediaFusionAnalyticsService.getClusterAvailabilityForHost(cluster, hostname, starttime, endtime, function (data, status) {

        if (data.success) {

          vm.availabilityCount = data[0].values;
          plotClusterAvailability();

        } else {
          $log.debug('Status: ' + status);
        }

      });
    }

    function getRelativeTimeClusterAvailability(cluster, relativetime) {

      MediaFusionAnalyticsService.getRelativeTimeClusterAvailability(cluster, relativetime, function (data, status) {

        if (data.success) {

          vm.availabilityCount = data[0].values;
          plotClusterAvailability();

        } else {
          $log.debug('Status: ' + status);
        }

      });
    }

    function getRelativeTimeClusterAvailabilityForHost(cluster, hostname, relativetime) {

      MediaFusionAnalyticsService.getRelativeTimeClusterAvailabilityForHost(cluster, hostname, relativetime, function (data, status) {

        if (data.success) {

          vm.availabilityCount = data[0].values;
          plotClusterAvailability();

        } else {
          $log.debug('Status: ' + status);
        }

      });
    }

    function plotClusterAvailability() {
      vm.chartNew = AmCharts.makeChart("clusterAvailabilityDiv", {
        "type": "serial",
        "theme": "light",
        "autoMargins": true,
        "autoMarginOffset": 25,

        "dataProvider": vm.availabilityCount,

        "valueAxes": [{
          "axisAlpha": 0,
          "minimum": 0,
          "maximum": 100,
          "integersOnly": true,
          "position": "left",
          "title": "Cluster Availability"

        }],

        "graphs": [{
          "id": "g1",
          "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
          //"bullet": "round",
          "title": "Cluster Availability",
          //"bulletSize": 0,
          "lineColor": "#089282",
          "lineThickness": 3,
          "valueField": "value",
        }],

        "chartCursor": {
          "categoryBalloonDateFormat": "JJ:NN, DD MMMM",
          "cursorAlpha": 0,
          "valueLineEnabled": true,
          "valueLineBalloonEnabled": true,
          "valueLineAlpha": 0.5,
          "fullWidth": true,
          "graphBulletAlpha": 0,
          "graphBulletSize": 1
        },
        "dataDateFormat": "YYYY-MM-DDTJJ:NN:SSZ",
        "categoryField": "timestamp",
        "categoryAxis": {
          "minPeriod": "mm",
          "parseDates": true,
          "title": "Time(UTC)",
          "minorGridAlpha": 0.1,
          "minorGridEnabled": false,
          "axisColor": "#DADADA"
        },
      });

    }

    function getCallRejects(cluster, starttime, endtime) {

      MediaFusionAnalyticsService.getCallReject(cluster, starttime, endtime, function (data, status) {

        if (data.success) {

          vm.cpuCallReject = data[0].values;
          plotCallReject();

        } else {
          $log.debug('Status: ' + status);
        }
      });

    }

    function getCallRejectsForHost(cluster, hostname, starttime, endtime) {

      MediaFusionAnalyticsService.getCallRejectForHost(cluster, hostname, starttime, endtime, function (data, status) {

        if (data.success) {

          vm.cpuCallReject = data[0].values;
          plotCallReject();

        } else {
          $log.debug('Status: ' + status);
        }

      });
    }

    function getRelativeTimeCallReject(cluster, relativetime) {

      MediaFusionAnalyticsService.getRelativeTimeCallReject(cluster, relativetime, function (data, status) {

        if (data.success) {

          vm.cpuCallReject = data[0].values;
          plotCallReject();

        } else {
          $log.debug('Status: ' + status);
        }

      });

    }

    function getRelativeTimeCallRejectForHost(cluster, hostname, relativetime) {

      MediaFusionAnalyticsService.getRelativeTimeCallRejectForHost(cluster, hostname, relativetime, function (data, status) {

        if (data.success) {

          vm.cpuCallReject = data[0].values;
          plotCallReject();

        } else {
          $log.debug('Status: ' + status);
        }

      });
    }

    function plotCallReject() {

      vm.chartDemo = AmCharts.makeChart("cpuOverloadDiv", {
        "type": "serial",
        "theme": "light",
        "autoMarginOffset": 25,
        "autoMargins": true,

        "dataProvider": vm.cpuCallReject,

        "valueAxes": [{
          "axisAlpha": 0,
          "integersOnly": true,
          "minimum": 0,
          "maximum": 4,
          "position": "left",
          "title": "Call Rejects",
          "autoGridCount": true,

        }],

        "graphs": [{
          "id": "g1",
          "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
          "bullet": "round",
          "title": "ECP-Linus Call Rejects",
          "labelPosition": "left",
          "bulletSize": 0,
          "fillAlphas": 0.8,
          "lineAlpha": 1.2,
          "type": "column",
          "lineColor": "#089282",
          "lineThickness": 2,
          "columnWidth": 0.3,
          "valueField": "value",
        }],

        "chartCursor": {
          "categoryBalloonDateFormat": "JJ:NN, DD MMMM",
          "cursorAlpha": 0,
          "valueLineEnabled": true,
          "valueLineBalloonEnabled": true,
          "valueLineAlpha": 0.5,
          "fullWidth": true,
          "graphBulletAlpha": 0,
          "graphBulletSize": 1
        },
        "dataDateFormat": "YYYY-MM-DDTJJ:NN:SSZ",
        "categoryField": "timestamp",
        "categoryAxis": {
          "minPeriod": "mm",
          "parseDates": true,
          "title": "Time(UTC)",
          "showLastLabel": true,
          "minorGridAlpha": 0.1,
          "minorGridEnabled": false,
          "axisColor": "#DADADA"
        },
      });

    }

  }
  angular
    .module('Mediafusion')
    .controller('AnalyticsUtilizationGraphController', AnalyticsUtilizationGraphController);
}());
