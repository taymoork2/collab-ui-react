import { TimeZoneComponent } from './settings-time-zone.component';

export * from './settings-time-zone.component';

export default angular
  .module('huron.settings.time-zone', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucTimeZone', new TimeZoneComponent())
  .name;
