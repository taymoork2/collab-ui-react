import './_hg-numbers.scss';

import { HuntGroupNumbersComponent } from './huntGroupNumbers.component';
import numberService from 'modules/huron/numbers';
import noDirtyOverride from 'modules/call/features/shared/no-dirty-override';

export default angular
  .module('huron.hunt-group-numbers', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    numberService,
    noDirtyOverride,
  ])
  .component('ucHuntGroupNumbers', new HuntGroupNumbersComponent())
  .name;
