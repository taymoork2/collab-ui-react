import './settings-cos.component.scss';

import { ClassOfServiceComponent } from './settings-cos.component';
import FeatureToggleService from 'modules/core/featureToggle';

export default angular
  .module('call.settings.class-of-service', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    FeatureToggleService,
    require('modules/core/scripts/services/authinfo'),
  ])
  .component('ucCosForm', new ClassOfServiceComponent())
  .name;
