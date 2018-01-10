import { PstnNpaNxxComponent } from './pstnNpaNxx.component';

import pstnModelName from '../../pstn.model';
import pstnAreaServiceName from '../../pstnAreaService';
import pstnServiceName from '../../pstn.service';
import notificationsName from 'modules/core/notifications';

export default angular
  .module('huron.pstn.pstn-npa-nxx', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    pstnModelName,
    pstnAreaServiceName,
    pstnServiceName,
    notificationsName,
  ])
  .component('ucPstnNpaNxx', new PstnNpaNxxComponent())
  .name;
