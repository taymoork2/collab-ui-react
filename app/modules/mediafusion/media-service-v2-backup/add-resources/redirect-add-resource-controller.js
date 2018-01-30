(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .controller('RedirectAddResourceControllerV2', RedirectAddResourceControllerV2);

  /* @ngInject */
  function RedirectAddResourceControllerV2($modalInstance, $translate, firstTimeSetup, yesProceed, $modal, AddResourceCommonServiceV2, $window, $state, $q) {
    var vm = this;
    vm.clusterList = [];
    vm.selectPlaceholder = $translate.instant('mediaFusion.add-resource-dialog.cluster-placeholder');
    vm.redirectToTargetAndCloseWindowClicked = redirectToTargetAndCloseWindowClicked;
    vm.back = back;
    vm.next = next;
    vm.enableRedirectToTarget = false;
    vm.selectedCluster = '';
    vm.selectedClusterId = '';
    vm.firstTimeSetup = firstTimeSetup;
    vm.showDownloadableOption = firstTimeSetup;
    vm.closeSetupModal = closeSetupModal;
    vm.radio = 1;
    vm.ovaType = 1;
    vm.noProceed = false;
    vm.yesProceed = yesProceed;
    vm.canGoNext = canGoNext;

    AddResourceCommonServiceV2.updateClusterLists().then(function (clusterList) {
      vm.clusterList = clusterList;
    });

    function redirectToTargetAndCloseWindowClicked(hostName, enteredCluster) {
      $modalInstance.close();
      if (vm.firstTimeSetup) {
        $q.all(AddResourceCommonServiceV2.enableMediaServiceEntitlements()).then(function (result) {
          var resultRhesos = result[0];
          var resultSparkCall = result[1];
          if (!_.isUndefined(resultRhesos) && !_.isUndefined(resultSparkCall)) {
            //create cluster
            //on success call media service activation service enableMediaService
            AddResourceCommonServiceV2.createFirstTimeSetupCluster(hostName, enteredCluster).then(function () {
              //call the rest of the services which needs to be enabled
              AddResourceCommonServiceV2.enableMediaService();
              AddResourceCommonServiceV2.redirectPopUpAndClose(hostName, enteredCluster);
            }).then(function () {
              $state.go('media-service-v2.list');
            });
          } else {
            $state.go('services-overview', {}, { reload: true });
          }
        });
      } else {
        AddResourceCommonServiceV2.addRedirectTargetClicked(hostName, enteredCluster).then(function () {
          AddResourceCommonServiceV2.redirectPopUpAndClose(hostName, enteredCluster);
        });
      }
    }

    function closeSetupModal(isCloseOk) {
      if (!firstTimeSetup) {
        $modalInstance.dismiss();
        return;
      }
      if (isCloseOk) {
        $state.go('services-overview');
        $modalInstance.dismiss();
        return;
      }
      $modal.open({
        template: require('modules/hercules/service-specific-pages/common-expressway-based/confirm-setup-cancel-dialog.html'),
        type: 'dialog',
      })
        .result.then(function (isAborting) {
          if (isAborting) {
            $modalInstance.dismiss();
          }
        });
    }

    function back() {
      vm.enableRedirectToTarget = false;
    }

    function next() {
      if (vm.radio === '0') {
        vm.noProceed = true;
        vm.showDownloadableOption = false;
        vm.yesProceed = false;
        if (vm.ovaType === '1') {
          $window.open('https://7f3b835a2983943a12b7-f3ec652549fc8fa11516a139bfb29b79.ssl.cf5.rackcdn.com/Media-Fusion-Management-Connector/mfusion.ova');
        } else {
          $window.open('https://7f3b835a2983943a12b7-f3ec652549fc8fa11516a139bfb29b79.ssl.cf5.rackcdn.com/hybrid-media-demo/hybridmedia_demo.ova');
        }
      } else if (vm.yesProceed) {
        if (!_.isUndefined(vm.selectedCluster) && vm.selectedCluster != '' && !_.isUndefined(vm.hostName)) {
          vm.enableRedirectToTarget = true;
        }
        if (vm.firstTimeSetup) {
          vm.showDownloadableOption = false;
        }
      } else {
        vm.yesProceed = true;
      }
    }

    function canGoNext() {
      if (vm.firstTimeSetup && vm.showDownloadableOption) {
        return true;
      } else if (vm.yesProceed && !_.isUndefined(vm.hostName) && vm.hostName != '' && !_.isUndefined(vm.selectedCluster) && vm.selectedCluster != '') {
        return true;
      } else {
        return false;
      }
    }
  }
}());
