import { GoogleCalendarSecondTimeSetupComponent } from './google-calendar-second-time-setup.component';
import './_google-calendar-second-time-setup.scss';

export default angular
  .module('hercules.google-calendar-second-time-setup', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('googleCalendarSecondTimeSetup', new GoogleCalendarSecondTimeSetupComponent())
  .name;
