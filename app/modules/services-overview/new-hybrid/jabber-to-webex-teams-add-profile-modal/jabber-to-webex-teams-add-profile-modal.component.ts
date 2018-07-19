import { JabberProfileService } from 'modules/services-overview/new-hybrid/shared/jabber-to-webex-teams.service';
import { Notification } from 'modules/core/notifications';

enum BackendTypes {
  VOICE = 'voiceServiceDomain',
  UDS  = 'udsServer',
  NONE = 'none',
}

interface IUCManagerProfileData {
  profileName: string;
  voiceServerDomainName: string;
  udsServerAddress: string;
  udsBackupServerAddress: string;
  allowUserEdit: boolean;
}

export class JabberToWebexTeamsAddProfileModalController implements ng.IComponentController {
  public dismiss: Function;
  public errorMessages = {
    profileName: {
      required: this.$translate.instant('common.invalidRequired'),
    },
    voiceServerDomainName: {
      required: this.$translate.instant('common.invalidRequired'),
    },
  };
  private profileData: IUCManagerProfileData = {
    profileName: '',
    voiceServerDomainName: '',
    udsServerAddress: '',
    udsBackupServerAddress: '',
    allowUserEdit: false,
  };
  public backendType: BackendTypes = BackendTypes.NONE;
  public finishDisable: boolean = true;
  public BackendTypes = BackendTypes;

  /* @ngInject */
  constructor(
    private Analytics,
    private $translate: ng.translate.ITranslateService,
    private $window: ng.IWindowService,
    private JabberProfileService: JabberProfileService,
    private Notification: Notification,
  ) {}

  public dismissModal(): void {
    this.Analytics.trackAddUsers(this.Analytics.eventNames.CANCEL_MODAL);
    this.dismiss();
  }

  public checkAndFinish(): void {
    if (!this.isValidProfile) {
      return;
    }
    this.finish();
  }

  private finish(): void {
    this.JabberProfileService.create(this.profileData.profileName, this.profileData.voiceServerDomainName, this.profileData.udsServerAddress, this.profileData.udsBackupServerAddress).then(() => {
      const ucManagerProfiles = _.toArray(JSON.parse(this.$window.sessionStorage.getItem('spark14176.ucManagerProfiles') || '[]'));
      ucManagerProfiles.push(this.profileData);
      this.$window.sessionStorage.setItem('spark14176.ucManagerProfiles', JSON.stringify(ucManagerProfiles));
      this.dismissModal();
      this.Notification.success('common.OK');
    }).catch(( reason: any ) => {
      this.Notification.errorResponse(reason);
    });
  }

  public get isValidProfile(): boolean {
    if (_.isEmpty(_.trim(this.profileData.profileName))) {
      return false;
    }
    if (this.backendType === BackendTypes.VOICE) {
      return !_.isEmpty(_.trim(this.profileData.voiceServerDomainName));
    } else if (this.backendType === BackendTypes.UDS) {
      return !_.isEmpty(_.trim(this.profileData.udsServerAddress));
    }
    return false;
  }
}

export class JabberToWebexTeamsAddProfileModalComponent implements ng.IComponentOptions {
  public controller = JabberToWebexTeamsAddProfileModalController;
  public template = require('./jabber-to-webex-teams-add-profile-modal.html');
  public bindings = {
    dismiss: '&',
  };
}
