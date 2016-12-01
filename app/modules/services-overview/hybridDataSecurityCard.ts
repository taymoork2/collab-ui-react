import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';
import { ICardButton, CardType } from './ServicesOverviewCard';

export class ServicesOverviewHybridDataSecurityCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private setupButton: ICardButton = {
    name: 'servicesOverview.genericButtons.setup',
    routerState: 'hds-settings',
    buttonClass: 'btn btn--primary',
  };

  private buttons: Array<ICardButton> = [{
    name: 'servicesOverview.cards.hybridDataSecurity.buttons.resources',
    routerState: 'hds-settings',
    buttonClass: 'btn-link',
  }, {
    name: 'servicesOverview.cards.hybridDataSecurity.buttons.settings',
    routerState: 'hds-settings',
    buttonClass: 'btn-link',
  }];

  public getButtons(): Array<ICardButton> {
    if (this.active) {
      return this.buttons;
    }
    return [this.setupButton];
  }

  public hybridDataSecurityToggleEventHandler(hasFeature: boolean) {
    this.display = hasFeature;
  }

  /* @ngInject */
  public constructor(FusionClusterStatesService) {
    super({
      active: false,
      cardClass: 'media',
      cardType: CardType.hybrid,
      description: 'servicesOverview.cards.hybridDataSecurity.description',
      display : false,
      name: 'servicesOverview.cards.hybridDataSecurity.title',
      routerState: 'hds-settings',
      service: 'hybrid-data-security',
      template: 'modules/services/card.tpl.html',
    }, FusionClusterStatesService);
  }
}
