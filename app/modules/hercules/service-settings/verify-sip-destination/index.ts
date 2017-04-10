import { VerifySipDestinationComponent } from './verify-sip-destination.component';

require('./_verify-sip-destination.scss');

export default angular
  .module('Hercules')
  .component('verifySipDestination', new VerifySipDestinationComponent())
  .name;
