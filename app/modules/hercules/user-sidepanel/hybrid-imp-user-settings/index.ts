import { HybridImpUserSettingsComponent } from './hybrid-imp-user-settings.component';

require('./_hybrid-imp-user-settings.scss');

export default angular
  .module('Hercules')
  .component('hybridImpUserSettings', new HybridImpUserSettingsComponent())
  .name;
