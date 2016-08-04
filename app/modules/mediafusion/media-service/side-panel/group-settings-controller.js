(function () {
  'use strict';

  /* @ngInject */
  function GroupSettingsController($stateParams, MediaClusterService) {
    var vm = this;
    vm.config = "";
    vm.cluster = $stateParams.cluster;
    vm.options = [];
    vm.selectPlaceholder = 'Select One';
    vm.selected = '';
    vm.clusterList = null;
    vm.propertySetValue = null;

    if (!angular.equals($stateParams.clusterList, {})) {
      vm.clusterList = $stateParams.clusterList;
    }

    if (!angular.equals($stateParams.dispName, {})) {
      vm.dispName = $stateParams.dispName;
    }

    if (vm.clusterList.length > 0) {
      if (!angular.equals(vm.clusterList[0].properties["fms.releaseChannel"], undefined)) {
        vm.selected = vm.clusterList[0].properties["fms.releaseChannel"];
      }
    } else {
      MediaClusterService.getGroups().then(function (group) {
        _.each(group, function (group) {
          if (angular.equals(group.name, vm.dispName)) {
            vm.selected = group.properties["fms.releaseChannel"];
          }
        });
      });
    }

    vm.options = [
      'GA',
      'DEV',
      'ALPHA'
    ];

    vm.changeReleaseChanel = function () {
      vm.propertySetValue = MediaClusterService.getPropertySet(vm.clusterList[0].assigned_property_sets).then(function (propertySet) {
        if (vm.selected != propertySet.properties["fms.releaseChannel"]) {
          propertySet.properties["fms.releaseChannel"] = vm.selected;
          MediaClusterService.setPropertySet(vm.clusterList[0].assigned_property_sets, propertySet);
        }
      });
    };
  }

  angular
    .module('Mediafusion')
    .controller('GroupSettingsController', GroupSettingsController);
}());
