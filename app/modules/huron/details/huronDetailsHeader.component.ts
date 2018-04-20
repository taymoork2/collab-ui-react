import { Config } from 'modules/core/config/config';

interface IHeaderTab {
  title: string;
  state: string;
}

class HuronDetailsHeaderComponentCtrl implements ng.IComponentController {
  public tabs: IHeaderTab[] = [];
  public title: string = this.$translate.instant('huronDetails.title');
  public back: boolean = true;
  public backState: string = 'services-overview';

  /* @ngInject */
  constructor(
    private Authinfo,
    private Config: Config,
    private FeatureToggleService,
    private $translate: ng.translate.ITranslateService,
  ) { }

  public $onInit(): void {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484)
      .then(enabled => {
        if (enabled) {
          this.tabs.splice(0, 0, {
            title: this.$translate.instant('huronDetails.locationsTitle'),
            state: 'call-locations',
          });
        }
      });
    this.tabs.push({
      title: this.$translate.instant('huronDetails.linesTitle'),
      state: 'huronlines',
    });

    if (this.showFeatureTab()) {
      this.tabs.push({
        title: this.$translate.instant('huronDetails.featuresTitle'),
        state: 'huronfeatures',
      });
    }

    this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484)
      .then(enabled => {
        if (enabled) {
          this.tabs.push({
            title: this.$translate.instant('huronDetails.settingsTitle'),
            state: 'huronsettingslocation',
          });
        } else {
          this.tabs.push({
            title: this.$translate.instant('huronDetails.settingsTitle'),
            state: 'huronsettings',
          });
        }
      });
  }

  private showFeatureTab(): boolean {
    return this.Authinfo.getLicenses().filter(license => {
      return license.licenseType === this.Config.licenseTypes.COMMUNICATION;
    }).length > 0;
  }
}

export class HuronDetailsHeaderComponent implements ng.IComponentOptions {
  public controller = HuronDetailsHeaderComponentCtrl;
  public template = require('modules/huron/details/huronDetailsHeader.html');
  public bindings = { };
}
