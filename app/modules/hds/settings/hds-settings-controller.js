(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('HDSSettingsController', HDSSettingsController);

  /* @ngInject */
  function HDSSettingsController($modal, $state) {
    var vm = this;
    vm.PRE_TRIAL = 'pre_trial';    // service status Trial/Production mode
    vm.TRIAL = 'trial';
    vm.PRODUCTION = 'production';
    // TODO: get the trial/prod domains, # of trial users, # of resource nodes from server when APIs ready
    vm.trialDomain = 'trial.kms.xxx';     // Trial Domain
    vm.prodDomain = 'Spark Default KMS';  // Production Domain
    vm.numResourceNodes = 1;              // # of resource nodes
    vm.numTrialUsers = 10;                 // # of trial users
    vm.startTrial = startTrial;
    vm.moveToProduction = moveToProduction;
    vm.addResource = addResource;
    vm.openAddTrialUsersModal = openAddTrialUsersModal;
    vm.openEditTrialUsersModal = openEditTrialUsersModal;

    vm.servicestatus = {
      title: 'hds.resources.settings.servicestatusTitle'
    };

    var DEFAULT_SERVICE_MODE = vm.PRE_TRIAL;

    vm.model = {
      serviceMode: DEFAULT_SERVICE_MODE,
    };

    function startTrial() {
      vm.model.serviceMode = vm.TRIAL;
    }

    function moveToProduction() {
      vm.model.serviceMode = vm.PRODUCTION;
    }

    function addResource() {
      $state.go('hds.list');
    }

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
  }
}());
