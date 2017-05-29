import { HybridCallServiceConnectUserSettingsComponent } from './hybrid-call-service-connect-user-settings.component';

require('./_hybrid-call-service-connect-user-settings.scss');

export default angular
  .module('Hercules')
  .component('hybridCallServiceConnectUserSettings', new HybridCallServiceConnectUserSettingsComponent())
  .name;
