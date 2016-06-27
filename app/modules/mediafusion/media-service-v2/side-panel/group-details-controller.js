(function () {
  'use strict';

  angular.module('Mediafusion')
    .controller('GroupDetailsControllerV2',

      /* @ngInject */
      function ($stateParams, $modal, $log, MediaClusterServiceV2) {

        var vm = this;
        vm.displayName = null;
        vm.nodeList = null;
        vm.clusterDetail = null;
        vm.options = [];
        vm.selectPlaceholder = 'Select One';
        vm.selected = '';

        if (!angular.equals($stateParams.clusterName, {})) {
          vm.displayName = $stateParams.clusterName;
        }

        if (!angular.equals($stateParams.nodes, {})) {
          vm.nodeList = $stateParams.nodes;
        }

        if (!angular.equals($stateParams.cluster, {})) {
          vm.clusterDetail = $stateParams.cluster;
          $log.log("cluster details ", vm.clusterDetail);
        }

        vm.options = [
          'GA',
          'DEV',
          'ALPHA'
        ];

        vm.changeReleaseChanel = function () {
          if (vm.selected != vm.clusterDetail.releaseChannel) {
            MediaClusterServiceV2.updateV2Cluster(vm.clusterDetail.id, vm.displayName, vm.selected);
          }
        };

        vm.alarmsSummary = function () {
          var alarms = {};
          $log.log("cluster details ", vm.nodeList);
          _.forEach(vm.nodeList, function (cluster) {
            _.forEach(cluster.services[0].connectors[0].alarms, function (alarm) {
              if (!alarms[alarm.id]) {
                alarms[alarm.id] = {
                  alarm: alarm,
                  hosts: []
                };
              }
              if (alarms[alarm.id].hosts.indexOf(cluster.hosts[0].host_name) == -1) {
                alarms[alarm.id].hosts.push(cluster.hosts[0].host_name);
              }
            });
          });
          return _.toArray(alarms);
        };

        vm.deleteGroup = function () {
          $modal.open({
            resolve: {
              groupName: function () {
                return vm.displayName;
              },
              clusterId: function () {
                return vm.clusterDetail.id;
              }
            },
            controller: 'DeleteClusterControllerV2',
            controllerAs: "deleteClust",
            templateUrl: 'modules/mediafusion/media-service-v2/side-panel/delete-cluster-dialog.html'
          });
        };

        vm.alarms = [];
        // vm.alarms = vm.alarmsSummary();
      }
    );
})();
