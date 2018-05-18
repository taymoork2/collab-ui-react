import { TOSService } from './termsOfService.service';
import coreAuthUserModule from 'modules/core/auth/user';
import modalModuleName from 'modules/core/modal';

export default angular
  .module('core.auth.tos', [
    require('angular-translate'),
    require('modules/core/auth/auth'),
    coreAuthUserModule,
    modalModuleName,
  ])
  .service('TOSService', TOSService)
  .name;
