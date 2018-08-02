import { JabberToWebexTeamsService } from 'modules/services-overview/new-hybrid/shared/jabber-to-webex-teams.service';
import { Notification } from 'modules/core/notifications';
import { EventNames } from 'modules/services-overview/new-hybrid/shared/jabber-to-webex-teams.types';

enum BackendTypes {
  VOICE = 'voiceServiceDomain',
  UDS  = 'udsServer',
}

interface IUCManagerProfileData {
  profileName: string;
  voiceServerDomainName: string;
  udsServerAddress: string;
  udsBackupServerAddress: string;
  allowUserEdit: boolean;
}

export class JabberToWebexTeamsAddProfileModalController implements ng.IComponentController {
  public readonly MIN_LENGTH = 4;
  public readonly MAX_LENGTH = 128;
  public dismiss: Function;
  public errorMessages = {
    profileName: {
      required: this.$translate.instant('common.invalidRequired'),
      minlength: this.$translate.instant('common.invalidMinLength', {
        min: this.MIN_LENGTH,
      }),
      maxlength: this.$translate.instant('common.invalidMaxLength', {
        max: this.MAX_LENGTH,
      }),
    },
    voiceServerDomainName: {
      required: this.$translate.instant('common.invalidRequired'),
      minlength: this.$translate.instant('common.invalidMinLength', {
        min: this.MIN_LENGTH,
      }),
      maxlength: this.$translate.instant('common.invalidMaxLength', {
        max: this.MAX_LENGTH,
      }),
    },
    udsServerAddress: {
      required: this.$translate.instant('common.invalidRequired'),
      minlength: this.$translate.instant('common.invalidMinLength', {
        min: this.MIN_LENGTH,
      }),
      maxlength: this.$translate.instant('common.invalidMaxLength', {
        max: this.MAX_LENGTH,
      }),
    },
    udsBackupServerAddress: {
      minlength: this.$translate.instant('common.invalidMinLength', {
        min: this.MIN_LENGTH,
      }),
      maxlength: this.$translate.instant('common.invalidMaxLength', {
        max: this.MAX_LENGTH,
      }),
    },
  };
  public profileData: IUCManagerProfileData = {
    profileName: '',
    voiceServerDomainName: '',
    udsServerAddress: '',
    udsBackupServerAddress: '',
    allowUserEdit: false,
  };
  public backendType: BackendTypes = BackendTypes.VOICE;
  public finishDisable: boolean = true;
  public BackendTypes = BackendTypes;
  public addProfileForm: ng.IFormController;
  public savingProfile = false;

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private $window: ng.IWindowService,
    private Analytics,
    public JabberToWebexTeamsService: JabberToWebexTeamsService,
    private Notification: Notification,
  ) {}

  public dismissModal(): void {
    this.Analytics.trackAddUsers(this.Analytics.eventNames.CANCEL_MODAL);
    this.dismiss();
  }

  public checkAndFinish(): void {
    if (!this.addProfileForm.$valid) {
      return;
    }
    this.finish();
  }

  public finish(): void {
    this.savingProfile = true;
    this.JabberToWebexTeamsService.hasAllPrereqsSettingsDone().then((isDone) => {
      if (!isDone) {
        return this.JabberToWebexTeamsService.savePrereqsSettings({ allPrereqsDone: false });
      }
    }).then(() => {
      return this.JabberToWebexTeamsService.create(this.profileData).then(() => {
        // TODO : 'spark14176.ucManagerProfiles' logic should be removed after the CI service is fullly coded
        const ucManagerProfiles = _.toArray(JSON.parse(this.$window.sessionStorage.getItem('spark14176.ucManagerProfiles') || '[]'));
        ucManagerProfiles.push(this.profileData);
        this.$window.sessionStorage.setItem('spark14176.ucManagerProfiles', JSON.stringify(ucManagerProfiles));
        this.$rootScope.$emit(EventNames.PROFILES_UPDATED);
        this.Notification.success('common.OK');
        this.$state.go('services-overview', {}, { reload: true });
        return this;
      });
    }).catch((response) => {
      this.Notification.errorResponse(response);
    }).finally(() => {
      this.savingProfile = false;
    });
  }
}

export class JabberToWebexTeamsAddProfileModalComponent implements ng.IComponentOptions {
  public controller = JabberToWebexTeamsAddProfileModalController;
  public template = require('./jabber-to-webex-teams-add-profile-modal.html');
  public bindings = {
    dismiss: '&',
  };
}
