import { BsftNumberListComponent } from './bsft-number-list.component';
import './bsft-number-list.scss';
export default angular.module('call.bsft.numbers.number-list', [
  require('@collabui/collab-ui-ng').default,
])
  .component('bsftNumberList', new BsftNumberListComponent())
  .name;
