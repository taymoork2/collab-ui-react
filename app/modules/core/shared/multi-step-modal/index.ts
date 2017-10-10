import './multi-step-modal.component.scss';
import { MultiStepModalComponent } from './multi-step-modal.component';

export default angular
  .module('core.shared.multi-step-modal', [
    require('angular-translate'),
  ])
  .component('multiStepModal', new MultiStepModalComponent())
  .name;
