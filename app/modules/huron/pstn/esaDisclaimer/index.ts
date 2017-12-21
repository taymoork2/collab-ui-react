import { EsaDisclaimerComponent } from './esaDisclaimer.component';
import EsaDisclaimerMsg from '../esaDisclaimerMsg';
import terminusService from '../terminus.service';
import notifications from 'modules/core/notifications';

export default angular
  .module('huron.pstn.esa-disclaimer', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    EsaDisclaimerMsg,
    terminusService,
    notifications,
  ])
  .component('ucEsaDisclaimer', new EsaDisclaimerComponent())
  .name;
