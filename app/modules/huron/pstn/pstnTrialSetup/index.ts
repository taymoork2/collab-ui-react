import { PstnTrialSetupComponent } from './pstnTrialSetup.component';
import notifications from 'modules/core/notifications';

export default angular
  .module('huron.pstn-trialSetup', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    'huron.telephoneNumber',
    require('modules/huron/pstn/pstn.service').default,
    require('modules/huron/pstn/pstn.model').default,
    'core.trial',
    'Huron',
    notifications,
  ])
  .component('ucPstnTrialSetup', new PstnTrialSetupComponent())
  .name;
