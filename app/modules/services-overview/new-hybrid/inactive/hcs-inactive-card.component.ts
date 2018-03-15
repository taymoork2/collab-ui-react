import { HcsSetupModalService } from 'modules/hcs/services';

export class HcsInactiveCardController implements ng.IComponentController {

  /* @ngInject */
  constructor(
    public HcsSetupModalService: HcsSetupModalService,
  ) {}

  public $onInit(): void {

  }

  public openSetUp(): void {
    this.HcsSetupModalService.openSetupModal();
  }
}

export class HcsInactiveCardComponent implements ng.IComponentOptions {
  public controller = HcsInactiveCardController;
  public template = `
    <article>
      <div class="inactive-card_header">
        <h4 translate="hcs.cardTitle"></h4>
         <p translate="hcs.description"></p>
      </div>
      <div class="inactive-card_content">
      </div>
      <div class="inactive-card_footer" ng-if="!$ctrl.loading">
        <p><button class="btn btn--primary" ng-disabled="!$ctrl.canSetup" ng-click="$ctrl.openSetUp()" translate="servicesOverview.genericButtons.setup"></button></p>
      </div>
    </article>
  `;
}
