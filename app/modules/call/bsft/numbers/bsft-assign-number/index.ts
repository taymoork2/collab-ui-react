import { BsftAssignNumberComponent } from './bsft-assign-number.component';

export default angular.module('call.bsft.numbers.assignNumber', [
  require('@collabui/collab-ui-ng').default,
])
  .component('bsftAssignNumber', new BsftAssignNumberComponent())
  .name;
