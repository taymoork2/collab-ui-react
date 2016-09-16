(function () {
  'use strict';

  angular.module('Hercules')
    .controller('AssignClustersController', AssignClustersController);

  /* @ngInject */
  function AssignClustersController($modalInstance, $q, resourceGroup, FusionClusterService, ResourceGroupService, $translate, Notification) {
    var vm = this;
    vm.clusters = [];
    vm.assignments = {};
    vm.resourceGroup = resourceGroup;
    vm.clusterCheckboxes = [];
    vm.saveAssignments = saveAssignments;

    loadAssignments();

    function loadAssignments() {
      FusionClusterService.getAll()
        .then(function (clusters) {
          return _.filter(clusters, function (cluster) {
            return cluster.targetType === 'c_mgmt';
          });
        })
        .then(function (clusters) {
          vm.clusters = clusters;
          _.forEach(vm.clusters, function (c) {
            vm.assignments[c.id] = c.resourceGroupId === resourceGroup.id;
            vm.clusterCheckboxes.push({
              label: c.name,
              name: c.id,
              id: c.id
            });
          });
        });
    }

    function saveAssignments() {
      var promises = [];
      _.forEach(vm.clusters, function (c) {
        if ((c.resourceGroupId === resourceGroup.id && !vm.assignments[c.id]) || (c.resourceGroupId !== resourceGroup.id && vm.assignments[c.id])) {
          var promise = ResourceGroupService.assign(c.id, vm.assignments[c.id] ? vm.resourceGroup.id : '')
            .then(function () {
              Notification.success($translate.instant('hercules.assignClustersModal.' + (vm.assignments[c.id] ? 'assigned' : 'removed'), {
                clusterName: c.name,
                groupName: resourceGroup.name
              }));
            }, function () {
              Notification.error('hercules.genericFailure');
            });
          promises.push(promise);
        }
        return $q.resolve();
      });
      return $q.all(promises)
        .finally(function () {
          $modalInstance.close();
        });
    }
  }
})();
