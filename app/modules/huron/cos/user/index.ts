import { UserClassOfServiceComponent } from './userCos.component';
import { UserCosService } from './userCos.service';

export default angular
  .module('huron.user-class-of-service', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    'ngResource',
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/cmiServices'),
  ])
  .component('ucUserCosForm', new UserClassOfServiceComponent())
  .service('UserCosService', UserCosService)
  .name;
