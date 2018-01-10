import {
  PstnSelectorComponent,
  StartFromFilter,
} from './pstnSelector.component';

import phoneNumberName from 'modules/huron/phoneNumber';

export default angular
  .module('huron.pstn.pstn-selector', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    phoneNumberName,
  ])
  .filter('startFrom', StartFromFilter)
  .component('ucPstnSelector', new PstnSelectorComponent())
  .name;
