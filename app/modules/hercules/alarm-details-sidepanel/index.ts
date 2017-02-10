import { AlarmDetailsSidepanelComponent } from './alarm-details-sidepanel.component';

require('./_alarm-details-sidepanel.scss');

export default angular
  .module('Hercules')
  .component('alarmDetailsSidepanel', new AlarmDetailsSidepanelComponent())
  .name;
