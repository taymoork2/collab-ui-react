import { IWebexSite } from 'modules/core/siteList/shared/site.interface';
import { SiteListService } from 'modules/core/siteList/shared/site-list.service';

class SiteDetailComponentCtrl implements ng.IComponentController {
  public selectedSite: IWebexSite;
  public onDelete: Function;
  public onRedistribute: Function;

  public canManage: boolean;
  public isEnterpriseSubscription: boolean;
  public get hasError(): boolean {
    return this.selectedSite.isError;
  }
  public get showErrorAuth(): boolean {
    return this.hasError && this.selectedSite.isWarn;
  }
  public get showErrorSystem(): boolean {
    return this.hasError && !this.selectedSite.isWarn;
  }
  public get showCIConfigure(): boolean {
    return this.selectedSite.isCI;
  }
  public get showDelete(): boolean {
    // show up regardless of ci flag
    return this.canManage && this.isEnterpriseSubscription && !this.selectedSite.isPending;
  }
  public get showManagementFeatures(): boolean {
    return this.selectedSite.isCI;
  }
  public get showNonCIConfigure(): boolean {
    return !this.selectedSite.isCI && !this.selectedSite.isPending;
  }
  public get showPendingAction(): boolean {
    return this.canManage && this.selectedSite.isPending;
  }
  public get showRedistribute(): boolean {
    // show up regardless of ci flag
    return this.canManage && this.isEnterpriseSubscription && !this.selectedSite.isPending;
  }
  public get showReports(): boolean {
    return this.selectedSite.isAdminReportEnabled && !this.hasError;
  }
  public get showReportsDisabled(): boolean {
    return !this.hasError && !this.selectedSite.isAdminReportEnabled;
  }

  /* @ngInject */
  constructor(
    private SiteListService: SiteListService,
  ) {
  }

  public $onInit() {
    this.canManage = this.SiteListService.canManageSite(this.selectedSite.siteUrl);
    this.isEnterpriseSubscription = this.SiteListService.isSubscriptionEnterprise(this.selectedSite.license);
  }

  public deleteSite(): void {
    this.onDelete({ license: this.selectedSite.license });
  }

  public redistributeLicenses(): void {
    this.onRedistribute({ license: this.selectedSite.license });
  }

}

export class SiteDetailComponent implements ng.IComponentOptions {

  public controller = SiteDetailComponentCtrl;
  public template = require('./site-detail.html');
  public bindings = {
    selectedSite: '<',
    onDelete: '&',
    onRedistribute: '&',
  };
}
