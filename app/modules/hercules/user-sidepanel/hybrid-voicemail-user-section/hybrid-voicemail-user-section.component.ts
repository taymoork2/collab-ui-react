import { UCCService } from '../../services/ucc-service';
class HybridVoicemailUserSectionCtrl implements ng.IComponentController {

  public callServiceConnectEnabledForUser: boolean;
  public pilotNumber: number;
  private isEnabledOrgWide: boolean;
  private userId: string;

  /* @ngInject */
  constructor(
    private UCCService: UCCService,
  ) { }

  public $onInit() {
    this.isEnabledOrgWide = false;
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

}

export class HybridVoicemailUserSectionComponent implements ng.IComponentOptions {
  public controller = HybridVoicemailUserSectionCtrl;
  public templateUrl = 'modules/hercules/user-sidepanel/hybrid-voicemail-user-section/hybrid-voicemail-user-section.html';
  public bindings = {
    callServiceConnectEnabledForUser: '<',
    userId: '<',
  };
}
