import { CallFeatureNameComponent } from './callFeatureName.component';

export default angular
  .module('huron.call-feature-name', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucCallFeatureName', new CallFeatureNameComponent())
  .name;
