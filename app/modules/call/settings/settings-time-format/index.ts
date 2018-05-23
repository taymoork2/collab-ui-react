import { HuronTimeFormatComponent } from './settings-time-format.component';

export default angular
  .module('call.settings.time-format', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucTimeFormat', new HuronTimeFormatComponent())
  .name;
