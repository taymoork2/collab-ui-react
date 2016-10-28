import { CallFeatureNameComponent } from './callFeatureName.component';

export default angular
  .module('huron.call-feature-name', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('ucCallFeatureName', new CallFeatureNameComponent())
  .name;
