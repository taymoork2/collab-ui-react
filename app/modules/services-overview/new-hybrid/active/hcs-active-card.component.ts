import { HcsSetupModalService } from 'modules/hcs/services/';
class HcsActiveCardController implements ng.IComponentController {
  public loading = false;
  public canSetup = true; //false only if both services up

  /* @ngInject */
  constructor(
    private HcsSetupModalService: HcsSetupModalService,
  ) {
  }
  public openSetUp(): void {
    this.HcsSetupModalService.openSetupModal();
  }
}
export class HcsActiveCardComponent implements ng.IComponentOptions {
  public controller = HcsActiveCardController;
  public template = `
    <article>
      <div class="active-card_header">
        <h4 translate="hcs.cardTitle"></h4>
        <i class="icon icon-question-circle" tooltip="{{::'hcs.description' | translate}}" tooltip-placement="bottom-right" tabindex="0" tooltip-trigger="focus mouseenter" aria-label="{{::'hcs.description' | translate}}"></i>
      </div>
      <div class="active-card_content">
        <div class="active-card_section">
          <div class="active-card_title" translate="hcs.inventory.title"></div>
          <div class="active-card_action"><a translate="hcs.inventory.title"></a></div>
        </div>
        <div class="active-card_section">
          <div class="active-card_title" translate="hcs.agentInstallFiles"></div>
          <div class="active-card_action"><a translate="hcs.agentInstallFiles"></a></div>
        </div>
      </div>
      <div class="inactive-card_footer" ng-if="!$ctrl.loading">
        <p><button class="btn btn--primary" ng-disabled="!$ctrl.canSetup" ng-click="$ctrl.openSetUp()" translate="hcs.addService"></button></p>
      </div>
    </article>
  `;
  public bindings = {
    serviceStatus: '<',
  };
}
