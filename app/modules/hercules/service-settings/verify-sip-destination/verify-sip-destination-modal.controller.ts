import { L2SipService } from 'modules/hercules/services/l2sip-service';

type CurrentStep = 'loading' | 'error' | 'result';
type Severity = 'Info' | 'Warn' | 'Error';
type VerificationStep = {
  type: string,
  description?: string,
  severity: Severity,
};

class VerifySipDestinationModalController {

  public result: {
    step: VerificationStep,
  };
  public error;

  public currentStep: CurrentStep = 'loading';

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private L2SipService: L2SipService,
    public destinationUrl: string,
  ) {
    this. verifySipDestination();
  }

  public verifySipDestination(): void {
    this.L2SipService.verifySipDestination(this.destinationUrl, true)
      .then((result) => {
        this.result =  result.steps;
        this.currentStep = 'result';
      })
      .catch((error) => {
        this.error = error;
        this.currentStep = 'error';
      });
  }

  public getNumberOfSteps(level: Severity): number {
    return _.chain(this.result)
      .filter((step: VerificationStep) => step.severity === level)
      .size()
      .value();
  }

  public hasWarningOrError(): boolean {
    return _.some(this.result, (step: VerificationStep) => step.severity === 'Warn' || step.severity === 'Error');
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

  public localizeType(type: string): string {
    return this.$translate.instant(`hercules.settings.verifySipDestination.types.${type}`);
  }

}

angular
  .module('Hercules')
  .controller('VerifySipDestinationModalController', VerifySipDestinationModalController);
