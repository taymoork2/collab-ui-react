import { SipDestinationTestResultsComponent } from './hs-sip-destination-test-results.component';

require('./_hs-sip-destination-test-results.scss');

export default angular
  .module('Hercules')
  .component('hsSipDestinationTestResults', new SipDestinationTestResultsComponent())
  .name;
