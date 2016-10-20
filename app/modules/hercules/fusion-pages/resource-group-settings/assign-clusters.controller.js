(function () {
  'use strict';

  angular.module('Hercules')
    .controller('AssignClustersController', AssignClustersController);

  /* @ngInject */
  function AssignClustersController($modalInstance, $q, resourceGroup, FusionClusterService, ResourceGroupService, Notification) {
    var vm = this;
    vm.loadingState = true;
    vm.savingState = false;
    vm.resourceGroup = resourceGroup;
    vm.originalData = {
      availableClusters: [],
      clustersInResourceGroup: []
    };
    vm.newData = angular.copy(vm.originalData);
    vm._helpers = {
      hasServices: hasServices,
      stateLabelToStatusClass: stateLabelToStatusClass,
    };
    vm.hasChanged = hasChanged;
    vm.assignCluster = assignCluster;
    vm.unassignCluster = unassignCluster;
    vm.save = save;

    loadData();

    function loadData() {
      return FusionClusterService.getResourceGroups()
        .then(function (response) {
          var group = _.find(response.groups, { 'id': resourceGroup.id });
          vm.originalData.availableClusters = filterHMClusters(response.unassigned);
          vm.originalData.clustersInResourceGroup = filterHMClusters(group.clusters);
          vm.newData = angular.copy(vm.originalData);
          vm.loadingState = false;
        })
        .catch(function () {
          Notification.error('hercules.assignClustersModal.errorLoading');
        });
    }

    function assignCluster(cluster) {
      _.remove(vm.newData.availableClusters, function (c) {
        return c.id === cluster.id;
      });
      vm.newData.clustersInResourceGroup.push(cluster);
    }

    function unassignCluster(cluster) {
      _.remove(vm.newData.clustersInResourceGroup, function (c) {
        return c.id === cluster.id;
      });
      vm.newData.availableClusters.push(cluster);
    }

    function filterHMClusters(clusters) {
      return _.filter(clusters, function (cluster) {
        return cluster.targetType !== 'mf_mgmt';
      });
    }

    function hasChanged() {
      var originalAvailableClustersIds = _.map(vm.originalData.availableClusters, 'id');
      var newAvailableClustersIds = _.map(vm.newData.availableClusters, 'id');
      return !_.isEmpty(_.xor(originalAvailableClustersIds, newAvailableClustersIds));
    }

    function hasServices(cluster) {
      return _.some(cluster.servicesStatuses, function (serviceStatus) {
        return serviceStatus.serviceId !== 'squared-fusion-mgmt' && serviceStatus.total > 0;
      });
    }

    function stateLabelToStatusClass(label) {
      if (label === 'ok') {
        return 'success';
      } else if (label === 'warning') {
        return 'warning';
      } else if (label === 'error') {
        return 'danger';
      } else if (label === 'unknown') {
        return 'disabled';
      } else {
        return 'disabled';
      }
    }

    function save() {
      vm.savingState = true;
      var promises = [];
      _.forEach(vm.newData.clustersInResourceGroup, function (cluster) {
        if (!_.find(vm.originalData.clustersInResourceGroup, { 'id': cluster.id })) {
          // assign
          promises.push(ResourceGroupService.assign(cluster.id, vm.resourceGroup.id));
        }
      });
      _.forEach(vm.newData.availableClusters, function (cluster) {
        if (!_.find(vm.originalData.availableClusters, { 'id': cluster.id })) {
          // unassign
          promises.push(ResourceGroupService.assign(cluster.id, ''));
        }
      });
      return $q.all(promises)
        .then(function () {
          $modalInstance.close();
        })
        .catch(function () {
          Notification.error('hercules.genericFailure');
          vm.savingState = false;
          // refresh data with what worked
          return loadData();
        });
    }
  }
})();
