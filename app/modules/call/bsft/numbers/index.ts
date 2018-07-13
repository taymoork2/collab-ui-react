import { BsftNumbersComponent } from './bsft-numbers.component';
import prevPortedNumberModule from './prev-ported-number';
import bsftPortedNumberModule from './bsft-ported-number';
import portedNumberAddModule from './ported-number-add';

import './bsft-numbers.scss';
export * from './bsft-numbers';
export default angular.module('call.bsft.numbers.bsft-numbers', [
  require('@collabui/collab-ui-ng').default,
  prevPortedNumberModule,
  bsftPortedNumberModule,
  portedNumberAddModule,
])
  .component('bsftNumbers', new BsftNumbersComponent())
  .name;
