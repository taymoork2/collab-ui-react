import { TimeZoneComponent } from './timeZone.component';

export * from './timeZone.component';

export default angular
  .module('huron.settings.time-zone', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucTimeZone', new TimeZoneComponent())
  .name;
