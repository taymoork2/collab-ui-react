import { TelephonyDomainsComponent } from './telephonyDomains.component';
import { TelephonyDomainService } from './telephonyDomain.service';

export default angular
  .module('Gemini')
  .component('gmTelephonyDomains', new TelephonyDomainsComponent())
  .service('TelephonyDomainService', TelephonyDomainService)
  .name;
