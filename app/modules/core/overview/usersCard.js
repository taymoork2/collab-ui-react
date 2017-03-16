(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewUsersCard', OverviewUsersCard);

  /* @ngInject */
  function OverviewUsersCard($rootScope, $state, Config, Orgservice) {
    return {
      createCard: function createCard() {
        var card = {};

        card.name = 'overview.cards.users.title';
        card.template = 'modules/core/overview/usersCard.tpl.html';
        card.cardClass = 'user-card';
        card.icon = 'icon-circle-user';
        card.isUpdating = true;
        card.showLicenseCard = false;

        card.unlicensedUsersHandler = function (data) {
          if (data.success) {
            // for now use the length to get the count as there is a bug in CI and totalResults is not accurate.
            card.usersToConvert = Math.max((data.resources || []).length, data.totalResults);
            if (card.usersToConvert === 0) {
              card.name = 'overview.cards.licenses.title';
              card.showLicenseCard = true;
              getUnassignedLicenses();
            }
          }
        };

        function getUnassignedLicenses() {
          Orgservice.getLicensesUsage().then(function (response) {
            var licenses = _.flatMap(response, 'licenses');
            if (licenses.length > 0) {
              displayLicenseData(licenses);
            }
          });
        }

        function displayLicenseData(licenses) {
          var finalCounts = {};
          _.forEach(licenses, function (data) {
            if (data.licenseType in finalCounts) {
              finalCounts[data.licenseType].volume = finalCounts[data.licenseType].volume + data.volume;
              finalCounts[data.licenseType].usage = finalCounts[data.licenseType].usage + data.usage;
            } else {
              finalCounts[data.licenseType] = {
                volume: data.volume,
                usage: data.usage,
              };
            }
          });

          var displayKey;
          var volume = 0;
          var usage = 0;
          _.forEach(finalCounts, function (countData, key) {
            if ((key !== Config.licenseTypes.STORAGE && countData.volume > volume) || (key === Config.licenseTypes.MESSAGING && countData.volume === volume)) {
              displayKey = key;
              volume = countData.volume;
              usage = countData.usage;
            }
          });

          if (displayKey) {
            card.licenseNumber = volume - usage;
            card.licenseType = displayKey;
          }
        }

        card.orgEventHandler = function (data) {
          card.isUpdating = false;
          if (data.success) {
            card.ssoEnabled = data.ssoEnabled || false;
            card.dirsyncEnabled = data.dirsyncEnabled || false;
            //ssoEnabled is used in enterpriseSettingsCtrl so share through rootScope
            if (data.ssoEnabled) {
              $rootScope.ssoEnabled = true;
            }
          }
        };

        card.openConvertModal = function () {
          $state.go('users.convert', {});
        };

        card.showSSOSettings = function () {
          $state.go('setupwizardmodal', {
            currentTab: 'enterpriseSettings',
            currentStep: 'init',
            onlyShowSingleTab: true,
          });
        };

        card.showDirSyncSettings = function () {
          $state.go('settings', {
            showSettings: 'dirsync',
          });
        };

        card.manageUsers = function () {
          $state.go('users.list').then(function () {
            $state.go('users.manage.picker');
          });
        };

        return card;
      },
    };
  }
})();
