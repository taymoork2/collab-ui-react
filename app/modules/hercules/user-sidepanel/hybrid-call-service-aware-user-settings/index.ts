import { HybridCallServiceAwareUserSettingsComponent } from './hybrid-call-service-aware-user-settings.component';

require('./_hybrid-call-service-aware-user-settings.scss');

export default angular
  .module('Hercules')
  .component('hybridCallServiceAwareUserSettings', new HybridCallServiceAwareUserSettingsComponent())
  .name;
