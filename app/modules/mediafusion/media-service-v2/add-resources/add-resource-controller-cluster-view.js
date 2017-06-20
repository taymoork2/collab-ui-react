(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .controller('AddResourceControllerClusterViewV2', AddResourceControllerClusterViewV2);

  /* @ngInject */
  function AddResourceControllerClusterViewV2($translate, $state, $stateParams, $window, $q, AddResourceCommonServiceV2, FeatureToggleService, ProPackService) {
    var vm = this;
    vm.clusterList = [];
    vm.selectPlaceholder = $translate.instant('mediaFusion.add-resource-dialog.cluster-placeholder');
    vm.redirectToTargetAndCloseWindowClicked = redirectToTargetAndCloseWindowClicked;
    vm.back = back;
    vm.next = next;
    vm.enableRedirectToTarget = false;
    vm.selectedCluster = '';
    vm.clusterDetail = null;
    vm.popup = '';
    vm.selectedClusterId = '';
    vm.firstTimeSetup = $state.params.firstTimeSetup;
    vm.closeSetupModal = closeSetupModal;
    vm.currentServiceId = 'squared-fusion-media';
    vm.radio = 1;
    vm.noProceed = false;
    vm.nameChangeEnabled = false;
    vm.yesProceed = $state.params.yesProceed;
    vm.fromClusters = $state.params.fromClusters;
    vm.showDownloadableOption = vm.fromClusters;
    vm.canGoNext = canGoNext;
    vm.getAppTitle = getAppTitle;

    var proPackEnabled = undefined;
    $q.all({
      proPackEnabled: ProPackService.hasProPackPurchased(),
      nameChangeEnabled: FeatureToggleService.atlas2017NameChangeGetStatus(),
    }).then(function (toggles) {
      proPackEnabled = toggles.proPackEnabled;
      vm.nameChangeEnabled = toggles.nameChangeEnabled;
    });

    // Forming clusterList which contains all cluster name of type mf_mgmt and sorting it.
    AddResourceCommonServiceV2.updateClusterLists().then(function (clusterList) {
      vm.clusterList = clusterList;
    });

    function getAppTitle() {
      return proPackEnabled ? $translate.instant('loginPage.titlePro') : $translate.instant('loginPage.titleNew');
    }

    function redirectToTargetAndCloseWindowClicked(hostName, enteredCluster) {
      $state.modal.close();
      AddResourceCommonServiceV2.addRedirectTargetClicked(hostName, enteredCluster).then(function () {
        AddResourceCommonServiceV2.redirectPopUpAndClose(hostName, enteredCluster, vm.selectedClusterId, vm.firstTimeSetup);
      });
    }

    function closeSetupModal() {
      $state.modal.close();
    }

    function back() {
      if (!vm.yesProceed) {
        $stateParams.wizard.back();
      } else if (vm.enableRedirectToTarget) {
        vm.enableRedirectToTarget = false;
      } else {
        vm.yesProceed = false;
        vm.showDownloadableOption = true;
      }
    }

    function next() {
      if (vm.radio == 0) {
        vm.noProceed = true;
        vm.showDownloadableOption = false;
        $window.open('https://7f3b835a2983943a12b7-f3ec652549fc8fa11516a139bfb29b79.ssl.cf5.rackcdn.com/Media-Fusion-Management-Connector/mfusion.ova');
      } else if (vm.yesProceed) {
        if (!_.isUndefined(vm.selectedCluster) && vm.selectedCluster != '' && !_.isUndefined(vm.hostName)) {
          vm.enableRedirectToTarget = true;
        }
      } else {
        vm.yesProceed = true;
        vm.showDownloadableOption = false;
      }
    }

    function canGoNext() {
      if (vm.fromClusters && !vm.yesProceed) {
        return true;
      } else if (vm.yesProceed && !_.isUndefined(vm.hostName) && vm.hostName != '' && !_.isUndefined(vm.selectedCluster) && vm.selectedCluster != '') {
        return true;
      } else {
        return false;
      }
    }
  }
}());
