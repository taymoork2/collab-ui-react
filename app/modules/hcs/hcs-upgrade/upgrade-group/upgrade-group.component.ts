export interface IHeaderTab {
  title: string;
  state: string;
}

export interface ISoftwareVersionProfileOption {
  label: string;
  value: string;
}

export class UpgradeGroupComponent implements ng.IComponentOptions {
  public controller = UpgradeGroupCtrl;
  public template = require('./upgrade-group.component.html');
  public bindings = {
    customerId: '<',
  };
}

export class UpgradeGroupCtrl implements ng.IComponentController {
  public customerId: string;
  public customerName: string;
  public tabs: IHeaderTab[] = [];
  public back: boolean = true;
  public backState: string = 'hcs.shared.inventoryList';
  public softwareVersionProfiles: ISoftwareVersionProfileOption[];
  public softwareVersionSelected: ISoftwareVersionProfileOption;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit() {
    //get customer name from api
    this.customerName = 'Betty\'s Flower Shop';
    this.tabs.push({
      title: this.$translate.instant('hcs.clustersList.title'),
      state: `hcs.clusterList({customerId: '${this.customerId}'})`,
    }, {
      title: this.$translate.instant('hcs.upgradePage.title'),
      state: `hcs.upgradeGroup({customerId: '${this.customerId}'})`,
    });

    this.softwareVersionProfiles = [{
      label: 'template1',
      value: 't1',
    }, {
      label: 'template2',
      value: 't2',
    }];

    this.softwareVersionSelected = { label: 'template2', value: 't2' };
  }
}
