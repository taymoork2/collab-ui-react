import { ILicenseInfo, ISite, FtswConfigService } from 'modules/call/bsft/shared';
import { IToolkitModalService } from 'modules/core/modal';
import { CoreEvent } from 'modules/core/shared/event.constants';

export class FtswSiteListComponent implements ng.IComponentOptions {
  public controller = FtswSiteListCtrl;
  public template = require('modules/call/bsft/locations/ftsw-site-list/ftsw-site-list.component.html');
  public bindings = {
    ftsw: '<',
  };
}

class FtswSiteListCtrl implements ng.IComponentController {
  public standardLicense: ILicenseInfo;
  public placesLicense: ILicenseInfo;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $translate: ng.translate.ITranslateService,
    private FtswConfigService: FtswConfigService,
    private $log: ng.ILogService,
    private $scope: ng.IScope,
  ) {}

  public getSites() {
    return this.FtswConfigService.getSites();
  }

  public addLocation() {
    this.$scope.$emit(CoreEvent.WIZARD_TO_STEP, 'setupBsft');
  }

  public cardSelected(site: ISite) {
    this.$log.log(site);
    this.FtswConfigService.setEditSite(site);
    this.$scope.$emit(CoreEvent.WIZARD_TO_STEP, 'setupBsft');
  }

  public getLicensesInfo(): ILicenseInfo[] {
    this.$log.log('ftsw is called');
    return this.FtswConfigService.getLicensesInfo();
  }

  public removeSite(site: ISite) {
    this.$modal.open({
      template: '<hcs-delete-modal delete-fn="$ctrl.deleteFn()" dismiss="$dismiss()" modal-title="$ctrl.title" modal-description="$ctrl.description"></hcs-delete-modal>',
      controller: () => {
        return {
          deleteFn: () => this.FtswConfigService.removeSite(site),
          title: this.$translate.instant('broadCloud.ftsw.siteList.deleteModal.title'),
          description: this.$translate.instant('broadCloud.ftsw.siteList.deleteModal.description'),
        };
      },
      modalClass: 'hcs-delete-modal-class',
      controllerAs: '$ctrl',
      type: 'dialog',
    });
  }
}
