import { BsftNumbersComponent } from './bsft-numbers.component';
import prevPortedNumberModule from './prev-ported-number';
import bsftPortedNumberModule from './bsft-ported-number';
import portedNumberAddModule from './ported-number-add';
import bsftAssignNumberModule from './bsft-assign-number';
import assignNumberModule from './site-assign-number';

import './bsft-numbers.scss';
export * from './bsft-numbers';
export default angular.module('call.bsft.numbers.bsft-numbers', [
  require('@collabui/collab-ui-ng').default,
  prevPortedNumberModule,
  bsftPortedNumberModule,
  portedNumberAddModule,
  bsftAssignNumberModule,
  assignNumberModule,
])
  .component('bsftNumbers', new BsftNumbersComponent())
  .name;
