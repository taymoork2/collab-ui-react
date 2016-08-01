import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';
import { CardButton, CardType } from './ServicesOverviewCard';

export class ServicesOverviewHybridManagementCard extends ServicesOverviewHybridCard {
  getShowMoreButton():CardButton {
    return undefined;
  }

  private _setupButton:CardButton = {
    name: 'servicesOverview.genericButtons.setup',
    link: 'services/expressway-management',
    buttonClass: 'btn'
  };

  private _buttons:Array<CardButton> = [
    {
      name: 'servicesOverview.cards.hybridManagement.buttons.resources',
      link: 'services/expressway-management',
      buttonClass: 'btn-link'
    },
    {
      name: 'servicesOverview.cards.hybridManagement.buttons.settings',
      link: 'services/expressway-management/settings',
      buttonClass: 'btn-link'
    }
  ];

  getButtons():Array<CardButton> {
    if (this.active) {
      return _.take(this._buttons, 3);
    }
    return [this._setupButton];
  }

  public f410FeatureEventHandler(hasFeature:boolean) {
    this._display = !hasFeature;
  }

  public constructor() {
    super({
      name: 'servicesOverview.cards.hybridManagement.title',
      description: 'servicesOverview.cards.hybridManagement.description',
      activeServices: ['squared-fusion-cal', 'squared-fusion-uc', 'squared-fusion-media'],
      statusServices: ['squared-fusion-mgmt'],
      statusLink: 'services/expressway-management',
      cardClass: '', cardType: CardType.hybrid
    });
  }
}

