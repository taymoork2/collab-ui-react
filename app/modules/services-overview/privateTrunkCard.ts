import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';
import { ICardButton, CardType } from './ServicesOverviewCard';

import { IPrivateTrunkResource } from 'modules/hercules/private-trunk/private-trunk-services/private-trunk';

export class ServicesOverviewPrivateTrunkCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }
  private hasDomain: boolean;
  private _buttons: ICardButton[] = [{
    name: 'servicesOverview.cards.privateTrunk.buttons.view',
    buttonClass: 'btn btn--link btn--expand',
    buttonState: 'prereq',
  }, {
    name: 'servicesOverview.genericButtons.setup',
    buttonClass: 'btn btn--primary',
    buttonState: 'prereq',
  }];

  private _activeButtons: ICardButton[] = [{
    name: 'servicesOverview.cards.privateTrunk.buttons.resources',
    routerState: 'private-trunk-overview.list',
    buttonClass: 'btn-link',
  }, {
    name: 'servicesOverview.cards.hybridCall.buttons.settings',
    routerState: 'private-trunk-overview.settings',
    buttonClass: 'btn-link',
  }];

  public getButtons(): ICardButton[] {
    if (this.active) {
      return this._activeButtons;
    } else {
      this._buttons[1].buttonState = this.hasDomain ? 'setup' : 'prereq';
    }
    return this._buttons;
  }

  public privateTrunkFeatureToggleEventHandler(hasFeature: boolean): void {
    this.display = hasFeature;
  }

  public privateTrunkDomainEventHandler(hasDomain: boolean): void {
    this.hasDomain = hasDomain;
  }

  public sipDestinationsEventHandler(destinationList: IPrivateTrunkResource[]): void {
    this.active = destinationList.length > 0;
    this.setupMode = !this.active;
  }

  public openModal(): void {
    this.PrivateTrunkPrereqService.openModal();
  }

  public openSetupModal(): void {
    if (this.hasDomain) {
      this.PrivateTrunkPrereqService.openSetupModal();
    } else {
      this.PrivateTrunkPrereqService.openModal();
    }
  }

  public hasVerifiedDomain(): boolean {
    return this.PrivateTrunkPrereqService.getVerifiedDomains().then(response => {
      this.hasDomain = response.length > 0;
    });
  }

  public $onInit() {
    this.hasVerifiedDomain();
  }

  /* @ngInject */
  public constructor(
    private PrivateTrunkPrereqService,
    HybridServicesClusterStatesService ) {
    super({
      name: 'servicesOverview.cards.privateTrunk.title',
      description: 'servicesOverview.cards.privateTrunk.description',
      active: false,
      cardType: CardType.hybrid,
      display : true,
      routerState: 'private-trunk-overview',
      service: 'ept',
      template: 'modules/services-overview/privateTrunkCard.html',
    }, HybridServicesClusterStatesService);
    this.hasDomain = false;
  }
}
