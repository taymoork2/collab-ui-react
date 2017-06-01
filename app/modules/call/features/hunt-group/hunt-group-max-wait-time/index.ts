import './hunt-group-max-wait-time.component.scss';
import { HuntGroupMaxWaitTimeComponent } from './hunt-group-max-wait-time.component';

export default angular
  .module('huron.hunt-group-max-wait-time', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucHuntGroupMaxWaitTime', new HuntGroupMaxWaitTimeComponent())
  .name;
