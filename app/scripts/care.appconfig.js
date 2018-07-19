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
        template: require('modules/sunlight/details/details.tpl.html'),
      })
      .state('care.Details', {
        url: '/services/careDetails',
        parent: 'care.DetailsBase',
        views: {
          header: {
            template: '<details-header-component></details-header-component>',
          },
          main: {
            template: '<div ui-view></div>',
          },
        },
      })
      .state('care.numbers', {
        url: '/numbers',
        parent: 'care.Details',
        template: '<care-numbers-component></care-numbers-component>',
      })
      .state('care.Settings', {
        url: '/settings',
        parent: 'care.Details',
        template: require('modules/sunlight/settings/careSettings.tpl.html'),
        controller: 'CareLocalSettingsCtrl',
        controllerAs: 'localCareSettings',
      })
      .state('care.Features', {
        url: '/features',
        parent: 'care.Details',
        template: require('modules/sunlight/features/featureLanding/careFeatures.tpl.html'),
        controller: 'CareFeaturesCtrl',
        controllerAs: 'careFeaturesCtrl',
        resolve: {
          collectFeatureToggles: /* @ngInject */ function (FeatureToggleService, $state) {
            return FeatureToggleService.supports(FeatureToggleService.features.atlasVirtualAssistantEnable)
              .then(function (isEnabled) {
                $state.isVirtualAssistantEnabled = isEnabled;
              });
          },
          isHybridToggleEnabled: /* @ngInject */ function (FeatureToggleService, $state) {
            return FeatureToggleService.supports(FeatureToggleService.features.atlasHybridEnable)
              .then(function (isEnabled) {
                $state.isHybridToggleEnabled = isEnabled;
              });
          },
          isExpertCareAssistantEnabled: /* @ngInject */ function (FeatureToggleService, $state) {
            return FeatureToggleService.supports(FeatureToggleService.features.atlasExpertVirtualAssistantEnable)
              .then(function (isEnabled) {
                $state.isExpertVirtualAssistantEnabled = isEnabled;
              });
          },
          isHybridAndEPTConfigured: /* @ngInject */ function (AutoAttendantHybridCareService, $state) {
            return AutoAttendantHybridCareService.isHybridAndEPTConfigured()
              .then(function (isEnabled) {
                $state.isHybridAndEPTConfigured = isEnabled;
              });
          },
          isSparkCallConfigured: /* @ngInject */ function (AutoAttendantHybridCareService, $state) {
            $state.isSparkCallConfigured = AutoAttendantHybridCareService.isSparkCallConfigured();
          },
          isAppleBusinessChatEnabled: /* @ngInject */ function (FeatureToggleService, $state) {
            return FeatureToggleService.supports(FeatureToggleService.features.careApplebuschatBasicEnable)
              .then(function (isEnabled) {
                $state.isAppleBusinessChatEnabled = isEnabled;
              });
          },
          isAppleBusinessChatOnSiteFileStorageEnable: /* @ngInject */ function (FeatureToggleService, $state) {
            return FeatureToggleService.supports(FeatureToggleService.features.careApplebuschatOnSiteFileStorageEnable)
              .then(function (isEnabled) {
                $state.isAppleBusinessChatOnSiteFileStorageEnable = isEnabled;
              });
          },
          isCVASelfServiceEnabled: /* @ngInject */ function (FeatureToggleService, $state) {
            return FeatureToggleService.supports(FeatureToggleService.features.careCVASelfServiceEnable)
              .then(function (isEnabled) {
                $state.isCVASelfServiceEnabled = isEnabled;
              });
          },
        },
      })
      .state('care.setupAssistant', {
        url: '/setupAssistant/:type',
        parent: 'care.Details',
        template: require('modules/sunlight/features/customerSupportTemplate/wizardPages/ctSetupAssistant.tpl.html'),
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
          isEvaFlagEnabled: /* @ngInject */ function (FeatureToggleService, $state) {
            return FeatureToggleService.supports(FeatureToggleService.features.atlasExpertVirtualAssistantEnable)
              .then(function (isEnabled) {
                $state.isEvaFlagEnabled = isEnabled;
              });
          },
        },
      })
      .state('care.setupAssistant_new', {
        url: '/setupAssistant_new/:type',
        parent: 'care.Details',
        template: '<ct-setup-assistant-component dismiss="$dismiss()" is-edit-feature="$resolve.isEditFeature" template="$resolve.template"></ct-setup-assistant-component>',
        params: {
          template: null,
          isEditFeature: null,
        },
        resolve: {
          isEditFeature: /* @ngInject */ function ($stateParams) {
            return $stateParams.isEditFeature;
          },
          template: /* @ngIngect */ function ($stateParams) {
            return $stateParams.template;
          },
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
          isEvaFlagEnabled: /* @ngInject */ function (FeatureToggleService, $state) {
            return FeatureToggleService.supports(FeatureToggleService.features.atlasExpertVirtualAssistantEnable)
              .then(function (isEnabled) {
                $state.isEvaFlagEnabled = isEnabled;
              });
          },
        },
      })
      .state('care.customerVirtualAssistant', {
        url: '/customerVirtualAssistant',
        parent: 'care.Details',
        template: '<cva-setup dismiss="$dismiss()" is-edit-feature="$resolve.isEditFeature" template="$resolve.template"></cva-setup>',
        params: {
          isEditFeature: null,
          template: null,
        },
        resolve: {
          isEditFeature: /* @ngInject */ function ($stateParams) {
            return $stateParams.isEditFeature;
          },
          template: /* @ngIngect */ function ($stateParams) {
            return $stateParams.template;
          },
        },
      })
      .state('care.expertVirtualAssistant', {
        url: '/expertVirtualAssistant',
        parent: 'care.Details',
        template: '<eva-setup dismiss="$dismiss()" is-edit-feature="$resolve.isEditFeature" template="$resolve.template"></eva-setup>',
        params: {
          isEditFeature: null,
          template: null,
        },
        resolve: {
          isEditFeature: /* @ngInject */ function ($stateParams) {
            return $stateParams.isEditFeature;
          },
          template: /* @ngIngect */ function ($stateParams) {
            return $stateParams.template;
          },
        },
      })
      .state('care.appleBusinessChat', {
        url: '/abcService?businessId',
        parent: 'care.Details',
        template: '<abc-setup dismiss="$dismiss()"  is-edit-feature="$resolve.isEditFeature" template="$resolve.template" business-id="$resolve.businessId"></abc-setup>',
        params: {
          isEditFeature: null,
          template: null,
        },
        resolve: {
          isEditFeature: /* @ngInject */ function ($stateParams) {
            return $stateParams.isEditFeature;
          },
          template: /* @ngIngect */ function ($stateParams) {
            return $stateParams.template;
          },
          businessId: /* @ngIngect */ function ($stateParams) {
            return $stateParams.businessId;
          },
        },
      })
      .state('care.Features.DeleteFeature', {
        parent: 'modalDialog',
        views: {
          'modal@': {
            controller: 'CareFeaturesDeleteCtrl',
            controllerAs: 'careFeaturesDeleteCtrl',
            template: require('modules/sunlight/features/featureLanding/careFeaturesDeleteModal.tpl.html'),
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
