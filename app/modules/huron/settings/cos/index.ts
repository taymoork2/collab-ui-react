import { ClassOfServiceComponent } from './cos.component';
import FeatureToggleService from 'modules/core/featureToggle';

export default angular
  .module('huron.class-of-service', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    FeatureToggleService,
    require('modules/core/scripts/services/authinfo'),
  ])
  .component('ucCosForm', new ClassOfServiceComponent())
  .name;
