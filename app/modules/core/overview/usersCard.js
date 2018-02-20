(function () {
  'use strict';

  // TODO: refactor - do not use 'ngtemplate-loader' or ng-include directive
  var usersCardTemplatePath = require('ngtemplate-loader?module=Core!./usersCard.tpl.html');

  angular
    .module('Core')
    .factory('OverviewUsersCard', OverviewUsersCard);

  /* @ngInject */
  function OverviewUsersCard($q, $rootScope, $state, $timeout, $translate, AutoAssignTemplateService, Config, DirSyncService, FeatureToggleService, ModalService, MultiDirSyncService, Orgservice) {
    return {
      createCard: function createCard() {
        var card = {};
        card.features = {};
        card.isAutoAssignTemplateActive = false;
        card.hasAutoAssignDefaultTemplate = false;

        card.name = 'overview.cards.users.title';
        card.template = usersCardTemplatePath;
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
          var sharedDevices = {};
          // TODO: Would benefit from a shared service for license counts w/mySubscriptions and helpdesk
          _.forEach(licenses, function (data) {
            if (data.licenseType === Config.licenseTypes.SHARED_DEVICES) {
              if (data.offerName in sharedDevices) {
                sharedDevices[data.offerName].volume = sharedDevices[data.offerName].volume + data.volume;
              } else {
                sharedDevices[data.offerName] = {
                  volume: data.volume,
                  usage: data.usage,
                };
              }
            } else if (data.licenseType in finalCounts) {
              finalCounts[data.licenseType].volume = finalCounts[data.licenseType].volume + data.volume;
              finalCounts[data.licenseType].usage = finalCounts[data.licenseType].usage + data.usage;
            } else {
              finalCounts[data.licenseType] = {
                volume: data.volume,
                usage: data.usage,
              };
            }
          });

          _.forEach(sharedDevices, function (deviceType) {
            if (Config.licenseTypes.SHARED_DEVICES in finalCounts) {
              finalCounts[Config.licenseTypes.SHARED_DEVICES].volume = finalCounts[Config.licenseTypes.SHARED_DEVICES].volume + deviceType.volume;
              finalCounts[Config.licenseTypes.SHARED_DEVICES].usage = finalCounts[Config.licenseTypes.SHARED_DEVICES].usage + deviceType.usage;
            } else {
              finalCounts[Config.licenseTypes.SHARED_DEVICES] = {
                volume: deviceType.volume,
                usage: deviceType.usage,
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
          if (data.success) {
            card.ssoEnabled = data.ssoEnabled || false;
            //ssoEnabled is used in enterpriseSettingsCtrl so share through rootScope
            if (data.ssoEnabled) {
              $rootScope.ssoEnabled = true;
            }
          }

          if (card.features.atlasF6980MultiDirSync) {
            MultiDirSyncService.getEnabledDomains().then(function (enabledDomains) {
              card.dirsyncEnabled = enabledDomains.length > 0;
            }).catch(function () {
              card.dirsyncEnabled = false;
            }).finally(function () {
              card.isUpdating = false;
            });
          } else {
            var dirSyncPromise = (DirSyncService.requiresRefresh() ? DirSyncService.refreshStatus() : $q.resolve());
            dirSyncPromise.finally(function () {
              card.dirsyncEnabled = DirSyncService.isDirSyncEnabled();
              card.isUpdating = false;
            });
          }
        };

        function goToUsersConvert(options) {
          $state.go('users.convert', options);
        }

        card.isConvertButtonDisabled = function () {
          return card.isUpdating || !card.usersToConvert;
        };

        card.openConvertModal = function () {
          if (card.dirsyncEnabled) {
            ModalService.open({
              message: '<span>' + $translate.instant('homePage.convertUsersDirSyncEnabledWarning') + '</span>',
              title: $translate.instant('userManage.ad.adStatus'),
            }).result.then(function () {
              goToUsersConvert({
                readOnly: true,
              });
            });
          } else {
            goToUsersConvert();
          }
        };

        card.showSSOSettings = function () {
          $state.go('setupwizardmodal', {
            currentTab: 'enterpriseSettings',
            currentStep: 'init',
            onlyShowSingleTab: true,
            showStandardModal: true,
          });
        };

        card.showDirSyncSettings = function () {
          $state.go('settings', {
            showSettings: 'dirsync',
          });
        };

        card.manageUsers = function () {
          // notes:
          // - simply calling '$state.go(...)' inside of the callback does not seem to produce correct behavior
          // - workaround for now is to delay the subsequent call till the next tick
          // TODO: reverify after angular-ui-router upgrade
          $state.go('users.list').then(function () {
            $timeout(function () {
              $state.go('users.manage.picker');
            });
          });
        };

        card.showEditAutoAssignTemplateModal = function () {
          $state.go('users.list').then(function () {
            $timeout(function () {
              AutoAssignTemplateService.gotoEditAutoAssignTemplate({
                isEditTemplateMode: card.hasAutoAssignDefaultTemplate,
              });
            });
          });
        };

        card.getAutoAssignLicensesStatusCssClass = function () {
          return card.isAutoAssignTemplateActive ? 'success' : 'disabled';
        };

        function initFeatureToggles() {
          return $q.all({
            atlasF3745AutoAssignLicenses: FeatureToggleService.atlasF3745AutoAssignLicensesGetStatus(),
            atlasF6980MultiDirSync: FeatureToggleService.atlasF6980MultiDirSyncGetStatus(),
          }).then(function (features) {
            card.features = features;
          });
        }

        function initAutoAssignTemplate() {
          if (card.features.atlasF3745AutoAssignLicenses) {
            AutoAssignTemplateService.hasDefaultTemplate().then(function (hasDefaultTemplate) {
              card.hasAutoAssignDefaultTemplate = hasDefaultTemplate;
              if (hasDefaultTemplate) {
                AutoAssignTemplateService.isEnabledForOrg().then(function (isActivated) {
                  card.isAutoAssignTemplateActive = isActivated;
                });
              }
            });
          }
        }

        initFeatureToggles().then(initAutoAssignTemplate);

        return card;
      },
    };
  }
})();
