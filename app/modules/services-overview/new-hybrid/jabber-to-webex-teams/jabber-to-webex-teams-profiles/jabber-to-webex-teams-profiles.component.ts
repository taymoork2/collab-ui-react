import { JabberToWebexTeamsService } from 'modules/services-overview/new-hybrid/shared/jabber-to-webex-teams.service';
import { IUcManagerProfile, EventNames } from 'modules/services-overview/new-hybrid/shared/jabber-to-webex-teams.types';
import { IToolkitModalService, IToolkitModalSettings } from 'modules/core/modal';
import { Notification } from 'modules/core/notifications';
export class JabberToWebexTeamsProfilesController implements ng.IComponentController {

  public profiles: IUcManagerProfile[];
  private updateHandler: Function;
  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private JabberToWebexTeamsService: JabberToWebexTeamsService,
    private ModalService: IToolkitModalService,
    private Notification: Notification,
  ) { }

  public $onInit() {
    this.retrieveProfiles();
    this.updateHandler = this.$rootScope.$on(EventNames.PROFILES_UPDATED, () => this.retrieveProfiles());
  }

  public $onDestroy() {
    this.updateHandler();
  }

  public editProfile(profile: IUcManagerProfile): void {
    //algendel TODO: this needs to be updated for edit profile to pass the needed data
    this.$state.go('jabber-to-webex-teams.modal.edit-profile', { profileData: profile });
  }

  public addProfile(): void {
    this.$state.go('jabber-to-webex-teams.modal.add-profile');
  }

  public deleteProfile(profile: IUcManagerProfile): void {
    const options: IToolkitModalSettings = {
      close: this.$translate.instant('common.yes'),
      dismiss: this.$translate.instant('common.no'),
      hideDismiss: false,
      hideTitle: false,
      message: this.$translate.instant('jabberToWebexTeams.profileList.deleteBody', { templateName: profile.templateName }),
      title: this.$translate.instant('jabberToWebexTeams.profileList.deleteTitle'),
      type: 'dialog',
    };
    this.ModalService.open(options).result.then(() => {
      this.JabberToWebexTeamsService.deleteUcManagerProfile(profile.id)
        .then(() => {
          //algendel TODO: replace with appropriate copy
          this.Notification.success('common.OK');
          this.retrieveProfiles();
        })
        .catch(error => this.Notification.errorResponse(error));
    });
  }

  private retrieveProfiles(): ng.IPromise<void> {
    return this.JabberToWebexTeamsService.listUcManagerProfiles().then(result => {
      this.profiles = _.sortBy(result, profile => profile.templateName.toUpperCase());
    });
  }
}

export class JabberToWebexTeamsProfilesComponent implements ng.IComponentOptions {
  public controller = JabberToWebexTeamsProfilesController;
  public template = require('./jabber-to-webex-teams-profiles.html');
  public bindings = {};
}
