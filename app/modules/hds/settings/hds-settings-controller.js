(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('HDSSettingsController', HDSSettingsController);

  /* @ngInject */
  function HDSSettingsController($modal, $log, $translate) {
    var vm = this;
    vm.emailSubscribers = '';
    vm.localizedAddEmailWatermark = $translate.instant('hds.settings.emailNotificationsWatermark');
    vm.TRIAL = 'trial';    // service status trial/production mode
    vm.PRODUCTION = 'production';
    vm.openAddTrialUsersModal = openAddTrialUsersModal;
    vm.openEditTrialUsersModal = openEditTrialUsersModal;

    vm.general = {
      title: 'common.general'
    };
    vm.servicestatus = {
      title: 'hds.settings.servicestatus_title'
    };

    var DEFAULT_SERVICE_MODE = vm.TRIAL;

    vm.model = {
      serviceMode: DEFAULT_SERVICE_MODE,
    };

    function openAddTrialUsersModal() {
      $modal.open({
        controller: 'AddTrialUsersController',
        controllerAs: 'addTrialUsersCtrl',
        templateUrl: 'modules/hds/settings/addtrialusers_modal/add-trial-users.html',
        type: 'small',
        resolve: {
          servicesId: function () {
            return vm.servicesId;
          },
          userStatusSummary: function () {
            return vm.userStatusSummary;
          }
        }
      });
    }

    function openEditTrialUsersModal() {
      $modal.open({
        controller: 'EditTrialUsersController',
        controllerAs: 'editTrialUsersCtrl',
        templateUrl: 'modules/hds/settings/edittrialusers_modal/edit-trial-users.html',
        type: 'small',
        resolve: {
          servicesId: function () {
            return vm.servicesId;
          },
          userStatusSummary: function () {
            return vm.userStatusSummary;
          }
        }
      });
    }

    $log.info('Started dialog');
  }
}());
