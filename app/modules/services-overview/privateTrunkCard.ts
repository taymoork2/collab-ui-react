import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';
import { ICardButton, CardType } from './ServicesOverviewCard';

export class ServicesOverviewPrivateTrunkCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _buttons: Array<ICardButton> = [{
    name: 'servicesOverview.cards.privateTrunk.buttons.verify',
    routerState: 'test',
    buttonClass: 'btn-link',
  }, {
    name: 'servicesOverview.genericButtons.setup',
    routerState: 'private-trunk-overview',
    buttonClass: 'btn btn--primary',
  }];

  public getButtons(): Array<ICardButton> {
    return this._buttons;
  }

  public privateTrunkFeatureToggleEventHandler(hasFeature: boolean) {
    this.display = hasFeature;
  }


  /* @ngInject */
  public constructor(
    FusionClusterStatesService,
  ) {
    super({
      name: 'servicesOverview.cards.privateTrunk.title',
      description: 'servicesOverview.cards.privateTrunk.description',
      active: true,
      cardClass: 'private-trunk',
      cardType: CardType.hybrid,
      display : true,
      routerState: 'private-trunk-overview',
      service: 'cisco-uc',
    }, FusionClusterStatesService);
  }
}
