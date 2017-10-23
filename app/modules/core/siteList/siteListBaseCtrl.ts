export class WebExSiteBaseCtrl implements ng.IController {

  public tabs: any = [];

  /* @ngInject */
  constructor(private accountLinkingPhase2,
              private $state,
  ) {

    if (this.$state.current.name === 'site-list') {
      this.$state.go('site-list.not-linked');
    }

    if (this.accountLinkingPhase2) {
      // TODO: i18n
      // Preliminary terminology:
      // 'Site Admin managed site' and 'Cisco Spark Control Hub managed site'
      this.tabs.push({
        title: 'webexSiteListTabs.notLinkedSites',
        state: 'site-list.not-linked',
      });
      this.tabs.push({
        title: 'webexSiteListTabs.linkedSites',
        state: 'site-list.linked',
      });
    }
  }

}

angular.module('Core')
  .controller('WebExSiteBaseCtrl', WebExSiteBaseCtrl);
