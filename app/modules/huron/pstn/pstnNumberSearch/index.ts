import { PstnNumberSearchComponent } from './pstnNumberSearch.component';
import { NumberModelFactory } from './number.model';
export * from './number.model';

import pstnNpaNxxName from './pstnNpaNxx';
import pstnSelectorName from './pstnSelector';

export default angular
  .module('huron.pstn.pstn-number-search', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    pstnNpaNxxName,
    pstnSelectorName,
  ])
  .component('ucPstnNumberSearch', new PstnNumberSearchComponent())
  .factory('NumberModelFactory', NumberModelFactory)
  .name;
