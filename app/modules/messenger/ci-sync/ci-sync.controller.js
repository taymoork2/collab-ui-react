(function () {
  'use strict';

  angular
    .module('Messenger')
    .controller('CiSyncCtrl', CiSyncCtrl);

  /* @ngInject */
  function CiSyncCtrl($q, $translate, Authinfo, Notification, CiService, SyncService) {
    var vm = this;

    var translatePrefix = 'messengerCiSync.';
    var customerSuccessRole = 'webex-messenger.customer_success';
    var requiredEntitlements = ['webex-squared', 'webex-messenger'];

    // TODO: replace this mechanism with something more consistent w/ other pages
    vm.dataStates = {
      LOADING: 1,
      LOADED: 2,
      ERROR: 3,
    };

    vm.adminTypes = {
      ORG: 'ORG',
      OPS: 'OPS',
      READ: 'READ',
      UNKNOWN: 'UNKNOWN',
    };

    vm.adminType = vm.adminTypes.UNKNOWN;
    vm.dataStatus = vm.dataStates.LOADING;
    vm.errorMsg = '';
    vm.orgAdminUrl = 'https://wapi.webexconnect.com/wbxconnect/acs/widgetserver/mashkit/apps/standalone.html?app=WBX.base.orgadmin';
    vm.backState = 'services-overview';
    vm.isSaving = false;
    vm.settings = {};
    vm.settings.syncInfo = {
      messengerOrgName: 'Unknown',
      messengerOrgId: 'Unknown',
      linkDate: 'Unknown',
      isAuthRedirect: false,
      isSyncEnabled: false,
      isMessengerSyncRawMode: false,
      isNewDataFormat: false,
      isPwdSync: true,
      isSparkEnt: true,
      isUsrDis: true,
      isUsrDel: true,
    };
    vm.settingsCopy = undefined;

    // l10n strings
    vm.refresh = $translate.instant(translatePrefix + 'refresh');
    vm.syncStatusTooltip = $translate.instant(translatePrefix + 'syncStatusTooltip');
    vm.dirsyncStatusTooltip = $translate.instant(translatePrefix + 'dirsyncStatusTooltip');
    vm.authRedirectTooltip = $translate.instant(translatePrefix + 'authRedirectTooltip');
    vm.orgAdminLinkTooltip = $translate.instant(translatePrefix + 'orgAdminLinkTooltip');
    vm.pwdSyncTooltip = $translate.instant(translatePrefix + 'pwdSyncTooltip');
    vm.sparkEntTooltip = $translate.instant(translatePrefix + 'sparkEntTooltip');
    vm.usrDisTooltip = $translate.instant(translatePrefix + 'usrDisTooltip');
    vm.usrDelTooltip = $translate.instant(translatePrefix + 'usrDelTooltip');
    vm.subSections = {};
    vm.subSections.orgInfo = {
      title: $translate.instant(translatePrefix + 'orgInfoSection.sectionTitle'),
      description: $translate.instant(translatePrefix + 'orgInfoSection.sectionDescr'),
    };
    vm.subSections.options = {
      title: $translate.instant(translatePrefix + 'optionsSection.sectionTitle'),
      description: $translate.instant(translatePrefix + 'optionsSection.sectionDescr'),
    };

    // methods
    vm.init = init;
    vm.authorized = authorized;
    vm.isOrgAdmin = isOrgAdmin;
    vm.isOpsAdmin = isOpsAdmin;
    vm.patchSync = patchSync;
    vm.refreshStatus = refreshStatus;
    vm.setOrgAdmin = setOrgAdmin;
    vm.setOpsAdmin = setOpsAdmin;
    vm.setExistingProperty = setExistingProperty;
    vm.saveSettings = saveSettings;
    vm.resetSettings = resetSettings;
    vm.canShowSaveCancel = canShowSaveCancel;

    init();

    ////////////////

    // CI Calls Inside
    function init() {
      vm.dataStatus = vm.dataStates.LOADING;

      // TODO: move this auth check to the UI routing level (ie. 'appconfig')
      // Check for Partner Admin (Ops Admin) vs. Full Admin (Org Admin)
      return checkUserType()
        .then(function () {
          // TODO: add promise for jabber interop setting
          return $q.all({
            syncInfo: getSyncStatus(),
          });
        })
        .then(function (results) {
          vm.settings.syncInfo = results.syncInfo;
          updateSettingsCopy();
          vm.dataStatus = vm.dataStates.LOADED;
        })
        .catch(function (errorMsg) {
          vm.dataStatus = vm.dataStates.ERROR;
          var error = $translate.instant(translatePrefix + 'errorAuthFailed') + errorMsg;
          Notification.error(error);
        });
    }

    function authorized() {
      return (isOrgAdmin() || isOpsAdmin());
    }

    function isOrgAdmin() {
      return (vm.adminTypes.ORG === vm.adminType);
    }

    function isOpsAdmin() {
      return (vm.adminTypes.OPS === vm.adminType);
    }

    function checkUserType() {
      var defer = $q.defer();

      // All users must have CI Full Admin role except new ReadAdmin
      //
      // Also allow help desk user with customer org in its managed org list with id_full_admin role.
      // add Full Admin Org Manager to allow list.
      //
      // Customer Success Admin     --> Ops Admin
      // Non-Customer Success Admin --> must have webex-squared AND webex-messenger CI entitlements
      if (Authinfo.isReadOnlyAdmin()) {
        setReadAdmin();
        defer.resolve();
      } else if (Authinfo.isCustomerAdmin()) {
        CiService.hasRole(customerSuccessRole)
          .then(function (hasCSRole) {
            if (hasCSRole) {
              setOpsAdmin();
              defer.resolve();
            } else {
              if (!(Authinfo.isWebexSquared() && Authinfo.isWebexMessenger())) {
                defer.reject($translate.instant(translatePrefix + 'errorLacksEntitlements') + requiredEntitlements);
              } else {
                CiService.isOrgManager()
                  .then(function (isOrgManager) {
                    if (isOrgManager) {
                      setOpsAdmin();
                    } else {
                      setOrgAdmin();
                    }
                    defer.resolve();
                  }).catch(function (errorMsg) {
                    defer.reject($translate.instant(translatePrefix + 'errorFailedCheckingOrgInManagedOrgs') + errorMsg);
                  });
              }
            }
          }).catch(function (errorMsg) {
            defer.reject($translate.instant(translatePrefix + 'errorFailedCheckingCustSuccessRole') + errorMsg);
          });
      } else if (!Authinfo.isHelpDeskUser()) {
        defer.reject($translate.instant(translatePrefix + 'errorLacksRole'));
      } else {
        CiService.isOrgManager()
          .then(function (isOrgManager) {
            if (isOrgManager) {
              setOpsAdmin();
              defer.resolve();
            } else {
              defer.reject($translate.instant(translatePrefix + 'errorNotOrgManager'));
            }
          }).catch(function (errorMsg) {
            defer.reject($translate.instant(translatePrefix + 'errorFailedCheckingOrgInManagedOrgs') + errorMsg);
          });
      }
      return defer.promise;
    }

    function getSyncStatus() {
      return SyncService.getSyncStatus()
        .then(function (syncStatusObj) {
          return syncStatusObj;
        })
        .catch(function (errorObj) {
          var error = $translate.instant(translatePrefix + 'errorFailedGettingCISyncStatus') + errorObj.message;
          vm.errorMsg = error;
          Notification.error(error);
        });
    }

    // TODO (mipark2): implement loading state behavior while refresh occurs (see: luwang2)
    function refreshStatus() {
      return SyncService.refreshSyncStatus()
        .then(function (syncStatusObj) {
          vm.settings.syncInfo = syncStatusObj;
          return syncStatusObj;
        })
        .catch(function (errorObj) {
          var error = $translate.instant(translatePrefix + 'errorFailedRefreshingCISyncStatus') + errorObj.message;
          vm.errorMsg = error;
          Notification.error(error);
        });
    }

    function setOrgAdmin() {
      vm.adminType = vm.adminTypes.ORG;
    }

    function setOpsAdmin() {
      vm.adminType = vm.adminTypes.OPS;
    }

    function setReadAdmin() {
      vm.adminType = vm.adminTypes.READ;
    }

    function patchSync() {
      // SyncService must turn the syncing boolean into the full mode
      return SyncService.patchSync(vm.settings.syncInfo)
        .then(function () {
          Notification.success(translatePrefix + 'patchSuccessful');
        })
        .catch(function (errorObj) {
          var error = $translate.instant(translatePrefix + 'errorFailedUpdatingCISync') + errorObj.message;
          Notification.error(error);

          // Reset to previous state
          return getSyncStatus();
        });
    }

    function setExistingProperty(propName, value) {
      // only a previously defined property can be updated
      if (_.isNil(_.get(vm, propName))) {
        return;
      }

      _.set(vm, propName, value);
    }

    function canShowSaveCancel() {
      return vm.dataStatus === vm.dataStates.LOADED &&
        hasSettingsChanged() &&
        canCurrentUserSave();
    }

    function canCurrentUserSave() {
      return vm.adminTypes.OPS === vm.adminType;
    }

    function saveSettings() {
      // Double-check that they are ops for security
      if (!canCurrentUserSave()) {
        return $q.reject();
      }

      vm.isSaving = true;
      return $q.all({
        syncInfo: patchSync(),
      })
      .then(updateSettingsCopy)
      .catch(resetSettings)
      .finally(function () {
        vm.isSaving = false;
      });
    }

    function updateSettingsCopy() {
      vm.settingsCopy = _.cloneDeep(vm.settings);
    }

    function resetSettings() {
      vm.settings = _.cloneDeep(vm.settingsCopy);
    }

    function hasSettingsChanged() {
      return !_.isEqual(vm.settings, vm.settingsCopy);
    }
  }
})();
