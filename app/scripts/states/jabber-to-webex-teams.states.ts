export default function configureStates($stateProvider: ng.ui.IStateProvider) {
  $stateProvider
    // all children require enabled feature-toggle: 'spark-14176-jabber-to-webex-teams'
    .state('jabber-to-webex-teams', {
      abstract: true,
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
          template: '<multi-step-modal dismiss="$dismiss()">TODO (mipark2): implement prerequisites confirmation modal</multi-step-modal>',
        },
      },
    });
}
