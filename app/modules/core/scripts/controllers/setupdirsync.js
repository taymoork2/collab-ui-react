'use strict';

angular.module('Core')
  .controller('setupDirSyncDialogCtrl', setupDirSyncDialogCtrl);

/* @ngInject */
function setupDirSyncDialogCtrl($scope, $modalInstance, DirSyncService, Authinfo, Log, Notification, $translate, $window, Config, UserListService) {

  $scope.numUsersInSync = '0';
  $scope.domainExists = true;
  $scope.domain = '';
  $scope.dirsyncStatus = '';
  $scope.gridOptions = {
    data: 'userList',
    multiSelect: false
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('canceled');
  };

  $scope.formatDate = function (date) {
    if (date !== '') {
      return moment.utc(date).local().format('MMM D \'YY h:mm a');
    } else {
      return date;
    }
  };

  $scope.getDefaultDomain = function () {
    DirSyncService.getDirSyncDomain(function (data, status) {
      if (data.success) {
        Log.debug('Retrieved DirSync domain name. Status: ' + status);
        if (data && data.domains[0]) {
          $scope.domain = data.domains[0].domainName;
          if ($scope.domain.length > 0) {
            $scope.domainExists = true;
          } else {
            $scope.domainExists = false;
          }
        }
      } else {
        Log.debug('Failed to retrieve directory sync configuration. Status: ' + status);
        // Notification.notify([$translate.instant('dirsyncModal.getDomainFailed', {
        //   status: status
        // })], 'error');
      }
    });
  };

  $scope.setDomainName = function (domainName) {
    $scope.domain = domainName.value;
  };

  $scope.setDomain = function () {
    if (($scope.domain.length > 0) && ($scope.domainExists !== true)) {
      DirSyncService.postDomainName($scope.domain, function (data, status) {
        if (data.success) {
          Log.debug('Created DirSync domain. Status: ' + status);
        } else {
          Log.debug('Failed to create directory sync domain. Status: ' + status);
          Notification.notify([$translate.instant('dirsyncModal.setDomainFailed', {
            status: status
          })], 'error');
        }
      });
    }
  };

  $scope.getStatus = function () {
    $scope.dirsyncStatus = '';
    $scope.numUsersInSync = 0;
    $scope.userList = [];

    DirSyncService.getDirSyncStatus(function (data, status) {
      if (data.success) {
        Log.debug('Retrieved DirSync status successfully. Status: ' + status);
        if (data) {
          $scope.dirsyncStatus = data.result;
          $scope.lastEndTime = data.lastEndTime;
        }
      } else {
        Log.debug('Failed to retrieve directory sync status. Status: ' + status);
        Notification.notify([$translate.instant('dirsyncModal.getStatusFailed', {
          status: status
        })], 'error');
      }
    });

    UserListService.listUsers(null, null, null, null, function (data, status) {
      if (data.success) {
        Log.debug('Retrieved user list successfully. Status: ' + status);
        if (data) {
          $scope.numUsersInSync = data.totalResults;

          for (var i = 0; i < data.totalResults; i++) {
            var userArrObj = {
              Email: null,
              Name: null
            };
            userArrObj.Email = data.Resources[i].userName;
            userArrObj.Name = data.Resources[i].displayName;
            $scope.userList.push(userArrObj);
          }
        }
      } else {
        Log.debug('Failed to retrieve user list. Status: ' + status);
        Notification.notify([$translate.instant('dirsyncModal.getListFailed', {
          status: status
        })], 'error');
      }
    });

  };

  $scope.syncNow = function () {
    $scope.syncNowLoad = true;
    DirSyncService.syncUsers(500, function (data, status) {
      if (data.success) {
        $scope.syncNowLoad = false;
        Log.debug('DirSync started successfully. Status: ' + status);
        Notification.notify([$translate.instant('dirsyncModal.dirsyncSuccess', {
          status: status
        })], 'success');
      } else {
        $scope.syncNowLoad = false;
        Log.debug('Failed to start directory sync. Status: ' + status);
        Notification.notify([$translate.instant('dirsyncModal.dirsyncFailed', {
          status: status
        })], 'error');
      }
    });
  };
}
