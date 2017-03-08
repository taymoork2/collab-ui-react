import { TelephonyDomainsComponent } from './telephonyDomains.component';
import { TelephonyDomainService } from './telephonyDomain.service';
import { GmTdDetailsComponent } from './details/gmTdDetails.component';
import { GmTdSitesComponent } from './details/gmTdSites.component';

export default angular
  .module('Gemini')
  .component('gmTdSites', new GmTdSitesComponent())
  .component('gmTdDetails', new GmTdDetailsComponent())
  .component('gmTelephonyDomains', new TelephonyDomainsComponent())
  .service('TelephonyDomainService', TelephonyDomainService)
  .name;
