import { ServicesOverviewHybridCard } from './services-overview-hybrid-card';
import { ICardButton, CardType } from '../shared/services-overview-card';
import { Config } from 'modules/core/config/config';

export class ServicesOverviewHybridMediaCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private setupButton: ICardButton = {
    name: 'servicesOverview.genericButtons.setup',
    routerState: 'media-service-v2.list',
    buttonClass: 'btn btn--primary',
  };

  private buttons: ICardButton[] = [{
    name: 'servicesOverview.cards.hybridMedia.buttons.resources',
    routerState: 'media-service-v2.list',
    buttonClass: 'btn-link',
  }, {
    name: 'servicesOverview.cards.hybridMedia.buttons.settings',
    routerState: 'media-service-v2.settings',
    buttonClass: 'btn-link',
  }];

  public getButtons(): ICardButton[] {
    if (this.active) {
      return this.buttons;
    }
    return [this.setupButton];
  }

  private hybridMediaRoleCheckEventHandler() {
    const hasRequiredRoles = _.includes(this.Authinfo.getRoles(), this.Config.roles.full_admin) ||
      _.includes(this.Authinfo.getRoles(), this.Config.roles.readonly_admin);
    this.display = hasRequiredRoles && this.Authinfo.isFusionMedia();
  }

  /* @ngInject */
  public constructor(
    private Authinfo,
    private Config: Config,
  ) {
    super({
      active: false,
      cardClass: 'media',
      cardType: CardType.hybrid,
      description: 'servicesOverview.cards.hybridMedia.description',
      display : false,
      name: 'servicesOverview.cards.hybridMedia.title',
      routerState: 'media-service-v2.list',
      serviceId: 'squared-fusion-media',
    });
    this.hybridMediaRoleCheckEventHandler();
  }
}
