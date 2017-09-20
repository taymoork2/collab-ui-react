import { ServicesOverviewHybridCard } from './services-overview-hybrid-card';
import { ICardButton, CardType } from '../shared/services-overview-card';

import { IPrivateTrunkResource } from 'modules/hercules/private-trunk/private-trunk-services/private-trunk';
import { PrivateTrunkPrereqService } from 'modules/hercules/private-trunk/private-trunk-prereq';

// TODO: refactor - do not use 'ngtemplate-loader' or ng-include directive
const privateTrunkCardTemplatePath = require('ngtemplate-loader?module=Hercules!./private-trunk-card.html');

export class ServicesOverviewPrivateTrunkCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): undefined {
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
    this.PrivateTrunkPrereqService.openPreReqModal();
  }

  public openSetupModal(): void {
    if (this.hasDomain) {
      this.PrivateTrunkPrereqService.openSetupModal();
    } else {
      this.PrivateTrunkPrereqService.openPreReqModal();
    }
  }

  public hasVerifiedDomain(): ng.IPromise<void> {
    return this.PrivateTrunkPrereqService.getVerifiedDomains().then(domains => {
      this.hasDomain = domains.length > 0;
    });
  }

  public $onInit() {
    // Note: already checked with privateTrunkDomainEventHandler() :/
    this.hasVerifiedDomain();
  }

  /* @ngInject */
  public constructor(
    private PrivateTrunkPrereqService: PrivateTrunkPrereqService,
  ) {
    super({
      name: 'servicesOverview.cards.privateTrunk.title',
      description: 'servicesOverview.cards.privateTrunk.description',
      active: false,
      cardType: CardType.hybrid,
      display : true,
      routerState: 'private-trunk-overview',
      serviceId: 'ept',
      template: privateTrunkCardTemplatePath,
    });
    this.hasDomain = false;
  }
}
