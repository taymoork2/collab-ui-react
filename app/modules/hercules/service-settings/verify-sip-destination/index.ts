import { SipDestinationTestResultComponent } from './sip-destination-test-result.component';
import { SipDestinationTestResultRowComponent } from './sip-destination-test-result-row.component';
import { VerifySipDestinationComponent } from './verify-sip-destination.component';

require('./_verify-sip-destination.scss');

export default angular
  .module('Hercules')
  .component('sipDestinationTestResult', new SipDestinationTestResultComponent())
  .component('sipDestinationTestResultRow', new SipDestinationTestResultRowComponent())
  .component('verifySipDestination', new VerifySipDestinationComponent())
  .name;
