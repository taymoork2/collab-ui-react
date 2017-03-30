import { CallFeatureNameComponent } from './callFeatureName.component';

export default angular
  .module('huron.call-feature-name', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'pascalprecht.translate',
  ])
  .component('ucCallFeatureName', new CallFeatureNameComponent())
  .name;
