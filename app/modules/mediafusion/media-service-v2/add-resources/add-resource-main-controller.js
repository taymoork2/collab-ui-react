(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .controller('AddResourceMainController', AddResourceMainController);
  /* @ngInject */
  function AddResourceMainController($modal, hasMfCascadeBwConfigToggle, hasMfClusterWizardFeatureToggle, hasMfFirstTimeCallingFeatureToggle, hasMfFeatureToggle, hasMfSIPFeatureToggle) {
    WizardSelector();

    function WizardSelector() {
      if (hasMfClusterWizardFeatureToggle) {
        $modal.open({
          type: 'modal',
          controller: 'ClusterCreationWizardController',
          controllerAs: 'clusterCreationWizard',
          template: require('modules/mediafusion/media-service-v2/add-resource-wizard/cluster-creation-wizard.tpl.html'),
          modalClass: 'redirect-add-resource',
          resolve: {
            wizard: null,
            firstTimeSetup: false,
            yesProceed: false,
            hasMfFeatureToggle: hasMfFeatureToggle,
            hasMfSIPFeatureToggle: hasMfSIPFeatureToggle,
            hasMfCascadeBwConfigToggle: hasMfCascadeBwConfigToggle,
            hasMfClusterWizardFeatureToggle: hasMfClusterWizardFeatureToggle,
            hasMfFirstTimeCallingFeatureToggle: hasMfFirstTimeCallingFeatureToggle,
          },
        });
      } else {
        $modal.open({
          type: 'small',
          controller: 'AddResourceControllerClusterViewV2',
          controllerAs: 'redirectResource',
          template: require('modules/mediafusion/media-service-v2/add-resources/add-resource-dialog.html'),
          modalClass: 'redirect-add-resource',
          params: {
            wizard: null,
            firstTimeSetup: false,
            yesProceed: false,
            fromClusters: true,
          },
        });
      }
    }
  }
}());
