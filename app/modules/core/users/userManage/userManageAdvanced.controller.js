require('./_user-manage.scss');

(function () {
  'use strict';

  angular.module('Core')
    .controller('UserManageAdvancedController', UserManageAdvancedController);

  /* @ngInject */
  function UserManageAdvancedController($modal, $previousState, $rootScope, $scope, $state, $timeout, $translate, Analytics, Authinfo, DirSyncService, Notification) {
    var vm = this;

    vm.isUserAdmin = isUserAdmin;
    vm.onInit = onInit;
    vm.onBack = onBack;
    vm.onNext = onNext;
    vm.onClose = onClose;
    vm.getCurrentState = getCurrentState;
    vm.isBusy = false;
    vm.isNextDisabled = false;
    vm.dirSyncStatusMessage = '';

    vm.onInit();

    $scope.$on('modal.closing', function (ev) {
      if (isCsvProcessing()) {
        onCancelImport();
        ev.preventDefault();
      }
      Analytics.trackAddUsers(Analytics.eventNames.CANCEL_MODAL);
    });

    //////////////////
    var rootState;

    function onInit() {
      // save state we came from here so we can go back when exiting this flow
      rootState = $previousState.get().state.name;
      if (rootState === 'users.manage.emailSuppress') {
        rootState = 'users.manage.picker';
      }

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
        Analytics.trackAddUsers(Analytics.sections.ADD_USERS.eventNames.SYNC_ERROR, null, { error: 'Directory Sync Error' });
      });

      // adapt so we an use the userCsvResults page since we want the DirSync results to look the same
      $scope.csv = {
        isDirSyncEnabled: true,
        isCancelledByUser: false,
        onCancelImport: onCancelImport,
      };
    }

    var transitions = {
      installConnector: {
        next: '^.syncStatus',
        prev: rootState,
      },

      syncStatus: {
        next: '^.dirsyncServices',
        prev: '^.installConnector',
      },

      dirsyncServices: {
        next: '^.dirsyncResult',
        prev: '^.syncStatus',
      },

      dirsyncResult: {
        next: 'users.list',
      },
    };

    function isUserAdmin() {
      return Authinfo.isUserAdminUser();
    }

    function onCancelImport() {
      if (isCsvProcessing()) {
        $modal.open({
          type: 'dialog',
          template: require('modules/core/users/userCsv/userCsvStopImportConfirm.tpl.html'),
        }).result.then(function () {
          // cancel the current import
          $scope.csv.isCancelledByUser = true;
          $scope.csv.model.cancelProcessCsv();
        });
      } else if (_.isFunction($scope.$dismiss)) {
        $scope.$dismiss();
      }
    }

    function isCsvProcessing() {
      return _.get($scope, 'csv.model.isProcessing', false);
    }

    function getCurrentState() {
      return _.last($state.$current.name.split('.'));
    }

    function onBack() {
      var curState = getCurrentState();
      var nextState = transitions[curState].prev;
      Analytics.trackAddUsers(Analytics.eventNames.BACK);
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
        if (DirSyncService.isDirSyncEnabled()) {
          Analytics.trackAddUsers(Analytics.eventNames.NEXT);
          $state.go(nextState);
        } else {
          Analytics.trackAddUsers(Analytics.sections.ADD_USERS.eventNames.SYNC_ERROR, null, { error: 'Directory Connector not installed' });
          Notification.warning('userManage.advanced.noDirSync');
        }
      } else {
        // move on
        Analytics.trackAddUsers(Analytics.eventNames.NEXT);
        $state.go(nextState);
      }
    }

    function onClose() {
      vm.isBusy = true;
      $timeout(function () {
        Analytics.trackAddUsers(Analytics.sections.ADD_USERS.eventNames.DONE);
        $scope.$dismiss();
      });
    }
  }
})();
