import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';
import { CardButton, CardType } from './ServicesOverviewCard';

export class ServicesOverviewHybridMediaCard extends ServicesOverviewHybridCard {
  getShowMoreButton():CardButton {
    return undefined;
  }

  private _setupButton:CardButton = {
    name: 'servicesOverview.genericButtons.setup',
    link: 'mediaservice',
    buttonClass: 'btn'
  };

  private _buttons:Array<CardButton> = [
    {name: 'servicesOverview.cards.hybridMedia.buttons.resources', link: 'mediaservice', buttonClass: 'btn-link'},
    {
      name: 'servicesOverview.cards.hybridMedia.buttons.settings',
      link: 'mediaservice/settings',
      buttonClass: 'btn-link'
    }];

  getButtons():Array<CardButton> {
    if (this.active)
      return _.take(this._buttons, 3);
    return [this._setupButton];
  }

  public constructor() {
    super({
      name: 'servicesOverview.cards.hybridMedia.title',
      description: 'servicesOverview.cards.hybridMedia.description',
      activeServices: ['squared-fusion-media'],
      statusServices: ['squared-fusion-media'],
      statusLink: 'mediaservice',
      active: false,
      cardClass: 'media',
      cardType: CardType.hybrid
    });
  }
}
