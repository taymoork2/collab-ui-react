import { CallFeatureNameComponent } from './call-feature-name.component';

export default angular
  .module('call.features.shared.name', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucCallFeatureName', new CallFeatureNameComponent())
  .name;
