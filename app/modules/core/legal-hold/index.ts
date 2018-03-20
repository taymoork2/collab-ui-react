import './legal-hold.scss';

import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import notificationModuleName from 'modules/core/notifications';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import configModuleName from 'modules/core/config/config';
import coreSharedTableModuleName from 'modules/core/shared/cr-table';
import coreUsersTileTotalsModuleName from 'modules/core/users/shared/cr-users-tile-totals';
import modalServiceModule from 'modules/core/modal';
import { LegalHoldService } from './legal-hold.service';
import { LegalHoldCustodianImportComponent } from './legal-hold-custodian-import.component';
import { LegalHoldLandingComponent } from './legal-hold-landing.component';

export default angular
  .module('core.legal-hold', [
    authinfoModuleName,
    configModuleName,
    coreSharedTableModuleName,
    modalServiceModule,
    notificationModuleName,
    urlConfigModuleName,
    coreUsersTileTotalsModuleName,
  ])
  .component('legalHoldLanding', new LegalHoldLandingComponent())
  .component('legalHoldCustodianImport', new LegalHoldCustodianImportComponent())
  .service('LegalHoldService', LegalHoldService)
  .name;
