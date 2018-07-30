import { BsftAssignNumberComponent } from './bsft-assign-number.component';
import notificationsModule from 'modules/core/notifications';

export default angular.module('call.bsft.numbers.assignNumber', [
  require('@collabui/collab-ui-ng').default,
  notificationsModule,
])
  .component('bsftAssignNumber', new BsftAssignNumberComponent())
  .name;
