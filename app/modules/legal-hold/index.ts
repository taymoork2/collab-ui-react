import './legal-hold.scss';

import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import * as userServiceModuleName from 'modules/core/scripts/services/user.service';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import notificationModuleName from 'modules/core/notifications';
import configModuleName from 'modules/core/config/config';
import coreSharedTableModuleName from 'modules/core/shared/cr-table';
import coreUsersTileTotalsModuleName from 'modules/core/users/shared/cr-users-tile-totals';
import csvDownloadModuleName from 'modules/core/shared/cr-csv-download';
import modalServiceModule from 'modules/core/modal';
import { LegalHoldService } from './legal-hold.service';
import { LegalHoldCustodianImportComponent } from './legal-hold-custodian-import.component';
import { LegalHoldLandingComponent } from './legal-hold-landing.component';
import { LegalHoldMatterNewComponent } from './legal-hold-matter-new.component';
import { LegalHoldMatterListComponent } from './legal-hold-matter-list.component';
import { LegalHoldMatterDetailComponent } from './legal-hold-matter-detail.component';
import { LegalHoldCustodiansManageComponent } from './legal-hold-custodians-manage.component';
import { LegalHoldCustodianExportComponent } from './legal-hold-custodian-export.component';

export default angular
  .module('legal-hold', [
    authinfoModuleName,
    configModuleName,
    coreSharedTableModuleName,
    coreUsersTileTotalsModuleName,
    csvDownloadModuleName,
    modalServiceModule,
    notificationModuleName,
    urlConfigModuleName,
    userServiceModuleName,
    require('ct-ui-router-extras.previous').default,
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('angular-ui-router'),
  ])
  .component('legalHoldCustodianImport', new LegalHoldCustodianImportComponent())
  .component('legalHoldLanding', new LegalHoldLandingComponent())
  .component('legalHoldMatterList', new LegalHoldMatterListComponent())
  .component('legalHoldMatterNew', new LegalHoldMatterNewComponent())
  .component('legalHoldMatterDetail', new LegalHoldMatterDetailComponent())
  .component('legalHoldCustodiansManage', new LegalHoldCustodiansManageComponent())
  .component('legalHoldCustodianExport', new LegalHoldCustodianExportComponent())
  .service('LegalHoldService', LegalHoldService)
  .name;
