/// <reference path="ServicesOverviewCard.ts"/>
namespace servicesOverview {

  export class ServicesOverviewMeetingCard extends ServicesOverviewCard {
    private moreButton:CardButton = {name: 'servicesOverview.showMore', link: 'site-list'};

    getShowMoreButton():servicesOverview.CardButton {
      if (this._buttons.length > 3) {
        return this.moreButton;
      }
      return undefined;
    }

    private _buttons:Array<servicesOverview.CardButton> = [
      {name: 'site 1', link: ''},
      {name: 'site 2', link: ''},
      {name: 'site 3', link: ''},
      {name: 'site 4', link: ''}];

    getButtons():Array<servicesOverview.CardButton> {
      return _.take(this._buttons, 3);
    }

    public constructor() {
      super('modules/hercules/servicesOverview/serviceCard.tpl.html',
        'servicesOverview.cards.meeting.title', 'servicesOverview.cards.meeting.description', 'icon-circle-group', true, 'meetings');
    }

    public updateWebexSiteList(data:{data:Array<{license:{siteUrl:string}}>}) {
      // console.log("update site",data);
      if (!data || !data.data) {
        this._loading = false;
        return
      }
      _.forEach(data.data, (site)=> {
        /* the data model isn't yet looked at, a full replace will be used
        let button:CardButton = _.find(this._buttons, {name: site.name});
        if (!button) {
          button = {name: site.name, link: site.link};
          this._buttons.push(button);
        } else {
          button.link = site.link;
        }*/

        //TODO pushing all items now, either update list, or replace when getting the data model or test data for this.
        this._buttons.push({name:site.siteUrl,link:site.siteUrl});
      });

      //done loading
      this._loading = false;
    }
  }
}
