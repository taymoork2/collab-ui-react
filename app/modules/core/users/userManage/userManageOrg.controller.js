// TODO: convert to TS and register to './index.ts'
(function () {
  'use strict';

  module.exports = UserManageOrgController;

  /* @ngInject */
  function UserManageOrgController($q, $state, Analytics, Authinfo, AutoAssignTemplateModel, AutoAssignTemplateService, DirSyncService, FeatureToggleService, Notification, OnboardService, Orgservice, UserCsvService, UserManageService) {
    var DEFAULT_AUTO_ASSIGN_TEMPLATE = AutoAssignTemplateService.DEFAULT;
    var vm = this;

    vm.ManageType = require('./userManage.keys').ManageType;

    vm.onInit = onInit;
    vm.manageType = 'manual';
    vm.maxUsersInCSV = UserCsvService.maxUsersInCSV;
    vm.maxUsersInManual = OnboardService.maxUsersInManual;
    vm.isDirSyncEnabled = DirSyncService.isDirSyncEnabled();
    vm.hasDefaultAutoAssignTemplate = hasDefaultAutoAssignTemplate;
    vm.initDefaultAutoAssignTemplate = initDefaultAutoAssignTemplate;
    vm.toggleActivateForDefaultAutoAssignTemplate = toggleActivateForDefaultAutoAssignTemplate;
    vm.isDefaultAutoAssignTemplateActivated = isDefaultAutoAssignTemplateActivated;
    vm.recvDelete = recvDelete;
    vm.cancelModal = cancelModal;
    vm.handleDirSyncService = handleDirSyncService;
    vm.onNext = onNext;
    vm.convertableUsers = false;
    vm.isAtlasF3745AutoAssignToggle = false;
    vm.autoAssignTemplates = {};

    Object.defineProperty(vm, 'dirSyncText', {
      get: function () {
        return vm.isDirSyncEnabled ? 'userManage.ad.turnOffDS' : 'userManage.org.turnOnDirSync';
      },
    });

    vm.initFeatureToggles = initFeatureToggles;
    vm.initConvertableUsers = initConvertableUsers;
    vm.isUserAdminUser = Authinfo.isUserAdminUser();

    var isOrgEnabledForAutoAssignTemplates = false;

    vm.onInit();

    //////////////////
    function onInit() {
      initConvertableUsers();
      initFeatureToggles()
        .then(function () {
          initDefaultAutoAssignTemplate();
          initOrgSettingForAutoAssignTemplates();
        });
    }

    function initFeatureToggles() {
      return $q.all({
        atlasF3745AutoAssignLicenses: FeatureToggleService.atlasF3745AutoAssignLicensesGetStatus(),
        multiDirSyncToggle: FeatureToggleService.atlasF6980MultiDirSyncManageUsersGetStatus(),
      }).then(function (toggles) {
        vm.isAtlasF3745AutoAssignToggle = toggles.atlasF3745AutoAssignLicenses;
        vm.multiDirSyncToggle = toggles.multiDirSyncToggle;
      });
    }

    function initConvertableUsers() {
      Orgservice.getUnlicensedUsers(function (data) {
        if (data.success && data.totalResults > 0) {
          vm.convertableUsers = true;
        }
      });
    }

    function initDefaultAutoAssignTemplate() {
      if (!vm.isAtlasF3745AutoAssignToggle) {
        return;
      }
      AutoAssignTemplateService.getDefaultTemplate()
        .then(function (defaultTemplate) {
          _.set(vm.autoAssignTemplates, DEFAULT_AUTO_ASSIGN_TEMPLATE, defaultTemplate);
        })
        .catch(function (response) {
          Notification.errorResponse(response);
        });
    }

    function initOrgSettingForAutoAssignTemplates() {
      if (!vm.isAtlasF3745AutoAssignToggle) {
        return;
      }
      isOrgEnabledForAutoAssignTemplates = false;
      AutoAssignTemplateService.isEnabledForOrg()
        .catch(_.noop)
        .then(function (isEnabled) {
          isOrgEnabledForAutoAssignTemplates = isEnabled;
        });
    }

    function hasDefaultAutoAssignTemplate() {
      return !!_.get(vm.autoAssignTemplates, DEFAULT_AUTO_ASSIGN_TEMPLATE);
    }

    function toggleActivateForDefaultAutoAssignTemplate(isActivated) {
      isOrgEnabledForAutoAssignTemplates = isActivated;
    }

    /* There are two levels of enablement for a template (i.e. what is known as "activation")
    1 - at the org-level
    2 - at the template-level (currently not implemented)
    Once 2 is implemented, logic will most likely change 12/21/17
    */
    function isDefaultAutoAssignTemplateActivated() {
      AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated = hasDefaultAutoAssignTemplate() && isOrgEnabledForAutoAssignTemplates;
      return AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated;
    }

    function recvDelete() {
      initDefaultAutoAssignTemplate();
    }

    function cancelModal() {
      $state.modal.dismiss();
      Analytics.trackAddUsers(Analytics.eventNames.CANCEL_MODAL);
    }

    function handleDirSyncService() {
      if (vm.isDirSyncEnabled) {
        $state.modal.closed.then(function () {
          $state.go('settings', {
            showSettings: 'dirsync',
          });
        });
        $state.modal.dismiss();
      } else {
        onNext(vm.ManageType.ADVANCED_NO_DS);
      }
    }

    function onNext(_manageType) {
      if (_manageType) {
        vm.manageType = _manageType;
      }

      UserManageService.gotoNextStateForManageType(vm.manageType);
    }
  }
})();
