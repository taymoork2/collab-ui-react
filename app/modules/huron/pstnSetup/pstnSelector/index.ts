import { PstnSelectorComponent } from './pstnSelector.component';

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
