import { USSService } from 'modules/hercules/services/uss.service';

class SipDestinationSettingsSectionComponentCtrl implements ng.IComponentController {
  public sipDomain: string;

  /* @ngInject */
  constructor(
    private Authinfo,
    private USSService: USSService,
  ) {}

  public $onInit() {
    this.getUSSData();
  }

  private getUSSData(): void {
    this.USSService.getOrg(this.Authinfo.getOrgId())
      .then(org => {
        this.sipDomain = org.sipDomain;
      });
  }
}

export class SipDestinationSettingsSectionComponent implements ng.IComponentOptions {
  public controller = SipDestinationSettingsSectionComponentCtrl;
  public template = require('./sip-destination-settings-section.component.html');
}
