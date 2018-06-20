import { BsftContactEmailComponent } from './settings-contact-email.component';

export default angular.module('call.bsft.settings.email', [
  require('@collabui/collab-ui-ng').default,
])
  .component('bsftContactEmail', new BsftContactEmailComponent())
  .name;
