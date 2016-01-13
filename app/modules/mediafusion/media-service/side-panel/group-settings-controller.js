(function () {
  'use strict';

  /* @ngInject */
  function GroupSettingsController($state, $modal, ServiceDescriptor, Authinfo, $stateParams, $log, MediaClusterService) {
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

    if (!angular.equals(vm.clusterList[0].properties["fms.releaseChannel"], undefined)) {
      vm.selected = vm.clusterList[0].properties["fms.releaseChannel"];
    }

    vm.options = [
      'GA'//,
      //'DEV',
      //'ALPHA'
    ];

    vm.changeReleaseChanel = function () {
      vm.propertySetValue = MediaClusterService.getPropertySet(vm.clusterList[0].assigned_property_sets).then(function (propertySet) {
        if (vm.selected != propertySet.properties["fms.releaseChannel"]) {
          propertySet.properties["fms.releaseChannel"] = vm.selected;
          $log.log("kk after change", propertySet);
          MediaClusterService.setPropertySet(vm.clusterList[0].assigned_property_sets, propertySet);
        }
      });
    };
  }

  angular
    .module('Mediafusion')
    .controller('GroupSettingsController', GroupSettingsController);
}());
