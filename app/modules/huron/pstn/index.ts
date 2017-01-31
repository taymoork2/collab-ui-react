import { PstnWizardComponent } from './pstnWizard.component';
import notifications from 'modules/core/notifications';

export default angular
  .module('huron.pstn-wizard', [
    notifications,
  ])
  .component('ucPstnWizard', new PstnWizardComponent())
  .name;
