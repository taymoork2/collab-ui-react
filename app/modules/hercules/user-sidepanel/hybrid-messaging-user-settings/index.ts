import { HybridMessagingUserSettingsComponent } from './hybrid-messaging-user-settings.component';

require('./_hybrid-messaging-user-settings.scss');

export default angular
  .module('Hercules')
  .component('hybridMessagingUserSettings', new HybridMessagingUserSettingsComponent())
  .name;
