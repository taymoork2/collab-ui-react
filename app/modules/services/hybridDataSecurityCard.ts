import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';
import { ICardButton, CardType } from './ServicesOverviewCard';

export interface IHdsCardButton {
  name: String;
  buttonClass?: String;
  routerState?: String;
  completed: boolean;
}

export class ServicesOverviewHybridDataSecurityCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }
  private _step = 3;

  private _clusterSetupModeButtons: Array<IHdsCardButton> = [
    {
      name: 'servicesOverview.cards.hybridDataSecurity.buttons.installSoftware',
      routerState: 'media-service-v2.settings',
      buttonClass: 'btn-link',
      completed: false,
    },
    {
      name: 'servicesOverview.cards.hybridDataSecurity.buttons.createCluster',
      routerState: 'media-service-v2.settings',
      buttonClass: 'btn-link',
      completed: false,
    },
    {
      name: 'servicesOverview.cards.hybridDataSecurity.buttons.registerNode',
      routerState: 'media-service-v2.settings',
      buttonClass: 'btn-link',
      completed: false,
    },
    {
      name: 'servicesOverview.cards.hybridDataSecurity.buttons.configureNode',
      routerState: 'media-service-v2.settings',
      buttonClass: 'btn-link',
      completed: false,
    },
    {
      name: 'servicesOverview.cards.hybridDataSecurity.buttons.addUsers',
      routerState: 'media-service-v2.settings',
      buttonClass: 'btn-link',
      completed: false,
    },
    ];

  private _clusterActiveModeButtons: Array<IHdsCardButton> = [
    {
      name: 'servicesOverview.cards.hybridDataSecurity.buttons.resources',
      routerState: 'media-service-v2.list',
      buttonClass: 'btn-link',
      completed: false,
    },
    {
      name: 'servicesOverview.cards.hybridDataSecurity.buttons.settings',
      routerState: 'media-service-v2.settings',
      buttonClass: 'btn-link',
      completed: false,
    },
  ];

  public getButtons(): Array<IHdsCardButton> {
    if (this.active) {
      return this._clusterActiveModeButtons;
    }
    this.enableButtons(this._clusterSetupModeButtons);
    return this._clusterSetupModeButtons;
  }

  private enableButtons(buttons: Array<IHdsCardButton>) {
    for (let i = 0; i < buttons.length; i++) {
      if (i !== this._step) {
          buttons[i].routerState = undefined;
      }
      if (i < this._step) {
          buttons[i].completed = true;
      }
    }
  }

  /* @ngInject */
  public constructor(FusionClusterStatesService) {
    super({
      template: 'modules/services/hdsCard.tpl.html',
      name: 'servicesOverview.cards.hybridDataSecurity.title',
      description: 'servicesOverview.cards.hybridDataSecurity.description',
      activeServices: ['hybrid-data-security'],
      statusService: 'hybrid-data-security',
      routerState: 'media-service-v2.list',
      active: false,
      display : false,
      cardClass: 'media',
      cardType: CardType.hybrid,
    }, FusionClusterStatesService);
  }
}
