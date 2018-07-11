export class JabberToWebexTeamsActiveCardController implements ng.IComponentController {

  /* @ngInject */
  constructor(
    private $window: ng.IWindowService,
    private $state: ng.ui.IStateService,
  ) {}

  public manageProfiles(): void {
    // TODO (spark-14176): implement jump to add/edit wizard
  }

  public addProfile(): void {
    this.$state.go('jabber-to-webex-teams.modal.add-profile');
  }

  // TODO (spark-14176): rm this method once back-end is hooked up and can start using appropriate service id
  public fakeHasAtLeastOneProfileSet(): boolean {
    return !_.isEmpty(JSON.parse(this.$window.sessionStorage.getItem('spark14176.ucManagerProfiles') || '[]'));
  }
}

export class JabberToWebexTeamsActiveCardComponent implements ng.IComponentOptions {
  public controller = JabberToWebexTeamsActiveCardController;
  public template = require('./jabber-to-webex-teams-active-card.html');
  public bindings = {};
}
