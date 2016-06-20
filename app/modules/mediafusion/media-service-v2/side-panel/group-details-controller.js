(function () {
  'use strict';

  angular.module('Mediafusion')
    .controller('GroupDetailsControllerV2',

      /* @ngInject */
      function ($stateParams, $modal) {

        var vm = this;
        vm.displayName = null;
        vm.clusterList = null;

        if (!angular.equals($stateParams.groupName, {})) {
          vm.displayName = $stateParams.groupName;
        }

        if (!angular.equals($stateParams.selectedClusters, {})) {
          vm.clusterList = $stateParams.selectedClusters;
        }

        vm.alarmsSummary = function () {
          var alarms = {};
          _.forEach(vm.clusterList, function (cluster) {
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
              }
            },
            controller: 'DeleteClusterControllerV2',
            controllerAs: "deleteClust",
            templateUrl: 'modules/mediafusion/media-service-v2/side-panel/delete-cluster-dialog.html'
          });
        };

        vm.alarms = vm.alarmsSummary();
      }
    );
})();
