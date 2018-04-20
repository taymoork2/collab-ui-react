import './call-feature-name.component.scss';
import { CallFeatureNameComponent } from './call-feature-name.component';

export default angular
  .module('call.features.shared.name', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucCallFeatureName', new CallFeatureNameComponent())
  .name;
