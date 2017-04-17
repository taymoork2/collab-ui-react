import { PstnTrialSetupComponent } from './pstnTrialSetup.component';
import notifications from 'modules/core/notifications';

export const TIMEOUT = 100;
export const SWIVEL = 'SWIVEL';
export const MIN_VALID_CODE = 3;
export const MAX_VALID_CODE = 6;
export const NXX = 'nxx';
export const MAX_DID_QUANTITY = 100;
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
