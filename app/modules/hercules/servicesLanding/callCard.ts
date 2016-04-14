/// <reference path="ServicesLandingCard.ts"/>
namespace servicesLanding {

  export class ServicesLandingCallCard extends ServicesLandingCard {
    // private moreButton:CardButton = {name: 'servicesLanding.showMore', link: ''};

    getShowMoreButton():servicesLanding.CardButton {
      // if (this._buttons.length > 3) {
      //   return this.moreButton;
      // }
      return undefined;
    }

    private _buttons:Array<servicesLanding.CardButton> = [
      {name: 'servicesLanding.cards.call.buttons.numbers', link: ''},
      {name: 'servicesLanding.cards.call.buttons.features', link: ''},
      {name: 'servicesLanding.cards.call.buttons.settings', link: ''}];

    getButtons():Array<servicesLanding.CardButton> {
      return _.take(this._buttons, 3);
    }

    public constructor() {
      super('modules/hercules/servicesLanding/serviceCard.tpl.html',
        'servicesLanding.cards.call.title', 'servicesLanding.cards.call.description', 'icon-circle-call', true, 'people');
    }

    public updateWebexSiteList(data:{data:Array<{name:String,link:String}>}) {
      if (!data || !data.data) {
        return
      }
      _.forEach(data.data, (site)=> {
        let button:CardButton = _.find(this._buttons, {name: site.name});
        if (!button) {
          button = {name: site.name, link: site.link};
          this._buttons.push(button);
        } else {
          button.link = site.link;
        }
      });
    }
  }
}
