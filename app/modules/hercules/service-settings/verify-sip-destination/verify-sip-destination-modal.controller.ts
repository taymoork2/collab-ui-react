import { L2SipService } from 'modules/hercules/services/l2sip-service';

type CurrentStep = 'input' | 'loading' | 'error' | 'result';

class VerifySipDestinationModalController {

  public result;
  public error;
  private originalDestinationUrl;
  public validateTls = true;
  public validateTlsCheckbox = true;

  public currentStep: CurrentStep = 'input';

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private L2SipService: L2SipService,
    private USSService,
    public destinationUrl: string,
  ) {
    this.originalDestinationUrl = destinationUrl;
  }

  public verifySipDestination(): void {
    this.currentStep = 'loading';
    this.L2SipService.verifySipDestination(this.destinationUrl, this.validateTls)
      .then((result) => {
        this.result =  result.steps;
        this.currentStep = 'result';
      })
      .catch((error) => {
        this.error = error;
        this.currentStep = 'error';
      });
  }

  public changeTlsSetting(enabled: boolean): void {
    this.validateTls = enabled;
  }

  public severityToIcon(severity): string {
    return this.USSService.getMessageIconClass(severity.toLowerCase());
  }

  public localizeType(type: string): string {
    return this.$translate.instant(`hercules.settings.verifySipDestination.types.${type}`);
  }

  public resetForm(): void {
    this.currentStep = 'input';
    this.destinationUrl = this.originalDestinationUrl;
    this.validateTls = true;
    this.validateTlsCheckbox = true;
    this.result = undefined;
    this.error = undefined;
  }

}

angular
  .module('Hercules')
  .controller('VerifySipDestinationModalController', VerifySipDestinationModalController);
