import { IExtendedStatusSummary, USSService } from 'modules/hercules/services/uss.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';

class Office365SettingsCtrl implements ng.IComponentController {
  public backState = 'services-overview';
  public userStatusesSummary: IExtendedStatusSummary[] = [];
  private subscribeStatusesSummary: any;

  private serviceId: HybridServiceId = 'squared-fusion-o365';

  /* @ngInject */
  constructor(
    private USSService: USSService,
  ) {}

  public $onInit() {
    this.extractSummary();
    this.subscribeStatusesSummary = this.USSService.subscribeStatusesSummary('data', this.extractSummary.bind(this));
  }

  public $onDestroy() {
    this.subscribeStatusesSummary.cancel();
  }

  public extractSummary() {
    this.userStatusesSummary = this.USSService.extractSummaryForAService([this.serviceId]);
  }
}

export class Office365SettingsPageComponent implements ng.IComponentOptions {
  public controller = Office365SettingsCtrl;
  public template = require('modules/hercules/office-365-settings/office-365-settings-page/office-365-settings-page.html');
}
