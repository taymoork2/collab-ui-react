import { UCCService, IVmInfo, IVoicemailOrgEnableInfo } from 'modules/hercules/services/ucc-service';
import { Notification } from 'modules/core/notifications/notification.service';

interface IUserVoiceMailInfo {
  mwiStatus: boolean;
  voicemailPilot: string;
}

class HelpDeskHybridVoicemailUserInfoComponentCtrl implements ng.IComponentController {

  private orgId: string;
  private userId: string;
  public entitled: boolean;
  public visible: boolean = false;
  public status: string;
  public mwi: boolean;
  public pilot: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private Notification: Notification,
    private UCCService: UCCService,
  ) { }

  public $onInit() {

    if (!this.entitled) {
      return;
    }

    this.isOrgHybridVoicemailEnabled()
      .then((isEnabled) => {
        if (!isEnabled) {
          this.status = this.$translate.instant('helpdesk.hybridVoicemail.orgNotEnabled');
        } else {
          this.getUserVoicemailInfo()
            .then((data: IUserVoiceMailInfo) => {
              this.visible = true;
              this.mwi = data.mwiStatus;
              this.pilot = data.voicemailPilot;
              this.status = this.entitled ? this.$translate.instant('common.on') : this.$translate.instant('common.off');
            });
        }
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'helpdesk.hybridVoicemail.cannotReadStatus');
      });
  }

  public isOrgHybridVoicemailEnabled(): ng.IPromise<boolean> {
    return this.UCCService.getOrgVoicemailConfiguration(this.orgId)
      .then((data: IVoicemailOrgEnableInfo) => {
        return data.voicemailOrgEnableInfo.orgHybridVoicemailEnabled;
      });
  }

  public getUserVoicemailInfo(): ng.IPromise<IUserVoiceMailInfo> {
    return this.UCCService.getUserVoicemailInfo(this.userId, this.orgId)
      .then((data: IVmInfo) => {
        return {
          mwiStatus: data.vmInfo.mwiStatus,
          voicemailPilot: data.vmInfo.voicemailPilot,
        };
      });
  }

}

export class HelpDeskHybridVoicemailUserInfoComponent implements ng.IComponentOptions {
  public controller = HelpDeskHybridVoicemailUserInfoComponentCtrl;
  public templateUrl = 'modules/squared/helpdesk/components/hybrid-voicemail-user-info/help-desk-hybrid-voicemail-user-info.component.html';
  public bindings = {
    orgId: '<',
    userId: '<',
    entitled: '<',
  };
}
