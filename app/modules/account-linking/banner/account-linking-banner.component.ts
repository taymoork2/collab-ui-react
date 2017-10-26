import { LinkingOriginator } from './../account-linking.interface';

const OVERVIEW_STATE: string = 'overview';

class AccountLinkingBannerComponentCtrl implements ng.IComponentController {

  public showBanner: boolean = false;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    // private $scope: ng.IScope,
    private $rootScope: ng.IRootScopeService,
    private Authinfo,
  ) {
  }

  public $onInit() {
    this.showBanner = (this.$state.current.name === OVERVIEW_STATE && this.hasLinkedSites());
    this.$rootScope.$on('$stateChangeStart', (_evt, toState, _toParams, _fromState, _fromParams) => {
      if (toState.name === OVERVIEW_STATE) {
        this.showBanner = this.hasLinkedSites();
      } else {
        this.showBanner = false;
      }
    });
  }

  public bannerClicked() {
    this.showBanner = false;
    this.$state.go('site-list.linked', { originator: LinkingOriginator.Banner }, { reload: false });
  }

  private hasLinkedSites(): boolean {
    const hasLinkedSites = this.Authinfo.getConferenceServicesWithLinkedSiteUrl();
    return !!hasLinkedSites && hasLinkedSites.length > 0;
  }
}

export class AccountLinkingBannerComponent implements ng.IComponentOptions {

  /* @ngInject */
  constructor() {
  }

  public controller = AccountLinkingBannerComponentCtrl;
  public template = require('modules/account-linking/banner/account-linking-banner.component.html');

  public bindings = {
  };
}
