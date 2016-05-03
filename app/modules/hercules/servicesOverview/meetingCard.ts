/// <reference path="ServicesOverviewCard.ts"/>
namespace servicesOverview {

  export class ServicesOverviewMeetingCard extends ServicesOverviewCard {
    private moreButton:CardButton = {name: 'servicesOverview.showMore', link: 'site-list', buttonClass:'btn-link'};

    getShowMoreButton():servicesOverview.CardButton {
      if (this._buttons.length > 3) {
        return this.moreButton;
      }
      return undefined;
    }

    private _buttons:Array<servicesOverview.CardButton> = [];

    getButtons():Array<servicesOverview.CardButton> {
      return _.take(this._buttons, 3);
    }

    public constructor() {
      super('modules/hercules/servicesOverview/serviceCard.tpl.html',
        'servicesOverview.cards.meeting.title', 'servicesOverview.cards.meeting.description', 'icon-circle-group', true, 'meetings');
    }

    public updateWebexSiteList(data:Array<{license:{siteUrl:string}}>) {
      // console.log("update site",data);
      if (!data) {
        this._loading = false;
        return
      }
      // console.log(data);
      _.forEach(data, (serviceFeature)=> {
        /* the data model isn't yet looked at, a full replace will be used
         let button:CardButton = _.find(this._buttons, {name: site.name});
         if (!button) {
         button = {name: site.name, link: site.link};
         this._buttons.push(button);
         } else {
         button.link = site.link;
         }*/

        //TODO pushing all items now, either update list, or replace when getting the data model or test data for this.
        this._buttons.push({name: serviceFeature.license.siteUrl, link: 'site-list', buttonClass:'btn-link'});
      });

      //done loading
      this._loading = false;
    }
  }
}
