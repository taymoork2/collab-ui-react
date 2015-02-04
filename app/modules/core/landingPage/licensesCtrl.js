'use strict';
/* global moment */

angular.module('Core')

.controller('LicensesCtrl', ['$scope', 'Authinfo', 'PartnerService', 'Orgservice', 'Log', 'Notification', '$modal', '$filter', '$translate', 'Userservice',
  function ($scope, Authinfo, PartnerService, Orgservice, Log, Notification, $modal, $filter, $translate, Userservice) {

    $scope.packageInfo = {
      name: '&nbsp;',
      termMax: 0,
      termUsed: 0,
      termRemaining: 0,
      termUnits: 'days'
    };

    $scope.licenses = {
      total: 0,
      used: 0,
      unlicensed: 0,
      domain: ''
    };

    var isOnTrial;
    var isDomainClaimed;

    $scope.isOnTrial = function () {
      return isOnTrial;
    };

    $scope.isDomainClaimed = function () {
      return isDomainClaimed;
    };

    $scope.isAdmin = function () {
      return Authinfo.isAdmin();
    };

    var populateLicenseData = function (trial) {

      if (trial.offers) {
        var offer = trial.offers[0];
        if (offer) {
          $scope.packageInfo.name = offer.id;
          $scope.licenses.total = offer.licenseCount;
        }
      }

      var now = moment();
      var start = moment(trial.startDate).format('MMM D, YYYY');
      var daysDone = moment(now).diff(start, 'days');

      $scope.packageInfo.termMax = trial.trialPeriod;
      $scope.packageInfo.termUsed = daysDone;
      $scope.packageInfo.termRemaining = trial.trialPeriod - daysDone;

    };

    var getTrials = function () {
      PartnerService.getTrialsList(function (data, status) {
        if (data.success) {
          Log.debug('trial records found:' + data.trials.length);
          if (data.trials.length > 0) {
            isOnTrial = true;
            var trial = data.trials[0];
            populateLicenseData(trial);
          } else {
            // not on trial, get usage from CI?
            isOnTrial = false;
            $scope.packageInfo.name = 'Default Collab Package';
            $scope.licenses.total = 'Unlimited';
          }
        } else {
          Log.debug('Failed to retrieve trial information. Status: ' + status);
          // Notification.notify([$translate.instant('homePage.errGetTrialsQuery', {
          // 	status: status
          // })], 'error');
        }
      });
    };

    var getorgInfo = function () {
      Orgservice.getOrg(function (data, status) {
        if (data.success) {
          var domainList = '';
          if (data.domains) {
            isDomainClaimed = true;
            for (var i = 0; i < data.domains.length; i++) {
              domainList = domainList + data.domains[i] + ' ';
            }
            $scope.licenses.domain = domainList;
          } else {
            isDomainClaimed = false;
          }

        } else {
          Log.debug('Get existing org failed. Status: ' + status);
        }
      });
    };

    var getAdminOrgInfo = function () {
      Orgservice.getAdminOrg(function (data, status) {
        if (data.success) {
          if (data.squaredUsageCount) {
            $scope.licenses.used = data.squaredUsageCount;
          }
        } else {
          Log.debug('Get existing admin org failed. Status: ' + status);
        }
      });
    };

    var getUnlicensedUsers = function () {
      Orgservice.getUnlicensedUsers(function (data, status) {
        $scope.licenses.unlicensed = 0;
        $scope.licenses.unlicensedUsersList = null;
        if (data.success) {
          if (data.totalResults) {
            $scope.licenses.unlicensed = data.totalResults;
            $scope.licenses.unlicensedUsersList = data.resources;
          }
        }
      });
    };

    $scope.convertUsers = function () {
      console.log($scope.gridOptions.$gridScope.selectedItems);
      Userservice.migrateUsers($scope.gridOptions.$gridScope.selectedItems, function (data, status) {
        if (data.success) {
          var successMessage = [];
          successMessage.push('Users successfully converted.');
          Notification.notify(successMessage, 'success');
        } else {
          var errorMessage = ['Converting users failed. Status: ' + status];
          errorMessage.push();
          Notification.notify(errorMessage, 'error');
        }
      });
      $scope.convertModalInstance.close();
    };

    $scope.getName = function (user) {
      if (user.name === undefined && user.displayName === undefined) {
        return '';
      }
      if (user.displayName !== undefined) {
        return user.displayName;
      }
      if (user.name.givenName !== undefined) {
        if (user.name.familyName !== undefined) {
          return user.name.givenName + " " + user.name.familyName;
        }
        return user.name.givenName;
      }
      return user.name.familyName;
    };

    getTrials();
    getorgInfo();
    getAdminOrgInfo();
    getUnlicensedUsers();

    $scope.openConvertModal = function () {
      $scope.convertModalInstance = $modal.open({
        templateUrl: 'modules/core/convertUsers/convertUsersModal.tpl.html',
        controller: 'LicensesCtrl',
        size: 'lg',
        scope: $scope
      });
    };

    var nameTemplate = '<div class="ngCellText"><p class="hoverStyle" title="{{getName(row.entity)}}">{{getName(row.entity)}}</p></div>';
    var emailTemplate = '<div class="ngCellText"><p class="hoverStyle" title="{{row.entity.userName}}">{{row.entity.userName}}</p></div>';

    $scope.gridOptions = {
      data: 'licenses.unlicensedUsersList',
      rowHeight: 45,
      headerRowHeight: 45,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 2,
      showSelectionCheckbox: true,

      selectedItems: [],
      columnDefs: [{
        displayName: $filter('translate')('homePage.name'),
        width: 342,
        resizable: false,
        cellTemplate: nameTemplate,
        sortable: false
      }, {
        field: 'userName',
        displayName: $filter('translate')('homePage.emailAddress'),
        cellTemplate: emailTemplate,
        width: 405,
        resizable: false,
        sortable: false
      }]
    };
    $scope.gridOptions.enableHorizontalScrollbar = 0;
  }
]);
