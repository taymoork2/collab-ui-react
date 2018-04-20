import { HuntGroupMaxRingTimeComponent } from './hunt-group-max-ring-time.component';

export default angular
  .module('huron.hunt-group-max-ring-time', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucHuntGroupMaxRingTime', new HuntGroupMaxRingTimeComponent())
  .name;
