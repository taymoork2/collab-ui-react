(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .controller('AddResourceMainController', AddResourceMainController);
  /* @ngInject */
  function AddResourceMainController($modal, hasMfFeatureToggle, hasMfSIPFeatureToggle, hasMfCascadeBwConfigToggle, hasMfClusterWizardFeatureToggle) {
    WizardSelector();

    function WizardSelector() {
      if (hasMfClusterWizardFeatureToggle) {
        $modal.open({
          type: 'modal',
          controller: 'clusterCreationWizardController',
          controllerAs: 'clusterCreationWizard',
          template: require('modules/mediafusion/media-service-v2/add-resource-wizard/cluster-creation-wizard.tpl.html'),
          modalClass: 'redirect-add-resource',
          resolve: {
            wizard: null,
            firstTimeSetup: false,
            yesProceed: false,
            fromClusters: true,
            hasMfFeatureToggle: hasMfFeatureToggle,
            hasMfSIPFeatureToggle: hasMfSIPFeatureToggle,
            hasMfCascadeBwConfigToggle: hasMfCascadeBwConfigToggle,
          },
        });
      } else {
        $modal.open({
          type: 'small',
          controller: 'AddResourceControllerClusterViewV2',
          controllerAs: 'redirectResource',
          template: require('modules/mediafusion/media-service-v2/add-resources/add-resource-dialog.html'),
          modalClass: 'redirect-add-resource',
          /*resolve: {
            wizard: null,
            firstTimeSetup: false,
            yesProceed: false,
            fromClusters: true,
          },*/
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
