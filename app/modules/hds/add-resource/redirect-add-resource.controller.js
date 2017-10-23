(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('HDSRedirectAddResourceController', HDSRedirectAddResourceController);

  /* @ngInject */
  function HDSRedirectAddResourceController($modal, $modalInstance, $q, $state, $translate, $window, firstTimeSetup, HDSAddResourceCommonService, ProPackService, Notification) {
    var vm = this;
    vm.clusterList = [];
    var states = {
      INIT: 0, //Initial Screen (Yes/No options)
      NO_PROCEED: 1, //NoProceed download software screen
      YES_PROCEED: 2, //Yes proceed screen with cluste/node info
      REGISTER_NODE: 3, //Register node screen
    };
    vm.states = states;
    vm.selectPlaceholder = $translate.instant('hds.add-resource-dialog.cluster');
    vm.redirectToTargetAndCloseWindowClicked = redirectToTargetAndCloseWindowClicked;
    vm.next = next;
    vm.back = back;
    vm.selectedCluster = '';
    vm.firstTimeSetup = firstTimeSetup;
    vm.closeSetupModal = closeSetupModal;
    if (vm.firstTimeSetup) {
      vm.radio = '2';
    } else {
      vm.radio = '1';
    }
    vm.canGoNext = canGoNext;
    vm.currentState = vm.states.INIT;
    vm.getAppTitle = getAppTitle;

    var proPackEnabled = undefined;
    $q.all({
      proPackEnabled: ProPackService.hasProPackPurchased(),
    }).then(function (toggles) {
      proPackEnabled = toggles.proPackEnabled;
    });

    HDSAddResourceCommonService.updateClusterLists().then(function (clusterList) {
      vm.clusterList = clusterList;
    })
      .catch(function (error) {
        Notification.errorWithTrackingId(error, 'hds.genericError');
      });

    function getAppTitle() {
      return proPackEnabled ? $translate.instant('loginPage.titlePro') : $translate.instant('loginPage.titleNew');
    }

    function redirectToTargetAndCloseWindowClicked(hostName, enteredCluster) {
      $modalInstance.dismiss();
      HDSAddResourceCommonService.addRedirectTargetClicked(hostName, enteredCluster).then(function () {
        HDSAddResourceCommonService.redirectPopUpAndClose(hostName, enteredCluster, vm.firstTimeSetup);
      });
    }

    function closeSetupModal(isCloseOk) {
      if (isCloseOk) {
        $modalInstance.dismiss();
        $state.go('services-overview');
        return;
      }
      $modal.open({
        template: require('modules/hds/add-resource/confirm-setup-cancel-dialog.html'),
        type: 'dialog',
      })
        .result.then(function () {
          $modalInstance.dismiss();
          $state.go('services-overview');
        });
    }

    function next() {
      if (vm.currentState === vm.states.INIT) {
        if (vm.radio === '1') {
          vm.currentState = vm.states.YES_PROCEED;
        } else {
          vm.currentState = vm.states.NO_PROCEED;
          //TODO: Switch to HDS link when available
          $window.open('https://7f3b835a2983943a12b7-f3ec652549fc8fa11516a139bfb29b79.ssl.cf5.rackcdn.com/HybridDataSecurityProduction/hds.ova');
        }
      } else if (vm.currentState === vm.states.YES_PROCEED) {
        vm.currentState = vm.states.REGISTER_NODE;
      }
    }

    function canGoNext() {
      if (vm.currentState === vm.states.INIT) {
        return true;
      } else if (vm.currentState === vm.states.YES_PROCEED) {
        if (_.isUndefined(vm.hostName) || vm.hostName === '' || _.isUndefined(vm.selectedCluster) || vm.selectedCluster === '') {
          return false;
        } else {
          return true;
        }
      }
      return false;
    }

    function back() {
      vm.currentState = vm.states.YES_PROCEED;
    }
  }
}());
