interface IHeaderTab {
  title: string;
  state: string;
}

class CmcDetailsHeaderComponentCtrl implements ng.IComponentController {
  public tabs: IHeaderTab[] = [];
  public back: boolean = true;
  public backState: string = 'services-overview';

  /* @ngInject */
  constructor(
  ) { }

  public $onInit(): void {
    this.tabs.push({
      title: 'cmc.detailsPage.settings',
      state: 'cmc.settings',
    });
    this.tabs.push({
      title: 'cmc.detailsPage.status',
      state: 'cmc.status',
    });
  }
}

export class CmcDetailsHeaderComponent implements ng.IComponentOptions {
  public controller = CmcDetailsHeaderComponentCtrl;
  public templateUrl = 'modules/cmc/details/cmc-details-header.html';
  public bindings = { };
}
