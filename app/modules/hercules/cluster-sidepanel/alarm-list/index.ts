import { AlarmListSectionComponent } from './alarm-list-section.component';

require('./_alarm-list-section.scss');

export default angular
  .module('Hercules')
  .component('alarmListSection', new AlarmListSectionComponent())
  .name;
