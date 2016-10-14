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
            var max = 0;
            var licenseUsage = 0;
            var licenseType = '';
            var licenses = _.get(response[0], 'licenses');
            if (licenses) {
              _.forEach(licenses, function (data) {
                if ((data.volume > max) && (data.licenseType !== Config.licenseTypes.STORAGE)) {
                  max = data.volume;
                  licenseUsage = data.usage;
                  licenseType = data.licenseType;
                } else if (data.volume === max && data.licenseType === Config.licenseTypes.MESSAGING) {
                  licenseType = Config.licenseTypes.MESSAGING;
                }
                var remainder = max - licenseUsage;
                card.licenseNumber = remainder < 0 ? 0 : remainder;
                card.licenseType = licenseType;
              });
            }
          });
        }

        card.orgEventHandler = function (data) {
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
            currentStep: 'init'
          });
        };

        card.manageUsers = function () {
          $state.go('users.manage', {});
        };

        return card;
      }
    };
  }
})();
