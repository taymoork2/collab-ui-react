import { PstnWizardComponent } from './pstnWizard.component';
import notifications from 'modules/core/notifications';

export const TIMEOUT: number = 100;
export const SWIVEL: string = 'SWIVEL';
export const MIN_VALID_CODE: number = 3;
export const MAX_VALID_CODE: number = 6;
export const NXX: string = 'nxx';
export const MAX_DID_QUANTITY: number = 100;
export const NUMTYPE_DID: string = 'DID';
export const NUMTYPE_TOLLFREE: string = 'TOLLFREE';
export const NXX_EMPTY: string = '--';
export const TOLLFREE_ORDERING_CAPABILITY: string = 'TOLLFREE_ORDERING';
export const NUMBER_ORDER: string = 'NUMBER_ORDER';
export const PORT_ORDER: string = 'PORT_ORDER';
export const BLOCK_ORDER: string = 'BLOCK_ORDER';
export const MIN_BLOCK_QUANTITY: number = 2;
export const MAX_BLOCK_QUANTITY: number = 100;
export const TOKEN_FIELD_ID: string = 'pstn-port-numbers';

export default angular
  .module('huron.pstn-wizard', [
    notifications,
  ])
  .component('ucPstnWizard', new PstnWizardComponent())
  .name;
