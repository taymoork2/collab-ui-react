import './legal-hold.scss';

import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import * as userServiceModuleName from 'modules/core/scripts/services/user.service.js';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import notificationModuleName from 'modules/core/notifications';
import configModuleName from 'modules/core/config/config';
import coreSharedTableModuleName from 'modules/core/shared/cr-table';
import coreUsersTileTotalsModuleName from 'modules/core/users/shared/cr-users-tile-totals';
import modalServiceModule from 'modules/core/modal';
import { LegalHoldService } from './legal-hold.service';
import { LegalHoldCustodianImportComponent } from './legal-hold-custodian-import.component';
import { LegalHoldLandingComponent } from './legal-hold-landing.component';
import { LegalHoldMatterNewComponent } from './legal-hold-matter-new.component';
import { LegalHoldMatterListComponent } from './legal-hold-matter-list.component';

export default angular
  .module('core.legal-hold', [
    authinfoModuleName,
    configModuleName,
    coreSharedTableModuleName,
    coreUsersTileTotalsModuleName,
    modalServiceModule,
    notificationModuleName,
    urlConfigModuleName,
    userServiceModuleName,
  ])
  .component('legalHoldCustodianImport', new LegalHoldCustodianImportComponent())
  .component('legalHoldLanding', new LegalHoldLandingComponent())
  .component('legalHoldMatterList', new LegalHoldMatterListComponent())
  .component('legalHoldMatterNew', new LegalHoldMatterNewComponent())
  .service('LegalHoldService', LegalHoldService)
  .name;
