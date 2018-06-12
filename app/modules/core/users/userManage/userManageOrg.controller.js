// TODO: convert to TS and register to './index.ts'
(function () {
  'use strict';

  module.exports = UserManageOrgController;

  /* @ngInject */
  function UserManageOrgController($q, $state, Analytics, Authinfo, AutoAssignTemplateModel, AutoAssignTemplateService, DirSyncService, Notification, OnboardService, Orgservice, UserCsvService, UserManageService) {
    var DEFAULT_AUTO_ASSIGN_TEMPLATE = AutoAssignTemplateService.DEFAULT;
    var SUCCESS = 'success';
    var vm = this;

    vm.ManageType = require('./shared/user-manage.keys').ManageType;

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
    vm.autoAssignTemplates = {};
    vm.showUserTaskManagerModal = showUserTaskManagerModal;

    Object.defineProperties(vm, {
      dirSyncText: {
        get: function () {
          return vm.isDirSyncEnabled ? 'userManage.ad.turnOffDS' : 'userManage.org.turnOnDirSync';
        },
      },
      dirSyncStatus: {
        get: function () {
          return vm.isDirSyncEnabled ? SUCCESS : undefined;
        },
      },
      defaultAutoAssignTemplateActivatedStatus: {
        get: function () {
          return isDefaultAutoAssignTemplateActivated() ? SUCCESS : undefined;
        },
      },
      manualLabelText: {
        get: function () {
          return isDefaultAutoAssignTemplateActivated() ? 'userManage.org.manualLabelTemplateEnabled' : 'userManage.org.manualLabelNew';
        },
      },
      manualDetailsText: {
        get: function () {
          return isDefaultAutoAssignTemplateActivated() ? 'userManage.org.manualDetailsTemplateEnabled' : 'userManage.org.manualDetailsNew';
        },
      },
    });

    vm.initConvertableUsers = initConvertableUsers;
    vm.isUserAdminUser = Authinfo.isUserAdminUser();

    var isOrgEnabledForAutoAssignTemplates = false;

    vm.onInit();

    //////////////////
    function onInit() {
      initAutoAssignModel();
      initConvertableUsers();
      initDefaultAutoAssignTemplate();
      initOrgSettingForAutoAssignTemplates();
    }

    function initAutoAssignModel() {
      // TODO needed when delete auto assign template too
      AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated = false;
    }

    function initConvertableUsers() {
      Orgservice.getUnlicensedUsers(function (data) {
        if (data.success && data.totalResults > 0) {
          vm.convertableUsers = true;
        }
      });
    }

    function initDefaultAutoAssignTemplate() {
      AutoAssignTemplateService.getDefaultTemplate()
        .then(function (defaultTemplate) {
          _.set(vm.autoAssignTemplates, DEFAULT_AUTO_ASSIGN_TEMPLATE, defaultTemplate);
        })
        .catch(function (response) {
          Notification.errorResponse(response);
        });
    }

    function initOrgSettingForAutoAssignTemplates() {
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

    function showUserTaskManagerModal() {
      $state.go('users.csv.task-manager');
    }
  }
})();
