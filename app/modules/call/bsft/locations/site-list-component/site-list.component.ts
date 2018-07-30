import { ILicenseInfo, ISite } from 'modules/call/bsft/shared';

export class BsftSiteListComponent implements ng.IComponentOptions {
  public controller = BsftSiteListCtrl;
  public template = require('modules/call/bsft/locations/site-list-component/site-list.component.html');
  public bindings = {
    isDetailed: '<',
    getSites: '&',
    getLicensesInfo: '&',
    cardSelected: '&',
    removeSite: '&',
  };
}

class BsftSiteListCtrl implements ng.IComponentController {
  public getSites: Function;
  public cardSelected: Function;
  public removeSite: Function;
  public getLicensesInfo: Function;
  public siteList: ISite[] = [];
  public standardLicense: ILicenseInfo;
  public placesLicense: ILicenseInfo;

  /* @ngInject */
  constructor() {}

  public $onInit() {
    const licenses = this.getLicensesInfo();
    this.standardLicense = _.find(licenses, { name : 'standard' });
    this.placesLicense = _.find(licenses, { name : 'places' });
    this.siteList = this.getSites();
  }

  public closeCard(site: ISite, $event: Event) {
    $event.preventDefault();
    $event.stopImmediatePropagation();
    this.removeSite({ site : site });
  }

  public selectCard(site: ISite) {
    this.cardSelected({ site : site });
  }
}
