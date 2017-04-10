import { GmHttpService } from '../common/gem.http.service';
import { GmTdSitesComponent } from './details/gmTdSites.component';
import { GmTdNotesComponent } from './details/gmTdNotes.component';
import { TelephonyDomainService } from './telephonyDomain.service';
import { GmTdDetailsComponent } from './details/gmTdDetails.component';
import { TelephonyDomainsComponent } from './telephonyDomains.component';
import { GmTdModalRequestComponent } from './details/gmTdModalRequest.component';

export default angular
  .module('Gemini')
  .service('GmHttpService', GmHttpService)
  .service('TelephonyDomainService', TelephonyDomainService)
  .component('gmTdNotes', new GmTdNotesComponent())
  .component('gmTdSites', new GmTdSitesComponent())
  .component('gmTdDetails', new GmTdDetailsComponent())
  .component('gmTdModalRequest', new GmTdModalRequestComponent())
  .component('gmTelephonyDomains', new TelephonyDomainsComponent())
  .name;
