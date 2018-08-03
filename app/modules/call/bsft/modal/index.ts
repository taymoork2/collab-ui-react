import { BsftSettingsModalComponent } from './bsft-settings-modal.component';
import BsftSettingsModule from 'modules/call/bsft/settings';
import BsftLicenseModule from 'modules/call/bsft/licenses';
import BsftNumberModule from 'modules/call/bsft/numbers';
import notificationsModule from 'modules/core/notifications';

export default angular.module('call.bsft.modal', [
  require('@collabui/collab-ui-ng').default,
  BsftSettingsModule,
  BsftLicenseModule,
  BsftNumberModule,
  notificationsModule,
])
  .component('bsftSettingsModal', new BsftSettingsModalComponent())
  .name;
