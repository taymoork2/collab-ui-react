import { Notification } from 'modules/core/notifications';

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
    private Notification: Notification,
    private $modal,
    private PreviousState,
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
      const resArr = _.words(item.siteUrl, /^[a-z][\w]+/g);
      item.globalSite = 'https://' + _.trim(item.siteUrl) + '/' + _.trim(resArr[0]) + '/globalcallin.php';
    });

    this.$state.current.data.displayName = this.$translate.instant('gemini.cbgs.field.totalSites');
  }

  public onClick(site, targetTd) {
    this.$modal.open({
      type: 'dialog',
      template: require('modules/gemini/callbackGroup/details/moveSiteConfirm.tpl.html'),
    }).result.then(() => {
      this.moveSite(site, targetTd);
    });
  }

  private moveSite(site, targetTd) {
    this.showLoading = true;

    const data = {
      siteId: site.siteId,
      siteUrl: site.siteUrl,
      spCustomerId: this.customerId,
      targetCcaDomainId: targetTd.targetCcaDomainId,
      targetDomainName: targetTd.targetDomainName,
      sourceCcaDomainId: this.curTd.ccaDomainId,
      sourceDomainName: this.curTd.telephonyDomainName,
    };
    this.TelephonyDomainService.moveSite(data).then(() => {
      _.remove(this.sites, (obj: any) => {
        return obj.siteId === site.siteId;
      });
      this.$scope.$emit('detailWatch', { sitesLength: this.sites.length, isLoadingHistories: true });
      this.$scope.$emit('tdUpdated', {});
    }).catch((err) => {
      this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
    }).finally(() => {
      this.showLoading = false;
    });
  }

  public onCancel() {
    this.PreviousState.go();
  }

  private filterCurrentTD(): void {
    if (this.tds.length) {
      const curCcaDomainId = this.curTd.ccaDomainId;
      const curPrimaryBridgeId = this.curTd.primaryBridgeId;
      const curBackupBridgeId = this.curTd.backupBridgeId;

      _.remove(this.tds, (obj: any) => {
        return (obj.telephonyDomainId === null || obj.ccaDomainId === curCcaDomainId)
          || (obj.primaryBridgeId !== curPrimaryBridgeId) || (obj.backupBridgeId !== curBackupBridgeId);
      });
    }
  }
}

export class GmTdSitesComponent implements ng.IComponentOptions {
  public controller = GmTdSites;
  public template = require('modules/gemini/telephonyDomain/details/gmTdSites.html');
}
