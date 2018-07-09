import { BsftContactPhoneNumberComponent } from './settings-contact-phone-number.component';

export default angular.module('call.bsft.settings.phone.number', [
  require('@collabui/collab-ui-ng').default,
])
  .component('bsftContactPhoneNumber', new BsftContactPhoneNumberComponent())
  .name;
