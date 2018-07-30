import { PolicyAction } from 'modules/integrations-management/integrations-management.types';
import { resolveLazyLoad, stateParamsToResolveParams, translateDisplayName } from './states.helper';

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
          template: '<integrations-management-overview integration="$resolve.integration" global-policy-action="$resolve.globalPolicyAction"><integrations-management-overview>',
        },
      },
      params: {
        globalPolicyAction: PolicyAction.DENY,
        integration: undefined,
      },
      resolve: _.assignIn(
        stateParamsToResolveParams({
          globalPolicyAction: PolicyAction.DENY,
          integration: undefined,
        }),
        {
          displayName: translateDisplayName('sidePanelBreadcrumb.overview'),
        },
      ),
    })
    .state('integrations-management.overview.detail', {
      views: {
        'side-panel-container': {
          template: '<integrations-management-detail integration="$resolve.integration"><integrations-management-detail>',
        },
      },
      resolve: {
        displayName: translateDisplayName('integrations.overview.details'),
      },
    });
}
