import { FtswConfigService } from 'modules/call/bsft/shared/ftsw-config.service';
import { Site } from 'modules/call/bsft/shared/bsft-site';
import { BsftSettingsOptionsService } from 'modules/call/bsft/settings/shared';

class BsftSettingsCtrl implements ng.IComponentController {
  public ftsw: boolean;
  public uuid: string;
  public loading: boolean = false;
  public form: ng.IFormController;
  public site = new Site();
  public editing = false;
  public timeZoneOptions;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $scope: ng.IScope,
    private Utils,
    private FtswConfigService: FtswConfigService,
    private BsftSettingsOptionsService: BsftSettingsOptionsService,
    ) {}

  public $onInit(): void {
    this.loading = true;
    this.$q.resolve(this.initComponentData()).finally( () => this.loading = false);
    this.$scope.$emit('wizardNextText', 'nextAssignLicenses');

    if (this.ftsw) {
      this.$scope.$watch(() => {
        return _.get(this.form, '$invalid');
      }, invalid => {
        this.$scope.$emit('wizardNextButtonDisable', !!invalid);
      });

      this.$scope.$watch(() => {
        return this.loading;
      }, loading => {
        this.$scope.$emit('wizardNextButtonDisable', !!loading);
      });
    }
  }

  private initComponentData() {
    const editSite = this.FtswConfigService.getEditSite();
    if (editSite) {
      this.editing = true;
      this.site = _.cloneDeep(editSite);
    }

    return this.BsftSettingsOptionsService.getOptions()
      .then(bsftOptions => this.timeZoneOptions = bsftOptions.timeZoneOptions);
  }

  public onSiteNameChanged(name) {
    _.set(this.site, 'name', name);
  }

  public onSiteAddressChanged(address1, address2) {
    _.set(this.site.address, 'address1', address1);
    _.set(this.site.address, 'address2', address2);
  }

  public onSiteCityChanged(city) {
    _.set(this.site.address, 'city', city);
  }

  public onSiteZipcodeChanged(zipcode) {
    _.set(this.site.address, 'zipcode', zipcode);
  }

  public onSiteStateChanged(state) {
    _.set(this.site.address, 'state', state);
  }

  public onSiteCountryChanged(country) {
    _.set(this.site.address, 'country', country);
  }

  public onTimeZoneChanged(timeZone) {
    _.set(this.site, 'timeZone', timeZone);
  }

  public onContactFirstNameChanged(firstName) {
    _.set(this.site.contact, 'firstName', firstName);
  }

  public onContactLastNameChanged(lastName) {
    _.set(this.site.contact, 'lastName', lastName);
  }

  public onContactPhoneNumberChanged(phoneNumber) {
    _.set(this.site.contact, 'phoneNumber', phoneNumber);
  }

  public onContactEmailChanged(email) {
    _.set(this.site.contact, 'email', email);
  }

  public setupBsftNext(): void {
    if (!this.editing) {
      this.site.uuid = this.Utils.getUUID();
      this.FtswConfigService.addSite(this.site);
    } else {
      this.FtswConfigService.updateSite(this.site);
    }
  }
}

export class BsftSettingsComponent implements ng.IComponentOptions {
  public controller = BsftSettingsCtrl;
  public template = require('modules/call/bsft/settings/bsft-settings.component.html');
  public bindings = {
    ftsw: '<',
    uuid: '<',
  };
}
