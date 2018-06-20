import { BsftContactLastNameComponent } from './settings-contact-last-name.component';

export default angular.module('call.bsft.settings.last.name', [
  require('@collabui/collab-ui-ng').default,
])
  .component('bsftContactLastName', new BsftContactLastNameComponent())
  .name;
