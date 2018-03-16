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
          .then(bsftSettings => this.bsftSettingsData = bsftSettings)
          .catch(error => this.Notification.processErrorResponse(error));
      });
  }

  public onSiteNameChanged(name) {
    _.set(this.bsftSettingsData.bsftSettings.site, 'name', name);
  }

  public onTimeZoneChanged(timeZone) {
    _.set(this.bsftSettingsData.bsftSettings.site, 'timeZone', timeZone);
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
