(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('HDSSettingsController', HDSSettingsController);

  /* @ngInject */
  function HDSSettingsController($modal, $log) {
    var vm = this;
    vm.TRIAL = 'trial';    // service status trial/production mode
    vm.PRODUCTION = 'production';
    vm.openAddTrialUsersModal = openAddTrialUsersModal;
    vm.openEditTrialUsersModal = openEditTrialUsersModal;

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
        type: 'small'
      });
    }

    function openEditTrialUsersModal() {
      $modal.open({
        controller: 'EditTrialUsersController',
        controllerAs: 'editTrialUsersCtrl',
        templateUrl: 'modules/hds/settings/edittrialusers_modal/edit-trial-users.html',
        type: 'small'
      });
    }

    $log.info('Started dialog');
  }
}());
