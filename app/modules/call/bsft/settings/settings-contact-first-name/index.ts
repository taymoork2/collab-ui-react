import { BsftContactFirstNameComponent } from './settings-contact-first-name.component';

export default angular.module('call.bsft.settings.first.name', [
  require('@collabui/collab-ui-ng').default,
])
  .component('bsftContactFirstName', new BsftContactFirstNameComponent())
  .name;
