import { HuronTimeFormatComponent } from './timeFormat.component';

export default angular
  .module('huron.settings.time-format', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'pascalprecht.translate',
  ])
  .component('ucTimeFormat', new HuronTimeFormatComponent())
  .name;
