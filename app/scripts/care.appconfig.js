/**
 *
 *  Contains the set of state definitions for Spark Care, which includes Virtual Assistant.
 *  This is included and used by appconfig.js, and it is extracted here to decrease its [appconfig.js] complexity and size.
 *
 *  @author lapage@cisco.com and gneves@cisco.com
 *
 */
(function () {
  'use strict';

  function configureStateProvider(stateProvider) {
    stateProvider
      .state('care', {
        parent: 'main',
        abstract: true,
      })
      .state('care.DetailsBase', {
        parent: 'main',
        abstract: true,
        templateUrl: 'modules/sunlight/details/details.tpl.html',
      })
      .state('care.Details', {
        url: '/services/careDetails',
        parent: 'care.DetailsBase',
        views: {
          header: {
            templateUrl: 'modules/sunlight/details/detailsHeader.tpl.html',
            controller: 'DetailsHeaderCtrl',
            controllerAs: 'header',
          },
          main: {
            template: '<div ui-view></div>',
          },
        },
      })
      .state('care.Settings', {
        url: '/settings',
        parent: 'care.Details',
        templateUrl: 'modules/sunlight/settings/careSettings.tpl.html',
        controller: 'CareLocalSettingsCtrl',
        controllerAs: 'localCareSettings',
      })
      .state('care.Features', {
        url: '/features',
        parent: 'care.Details',
        templateUrl: 'modules/sunlight/features/featureLanding/careFeatures.tpl.html',
        controller: 'CareFeaturesCtrl',
        controllerAs: 'careFeaturesCtrl',
        resolve: {
          collectFeatureToggles: /* @ngInject */ function (FeatureToggleService, $state) {
            return FeatureToggleService.supports(FeatureToggleService.features.atlasVirtualAssistantEnable)
              .then(function (isEnabled) {
                $state.isVirtualAssistantEnabled = isEnabled;
              });
          },
        },
      })
      .state('care.setupAssistant', {
        url: '/setupAssistant/:type',
        parent: 'care.Details',
        templateUrl: 'modules/sunlight/features/template/ctSetupAssistant.tpl.html',
        controller: 'CareSetupAssistantCtrl',
        controllerAs: 'careSetupAssistant',
        params: {
          template: null,
          isEditFeature: null,
        },
        resolve: {
          isCareProactiveChatTrialsEnabled: /* @ngInject */ function (FeatureToggleService, $state) {
            return FeatureToggleService.supports(FeatureToggleService.features.atlasCareProactiveChatTrials)
              .then(function (isEnabled) {
                $state.isCareProactiveChatTrialsEnabled = isEnabled;
              });
          },
          isCareAssistantEnabled: /* @ngInject */ function (FeatureToggleService, $state) {
            return FeatureToggleService.supports(FeatureToggleService.features.atlasVirtualAssistantEnable)
              .then(function (isEnabled) {
                $state.isCareAssistantEnabled = isEnabled;
              });
          },
        },
      })
      .state('care.assistant', {
        url: '/virtualAssistant',
        parent: 'care.Details',
        templateUrl: 'modules/sunlight/features/template/vaSetupAssistant.tpl.html',
        controller: 'CareSetupVirtualAssistantCtrl',
        controllerAs: 'vaSetupAssistant',
        params: {
          isEditFeature: null,
          template: null,
        },
      })
      .state('care.Features.DeleteFeature', {
        parent: 'modalDialog',
        views: {
          'modal@': {
            controller: 'CareFeaturesDeleteCtrl',
            controllerAs: 'careFeaturesDeleteCtrl',
            templateUrl: 'modules/sunlight/features/featureLanding/careFeaturesDeleteModal.tpl.html',
          },
        },
        params: {
          deleteFeatureName: null,
          deleteFeatureId: null,
          deleteFeatureType: null,
        },
      });
  }

  module.exports.configureStateProvider = configureStateProvider;
})();
