export class SipDestinationTestResultComponent implements ng.IComponentOptions {
  public template = `
  <div class="row collapse test-card">
    <div class="columns medium-12">
      <div class="row">
        <div class="columns medium-12" translate="hercules.settings.verifySipDestination.testFor" translate-value-target="{{::$ctrl.test.target}}"></div>
      </div>
      <div class="row">
        <div class="columns medium-4"><p><strong translate="hercules.settings.verifySipDestination.tests"></strong></p></div>
        <div class="columns medium-2"><p><strong translate="hercules.settings.verifySipDestination.result"></strong></p></div>
        <div class="columns medium-6"><p><strong translate="hercules.settings.verifySipDestination.details"></strong></p></div>
      </div>
      <sip-destination-test-result-row title-key="'hercules.settings.verifySipDestination.connectingToIP'" data="$ctrl.test.connecting"></sip-destination-test-result-row>
      <sip-destination-test-result-row title-key="'hercules.settings.verifySipDestination.socketTest'" data="$ctrl.test.socket"></sip-destination-test-result-row>
      <sip-destination-test-result-row title-key="'hercules.settings.verifySipDestination.sslHandshake'" data="$ctrl.test.sslHandshake"></sip-destination-test-result-row>
      <sip-destination-test-result-row title-key="'hercules.settings.verifySipDestination.ping'" data="$ctrl.test.ping"></sip-destination-test-result-row>
    </div>
  </div>
  `;
  public bindings = {
    test: '<',
  };
}
