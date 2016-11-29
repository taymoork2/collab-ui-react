import './_hg-method.scss';

import { HuntGroupMethodComponent } from './huntGroupMethod.component';

export default angular
  .module('huron.hunt-group-method', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('ucHuntGroupMethod', new HuntGroupMethodComponent())
  .name;
