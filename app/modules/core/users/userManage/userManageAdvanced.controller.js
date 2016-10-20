(function () {
  'use strict';

  angular.module('Core')
    .controller('UserManageAdvancedController', UserManageAdvancedController);

  /* @ngInject */
  function UserManageAdvancedController($state, $rootScope, $scope, $previousState, $translate, $modal, $timeout,
    FeatureToggleService, Notification) {
    var vm = this;

    vm.onInit = onInit;
    vm.onBack = onBack;
    vm.onNext = onNext;
    vm.onClose = onClose;
    vm.getCurrentState = getCurrentState;
    vm.isBusy = false;
    vm.isNextDisabled = false;
    vm.dirSyncStatusMessage = "";

    vm.onInit();

    $scope.$on('modal.closing', function (ev) {
      if ($scope.csv.model.isProcessing) {
        onCancelImport();
        ev.preventDefault();
      }
    });

    //////////////////
    var rootState;

    function onInit() {
      // save state we came from here so we can go back when exiting this flow
      rootState = $previousState.get().state.name;

      $rootScope.$on('add-user-dirsync-started', function () {
        vm.isBusy = true;
        vm.dirSyncStatusMessage = $translate.instant('userManage.ad.dirSyncProcessing');
      });

      $rootScope.$on('add-user-dirsync-completed', function () {
        vm.isBusy = false;
        vm.dirSyncStatusMessage = $translate.instant('userManage.ad.dirSyncSuccess');
      });

      $rootScope.$on('add-user-dirsync-error', function () {
        vm.isNextDisabled = true;
        vm.dirSyncStatusMessage = $translate.instant('userManage.ad.dirSyncError');
      });

      // adapt so we an use the userCsvResults page since we want the DirSync results to look the same
      $scope.csv = {
        isDirSyncEnabled: true,
        isCancelledByUser: false,
        onCancelImport: onCancelImport
      };
    }

    var transitions = {
      'installConnector': {
        next: '^.syncStatus',
        prev: rootState
      },

      'syncStatus': {
        next: '^.dirsyncServices',
        prev: '^.installConnector'
      },

      'dirsyncServices': {
        next: '^.dirsyncResult',
        prev: '^.syncStatus'
      },

      'dirsyncResult': {
        next: 'users.list'
      }
    };

    function onCancelImport() {
      if ($scope.csv.model.isProcessing) {
        $modal.open({
          type: 'dialog',
          templateUrl: 'modules/core/users/userCsv/userCsvStopImportConfirm.tpl.html'
        }).result.then(function () {
          // cancel the current import
          $scope.csv.isCancelledByUser = true;
          $scope.csv.model.cancelProcessCsv();
        });
      } else {
        $scope.$dismiss();
      }
    }

    function getCurrentState() {
      return _.last($state.$current.name.split('.'));
    }

    function onBack() {
      var curState = getCurrentState();
      var nextState = transitions[curState].prev;
      if (curState === 'syncStatus') {
        $state.go('users.manage.activedir');
      } else {
        $state.go(nextState);
      }
    }

    function onNext() {
      var curState = getCurrentState();
      var nextState = transitions[curState].next;
      vm.showCloseButton = (nextState.indexOf('dirsyncResult') >= 0);

      if (curState === 'installConnector') {
        // make sure directory syncing is enabled. If not, then we can't continue and need
        // to display an error
        vm.isBusy = true;
        FeatureToggleService.supportsDirSync().then(function (dirSyncEnabled) {
          vm.isBusy = false;
          if (dirSyncEnabled) {
            $state.go(nextState);
          } else {
            Notification.notify([$translate.instant('userManage.advanced.noDirSync')], 'warning');
          }
        });
      } else {
        // move on
        $state.go(nextState);
      }
    }

    function onClose() {
      vm.isBusy = true;
      $timeout(function () {
        $scope.$dismiss();
      });
    }
  }

})();
