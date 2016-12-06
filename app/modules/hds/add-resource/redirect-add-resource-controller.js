(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('HDSRedirectAddResourceController', HDSRedirectAddResourceController);

  /* @ngInject */
  function HDSRedirectAddResourceController($modalInstance, $translate, $modal, $state, $window, HDSAddResourceCommonService, firstTimeSetup, yesProceed) {
    var vm = this;
    vm.clusterList = [];
    vm.selectPlaceholder = $translate.instant('hds.add-resource-dialog.cluster-placeholder');
    vm.redirectToTargetAndCloseWindowClicked = redirectToTargetAndCloseWindowClicked;
    vm.back = back;
    vm.next = next;
    vm.enableRedirectToTarget = false;
    vm.selectedCluster = '';
    vm.selectedClusterId = '';
    vm.firstTimeSetup = firstTimeSetup;
    vm.closeSetupModal = closeSetupModal;
    vm.radio = 1;
    vm.noProceed = false;
    vm.yesProceed = yesProceed;
    vm.canGoNext = canGoNext;
    HDSAddResourceCommonService.updateClusterLists().then(function (clusterList) {
      vm.clusterList = clusterList;
    });

    function redirectToTargetAndCloseWindowClicked(hostName, enteredCluster) {
      $modalInstance.close();
      HDSAddResourceCommonService.addRedirectTargetClicked(hostName, enteredCluster).then(function () {
        HDSAddResourceCommonService.redirectPopUpAndClose(hostName, enteredCluster, vm.selectedClusterId, vm.firstTimeSetup);
      });
    }

    function closeSetupModal(isCloseOk) {
      if (!vm.firstTimeSetup) {
        $modalInstance.close();
        return;
      }
      if (isCloseOk) {
        $modalInstance.close();
        $state.go('services-overview');
        return;
      }
      $modal.open({
        templateUrl: 'modules/hds/add-resource/confirm-setup-cancel-dialog.html',
        type: 'dialog'
      })
        .result.then(function (isAborting) {
          if (isAborting) {
            $modalInstance.close();
            $state.go('services-overview');
          }
        });
    }

    function back() {
      vm.enableRedirectToTarget = false;
    }

    function next() {
      if (vm.radio == 0) {
        vm.noProceed = true;
        //TODO: Switch to HDS link when available
        $window.open('https://7f3b835a2983943a12b7-f3ec652549fc8fa11516a139bfb29b79.ssl.cf5.rackcdn.com/Media-Fusion-Management-Connector/mfusion.ova');
      } else if (vm.yesProceed) {
        if (!_.isUndefined(vm.selectedCluster) && vm.selectedCluster != '' && !_.isUndefined(vm.hostName)) {
          vm.enableRedirectToTarget = true;
        }
      } else {
        vm.yesProceed = true;
      }
    }

    function canGoNext() {
      if (vm.firstTimeSetup && !vm.yesProceed) {
        return true;
      } else if (vm.yesProceed && !_.isUndefined(vm.hostName) && vm.hostName != '' && !_.isUndefined(vm.selectedCluster) && vm.selectedCluster != '') {
        return true;
      } else {
        return false;
      }
    }
  }
}());
