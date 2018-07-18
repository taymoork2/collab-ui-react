export class JabberToWebexTeamsInactiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
  ) {
  }

  public openSetUp(): void {
    this.$state.go('jabber-to-webex-teams.modal.confirm-prerequisites');
  }
}

export class JabberToWebexTeamsInactiveCardComponent implements ng.IComponentOptions {
  public controller = JabberToWebexTeamsInactiveCardController;
  public template = require('./jabber-to-webex-teams-inactive-card.html');
  public bindings = {};
}
