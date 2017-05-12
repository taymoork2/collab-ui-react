import { GoogleCalendarSetupComponent } from './google-calendar-setup.component';
import { GoogleCalendarApiInformationComponent } from './google-calendar-api-information.component';
import 'modules/hercules/service-settings/calendar-service-setup/_google-calendar-setup.scss';

export default angular
  .module('hercules.first-google-calendar-setup', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('googleCalendarSetup', new GoogleCalendarSetupComponent())
  .component('googleCalendarApiInformation', new GoogleCalendarApiInformationComponent())
  .name;
