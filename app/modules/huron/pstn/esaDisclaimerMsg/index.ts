import { EsaDisclaimerMsgComponent } from './esaDisclaimerMsg.component';
import './_esaDisclaimerMsg.scss';

export default angular
  .module('huron.pstn.esa-disclaimer-msg', [
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucEsaDisclaimerMsg', new EsaDisclaimerMsgComponent())
  .name;

