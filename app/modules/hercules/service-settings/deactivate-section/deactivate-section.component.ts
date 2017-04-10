class DeactivateSectionCtrl implements ng.IComponentController {
  public deactivateSection = {
    title: 'common.deactivate',
  };
  public serviceId: string;
  public localizedServiceName: string;
  public localizedConnectorName: string;

  private deactivateModalOptions: any;
  private defaultDeactivateModalOptions: any = {
    resolve: {
      serviceId: () => this.serviceId,
    },
    controller: 'ConfirmDisableHybridServiceCtrl',
    controllerAs: '$ctrl',
    templateUrl: 'modules/hercules/service-settings/deactivate-section/confirm-disable-hybrid-service.html',
    type: 'dialog',
  };

  /* @ngInject */
  constructor(
    private $modal,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit() {

    this.localizedServiceName = this.$translate.instant('hercules.hybridServiceNames.' + this.serviceId);

    if (this.serviceId === 'squared-fusion-cal' || this.serviceId === 'squared-fusion-uc') {
      this.localizedConnectorName = this.$translate.instant(`hercules.connectorNames.${this.serviceId}`);
    }

  }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject}) {

    const { deactivateModalOptions } = changes;

    if (deactivateModalOptions && deactivateModalOptions.currentValue) {
      this.deactivateModalOptions = deactivateModalOptions.currentValue;
    } else if (deactivateModalOptions) {
      this.deactivateModalOptions = this.defaultDeactivateModalOptions;
    }
  }

  public confirmDisable(): void {
    this.$modal.open(this.deactivateModalOptions)
      .result
      .then(() => {
        this.$state.go('services-overview');
      });

  }

}

class DeactivateSectionComponent implements ng.IComponentOptions {
  public controller = DeactivateSectionCtrl;
  public templateUrl = 'modules/hercules/service-settings/deactivate-section/deactivate-section.html';
  public bindings = {
    serviceId: '<',
    deactivateModalOptions: '<',
  };
}

export default angular
  .module('Hercules')
  .component('deactivateSection', new DeactivateSectionComponent())
  .name;
