import { CallDestinationTranslateService } from 'modules/call/shared/call-destination-translate/call-destination-translate.service';

export { CallDestinationTranslateService };
export * from './call-destination-translate-object';

export default angular
  .module('call.shared.call-destination-translate', [])
  .service('CallDestinationTranslateService', CallDestinationTranslateService)
  .name;
