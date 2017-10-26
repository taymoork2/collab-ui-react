import { LinkedSitesService } from './linked-sites.service';
import { IACSiteInfo, LinkingOriginator, LinkingOperation } from './account-linking.interface';

class LinkedSitesComponentCtrl implements ng.IComponentController {
  public gridOptions;
  public gridApi;
  public sitesInfo: IACSiteInfo[];

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private $state: ng.ui.IStateService,
    private $stateParams: any,
    private LinkedSitesService: LinkedSitesService,
    private FeatureToggleService,

) {
    this.$log.debug('LinkedSitesComponentCtrl constructor, stateParams:', this.$stateParams);
  }

  public $onInit = () => {
    this.$log.debug('LinkedSitesComponentCtrl $onInit');

    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasAccountLinkingPhase2).then( (feature) => {
      if (feature === false) {
        this.$log.warn('Illegal state');
      } else {
        this.LinkedSitesService.filterSites().then((sites: IACSiteInfo[]) => {
          this.$log.debug('sites', sites);
          if (sites.length > 0) {
            this.sitesInfo = sites;
            this.showWizardIfRequired(this.$stateParams.originator);
          } else {
            // TODO: Handle this case in the UI
            this.$log.warn('No linked sites');
          }
        });
      }
    });
  }

  // TODO: Find which situations the wizard should be shown and what site to use
  private showWizardIfRequired(originator: LinkingOriginator) {

    // TODO: Cannot just select the first on if multiple sites... Must detect the newest ???
    this.$log.warn('For now, just select the first site in ', this.sitesInfo);
    const selectedSiteInfo = this.sitesInfo[0];
    if (originator === LinkingOriginator.Banner) {
      this.$state.go('site-list.linked.details.wizard', { siteInfo: selectedSiteInfo, operation: LinkingOperation.New });
    } else if (originator !== LinkingOriginator.Menu) {
      this.$log.warn('Page was initiated from unknown originator.');
    }
  }

  public onSiteSelectedFn = (selectedSiteInfo) => {
    this.$log.debug('site selected:', selectedSiteInfo);
    this.$state.go('site-list.linked.details', { siteInfo: selectedSiteInfo, operation: LinkingOperation.New });
  }

  // private collectStatusInfo(linkedConferenceServices): IACSiteInfo[] {
  //   const data: IACSiteInfo[] = [];
  //   _.each(linkedConferenceServices, function (site) {
  //     const element: IACSiteInfo = {
  //       linkedSiteUrl: site.license.linkedSiteUrl,
  //       accountLinkingStatus: 'Unknown',
  //       usersLinked: 'Unknown',
  //     };
  //     data.push(element);
  //   });
  //   return data;
  // }

}

export class LinkedSitesComponent implements ng.IComponentOptions {

  /* @ngInject */
  constructor() {
  }

  public controller = LinkedSitesComponentCtrl;
  public template = require('./linked-sites.component.html');
  public bindings = { };
}
