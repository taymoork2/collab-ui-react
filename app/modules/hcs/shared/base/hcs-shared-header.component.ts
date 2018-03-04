interface IHeaderTab {
  title: string;
  state: string;
}

class HcsSharedHeaderComponentCtrl implements ng.IComponentController {
  public tabs: IHeaderTab[] = [];
  public title: string = this.$translate.instant('hcs.cardTitle');
  public back: boolean = true;
  public backState: string = 'partner-services-overview';

  /* @ngInject */
  constructor(
    private FeatureToggleService,
    private $translate: ng.translate.ITranslateService,
  ) { }

  public $onInit(): void {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHostedCloudService)
      .then(enabled => {
        if (enabled) {
          this.tabs.push({
            title: this.$translate.instant('hcs.inventory.title'),
            state: 'hcs.shared.inventory',
          }, {
            title: this.$translate.instant('hcs.installFiles.title'),
            state: 'hcs.shared.installFiles',
          });
        }
      });
  }
}

export class HcsSharedHeaderComponent implements ng.IComponentOptions {
  public controller = HcsSharedHeaderComponentCtrl;
  public template = require('modules/hcs/shared/base/hcs-shared-header.component.html');
  public bindings = { };
}
