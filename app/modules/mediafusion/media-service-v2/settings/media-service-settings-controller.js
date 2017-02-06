(function () {
  'use strict';

  /* @ngInject */
  function MediaServiceSettingsControllerV2($stateParams) {
    var vm = this;
    vm.config = "";
    vm.wx2users = "";
    vm.serviceType = "mf_mgmt";
    vm.serviceId = "squared-fusion-media";
    vm.cluster = $stateParams.cluster;

    vm.emailSection = {
      title: 'common.general'
    };

    vm.sipRegistration = {
      title: 'mediaFusion.sipconfiguration.title'
    };

    vm.deactivateModalOptions = {
      templateUrl: 'modules/mediafusion/media-service-v2/settings/confirm-disable-dialog.html',
      controller: 'DisableMediaServiceController',
      controllerAs: 'disableServiceDialog',
      type: 'small',
    };
  }

  angular
    .module('Mediafusion')
    .controller('MediaServiceSettingsControllerV2', MediaServiceSettingsControllerV2);
}());
