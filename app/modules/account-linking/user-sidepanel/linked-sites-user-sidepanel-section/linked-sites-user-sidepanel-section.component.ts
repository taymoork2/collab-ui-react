import { FeatureToggleService } from 'modules/core/featureToggle/index';

class LinkedSitesUserSidepanelSectionComponentCtrl implements ng.IComponentController {

  private userId: string;
  private linkedTrainSiteNames: string[];
  public atlasAccountLinkingPhase2: boolean;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private FeatureToggleService: FeatureToggleService,
  ) { }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { user } = changes;
    if (user && user.currentValue) {
      this.userId = user.currentValue.id;
      this.linkedTrainSiteNames = user.currentValue.linkedTrainSiteNames;
    }
  }

  public $onInit() {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasAccountLinkingPhase2)
      .then((supported) => {
        this.atlasAccountLinkingPhase2 = supported;
      });
  }

  public haveLinkedWebexSites(): boolean {
    return !_.isEmpty(this.linkedTrainSiteNames);
  }

  public numberOfLinkedWebexSites(): number {
    return this.haveLinkedWebexSites() ? this.linkedTrainSiteNames.length : 0;
  }

  public clickViewLinkedWebexSites() {
    if (!this.haveLinkedWebexSites()) {
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
