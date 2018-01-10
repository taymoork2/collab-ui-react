import { UserClassOfServiceComponent } from './userCos.component';
import { UserCosService } from './userCos.service';
import FeatureToggleService from 'modules/core/featureToggle';

export default angular
  .module('huron.user-class-of-service', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    'ngResource',
    FeatureToggleService,
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/cmiServices'),
  ])
  .component('ucUserCosForm', new UserClassOfServiceComponent())
  .service('UserCosService', UserCosService)
  .name;
