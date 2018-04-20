import { GoogleCalendarSecondTimeSetupComponent } from './google-calendar-second-time-setup.component';
import featureToggle from 'modules/core/featureToggle';
import './_google-calendar-second-time-setup.scss';

export default angular
  .module('hercules.google-calendar-second-time-setup', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    featureToggle,
  ])
  .component('googleCalendarSecondTimeSetup', new GoogleCalendarSecondTimeSetupComponent())
  .name;
