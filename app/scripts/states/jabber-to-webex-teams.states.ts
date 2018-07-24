import { resolveLazyLoad, stateParamsToResolveParams } from './states.helper';

export default function configureStates($stateProvider: ng.ui.IStateProvider) {
  $stateProvider
    // all children require enabled feature-toggle: 'spark-14176-jabber-to-webex-teams'
    .state('jabber-to-webex-teams', {
      abstract: true,
      parent: 'main',
      resolve: {
        supportsFeature: /* @ngInject */ function (FeatureToggleService) {
          return FeatureToggleService.stateSupportsFeature(FeatureToggleService.features.spark14176JabberToWebexTeams);
        },
      },
    })
    // all children will target view 'modal@'
    .state('jabber-to-webex-teams.modal', {
      template: '<div ui-view></div>',
      abstract: true,
      parent: 'modal',
    })
    .state('jabber-to-webex-teams.modal.confirm-prerequisites', {
      views: {
        'modal@': {
          template: '<jabber-to-webex-teams-prerequisites-modal dismiss="$dismiss()"></jabber-to-webex-teams-prerequisites-modal>',
        },
      },
    })
    .state('jabber-to-webex-teams.modal.add-profile', {
      views: {
        'modal@': {
          template: '<jabber-to-webex-teams-add-profile-modal dismiss="$dismiss()"></jabber-to-webex-teams-add-profile-modal>',
        },
      },
    })
    .state('jabber-to-webex-teams.modal.edit-profile', {
      views: {
        'modal@': {
          template: '<jabber-to-webex-teams-add-profile-modal profile="$resolve.profile" dismiss="$dismiss()"></jabber-to-webex-teams-add-profile-modal>',
        },
      },
      params: {
        profile: undefined,
      },
      resolve: _.assignIn(
        stateParamsToResolveParams({
          profile: undefined,
        })),
    })
    .state('jabber-to-webex-teams.profiles', {
      parent: 'main',
      url: '/services/jabber-profiles',
      template: '<jabber-to-webex-teams-profiles></jabber-to-webex-teams-profiles>',
      resolve: {
        lazy: resolveLazyLoad(function (done) {
          require.ensure([], function () {
            done(require('modules/services-overview/new-hybrid/jabber-to-webex-teams/jabber-to-webex-teams-profiles'));
          }, undefined, 'services-overview.new-hybrid.jabber-to-webex-teams.jabber-to-webex-teams-profiles');
        }),
      },
    });
}
