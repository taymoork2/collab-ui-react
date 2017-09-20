interface IHeaderTab {
  title: string;
  state: string;
}

class CmcDetailsHeaderComponentCtrl implements ng.IComponentController {
  public tabs: IHeaderTab[] = [];
  public back: boolean = true;
  public backState = 'services-overview';

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) { }

  public $onInit(): void {
    this.tabs.push({
      title: this.$translate.instant('cmc.detailsPage.settings'),
      state: 'cmc.settings',
    });
    this.tabs.push({
      title: this.$translate.instant('cmc.detailsPage.status'),
      state: 'cmc.status',
    });
  }
}

export class CmcDetailsHeaderComponent implements ng.IComponentOptions {
  public controller = CmcDetailsHeaderComponentCtrl;
  public template = require('modules/cmc/details/cmc-details-header.html');
  public bindings = { };
}
