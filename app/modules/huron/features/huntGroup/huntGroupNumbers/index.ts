import './_hg-numbers.scss';

import { HuntGroupNumbersComponent } from './huntGroupNumbers.component';
import numberService from 'modules/huron/numbers';
import noDirtyOverride from 'modules/huron/features/components/noDirtyOverride';

export default angular
  .module('huron.hunt-group-numbers', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    numberService,
    noDirtyOverride,
  ])
  .component('ucHuntGroupNumbers', new HuntGroupNumbersComponent())
  .name;
