import { BsftSettingsOptionsService, BsftSettingsOptions, BsftSettingsService, BsftSettingsData } from './shared';
import { Notification } from 'modules/core/notifications';

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

  public onTimeZoneChanged(timeZone) {
    _.set(this.bsftSettingsData.bsftSettings.site, 'timeZone', timeZone);
  }

  public onContactFirstNameChanged(firstName) {
    _.set(this.bsftSettingsData.bsftSettings.contactInfo, 'contactFirstName', firstName);
  }

  public onContactLastNameChanged(lastName) {
    _.set(this.bsftSettingsData.bsftSettings.contactInfo, 'contactLastName', lastName);
  }

  public onContactEmailChanged(email) {
    _.set(this.bsftSettingsData.bsftSettings.contactInfo, 'emailAddress', email);
  }

  public setupBsftNext(): ng.IPromise<void> {
    return this.save();
  }

  public save(): ng.IPromise<void> {
    this.loading = true;
    return this.BsftSettingsService.save(this.bsftSettingsData.bsftSettings)
      .then(() => {})
      .finally(() => this.loading = false);
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
