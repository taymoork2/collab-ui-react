(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewUsersCard', OverviewUsersCard);

  /* @ngInject */
  function OverviewUsersCard($rootScope, $state, Auth, Authinfo, Config) {
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
          Auth.getCustomerAccount(Authinfo.getOrgId()).then(function (response) {
            var max = 0;
            var licenseType = '';
            var licenses = _.get(response, 'data.customers[0].licenses');
            if (_.isUndefined(licenses)) {
              licenses = _.get(response, 'data.customers[0].subscriptions[0].licenses');
            }
            if (licenses) {
              _.forEach(licenses, function (data) {
                if (data.volume > max) {
                  max = data.volume;
                  licenseType = data.licenseType;
                } else if (data.volume === max && data.licenseType === Config.licenseTypes.MESSAGING) {
                  licenseType = Config.licenseTypes.MESSAGING;
                }
              });
            }
            card.licenseNumber = max;
            card.licenseType = licenseType;
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
