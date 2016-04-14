(function () {
  'use strict';

  angular.module('Core')
    .controller('LicensesCtrl', LicenseCtrl);

  /* @ngInject */
  function LicenseCtrl($modal, $scope, $state, Authinfo, Log, Notification, Orgservice, TrialService) {

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
      var start = moment(trial.startDate);
      var daysDone = moment(now).diff(start, 'days');

      $scope.packageInfo.termMax = trial.trialPeriod;
      $scope.packageInfo.termUsed = daysDone;
      $scope.packageInfo.termRemaining = trial.trialPeriod - daysDone;

    };

    var getTrials = function () {
      TrialService.getTrialsList(function (data, status) {
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
      Orgservice.getUnlicensedUsers(function (data) {
        $scope.licenses.unlicensed = 0;
        $scope.licenses.unlicensedUsersList = null;
        if (data.success) {
          if (data.totalResults > 0) {
            // for now use the length to get the count as there is a bug in CI and totalResults
            // is not accurate.
            $scope.licenses.unlicensed = data.resources.length;
            $scope.licenses.unlicensedUsersList = data.resources;
          }
        }
      });
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

    $scope.$on('$stateChangeSuccess', function (e, to) {
      if (to.name === 'overview') {
        getUnlicensedUsers();
      }
    });

    $scope.openConvertModal = function () {
      $state.go('users.convert', {});
    };

  }
})();
