(function() {
  'use strict';

  angular.module('Mediafusion')
    .controller('GroupDetailsController',

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
            controller: 'DeleteClusterController',
            controllerAs: "deleteClust",
            templateUrl: 'modules/mediafusion/media-service/side-panel/delete-cluster-dialog.html'
          });
        };

        vm.alarms = vm.alarmsSummary();
      }
    );
})();