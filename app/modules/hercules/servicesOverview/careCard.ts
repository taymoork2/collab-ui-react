import { ServicesOverviewCard, CardButton } from './ServicesOverviewCard';

export class ServicesOverviewCareCard extends ServicesOverviewCard {

  getShowMoreButton():CardButton {
    return undefined;
  }

  private _buttons:Array<CardButton> = [
    {name: 'servicesOverview.cards.care.buttons.features', link: 'careDetails/features', buttonClass: 'btn-link'},
    {name: 'servicesOverview.cards.care.buttons.settings', link: 'careDetails/settings', buttonClass: 'btn-link'}];

  getButtons():Array<CardButton> {
    if (this.active) {
      return _.take(this._buttons, 3);
    }
    return [];
  }

  public constructor(Authinfo) {
    super({
      name: 'servicesOverview.cards.care.title',
      description: 'servicesOverview.cards.care.description',
      icon: 'icon-circle-contact-centre',
      active: Authinfo.isAllowedState('care'),
      cardClass: 'care-bar'
    });
    this._loading = false;
  }
}
