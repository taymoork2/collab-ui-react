import { Notification } from 'modules/core/notifications/notification.service';
import { UCCService } from 'modules/hercules/services/ucc-service';
import { HybridVoicemailStatus } from 'modules/hercules/hybrid-services.types';
require('./_voicemail-settings.scss');

class HybridVoicemailCtrl implements ng.IComponentController {
  public isCallServiceConnectEnabled: boolean;
  public voicemailSection = {
    title: 'hercules.settings.voicemail.heading',
  };

  private voicemailToggle: boolean;
  private orgId: string;
  private voicemailStatus: string;
  private cssColor: string;
  private isLoading: boolean;

  /* @ngInject */
  constructor(
    private Notification: Notification,
    private UCCService: UCCService,
    private Authinfo,
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit() {
    this.orgId = this.Authinfo.getOrgId();
    this.UCCService.getOrgVoicemailConfiguration(this.orgId)
      .then((data) => {
        this.setVoiceMailStatus(data.voicemailOrgEnableInfo.orgVoicemailStatus);
        this.voicemailToggle = data.voicemailOrgEnableInfo.orgHybridVoicemailEnabled;
      })
      .catch((response) => {
        this.Notification.errorWithTrackingId(response, 'hercules.settings.voicemail.voicemailStatusError');
      });
  }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject}) {
    const { isCallServiceConnectEnabled } = changes;
    if (!isCallServiceConnectEnabled.currentValue) {
      this.voicemailToggle = false;
    }
  }

  private setVoiceMailStatus = (status: HybridVoicemailStatus) => {
    switch (status) {
      case 'NOT_CONFIGURED':
        this.cssColor = 'disabled';
        this.voicemailStatus = this.$translate.instant('hercules.settings.voicemail.voicemailStatusNotConfigured');
        break;
      case 'REQUESTED':
        this.cssColor = 'disabled';
        this.voicemailStatus = this.$translate.instant('hercules.settings.voicemail.voicemailStatusRequested');
        break;
      case 'HYBRID_SUCCESS':
        this.cssColor = 'success';
        this.voicemailStatus = this.$translate.instant('hercules.settings.voicemail.voicemailStatusHybridSuccess');
        break;
      case 'HYBRID_FAILED':
        this.cssColor = 'warning';
        this.voicemailStatus = this.$translate.instant('hercules.settings.voicemail.voicemailStatusHybridFailed');
        break;
      case 'HYBRID_PARTIAL':
        this.cssColor = 'danger';
        this.voicemailStatus = this.$translate.instant('hercules.settings.voicemail.voicemailStatusHybridPartial');
        break;
    }
  }

  public toggleVoicemail = (enableVoiceMail: boolean) => {
    this.isLoading = true;
    if (!enableVoiceMail) {
      this.UCCService.enableHybridVoicemail(this.orgId)
        .then((data) => {
          this.setVoiceMailStatus(data.voicemailOrgEnableInfo.orgVoicemailStatus);
          this.Notification.success('hercules.settings.voicemail.enableDescription');
        })
        .catch((response) => {
          this.voicemailToggle = !this.voicemailToggle;
          this.Notification.errorWithTrackingId(response, 'hercules.settings.voicemail.voicemailEnableError');
        })
        .finally(() => {
          this.isLoading = false;
        });
    } else {
      this.UCCService.disableHybridVoicemail(this.orgId)
        .then((data) => {
          this.setVoiceMailStatus(data.voicemailOrgEnableInfo.orgVoicemailStatus);
          this.Notification.success('hercules.settings.voicemail.disableDescription');
        }).catch((response) => {
          this.voicemailToggle = !this.voicemailToggle;
          this.Notification.errorWithTrackingId(response, 'hercules.settings.voicemail.voicemailDisableError');
        })
        .finally(() => {
          this.isLoading = false;
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
