import { PstnTrialSetupComponent } from './pstnTrialSetup.component';
import pstnModel from '../pstn.model';
import pstnService from '../pstn.service';
import notifications from 'modules/core/notifications';
import phoneNumberModule from 'modules/huron/phoneNumber';
import PstnAddressServiceModule from '../shared/pstn-address';

export default angular
  .module('huron.pstn.pstn-trial-setup', [
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/trials/trial.module'),
    require('modules/core/analytics'),
    pstnModel,
    pstnService,
    notifications,
    phoneNumberModule,
    PstnAddressServiceModule,
  ])
  .component('ucPstnTrialSetup', new PstnTrialSetupComponent())
  .name;
