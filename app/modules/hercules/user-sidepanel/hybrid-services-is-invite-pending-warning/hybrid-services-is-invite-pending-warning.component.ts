class HybridServicesIsInvitePendingWarningComponentCtrl implements ng.IComponentController {

  private isEntitled: boolean;
  private wasEntitled: boolean;
  public serviceName: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) { }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { isEntitled, wasEntitled, serviceId } = changes;
    if (isEntitled && isEntitled.currentValue) {
      this.isEntitled = isEntitled.currentValue;
    }
    if (wasEntitled && wasEntitled.currentValue) {
      this.wasEntitled = wasEntitled.currentValue;
    }
    if (serviceId && serviceId.currentValue) {
      this.serviceName = this.$translate.instant(`hercules.serviceNames.${serviceId.currentValue}`);
    }
  }

}

export class HybridServicesIsInvitePendingWarningComponent implements ng.IComponentOptions {
  public template = `<div ng-hide="!$ctrl.isEntitled && $ctrl.wasEntitled" class="hybrid-services-warning-message">
        <i class="icon icon-warning"></i>
        <p class="hybrid-services-message">
          <span ng-if="!$ctrl.isEntitled && !$ctrl.wasEntitled" translate="hercules.userSidepanel.warningInvitePendingNotEntitled" translate-values="{ ServiceName: $ctrl.serviceName }"></span>
          <span ng-if="$ctrl.isEntitled" translate="hercules.userSidepanel.warningInvitePendingActivation"></span>
        </p>
      </div>`;
  public controller = HybridServicesIsInvitePendingWarningComponentCtrl;
  public bindings = {
    isEntitled: '<',
    wasEntitled: '<',
    serviceId: '<',
  };
}
