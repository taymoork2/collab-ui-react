(function () {
  'use strict';

  angular
    .module("Mediafusion")
    .controller("AddResourceControllerClusterViewV2", AddResourceControllerClusterViewV2);

  /* @ngInject */
  function AddResourceControllerClusterViewV2(XhrNotificationService, $translate, $state, $stateParams, AddResourceCommonServiceV2) {
    var vm = this;
    vm.clusterList = [];
    vm.selectPlaceholder = $translate.instant('mediaFusion.add-resource-dialog.cluster-placeholder');
    vm.addRedirectTargetClicked = addRedirectTargetClicked;
    vm.redirectToTargetAndCloseWindowClicked = redirectToTargetAndCloseWindowClicked;
    vm.back = back;
    vm.next = next;
    //vm.getV2Clusters = getV2Clusters;
    vm.enableRedirectToTarget = false;
    vm.selectedCluster = '';
    vm.clusterDetail = null;
    vm.popup = '';
    vm.selectedClusterId = '';
    vm.firstTimeSetup = $state.params.firstTimeSetup;
    vm.closeSetupModal = closeSetupModal;
    vm.currentServiceId = "squared-fusion-media";
    vm.radio = 1;
    vm.noProceed = false;
    vm.yesProceed = $state.params.yesProceed;
    vm.fromClusters = $state.params.fromClusters;
    vm.canGoNext = canGoNext;

    // Forming clusterList which contains all cluster name of type mf_mgmt and sorting it.
    AddResourceCommonServiceV2.updateClusterLists().then(function (clusterList) {
      vm.clusterList = clusterList;
    });

    function addRedirectTargetClicked(hostName, enteredCluster) {
      AddResourceCommonServiceV2.addRedirectTargetClicked(hostName, enteredCluster).then(function () {
        vm.enableRedirectToTarget = true;
      }, XhrNotificationService.notify);
    }

    function redirectToTargetAndCloseWindowClicked(hostName, enteredCluster) {
      $state.modal.close();
      AddResourceCommonServiceV2.redirectPopUpAndClose(hostName, enteredCluster, vm.selectedClusterId, vm.firstTimeSetup);
    }

    function closeSetupModal(isCloseOk) {
      $state.modal.close();
    }

    function back() {
      if (vm.yesProceed != true) {
        $stateParams.wizard.back();
      } else if (vm.enableRedirectToTarget == true) {
        vm.enableRedirectToTarget = false;
      } else {
        vm.yesProceed = false;
      }
    }

    function next() {
      if (vm.radio == 0) {
        vm.noProceed = true;
      } else if (vm.yesProceed == true) {
        if (angular.isDefined(vm.selectedCluster) && vm.selectedCluster != '' && angular.isDefined(vm.hostName)) {
          vm.addRedirectTargetClicked(vm.hostName, vm.selectedCluster);
        }
      } else {
        vm.yesProceed = true;
      }
    }

    function canGoNext() {

      if (vm.fromClusters && vm.yesProceed == false) {
        return true;
      } else if (vm.yesProceed == true && angular.isDefined(vm.hostName) && vm.hostName != "" && angular.isDefined(vm.selectedCluster) && vm.selectedCluster != "") {
        return true;
      } else {
        return false;
      }
    }
  }
}());
