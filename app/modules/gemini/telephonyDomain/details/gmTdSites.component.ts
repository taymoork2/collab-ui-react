class GmTdSites implements ng.IComponentController {

  public sites: any[];
  public curTd: any;
  public tds: any[];
  public customerId: string;
  public showLoading: boolean = false;

  /* @ngInject */
  public constructor(
    private $stateParams,
    private $state: ng.ui.IStateService,
    private $scope: ng.IScope,
    private $translate: ng.translate.ITranslateService,
    private $modal,
    private PreviousState,
    private Notification,
    private gemService,
    private TelephonyDomainService,
  ) {
    this.customerId = _.get(this.$stateParams, 'data.customerId', '');
    this.curTd = _.get(this.$stateParams, 'data.curTd', {});
    this.sites = _.get(this.$stateParams, 'data.curTd.telephonyDomainSites', []);
    this.tds = _.get(this.$stateParams, 'data.tds', []);
  }

  public $onInit(): void {
    this.filterCurrentTD();

    _.forEach(this.sites, (item) => {
      let resArr = _.words(item.siteUrl, /^[a-z][\w]+/g);
      item.globalSite = 'https://' + _.trim(item.siteUrl) + '/' + _.trim(resArr[0]) + '/globalcallin.php';
    });

    this.$state.current.data.displayName = this.$translate.instant('gemini.cbgs.field.totalSites');
  }

  public onClick(site, targetTd) {
    this.$modal.open({
      type: 'dialog',
      templateUrl: 'modules/gemini/callbackGroup/details/moveSiteConfirm.tpl.html',
    }).result.then(() => {
      this.moveSite(site, targetTd);
    });
  }

  private moveSite(site, targetTd) {
    this.showLoading = true;

    let data = {
      siteId: site.siteId,
      siteUrl: site.siteUrl,
      spCustomerId: this.customerId,
      targetCcaDomainId: targetTd.targetCcaDomainId,
      targetDomainName: targetTd.targetDomainName,
      sourceCcaDomainId: this.curTd.ccaDomainId,
      sourceDomainName: this.curTd.telephonyDomainName,
    };
    this.TelephonyDomainService.moveSite(data).then((res) => {
      this.showLoading = false;

      let resJson: any = _.get(res.content, 'data');
      if (resJson.returnCode) {
        this.Notification.notify(this.gemService.showError(resJson.returnCode));
        return;
      }
      _.remove(this.sites, (obj: any) => {
        return obj.siteId === site.siteId;
      });
      this.$scope.$emit('tdSitesUpdated', this.sites);
      this.$scope.$emit('tdUpdated', this.sites);
    });
  }

  public onCancel() {
    this.PreviousState.go();
  }

  private filterCurrentTD(): void {
    if (this.tds.length) {
      let curCcaDomainId = this.curTd.ccaDomainId;
      let curPrimaryBridgeId = this.curTd.primaryBridgeId;
      let curBackupBridgeId = this.curTd.backupBridgeId;
      let curWebDomainId = this.curTd.webDomainId;

      _.remove(this.tds, (obj: any) => {
        return (obj.ccaDomainId === curCcaDomainId) || (obj.primaryBridgeId !== curPrimaryBridgeId)
          || (obj.backupBridgeId !== curBackupBridgeId) || (obj.webDomainId !== curWebDomainId);
      });
    }
  }
}

export class GmTdSitesComponent implements ng.IComponentOptions {
  public controller = GmTdSites;
  public templateUrl = 'modules/gemini/telephonyDomain/details/gmTdSites.html';
}
