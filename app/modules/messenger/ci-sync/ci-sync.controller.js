(function () {
  'use strict';

  angular
    .module('Messenger')
    .controller('CiSyncCtrl', CiSyncCtrl);

  /* @ngInject */
  function CiSyncCtrl($q, $translate, AccountOrgService, Authinfo, Config, CiService, Notification, SyncService) {
    var vm = this;

    var translatePrefix = 'messengerCiSync.';
    var customerSuccessRole = 'webex-messenger.customer_success';
    var requiredEntitlements = [Config.entitlements.squared, Config.entitlements.messenger];
    var JABBER_INTEROP_ENTITLEMENT = Config.entitlements.messenger_interop;

    // TODO: replace this mechanism with something more consistent w/ other pages
    vm.dataStates = {
      LOADING: 1,
      LOADED: 2,
      ERROR: 3,
    };

    vm.adminTypes = {
      ORG: 'ORG',
      OPS: 'OPS',
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
    vm.jabberInteropTooltip = $translate.instant(translatePrefix + 'jabberInteropTooltip');
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
    vm.refreshStatus = refreshStatus;
    vm.setOrgAdmin = setOrgAdmin;
    vm.setOpsAdmin = setOpsAdmin;
    vm.setExistingProperty = setExistingProperty;
    vm.saveSettings = saveSettings;
    vm.resetSettings = resetSettings;
    vm.canShowSaveCancel = canShowSaveCancel;
    vm._helpers = {};
    vm._helpers.hasJabberInteropChanged = hasJabberInteropChanged;
    vm._helpers.hasSyncInfoChanged = hasSyncInfoChanged;
    vm._helpers.saveJabberInterop = saveJabberInterop;
    vm._helpers.saveSyncInfo = saveSyncInfo;

    init();

    ////////////////

    // CI Calls Inside
    function init() {
      vm.dataStatus = vm.dataStates.LOADING;

      // jabber interop entitlement is already known (this is determined at login-time when
      // populating the 'services' property of a user's auth data)
      vm.settings.jabberInterop = isJabberInteropEnabled();

      // TODO: move this auth check to the UI routing level (ie. 'appconfig')
      // Check for Partner Admin (Ops Admin) vs. Full Admin (Org Admin)
      return checkUserType()
        .then(getSyncStatus)
        .then(function (syncInfo) {
          vm.settings.syncInfo = syncInfo;
          updateSettingsCopy();
          vm.dataStatus = vm.dataStates.LOADED;
        })
        .catch(function (errorMsg) {
          vm.dataStatus = vm.dataStates.ERROR;
          var error = $translate.instant(translatePrefix + 'errorAuthFailed') + errorMsg;
          Notification.error(error);
        });
    }

    // TODO: remove this in-page auth logic (use UI router or 'Auth.allowMessengerService()' to block access instead)
    function authorized() {
      return isOrgAdmin() || isOpsAdmin() || Authinfo.isReadOnlyAdmin();
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
          vm.settingsCopy.syncInfo = vm.settings.syncInfo = syncStatusObj;
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

    function setExistingProperty(propName, value) {
      // only a previously defined property can be updated
      if (_.isNil(_.get(vm, propName))) {
        return;
      }

      _.set(vm, propName, value);
    }

    function canShowSaveCancel() {
      return vm.dataStatus === vm.dataStates.LOADED && hasSettingsChanged();
    }

    function saveSettings() {
      var promises = {
        jabberInterop: vm._helpers.hasJabberInteropChanged() ? vm._helpers.saveJabberInterop() : $q.resolve(),
        syncInfo: vm._helpers.hasSyncInfoChanged() ? vm._helpers.saveSyncInfo() : $q.resolve(),
      };

      vm.isSaving = true;
      return $q.all(promises)
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

    function hasJabberInteropChanged() {
      return !_.isEqual(_.get(vm, 'settings.jabberInterop'), _.get(vm, 'settingsCopy.jabberInterop'));
    }

    function hasSyncInfoChanged() {
      return !_.isEqual(_.get(vm, 'settings.syncInfo'), _.get(vm, 'settingsCopy.syncInfo'));
    }

    function hasSettingsChanged() {
      return !_.isEqual(vm.settings, vm.settingsCopy);
    }

    function isJabberInteropEnabled() {
      return Authinfo.isEntitled(JABBER_INTEROP_ENTITLEMENT);
    }

    function saveSyncInfo() {
      // Double-check that they are ops for security
      if (!vm.isOpsAdmin()) {
        return $q.reject();
      }

      // SyncService must turn the syncing boolean into the full mode
      return SyncService.patchSync(vm.settings.syncInfo)
        .then(function () {
          Notification.success(translatePrefix + 'patchSuccessful');
        })
        .catch(function (errorObj) {
          var error = $translate.instant(translatePrefix + 'errorFailedUpdatingCISync') + errorObj.message;
          Notification.error(error);
        });
    }

    function saveJabberInterop() {
      var orgId = Authinfo.getOrgId();
      var promise;

      if (_.get(vm, 'settings.jabberInterop')) {
        promise = AccountOrgService.addMessengerInterop(orgId)
          .then(function () {
            return AccountOrgService.getServices(orgId);
          })
          .then(function (response) {
            var entitlements = _.get(response, 'data.entitlements');
            var entitlement = _.find(entitlements, { ciName: JABBER_INTEROP_ENTITLEMENT });
            Authinfo.addEntitlement(entitlement);
          });
      } else {
        promise = AccountOrgService.deleteMessengerInterop(orgId)
          .then(function () {
            Authinfo.removeEntitlement(JABBER_INTEROP_ENTITLEMENT);
          });
      }

      return promise
        .then(function () {
          Notification.success(translatePrefix + 'jabberInteropUpdateSuccessful');
        })
        .catch(function () {
          Notification.error(translatePrefix + 'errorFailedUpdatingJabberInterop');
        });
    }
  }
})();
