import { resolveLazyLoad } from './states.helper';

export default function configureStates($stateProvider: ng.ui.IStateProvider) {
  $stateProvider
    .state('integrations-management', {
      template: '<div ui-view></div>',
      parent: 'main',
      abstract: true,
      resolve: {
        supportsFeature: /* @ngInject */ function (FeatureToggleService) {
          return FeatureToggleService.stateSupportsFeature(FeatureToggleService.features.atlasIntegrationsManagement);
        },
        lazy: resolveLazyLoad(function (done) {
          require.ensure([], function () {
            done(require('modules/integrations-management'));
          }, undefined, 'integrations');
        }),
      },
    })
    .state('integrations-management.list', {
      template: '<integrations-management-list></integrations-management-list>',
      url: '/integrations',
    });
}
