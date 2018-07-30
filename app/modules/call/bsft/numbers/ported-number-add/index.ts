import { PortedNumbersAddComponent } from './ported-numbers-add.component';

export default angular.module('call.bsft.numbers.bsft-ported-number', [
  require('@collabui/collab-ui-ng').default,
])
  .component('portedNumbersAdd', new PortedNumbersAddComponent())
  .name;
