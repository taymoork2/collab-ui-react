import { BsftReadOnlyComponent } from './bsft-read-only.component';
import * as authInfoModule from 'modules/core/scripts/services/authinfo';

export default angular.module('call.bsft.settings.readOnly', [
  require('@collabui/collab-ui-ng').default,
  authInfoModule,
])
  .component('bsftReadOnly', new BsftReadOnlyComponent())
  .name;
