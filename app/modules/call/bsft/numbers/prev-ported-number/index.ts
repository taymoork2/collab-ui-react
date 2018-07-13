import { PrevPortedNumbersComponent } from './prev-ported-numbers.component';

export default angular.module('call.bsft.numbers.prev-ported-numbers', [
  require('@collabui/collab-ui-ng').default,
])
  .component('prevPortedNumbers', new PrevPortedNumbersComponent())
  .name;
