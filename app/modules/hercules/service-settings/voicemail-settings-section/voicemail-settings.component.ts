require('./_voicemail-settings.scss');

class HybridVoicemailCtrl implements ng.IComponentController {
  public isCallServiceConnectEnabled: boolean;
  public voicemailSection = {
    title: 'hercules.settings.voicemail.heading',
    };

 private voicemailToggle: boolean;
 private OrgId: string;

  /* @ngInject */
  constructor(
    private Notification,
    private UCCService,
    private Authinfo,
) {}

  public $onInit() {
    this.OrgId = this.Authinfo.getOrgId();
    this.UCCService.getOrgVoicemailConfiguration(this.OrgId).then((data) => {
      this.voicemailToggle = data.voicemailOrgEnableInfo.orgHybridVoicemailEnabled;
        }).catch((response) => {
      this.Notification.errorWithTrackingId(response, 'hercules.settings.voicemail.voicemailStatusError');
        });
  }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject}) {
    const { isCallServiceConnectEnabled } = changes;
    if (!isCallServiceConnectEnabled.currentValue) {
      this.voicemailToggle = false;
    }
  }

public toggleVoicemail = (enableVoiceMail: boolean) => {
  if (!enableVoiceMail) {
    this.UCCService.enableHybridVoicemail(this.OrgId).then(() => {
      this.Notification.success('hercules.settings.voicemail.enableDescription');
    }).catch((response) => {
      this.Notification.errorWithTrackingId(response, 'hercules.settings.voicemail.voicemailEnableError');
    });
  } else {
    this.UCCService.disableHybridVoicemail(this.OrgId).then(() => {
      this.Notification.success('hercules.settings.voicemail.disableDescription');
    }).catch((response) => {
      this.Notification.errorWithTrackingId(response, 'hercules.settings.voicemail.voicemailDisableError');
    });
  }
  }
}

class HybridVoicemailSectionComponent implements ng.IComponentOptions {
  public controller = HybridVoicemailCtrl;
  public templateUrl = 'modules/hercules/service-settings/voicemail-settings-section/voicemail-settings.html';
  public bindings = {
    isCallServiceConnectEnabled: '<',
  };
}

export default angular
  .module('Hercules')
  .component('hybridVoicemailSettings', new HybridVoicemailSectionComponent())
  .name;
