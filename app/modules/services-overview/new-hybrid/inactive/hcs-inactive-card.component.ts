import { HcsSetupModalService, HcsSetupModalSelect } from 'modules/hcs/hcs-shared';

export class HcsInactiveCardController implements ng.IComponentController {

  /* @ngInject */
  constructor(
    public HcsSetupModalService: HcsSetupModalService,
  ) {}

  public $onInit(): void {

  }

  public openSetUp(): void {
    this.HcsSetupModalService.openSetupModal(true, HcsSetupModalSelect.FirstTimeSetup);
  }
}

export class HcsInactiveCardComponent implements ng.IComponentOptions {
  public controller = HcsInactiveCardController;
  public template = `
    <article>
      <div class="cs-card">
        <h4 translate="hcs.cardTitle"></h4>
      </div>
      <div class="inactive-card_content">
      </div>
      <div class="inactive-card_footer" ng-if="!$ctrl.loading">
      <a><href ng-click="$ctrl.openSetUp()" translate="hcs.getStarted"></a>
      </div>
    </article>
  `;
}
