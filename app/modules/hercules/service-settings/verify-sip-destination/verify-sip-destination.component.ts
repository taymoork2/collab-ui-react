class VerifySipDestinationComponentCtrl implements ng.IComponentController {

  public destinationUrl: string;

  /* @ngInject */
  constructor(
    private $modal,
  ) {}

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject}) {
    const { destinationUrl } = changes;
    if (destinationUrl && destinationUrl.currentValue) {
      this.destinationUrl = destinationUrl.currentValue;
    }
  }

  public openVerificationModal(): void {
    this.$modal.open({
      resolve: {
        destinationUrl: () => {
          return this.destinationUrl;
        },
      },
      controller: 'VerifySipDestinationModalController',
      controllerAs: 'vm',
      templateUrl: 'modules/hercules/service-settings/verify-sip-destination/verify-sip-destination-modal.html',
      type: 'full',
    });
  }
}

export class VerifySipDestinationComponent implements ng.IComponentOptions {
  public controller = VerifySipDestinationComponentCtrl;
  public templateUrl = 'modules/hercules/service-settings/verify-sip-destination/verify-sip-destination.html';
  public bindings = {
    destinationUrl: '<',
  };
}
