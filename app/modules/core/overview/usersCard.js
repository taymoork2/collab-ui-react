(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewUsersCard', OverviewUsersCard);

  /* @ngInject */
  function OverviewUsersCard($state, $rootScope, $translate, Auth, Authinfo, Config) {
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
              unassignedLicenses();
            }
          }
        };

        function unassignedLicenses() {
          Auth.getCustomerAccount(Authinfo.getOrgId()).then(function (data) {
            var max = 0;
            var license = {};
            var licenses = data.data.customers[0].licenses;
            _.forEach(licenses, function (data) {
              if (data.volume >= max) {
                max = data.volume;
                if (data.volume === max) {
                  if (!(license.licenseType) || license.licenseType !== Config.licenseTypes.MESSAGING) {
                    license = data;
                  }
                } else {
                  license = data;
                }
              }
              card.text = $translate.instant('overview.cards.licenses.text', {
                number: max,
                licenseType: license.licenseType
              });
              card.licenseNumber = max;
              card.licenseType = license.licenseType;
            });
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
