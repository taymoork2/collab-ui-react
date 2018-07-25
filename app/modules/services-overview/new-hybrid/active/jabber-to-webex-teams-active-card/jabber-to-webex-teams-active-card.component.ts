import { JabberToWebexTeamsService } from 'modules/services-overview/new-hybrid/shared/jabber-to-webex-teams.service';

export class JabberToWebexTeamsActiveCardController implements ng.IComponentController {
  public hasAtLeastOneProfileSet = false;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private JabberToWebexTeamsService: JabberToWebexTeamsService,
  ) {}

  public $onInit() {
    this.JabberToWebexTeamsService.hasAnyJabberTemplate().then((hasAny) => {
      this.hasAtLeastOneProfileSet = hasAny;
    });
  }

  public manageProfiles(): void {
    this.$state.go('jabber-to-webex-teams.profiles');
  }

  public addProfile(): void {
    this.$state.go('jabber-to-webex-teams.modal.add-profile');
  }
}

export class JabberToWebexTeamsActiveCardComponent implements ng.IComponentOptions {
  public controller = JabberToWebexTeamsActiveCardController;
  public template = require('./jabber-to-webex-teams-active-card.html');
  public bindings = {};
}
