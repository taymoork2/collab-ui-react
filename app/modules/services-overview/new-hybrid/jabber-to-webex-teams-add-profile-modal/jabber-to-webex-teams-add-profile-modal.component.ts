import { JabberProfileService } from 'modules/services-overview/shared/jabber-to-webex-teams.service';
import { Notification } from 'modules/core/notifications';

interface IData {
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
  private data: IData = {
    profileName: '',
    voiceServerDomainName: '',
    udsServerAddress: '',
    udsBackupServerAddress: '',
    allowUserEdit: false,
  };
  public backendType = '';
  public finishDisable: boolean = true;

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
    this.JabberProfileService.create(this.data.profileName, this.data.voiceServerDomainName, this.data.udsServerAddress, this.data.udsBackupServerAddress).then(() => {
      const ucManagerProfiles = _.toArray(JSON.parse(this.$window.sessionStorage.getItem('spark14176.ucManagerProfiles') || '[]'));
      ucManagerProfiles.push(this.data);
      this.$window.sessionStorage.setItem('spark14176.ucManagerProfiles', JSON.stringify(ucManagerProfiles));
      this.dismissModal();
      this.Notification.success('common.OK');
    }).catch(( reason: any ) => {
      this.Notification.errorResponse(reason);
    });
  }

  public get getBackendType(): string {
    return this.backendType;
  }

  public get isValidProfile(): boolean {
    if (_.isEmpty(_.trim(this.data.profileName))) {
      return false;
    }
    if (this.backendType === 'voiceServiceDomain') {
      return !_.isEmpty(_.trim(this.data.voiceServerDomainName));
    } else if (this.backendType === 'udsServer') {
      return !_.isEmpty(_.trim(this.data.udsServerAddress));
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
