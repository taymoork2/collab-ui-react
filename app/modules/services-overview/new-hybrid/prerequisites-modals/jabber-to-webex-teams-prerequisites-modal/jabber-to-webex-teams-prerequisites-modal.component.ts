export class JabberToWebexTeamsPrerequisitesModalController implements ng.IComponentController {
  public dismiss: Function;

  /* @ngInject */
  constructor(
    private $window,
    private Analytics,
  ) {}

  public dismissModal(): void {
    this.Analytics.trackAddUsers(this.Analytics.eventNames.CANCEL_MODAL);
    this.dismiss();
  }

  public get hasPrereqs(): boolean {
    // TODO: (spark-14176): true or false based on whether all checkboxes are selected
    return this.$window.sessionStorage.getItem('spark14176.hasPrereqs') === 'true';
  }

  public nextOrFinish(): void {
    if (!this.hasPrereqs) {
      this.next();
      return;
    }
    this.finish();
  }

  private next(): void {
    // TODO (spark-14176): transition to add-a-profile step
  }

  private finish(): void {
    // TODO (spark-14176): dismiss modal + notify success/error
  }
}

export class JabberToWebexTeamsPrerequisitesModalComponent implements ng.IComponentOptions {
  public controller = JabberToWebexTeamsPrerequisitesModalController;
  public template = require('./jabber-to-webex-teams-prerequisites-modal.html');
  public bindings = {
    dismiss: '&',
  };
}
