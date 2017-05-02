import './_hg-method.scss';

import { HuntGroupMethodComponent } from './huntGroupMethod.component';

export default angular
  .module('huron.hunt-group-method', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucHuntGroupMethod', new HuntGroupMethodComponent())
  .name;
