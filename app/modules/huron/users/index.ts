import { HuronUserService } from './user.service';
import { UserDetailsComponent } from './userDetails.component';
import locationsServiceModule from 'modules/call/locations/shared';

export * from './user';
export { HuronUserService };

export default angular
  .module('huron.user', [
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
    locationsServiceModule,
  ])
  .service('HuronUserService', HuronUserService)
  .component('ucUserDetails', new UserDetailsComponent())
  .name;
