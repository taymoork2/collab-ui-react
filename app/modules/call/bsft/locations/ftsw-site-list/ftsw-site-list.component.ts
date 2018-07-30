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
  public ftsw: boolean;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $translate: ng.translate.ITranslateService,
    private FtswConfigService: FtswConfigService,
    private $scope: ng.IScope,
  ) {}

  public $onInit() {
    if (this.ftsw) {
      this.$scope.$emit('wizardNextText', 'nextEnterpriseSettings');
    }
  }

  public getSites() {
    return this.FtswConfigService.getSites();
  }

  public addLocation() {
    this.$scope.$emit(CoreEvent.WIZARD_TO_STEP, 'setupBsft');
  }

  public cardSelected(site: ISite) {
    this.FtswConfigService.setEditSite(site);
    this.$scope.$emit(CoreEvent.WIZARD_TO_STEP, 'setupBsft');
  }

  public getLicensesInfo(): ILicenseInfo[] {
    const licenses = this.FtswConfigService.getLicensesInfo();
    let placesLicUsed = 0;
    let standardLicUsed = 0;
    _.forEach(this.FtswConfigService.getSites(), (site) => {
      if (!_.isUndefined(site.licenses.standard)) {
        standardLicUsed = standardLicUsed + site.licenses.standard;
      }
      if (!_.isUndefined(site.licenses.places)) {
        placesLicUsed = placesLicUsed + site.licenses.places;
      }
    });
    if (standardLicUsed) {
      _.set(_.find(licenses, { name: 'standard' }), 'available', _.find(licenses, { name: 'standard' }).total - standardLicUsed);
    }
    if (placesLicUsed) {
      _.set(_.find(licenses, { name: 'places' }), 'available', _.find(licenses, { name: 'places' }).total - placesLicUsed);
    }
    return licenses;
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
