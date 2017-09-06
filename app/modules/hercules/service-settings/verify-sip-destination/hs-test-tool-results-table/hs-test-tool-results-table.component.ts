import { VerificationStep } from 'modules/hercules/services/l2sip-service';

class HsTestToolResultsTableComponentCtrl implements ng.IComponentController {

  public testResults: VerificationStep[];

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { testResults } = changes;
    if (testResults && testResults.currentValue) {
      this.testResults = testResults.currentValue;
    }
  }

  public localizeType(type: string): string {
    return this.$translate.instant(`hercules.settings.verifySipDestination.types.${type}`);
  }

  public severityToIcon(severity): string {
    switch (severity) {
      case 'Error':
        return 'icon-error';
      case 'Warn':
        return 'icon-warning';
      default:
        return 'icon-checkbox';
    }
  }

}

export class HsTestToolResultsTableComponent implements ng.IComponentOptions {
  public controller = HsTestToolResultsTableComponentCtrl;
  public template = require('modules/hercules/service-settings/verify-sip-destination/hs-test-tool-results-table/hs-test-tool-results-table.component.html');
  public bindings = {
    testResults: '<',
  };
}
