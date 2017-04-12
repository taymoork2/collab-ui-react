import { GmHttpService } from '../common/gem.http.service';
import { GmTdSitesComponent } from './details/gmTdSites.component';
import { GmTdNotesComponent } from './details/gmTdNotes.component';
import { TelephonyDomainService } from './telephonyDomain.service';
import { GmImportTdComponent } from './details/gmImportTd.component';
import { GmTdNumbersComponent } from './details/gmTdNumbers.component';
import { GmTdDetailsComponent } from './details/gmTdDetails.component';
import { TelephonyDomainsComponent } from './telephonyDomains.component';
import { GmTdHistoriesComponent } from './details/gmTdHistories.component';
import { GmTdLargePanelComponent } from './details/gmTdLargePanel.component';
import { GmTdNumbersViewComponent } from './details/gmTdNumbersView.component';
import { GmTdModalRequestComponent } from './details/gmTdModalRequest.component';

export default angular
  .module('Gemini')
  .service('GmHttpService', GmHttpService)
  .service('TelephonyDomainService', TelephonyDomainService)
  .component('gmTdNotes', new GmTdNotesComponent())
  .component('gmTdSites', new GmTdSitesComponent())
  .component('gmImportTd', new GmImportTdComponent())
  .component('gmTdDetails', new GmTdDetailsComponent())
  .component('gmTdNumbers', new GmTdNumbersComponent())
  .component('gmTdHistories', new GmTdHistoriesComponent())
  .component('gmTdLargePanel', new GmTdLargePanelComponent())
  .component('gmTdNumbersView', new GmTdNumbersViewComponent())
  .component('gmTdModalRequest', new GmTdModalRequestComponent())
  .component('gmTelephonyDomains', new TelephonyDomainsComponent())
  .name;
