import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';
import { ICardButton, CardType } from './ServicesOverviewCard';

export class ServicesOverviewPrivateTrunkCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }
  private hasDomain: boolean;

  private _buttons: Array<ICardButton> = [{
    name: 'servicesOverview.cards.privateTrunk.buttons.view',
    buttonClass: 'btn btn--link btn--expand',
  }, {
    name: 'servicesOverview.genericButtons.setup',
    buttonClass: 'btn btn--primary',
  }];

  private _verifyDomain_buttons: Array<ICardButton> = [{
    name: 'servicesOverview.cards.privateTrunk.buttons.verify',
    buttonClass: 'btn btn--link btn--expand',
  }, {
    name: 'servicesOverview.genericButtons.setup',
    routerState: 'private-trunk-overview',
    buttonClass: 'btn btn--primary',
  }];

  public getButtons(): Array<ICardButton> {
    return this.hasDomain ? this._verifyDomain_buttons : this._buttons;
  }

  public privateTrunkFeatureToggleEventHandler(hasFeature: boolean): void {
    this.display = hasFeature;
  }

  public privateTrunkDomainEventHandler(hasDomain: boolean): void {
    this.hasDomain = hasDomain;
  }

  public openModal(): void {
    this.PrivateTrunkPrereqService.openModal();
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
    FusionClusterStatesService,

  ) {
    super({
      name: 'servicesOverview.cards.privateTrunk.title',
      description: 'servicesOverview.cards.privateTrunk.description',
      active: true,
      cardType: CardType.hybrid,
      cardClass: 'private-trunk-nodomain',
      display : true,
      routerState: 'private-trunk-overview',
      service: 'cisco-uc',
      template: 'modules/services-overview/privateTrunkCard.html',
    }, FusionClusterStatesService);
    this.hasDomain = false;
  }
}
