import './hunt-group-method.component.scss';

import { HuntGroupMethodComponent } from './hunt-group-method.component';

export default angular
  .module('huron.hunt-group-method', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucHuntGroupMethod', new HuntGroupMethodComponent())
  .name;
