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
  public template = `<div ng-hide="!$ctrl.isEntitled && $ctrl.wasEntitled">
        <hybrid-services-sidepanel-message ng-if="!$ctrl.isEntitled && !$ctrl.wasEntitled" severity="'warning'" translation-key="'hercules.userSidepanel.warningInvitePendingNotEntitled'" translate-replacements="{ ServiceName: $ctrl.serviceName }"></hybrid-services-sidepanel-message>
        <hybrid-services-sidepanel-message ng-if="$ctrl.isEntitled" severity="'warning'" translation-key="'hercules.userSidepanel.warningInvitePendingActivation'"></hybrid-services-sidepanel-message>
      </div>`;
  public controller = HybridServicesIsInvitePendingWarningComponentCtrl;
  public bindings = {
    isEntitled: '<',
    wasEntitled: '<',
    serviceId: '<',
  };
}
