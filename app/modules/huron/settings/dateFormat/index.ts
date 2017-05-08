import { HuronDateFormatComponent } from './dateFormat.component';

export default angular
  .module('huron.settings.date-format', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucDateFormat', new HuronDateFormatComponent())
  .name;
