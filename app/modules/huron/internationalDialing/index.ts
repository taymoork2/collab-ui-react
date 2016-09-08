import { InternationalDialingComponnent } from './internationalDialing.component';
import { InternationalDialingService } from './internationalDialing.service'

export * from './internationalDialing.service';

export default angular
  .module('huron.international-dialing', [
    'atlas.templates',
    'cisco.ui',
    'pascalprecht.translate',
  ])
  .component('internationalDialingComp', new InternationalDialingComponnent())
  .service('InternationalDialingService', InternationalDialingService)
  .name;
