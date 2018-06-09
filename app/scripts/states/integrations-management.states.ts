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
    })
    .state('integrations-management.overview', {
      parent: 'sidepanel',
      views: {
        'sidepanel@': {
          template: 'overview placeholder',
        },
      },
    })
    .state('integrations-management.overview.detail', {
      views: {
        'sidepanel@': {
          template: 'detail placeholder',
        },
      },
    });
}
