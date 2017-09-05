import { PrivateTrunkPrereqService } from 'modules/hercules/private-trunk/private-trunk-prereq';

class EPTInactiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
    private PrivateTrunkPrereqService: PrivateTrunkPrereqService,
  ) {}

  public $onInit(): void {
    // TODO: look for domains? this.PrivateTrunkPrereqService.getVerifiedDomains()
    // TODO: look for destinationList? this.FeatureToggleService.supports(this.FeatureToggleService.features.huronEnterprisePrivateTrunking)
      // .then((supported: boolean) => {
      //   if (supported) {
      //     this.EnterprisePrivateTrunkService.fetch()
      //       .then((sipTrunkResources: IPrivateTrunkResource[]) => {
      //         sipTrunkResources
      //       });
      //   }
      // });
  }

  public openPrerequisites(): void {
    this.PrivateTrunkPrereqService.openModal();
  }

  public openSetUp(): void {
    this.PrivateTrunkPrereqService.openSetupModal();
  }
}

export class EPTInactiveCardComponent implements ng.IComponentOptions {
  public controller = EPTInactiveCardController;
  public template = `
    <article>
      <div class="inactive-card_header">
        <h4 translate="servicesOverview.cards.privateTrunk.title"></h4>
      </div>
      <div class="inactive-card_content">
        <p translate="servicesOverview.cards.privateTrunk.description"></p>
      </div>
      <div class="inactive-card_footer">
        <p><a href ng-click="$ctrl.openPrerequisites()" translate="servicesOverview.genericButtons.prereq"></a></p>
        <p><button class="btn btn--primary" ng-click="$ctrl.openSetUp()" translate="servicesOverview.genericButtons.setup"></button></p>
      </div>
    </article>
  `;
}
