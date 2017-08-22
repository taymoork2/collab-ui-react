import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';
import { ICardButton, CardType } from './ServicesOverviewCard';

export class ServicesOverviewHybridContextCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private setupButton: ICardButton = {
    name: 'servicesOverview.genericButtons.setup',
    routerState: 'context-resources',
    buttonClass: 'btn btn--primary',
  };

  private buttons: ICardButton[] = [{
    name: 'servicesOverview.cards.hybridContext.buttons.resources',
    routerState: 'context-resources',
    buttonClass: 'btn-link',
  }, {
    name: 'servicesOverview.cards.hybridContext.buttons.fields',
    routerState: 'context-fields',
    buttonClass: 'btn-link',
  }, {
    name: 'servicesOverview.cards.hybridContext.buttons.fieldsets',
    routerState: 'context-fieldsets',
    buttonClass: 'btn-link',
  }];

  public getButtons(): ICardButton[] {
    if (this.active) {
      return this.buttons;
    }
    return [this.setupButton];
  }

  /* @ngInject */
  public constructor(
    private Authinfo,
  ) {
    super({
      active: false,
      cardClass: 'context',
      cardType: CardType.hybrid,
      description: 'servicesOverview.cards.hybridContext.description',
      display : false,
      name: 'servicesOverview.cards.hybridContext.title',
      routerState: 'context-resources',
      serviceId: 'contact-center-context',
    });
    this.display = this.Authinfo.isContactCenterContext();
  }
}
