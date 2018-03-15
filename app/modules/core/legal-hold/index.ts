import './legal-hold.scss';

import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import notificationModuleName from 'modules/core/notifications';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import configModuleName from 'modules/core/config/config';
import coreSharedModuleName from 'modules/core/shared';
import coreSharedTableModuleName from 'modules/core/shared/cr-table';
import usersSharedModuleName from 'modules/core/users/shared';
import modalServiceModule from 'modules/core/modal';
import { LegalHoldService } from './legal-hold.service';
import { LegalHoldCustodianImportComponent } from './legal-hold-custodian-import.component';

export default angular
  .module('core.legal-hold', [
    authinfoModuleName,
    configModuleName,
    coreSharedModuleName,
    coreSharedTableModuleName,
    modalServiceModule,
    notificationModuleName,
    urlConfigModuleName,
    usersSharedModuleName,
  ])
  .component('legalHoldCustodianImport', new LegalHoldCustodianImportComponent())
  .service('LegalHoldService', LegalHoldService)
  .name;
