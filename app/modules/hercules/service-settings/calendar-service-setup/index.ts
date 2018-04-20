import { GoogleCalendarFirstTimeSetupComponent } from './google-calendar-first-time-setup.component';
import { GoogleCalendarApiInformationComponent } from './google-calendar-api-information.component';
import 'modules/hercules/service-settings/calendar-service-setup/_google-calendar-first-time-setup.scss';

export default angular
  .module('hercules.google-calendar-first-time-setup', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/auth/auth'),
    require('modules/core/scripts/services/authinfo'),
  ])
  .component('googleCalendarFirstTimeSetup', new GoogleCalendarFirstTimeSetupComponent())
  .component('googleCalendarApiInformation', new GoogleCalendarApiInformationComponent())
  .name;
