// TODO: convert to TS and register to './index.ts'
(function () {
  'use strict';

  module.exports = UserManageOrgController;

  /* @ngInject */
  function UserManageOrgController($q, $state, $window, Analytics, AutoAssignTemplateService, DirSyncService, FeatureToggleService, Notification, OnboardService, Orgservice, UserCsvService) {
    var DEFAULT_AUTO_ASSIGN_TEMPLATE = 'Default';
    var ENABLE_DIR_SYNC_URL = 'https://www.cisco.com/go/hybrid-services-directory';
    var vm = this;

    vm.ManageType = require('./userManage.keys').ManageType;

    vm.onInit = onInit;
    vm.manageType = 'manual';
    vm.maxUsersInCSV = UserCsvService.maxUsersInCSV;
    vm.maxUsersInManual = OnboardService.maxUsersInManual;
    vm.isDirSyncEnabled = DirSyncService.isDirSyncEnabled();
    vm.recvDelete = recvDelete;
    vm.cancelModal = cancelModal;
    vm.onNext = onNext;
    vm.handleDirSyncService = handleDirSyncService;
    vm.isAutoAssignTemplateEnabled = isAutoAssignTemplateEnabled;
    vm.convertableUsers = false;
    vm.isAtlasF3745AutoAssignToggle = false;
    vm.autoAssignTemplates = {};
    vm.dirSyncText = vm.isDirSyncEnabled ? 'globalSettings.dirsync.turnOffDirSync' : 'globalSettings.dirsync.turnOnDirSync';

    vm.initFeatureToggles = initFeatureToggles;
    vm.initConvertableUsers = initConvertableUsers;
    vm.initDefaultAutoAssignTemplate = initDefaultAutoAssignTemplate;

    var isAtlasEmailSuppressToggle = false;

    vm.onInit();

    //////////////////
    function onInit() {
      initConvertableUsers();
      initFeatureToggles()
        .then(function () {
          initDefaultAutoAssignTemplate();
        });
    }

    function initFeatureToggles() {
      return $q.all({
        atlasEmailSuppress: FeatureToggleService.atlasEmailSuppressGetStatus(),
        atlasF3745AutoAssignLicenses: FeatureToggleService.atlasF3745AutoAssignLicensesGetStatus(),
      }).then(function (toggles) {
        isAtlasEmailSuppressToggle = toggles.atlasEmailSuppress;
        vm.isAtlasF3745AutoAssignToggle = toggles.atlasF3745AutoAssignLicenses;
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
      AutoAssignTemplateService.getTemplates()
        .then(function (templates) {
          var foundTemplate = _.find(templates, { name: DEFAULT_AUTO_ASSIGN_TEMPLATE });
          _.set(vm.autoAssignTemplates, DEFAULT_AUTO_ASSIGN_TEMPLATE, foundTemplate);
        })
        .catch(function (response) {
          // 404's when fetching auto-assign templates will be fairly common
          if (response.status === 404) {
            _.set(vm.autoAssignTemplates, DEFAULT_AUTO_ASSIGN_TEMPLATE, undefined);
            return;
          }
          Notification.errorResponse(response);
        });
    }

    function getAutoAssignTemplate() {
      return _.get(vm.autoAssignTemplates, DEFAULT_AUTO_ASSIGN_TEMPLATE);
    }

    function isAutoAssignTemplateEnabled() {
      return !!getAutoAssignTemplate();
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
        // - because we're in a modal, chain the transition to 'settings' after dismissing the modal
        $state.modal.closed.then(function () {
          $state.go('settings', {
            showSettings: 'dirsync',
          });
        });
        $state.modal.dismiss();
      } else {
        $window.open(ENABLE_DIR_SYNC_URL, '_blank');
      }
    }

    function goToAutoAssignTemplate() {
      $state.go('users.manage.edit-auto-assign-template-modal', {
        prevState: 'users.manage.picker',
      });
    }

    function onNext(_manageType) {
      if (_manageType) {
        vm.manageType = _manageType;
      }

      if (isAtlasEmailSuppressToggle) {
        if (vm.manageType === vm.ManageType.AUTO_ASSIGN_TEMPLATE) {
          goToAutoAssignTemplate();
        } else {
          $state.go('users.manage.emailSuppress', {
            manageType: vm.manageType,
            prevState: 'users.manage.org',
          });
        }
      } else {
        switch (vm.manageType) {
          case vm.ManageType.MANUAL:
            Analytics.trackAddUsers(Analytics.eventNames.NEXT, Analytics.sections.ADD_USERS.uploadMethods.MANUAL);
            $state.go('users.add');
            break;

          case vm.ManageType.BULK:
            Analytics.trackAddUsers(Analytics.sections.ADD_USERS.eventNames.CSV_UPLOAD, Analytics.sections.ADD_USERS.uploadMethods.CSV);
            $state.go('users.csv');
            break;

          case vm.ManageType.ADVANCED_NO_DS:
            Analytics.trackAddUsers(Analytics.sections.ADD_USERS.eventNames.INSTALL_CONNECTOR, Analytics.sections.ADD_USERS.uploadMethods.SYNC);
            $state.go('users.manage.advanced.add.ob.installConnector');
            break;

          case vm.ManageType.CONVERT:
            $state.go('users.convert', {
              manageUsers: true,
            });
            break;

          case vm.ManageType.AUTO_ASSIGN_TEMPLATE:
            goToAutoAssignTemplate();
            break;
        }
      }
    }
  }
})();
