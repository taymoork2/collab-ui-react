import { FtswConfigService } from 'modules/call/bsft/shared/ftsw-config.service';
import { Site } from 'modules/call/bsft/shared/bsft-site';

class LicenseAllocationCtrl implements ng.IComponentController {
  public ftsw: boolean;
  public uuid: string;
  public loading: boolean = false;
  public form: ng.IFormController;
  public site: Site;
  public editing = false;
  public timeZoneOptions;
  public makeDefault: boolean;
  public licenses = {};

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private FtswConfigService: FtswConfigService,
    ) {}

  public $onInit(): void {
    if (this.ftsw) {
      this.$scope.$emit('wizardNextText', 'nextAddNumbers');

      this.$scope.$watch(() => {
        return _.get(this.form, '$invalid');
      }, invalid => {
        this.$scope.$emit('wizardNextButtonDisable', !!invalid);
      });
    }

    const currentSite = this.FtswConfigService.getCurentSite();
    if (currentSite !== undefined) {
      this.site = currentSite;
    }

    this.licenses['standard'] = _.find(this.FtswConfigService.getLicensesInfo(), licenses => licenses.name === 'standard');
    this.licenses['places'] = _.find(this.FtswConfigService.getLicensesInfo(), licenses => licenses.name === 'places');
  }

  public onStandardLicenseChanged(standard) {
    if (standard <= this.licenses['standard'].available) {
      _.set(this.site.licenses, 'standard', standard);
    }
  }

  public onPlacesLicenseChanged(places) {
    if (places <= this.licenses['places'].available) {
      _.set(this.site.licenses, 'places', places);
    }
  }

  //to get called, must be step name + 'Next'
  public bsftLicenseAllocationNext(): void {
    this.FtswConfigService.setCurrentSite(this.site);
  }
}

export class LicenseAllocationComponent implements ng.IComponentOptions {
  public controller = LicenseAllocationCtrl;
  public template = require('modules/call/bsft/licenses/license-allocation.component.html');
  public bindings = {
    ftsw: '<',
    uuid: '<',
  };
}
