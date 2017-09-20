class SipDestinationTestResultsComponentCtrl implements ng.IComponentController {

  public testResultNumbers: {
    successful: number,
    issues: number,
    failed: number,
  };

  /* @ngInject */
  constructor(
  ) {}

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { testResultNumbers } = changes;
    if (testResultNumbers && testResultNumbers.currentValue) {
      this.testResultNumbers = testResultNumbers.currentValue;
    }
  }

}

export class SipDestinationTestResultsComponent implements ng.IComponentOptions {
  public controller = SipDestinationTestResultsComponentCtrl;
  public template = require('modules/hercules/service-settings/verify-sip-destination/hs-sip-destination-test-results/hs-sip-destination-test-results.html');
  public bindings = {
    testResultNumbers: '<',
  };
}
