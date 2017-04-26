import { PstnTrialSetupComponent } from './pstnTrialSetup.component';
import notifications from 'modules/core/notifications';

export default angular
  .module('huron.pstn-trialSetup', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    'huron.telephoneNumber',
    'huron.pstnsetupservice',
    'huron.PstnSetup',
    'core.trial',
    'Huron',
    notifications,
  ])
  .component('ucPstnTrialSetup', new PstnTrialSetupComponent())
  .name;
