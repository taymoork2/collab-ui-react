class GmTdSites implements ng.IComponentController {

  public sites;
  public customerId: string;

  /* @ngInject */
  public constructor(
    private $stateParams,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
  ) {
    this.customerId = _.get(this.$stateParams, 'data.customerId', '');
    this.sites = _.get(this.$stateParams, 'data.currCbg.telephonyDomainSites');
  }

  public $onInit(): void {

    _.forEach(this.sites, (item) => {
      let resArr = _.words(item.siteUrl, /^[a-z][\w]+/g);
      item.globalSite = 'https://' + _.trim(item.siteUrl) + '/' + _.trim(resArr[0]) + '/globalcallin.php';
    });

    this.$state.current.data.displayName = this.$translate.instant('gemini.cbgs.field.totalSites');
  }
}

export class GmTdSitesComponent implements ng.IComponentOptions {
  public controller = GmTdSites;
  public templateUrl = 'modules/gemini/telephonyDomain/details/gmTdSites.html';
}
