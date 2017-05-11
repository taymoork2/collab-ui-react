import { GoogleCalendarFirstTimeSetupComponent } from './google-calendar-first-time-setup.component';
import { GoogleCalendarApiInformationComponent } from './google-calendar-api-information.component';
import 'modules/hercules/service-settings/calendar-service-setup/_google-calendar-first-time-setup.scss';

export default angular
  .module('hercules.google-calendar-first-time-setup', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('googleCalendarFirstTimeSetup', new GoogleCalendarFirstTimeSetupComponent())
  .component('googleCalendarApiInformation', new GoogleCalendarApiInformationComponent())
  .name;
