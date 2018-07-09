export class JabberToWebexTeamsInactiveCardController implements ng.IComponentController {
  public openSetUp(): void {
    // TODO (spark-14176): implement jump to setup wizard
  }
}

export class JabberToWebexTeamsInactiveCardComponent implements ng.IComponentOptions {
  public controller = JabberToWebexTeamsInactiveCardController;
  public template = require('./jabber-to-webex-teams-inactive-card.html');
  public bindings = {};
}
