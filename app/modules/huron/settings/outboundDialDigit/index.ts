import { OutboundDialDigitComponent } from './outboundDialDigit.component';

export default angular
  .module('huron.settings.outbound-dial-digit', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucOutboundDialDigit', new OutboundDialDigitComponent())
  .name;
