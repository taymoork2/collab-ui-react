import { BsftSettingsOptionsService, BsftSettingsOptions, BsftSettingsService, BsftSettingsData } from './shared';
import { Notification } from 'modules/core/notifications';
import { FtswConfigService } from 'modules/call/bsft/shared/ftsw-config.service';

class BsftSettingsCtrl implements ng.IComponentController {
  public ftsw: boolean;
  public uuid: string;
  public loading: boolean = false;
  public form: ng.IFormController;
  public bsftSettingsOptions: BsftSettingsOptions;
  public bsftSettingsData: BsftSettingsData;

  /* @ngInject */
  constructor(
    private BsftSettingsService: BsftSettingsService,
    private BsftSettingsOptionsService: BsftSettingsOptionsService,
    private Notification: Notification,
    private $q: ng.IQService,
    private $scope: ng.IScope,
    private Authinfo,
    private FtswConfigService: FtswConfigService,
    ) {}

  public $onInit(): void {
    this.loading = true;
    this.$q.resolve(this.initComponentData()).finally( () => this.loading = false);

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
    return this.BsftSettingsOptionsService.getOptions()
      .then(bsftOptions => this.bsftSettingsOptions = bsftOptions)
      .then(() => {
        return this.BsftSettingsService.get(this.uuid)
          .then(bsftSettings => {
            this.bsftSettingsData = bsftSettings;
            this.bsftSettingsData.bsftSettings.orgId = this.Authinfo.getOrgId();
            this.bsftSettingsData.bsftSettings.name = this.Authinfo.getOrgName();
          })
          .catch(error => this.Notification.processErrorResponse(error));
      });
  }

  public onSiteNameChanged(name) {
    _.set(this.bsftSettingsData.bsftSettings.site, 'name', name);
  }

  public onSiteAddressChanged(address1, address2) {
    _.set(this.bsftSettingsData.bsftSettings.site, 'address1', address1);
    _.set(this.bsftSettingsData.bsftSettings.site, 'address2', address2);
  }

  public onSiteCityChanged(city) {
    _.set(this.bsftSettingsData.bsftSettings.site, 'city', city);
  }

  public onSiteZipcodeChanged(zipcode) {
    _.set(this.bsftSettingsData.bsftSettings.site, 'zipcode', zipcode);
  }

  public onSiteStateChanged(state) {
    _.set(this.bsftSettingsData.bsftSettings.site, 'state', state);
  }

  public onSiteCountryChanged(country) {
    _.set(this.bsftSettingsData.bsftSettings.site, 'country', country);
  }

  public onTimeZoneChanged(timeZone) {
    _.set(this.bsftSettingsData.bsftSettings.site, 'timeZone', timeZone);
  }

  public onContactFirstNameChanged(firstName) {
    _.set(this.bsftSettingsData.bsftSettings.site.contact, 'firstName', firstName);
  }

  public onContactLastNameChanged(lastName) {
    _.set(this.bsftSettingsData.bsftSettings.site.contact, 'lastName', lastName);
  }

  public onContactPhoneNumberChanged(phoneNumber) {
    _.set(this.bsftSettingsData.bsftSettings.site.contact, 'phoneNumber', phoneNumber);
  }

  public onContactEmailChanged(email) {
    _.set(this.bsftSettingsData.bsftSettings.site.contact, 'email', email);
  }

  public setupBsftNext(): void {
    return this.FtswConfigService.addSite(this.bsftSettingsData.bsftSettings.site);
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
