(function () {
  'use strict';

  angular.module('Mediafusion')
    .controller('GroupDetailsControllerV2',

      /* @ngInject */
      function ($stateParams, $modal, $log, $state, $translate) {

        var vm = this;
        vm.displayName = null;
        vm.nodeList = null;
        vm.clusterDetail = null;
        vm.openSettings = openSettings;

        if (!angular.equals($stateParams.clusterName, {})) {
          vm.displayName = $stateParams.clusterName;
        }

        if (!angular.equals($stateParams.nodes, {})) {
          vm.nodeList = $stateParams.nodes;
          $log.log("node details ", vm.nodeList);
        }

        if (!angular.equals($stateParams.cluster, {})) {
          vm.clusterDetail = $stateParams.cluster;
          $log.log("cluster details ", vm.clusterDetail);
        }

        function openSettings(type, id) {
          $state.go('mediafusion-settings', {
            id: id
          });
        }

        vm.alarmsSummary = function () {
          var alarms = {};
          _.forEach(vm.nodeList, function (cluster) {
            _.forEach(cluster.alarms, function (alarm) {
              if (!alarms[alarm.id]) {
                alarms[alarm.id] = {
                  alarm: alarm,
                  hosts: []
                };
              }
              if (alarms[alarm.id].hosts.indexOf(cluster.hostname) == -1) {
                alarms[alarm.id].hosts.push(cluster.hostname);
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

        vm.openSettingsTitle = $translate.instant('mediaFusion.openSettingsTitle', {
          clusterName: vm.displayName
        });
        vm.alarms = [];
        vm.alarms = vm.alarmsSummary();
      }
    );
})();
