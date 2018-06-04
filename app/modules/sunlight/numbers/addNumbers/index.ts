
import { CareAddNumbersModalComponent } from './care-add-numbers-modal.component';
import pstnWizardModule from 'modules/huron/pstn/pstnWizard';
import './_care-add-numbers.scss';

export default angular
  .module('Sunlight.addNumbers', [
    require('angular-translate'),
    pstnWizardModule,
  ])
  .component('careAddNumbersModal', new CareAddNumbersModalComponent())
  .name;
