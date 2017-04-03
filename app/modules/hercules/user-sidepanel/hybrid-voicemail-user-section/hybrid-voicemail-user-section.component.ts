import { UCCService } from 'modules/hercules/services/ucc-service';

class HybridVoicemailUserSectionCtrl implements ng.IComponentController {

  public isFeatureToggled: boolean = false;
  public callServiceConnectEnabledForUser: boolean;
  public voicemailEnabledForUser: boolean;
  public pilotNumber: number;
  public mwiStatus: boolean;
  private isEnabledOrgWide: boolean;
  private userId: string;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private FeatureToggleService,
    private UCCService: UCCService,
  ) { }

  public $onInit() {
    this.isEnabledOrgWide = false;
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridVoicemail)
      .then((enabled) => {
        if (enabled) {
          this.isFeatureToggled = true;
        }
      });
  }

  public $onChanges(): void {
    this.checkEnabledOrgWide();
  }

  public checkEnabledOrgWide(): void {
    this.UCCService.getOrgVoicemailConfiguration()
      .then((data) => {
        return this.isEnabledOrgWide = data.voicemailOrgEnableInfo.orgHybridVoicemailEnabled;
      })
      .then((isEnabled) => {
        if (isEnabled) {
          this.UCCService.getUserVoicemailInfo(this.userId)
            .then((data) => {
              this.pilotNumber = data.vmInfo.voicemailPilot;
              this.mwiStatus = data.vmInfo.mwiStatus;

            });
          this.voicemailEnabledForUser = this.callServiceConnectEnabledForUser;
        }
      });
  }

  public navigateToCallServiceSettings(): void {
    this.$state.go('call-service.settings');
  }

}

export class HybridVoicemailUserSectionComponent implements ng.IComponentOptions {
  public controller = HybridVoicemailUserSectionCtrl;
  public templateUrl = 'modules/hercules/user-sidepanel/hybrid-voicemail-user-section/hybrid-voicemail-user-section.html';
  public bindings = {
    callServiceConnectEnabledForUser: '<',
    userId: '<',
  };
}
