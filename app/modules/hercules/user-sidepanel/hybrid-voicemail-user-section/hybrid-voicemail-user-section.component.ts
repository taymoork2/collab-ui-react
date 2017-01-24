import { UCCService } from 'modules/hercules/services/ucc-service.ts';

class HybridVoicemailUserSectionCtrl implements ng.IComponentController {

  public isFeatureToggled: boolean = false;
  public callServiceConnectEnabledForUser: boolean;
  public pilotNumber: number;
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

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const { callServiceConnectEnabledForUser } = changes;
    if (callServiceConnectEnabledForUser && callServiceConnectEnabledForUser.currentValue) {
      this.checkEnabledOrgWide();
    }
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
            });
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
