import { PstnSelectorComponent } from './pstnSelector.component';
import phoneNumberModule from 'modules/huron/phoneNumber';

export default angular
  .module('huron.pstn-selector', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    phoneNumberModule,
  ])
  .component('pstnSelector', new PstnSelectorComponent())
  .name;
