import { GmTdSitesComponent } from './details/gmTdSites.component';
import { GmTdNotesComponent } from './details/gmTdNotes.component';
import { TelephonyDomainService } from './telephonyDomain.service';
import { TelephonyNumberValidateService } from './details/telephonyNumberValidate.service';
import { TelephonyNumberDataService } from './details/telephonyNumberData.service';
import { GmTdDetailsComponent } from './details/gmTdDetails.component';
import { TelephonyDomainsComponent } from './telephonyDomains.component';
import { GmTdModalRequestComponent } from './details/gmTdModalRequest.component';
import { GmTdNumbersComponent } from './details/gmTdNumbers.component';
import { GmTdHistoriesComponent } from './details/gmTdHistories.component';
import { GmTdNotesViewComponent } from './details/gmTdNotesView.component';
import { GmTdHeaderComponent } from './details/gmTdHeader.component';
import { GmTdImportNumbersFromCsvComponent } from './details/gmTdImportNumbersFromCsv.component';
import { GmImportTdComponent } from './details/gmImportTd.component';

export default angular
  .module('Gemini')
  .service('TelephonyDomainService', TelephonyDomainService)
  .service('TelephonyNumberDataService', TelephonyNumberDataService)
  .service('TelephonyNumberValidateService', TelephonyNumberValidateService)
  .component('gmTdNotes', new GmTdNotesComponent())
  .component('gmTdSites', new GmTdSitesComponent())
  .component('gmTdDetails', new GmTdDetailsComponent())
  .component('gmTdModalRequest', new GmTdModalRequestComponent())
  .component('gmTelephonyDomains', new TelephonyDomainsComponent())
  .component('gmTdNumbers', new GmTdNumbersComponent())
  .component('gmTdHistories', new GmTdHistoriesComponent())
  .component('gmTdNotesView', new GmTdNotesViewComponent())
  .component('gmTdHeader', new GmTdHeaderComponent())
  .component('gmTdImportNumbersFromCsv', new GmTdImportNumbersFromCsvComponent())
  .component('gmImportTd', new GmImportTdComponent())
  .name;
