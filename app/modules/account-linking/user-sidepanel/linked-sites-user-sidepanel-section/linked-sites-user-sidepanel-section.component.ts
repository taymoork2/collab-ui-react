class LinkedSitesUserSidepanelSectionComponentCtrl implements ng.IComponentController {

  private linkedTrainSiteNames: string[];

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
  ) { }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { user } = changes;
    if (user && user.currentValue) {
      this.linkedTrainSiteNames = user.currentValue.linkedTrainSiteNames;
    }
  }

  public hasLinkedWebexSites(): boolean {
    return !_.isEmpty(this.linkedTrainSiteNames);
  }

  public numLinkedWebexSites(): number {
    return _.size(this.linkedTrainSiteNames);
  }

  public clickViewLinkedWebexSites() {
    if (!this.hasLinkedWebexSites()) {
      return;
    }
    this.$state.go('user-overview.linked-webex-sites');
  }

}

export class LinkedSitesUserSidepanelSectionComponent implements ng.IComponentOptions {
  public controller = LinkedSitesUserSidepanelSectionComponentCtrl;
  public template = require('./linked-sites-user-sidepanel-section.component.html');
  public bindings = {
    user: '<',
  };
}
