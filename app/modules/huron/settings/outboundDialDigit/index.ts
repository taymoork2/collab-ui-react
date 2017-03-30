import { OutboundDialDigitComponent } from './outboundDialDigit.component';

export default angular
  .module('huron.settings.outbound-dial-digit', [
    require('scripts/app.templates'),
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('ucOutboundDialDigit', new OutboundDialDigitComponent())
  .name;
