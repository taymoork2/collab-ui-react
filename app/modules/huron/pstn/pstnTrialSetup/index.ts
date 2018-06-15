import { PstnTrialSetupComponent } from './pstnTrialSetup.component';
import pstnModelModule from '../pstn.model';
import pstnServiceModule from '../pstn.service';
import pstnAddressServiceModule from '../shared/pstn-address';
import notificationsModule from 'modules/core/notifications';
import phoneNumberModule from 'modules/huron/phoneNumber';

export default angular
  .module('huron.pstn.pstn-trial-setup', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/trials/trial.module'),
    require('modules/core/analytics'),
    pstnModelModule,
    pstnServiceModule,
    notificationsModule,
    phoneNumberModule,
    pstnAddressServiceModule,
  ])
  .component('ucPstnTrialSetup', new PstnTrialSetupComponent())
  .name;
