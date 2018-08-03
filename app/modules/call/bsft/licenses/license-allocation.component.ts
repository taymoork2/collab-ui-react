import { Site, FtswConfigService, ILicenseInfo } from 'modules/call/bsft/shared';

class LicenseAllocationCtrl implements ng.IComponentController {
  public ftsw: boolean;
  public form: ng.IFormController;
  public site: Site;
  public licenses = {};
  public modalInvalid: Function;

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private FtswConfigService: FtswConfigService,
    ) {}

  public $onInit(): void {
    this.$scope.$watch(() => {
      return _.get(this.form, '$invalid');
    }, invalid => {
      if (this.ftsw) {
        this.$scope.$emit('wizardNextButtonDisable', !!invalid);
      } else {
        this.modalInvalid({
          invalid: !!invalid,
        });
      }
    });

    if (this.ftsw) {
      this.$scope.$emit('wizardNextText', 'nextAddNumbers');
    } else {
      this.$scope.$on('bsftLicenseAllocationNext', () => this.bsftLicenseAllocationNext());
    }

    this.licenses['standard'] = _.find(this.getLicensesInfo('standard'), licenses => licenses.name === 'standard');
    this.licenses['places'] = _.find(this.getLicensesInfo('places'), licenses => licenses.name === 'places');

    const currentSite = this.FtswConfigService.getCurentSite();
    if (currentSite !== undefined) {
      this.site = currentSite;
    }
  }

  public getLicensesInfo(name): ILicenseInfo[] {
    const licenses = this.FtswConfigService.getLicensesInfo();
    let licUsed = 0;
    _.forEach(this.FtswConfigService.getSites(), (site) => {
      if (!_.isUndefined(site.licenses[name])) {
        licUsed = licUsed + site.licenses[name];
      }
    });
    if (_.find(licenses, { name: name })) {
      _.set(_.find(licenses, { name: name }), 'available', _.find(licenses, { name: name }).total - licUsed);
    }
    return licenses;
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
    modalInvalid: '&?',
  };
}
