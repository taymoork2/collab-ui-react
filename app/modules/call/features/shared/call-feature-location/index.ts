import './call-feature-location.component.scss';
import { CallFeatureLocationComponent } from './call-feature-location.component';
import featureToggleServiceModule from 'modules/core/featureToggle';

export default angular
  .module('call.features.shared.location', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    featureToggleServiceModule,
  ])
  .component('ucCallFeatureLocation', new CallFeatureLocationComponent())
  .name;
