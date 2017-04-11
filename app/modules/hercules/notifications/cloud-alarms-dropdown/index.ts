import { HsCloudAlarmsDropdownComponent } from './hs-cloud-alarms-dropdown.component';

require('./_hs-cloud-alarms-dropdown.scss');

export default angular
  .module('Hercules')
  .component('hsCloudAlarmsDropdown', new HsCloudAlarmsDropdownComponent())
  .name;
