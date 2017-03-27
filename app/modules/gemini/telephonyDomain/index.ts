import { TelephonyDomainsComponent } from './telephonyDomains.component';
import { TelephonyDomainService } from './telephonyDomain.service';
import { GmTdDetailsComponent } from './details/gmTdDetails.component';
import { GmTdSitesComponent } from './details/gmTdSites.component';
import { GmTdNotesComponent } from './details/gmTdNotes.component';
import { GmHttpService } from '../common/gem.http.service';

export default angular
  .module('Gemini')
  .component('gmTdSites', new GmTdSitesComponent())
  .component('gmTdDetails', new GmTdDetailsComponent())
  .component('gmTelephonyDomains', new TelephonyDomainsComponent())
  .component('gmTdNotes', new GmTdNotesComponent())
  .service('TelephonyDomainService', TelephonyDomainService)
  .service('GmHttpService', GmHttpService)
  .name;
