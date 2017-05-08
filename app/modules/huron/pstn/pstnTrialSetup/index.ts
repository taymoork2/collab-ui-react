import { PstnTrialSetupComponent } from './pstnTrialSetup.component';
import pstnModel from '../pstn.model';
import pstnService from '../pstn.service';
import notifications from 'modules/core/notifications';

export default angular
  .module('huron.pstn.pstn-trial-setup', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/huron/telephony/telephoneNumber.filter'),
    require('modules/core/trials/trial.module'),
    require('modules/core/analytics'),
    pstnModel,
    pstnService,
    notifications,
  ])
  .component('ucPstnTrialSetup', new PstnTrialSetupComponent())
  .name;
