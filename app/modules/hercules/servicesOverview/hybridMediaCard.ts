import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';
import { ICardButton, CardType } from './ServicesOverviewCard';

export class ServicesOverviewHybridMediaCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _setupButton: ICardButton = {
    name: 'servicesOverview.genericButtons.setup',
    link: 'mediaserviceV2',
    buttonClass: 'btn',
  };

  private _buttons: Array<ICardButton> = [
    {
      name: 'servicesOverview.cards.hybridMedia.buttons.resources',
      link: 'mediaserviceV2',
      buttonClass: 'btn-link',
    },
    {
      name: 'servicesOverview.cards.hybridMedia.buttons.settings',
      link: 'mediaserviceV2/settings',
      buttonClass: 'btn-link',
    }];

  public getButtons(): Array<ICardButton> {
    if (this.active) {
      return _.take(this._buttons, 3);
    }
    return [this._setupButton];
  }

  public hybridMediaFeatureToggleEventHandler(hasFeature: boolean) {
    this._display = hasFeature;
  }

  public constructor(FusionClusterStatesService) {
    super({
      name: 'servicesOverview.cards.hybridMedia.title',
      description: 'servicesOverview.cards.hybridMedia.description',
      activeServices: ['squared-fusion-media'],
      statusService: 'squared-fusion-media',
      statusLink: 'mediaserviceV2',
      active: false,
      display : false,
      cardClass: 'media',
      cardType: CardType.hybrid,
    }, FusionClusterStatesService);
    this._loading = false;
  }
}
