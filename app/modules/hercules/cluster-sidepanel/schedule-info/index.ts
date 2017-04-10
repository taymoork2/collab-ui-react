import { ScheduleInfoSectionComponent } from './schedule-info.component';

require('./_schedule-info.scss');

export default angular
  .module('Hercules')
  .component('scheduleInfoSection', new ScheduleInfoSectionComponent())
  .name;
