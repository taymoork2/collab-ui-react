import { IWebexSite } from 'modules/core/siteList/shared/site.interface';
import { SiteListService } from 'modules/core/siteList/shared/site-list.service';

class SiteDetailComponentCtrl implements ng.IComponentController {
  public selectedSite: IWebexSite;
  public onDelete: Function;
  public onRedistribute: Function;

  public canManage: boolean;
  public isEnterpriseSubscription: boolean;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
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

  public get csvStatus(): string {
    return _.get(this.selectedSite.csvStatusObj, 'status', '');
  }

  public get hasError(): boolean {
    return this.selectedSite.isError;
  }

  public get hasInProgress(): boolean {
    const validStatus = ['exportInProgress', 'importInProgress'];

    return _.includes(validStatus, this.csvStatus);
  }

  public get inProgressLabel(): string {
    const labels = {
      exportInProgress: 'siteList.siteCsvExportInProgressLinkLabel',
      importInProgress: 'siteList.siteCsvImportInProgressLinkLabel',
    };

    return this.$translate.instant(labels[this.csvStatus]);
  }

  public get resultsLabel(): string {
    const labels = {
      exportCompletedNoErr: 'siteList.siteCsvExportResultsLinkLabel',
      exportCompletedWithErr: 'siteList.siteCsvExportResultsLinkLabel',
      importCompletedNoErr: 'siteList.siteCsvImportResultsLinkLabel',
      importCompletedWithErr: 'siteList.siteCsvImportResultsLinkLabel',
    };

    return this.$translate.instant(labels[this.csvStatus]);
  }

  public get showCIConfigure(): boolean {
    return this.selectedSite.isCI;
  }

  public get showCSVDisabled(): boolean {
    return !this.selectedSite.showCSVInfo && !this.hasError;
  }

  public get showCSVResults(): boolean {
    const validStatus = [
      'exportCompletedNoErr',
      'exportCompletedWithErr',
      'importCompletedNoErr',
      'importCompletedWithErr',
    ];
    const exportComplete = _.includes(validStatus, this.csvStatus);

    return this.showUserManagement && !this.hasInProgress && exportComplete;
  }

  public get showDelete(): boolean {
    // show up regardless of ci flag
    return this.canManage && this.isEnterpriseSubscription && !this.selectedSite.isPending;
  }

  public get showErrorAuth(): boolean {
    return this.hasError && this.selectedSite.isWarn;
  }

  public get showErrorSystem(): boolean {
    return this.hasError && !this.selectedSite.isWarn;
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

  public get showUserManagement(): boolean {
    return this.selectedSite.isCSVSupported && this.selectedSite.showCSVInfo && !this.hasError;
  }

  public get showUserManagementDisabled(): boolean {
    return !this.selectedSite.isCSVSupported && this.selectedSite.showCSVInfo && !this.hasError;
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
