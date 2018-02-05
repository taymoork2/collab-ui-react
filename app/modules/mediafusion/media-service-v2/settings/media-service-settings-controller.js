(function () {
  'use strict';

  /* @ngInject */
  function MediaServiceSettingsControllerV2($stateParams, Analytics) {
    var vm = this;
    vm.config = '';
    vm.serviceType = 'mf_mgmt';
    vm.serviceId = 'squared-fusion-media';
    vm.cluster = $stateParams.cluster;

    vm.deactivateModalOptions = {
      template: require('modules/mediafusion/media-service-v2/settings/confirm-disable-dialog.html'),
      controller: 'DisableMediaServiceController',
      controllerAs: 'disableServiceDialog',
      type: 'small',
    };

    Analytics.trackHybridServiceEvent(Analytics.sections.HS_NAVIGATION.eventNames.VISIT_MEDIA_SETTINGS);
  }

  angular
    .module('Mediafusion')
    .controller('MediaServiceSettingsControllerV2', MediaServiceSettingsControllerV2);
}());
