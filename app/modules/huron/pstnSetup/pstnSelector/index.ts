import { PstnSelectorComponent } from './pstnSelector.component';

export const NUMBER_ORDER = 'NUMBER_ORDER';
export const PORT_ORDER = 'PORT_ORDER';
export const BLOCK_ORDER = 'BLOCK_ORDER';
export const NXX: string = 'nxx';
export const MIN_BLOCK_QUANTITY: number = 2;
export const MAX_BLOCK_QUANTITY: number = 100;

export default angular
  .module('huron.pstn-selector', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'huron.telephoneNumber',
    'huron.telephoneNumberService',
    require('angular-translate'),
  ])
  .component('pstnSelector', new PstnSelectorComponent())
  .name;
