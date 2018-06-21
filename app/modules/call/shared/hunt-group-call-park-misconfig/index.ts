import { HuntGroupCallParkMisconfigService } from 'modules/call/shared/hunt-group-call-park-misconfig/hunt-group-call-park-misconfig.service';

export { HuntGroupCallParkMisconfigService };
export * from './hunt-group-call-park';

export default angular
  .module('call.shared.hunt-group-call-park-misconfig', [
    require('angular-resource'),
  ])
  .service('HuntGroupCallParkMisconfigService', HuntGroupCallParkMisconfigService)
  .name;
