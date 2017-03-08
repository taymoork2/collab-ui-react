(function () {
  'use strict';

  /* @ngInject */
  function MediaServiceSettingsControllerV2($stateParams, Analytics) {
    var vm = this;
    vm.config = "";
    vm.wx2users = "";
    vm.serviceType = "mf_mgmt";
    vm.serviceId = "squared-fusion-media";
    vm.cluster = $stateParams.cluster;
    vm.emailSection = {
      title: 'common.general',
    };
    vm.deactivateModalOptions = {
      templateUrl: 'modules/mediafusion/media-service-v2/settings/confirm-disable-dialog.html',
      controller: 'DisableMediaServiceController',
      controllerAs: 'disableServiceDialog',
      type: 'small',
    };

    Analytics.trackHSNavigation(Analytics.sections.HS_NAVIGATION.eventNames.VISIT_MEDIA_SETTINGS);
  }

  angular
    .module('Mediafusion')
    .controller('MediaServiceSettingsControllerV2', MediaServiceSettingsControllerV2);
}());
