import { CardType, ICardButton, ServicesOverviewCard } from './ServicesOverviewCard';

export class ServicesOverviewCmcCard extends ServicesOverviewCard {

  private buttons: Array<ICardButton> = [{
    name: 'servicesOverview.cards.cmc.buttons.status',
    routerState: 'cmc.status',
    buttonClass: 'btn-link',
  }, {
    name: 'servicesOverview.cards.cmc.buttons.settings',
    routerState: 'cmc.settings',
    buttonClass: 'btn-link',
  }];

  public getButtons(): Array<ICardButton> {
    //$log.warn("this buttons", this.buttons)
    if (this.active) {
      return this.buttons;
    }
    return [];
  }
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  public constructor(Authinfo) {
    super({
      active: Authinfo.isAllowedState('cmc'),
      cardType: CardType.cmc,
      description: 'servicesOverview.cards.cmc.description',
      icon: 'icon-circle-mobile',
      name: 'servicesOverview.cards.cmc.title',
    });
    this.loading = false;
  }
}
