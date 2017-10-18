export class WebExSiteBaseCtrl implements ng.IController {

  public tabs: any = [];

  /* @ngInject */
  constructor(private $stateParams,
              private $state,
  ) {

    if (this.$state.current.name === 'site-list') {
      this.$state.go('site-list.not-linked');
    }

    if (this.$stateParams.accountLinkingV2) {
      // TODO: i18n
      // Preliminary terminology:
      // 'Site Admin managed site' and 'Cisco Spark Control Hub managed site'
      this.tabs.push({
        title: 'Cisco Spark Control Hub managed site',
        state: 'site-list.not-linked',
      });
      this.tabs.push({
        title: 'Site Admin managed site',
        state: 'site-list.linked',
      });
    }
  }

}

angular.module('Core')
  .controller('WebExSiteBaseCtrl', WebExSiteBaseCtrl);
