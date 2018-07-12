import { BsftPortedNumbersComponent } from './bsft-ported-numbers.component';

export default angular.module('call.bsft.numbers.bsft-ported-numbers', [
  require('@collabui/collab-ui-ng').default,
])
  .component('bsftPortedNumbers', new BsftPortedNumbersComponent())
  .name;
