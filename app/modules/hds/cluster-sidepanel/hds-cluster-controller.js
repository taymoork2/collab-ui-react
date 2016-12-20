(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('HDSClusterController', HDSClusterController);

  /* @ngInject */
  function HDSClusterController($scope, $state, $stateParams, $translate, ClusterService, FusionUtils, FusionClusterService, Notification, $window) {
    var vm = this;
    vm.state = $state;
    vm.clusterId = $stateParams.clusterId;
    vm.connectorType = 'hds_app';
    vm.servicesId = FusionUtils.connectorType2ServicesId(vm.connectorType);
    vm.serviceName = $translate.instant('hds.serviceName.' + vm.servicesId[0]);
    vm.connectorName = $translate.instant('hds.connectorName.' + vm.servicesId[0]);
    vm.localizedManagementConnectorName = $translate.instant('hds.connectorNameFromConnectorType.hds_app');
    vm.localizedConnectorName = $translate.instant('hds.connectorNameFromConnectorType.' + vm.connectorType);
    vm.getSeverity = ClusterService.getRunningStateSeverity;
    vm.hasConnectorAlarm = hasConnectorAlarm;
    vm.goToHds = goToHds;

    if (!vm.connectorType || !vm.clusterId) {
      return;
    }

    $scope.$watch(function () {
      return [
        ClusterService.getCluster(vm.connectorType, vm.clusterId),
        ClusterService.getCluster(vm.connectorType, vm.clusterId)
      ];
    }, function (newValue) {
      vm.cluster = newValue[0];
      vm.managementCluster = newValue[1];

      if (vm.cluster && _.size(vm.cluster.connectors) === 0) {
        FusionClusterService.getPreregisteredClusterAllowList()
          .then(function (allowList) {
            vm.cluster.allowedRedirectTarget = _.find(allowList, { clusterId: vm.cluster.id });
          })
          .catch(function (error) {
            Notification.errorWithTrackingId(error, 'hercules.genericFailure');
          });
      }
    }, true);


    function buildCluster() {
      vm.schedule = {};
      FusionClusterService.get(vm.clusterId)
        .then(function (cluster) {
          vm.hosts = FusionClusterService.buildSidepanelConnectorList(cluster, vm.connectorType);
          vm.schedule.dateTime = FusionClusterService.formatTimeAndDate(cluster.upgradeSchedule);
          vm.schedule.urgentScheduleTime = FusionClusterService.formatTimeAndDate({
            scheduleTime: cluster.upgradeSchedule.urgentScheduleTime,
            // Simulate every day
            scheduleDays: { length: 7 },
          });
          vm.schedule.timeZone = cluster.upgradeSchedule.scheduleTimeZone;
        });
    }
    buildCluster();

    function hasConnectorAlarm(connector) {
      if (connector.alarms.length > 0) {
        return true;
      } else {
        return false;
      }
    }

    function goToHds(hostname) {
      $window.open('https://' + encodeURIComponent(hostname) + '/fusionregistration');
    }
  }
}());
