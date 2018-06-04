import { LocationsService } from 'modules/call/locations/shared';
import { Notification } from 'modules/core/notifications';

class CopyLocationCtrl implements ng.IComponentController {
  public location;
  public form: ng.IFormController;
  public uuid: string;
  public close: Function;
  public saveInProcess: boolean = false;

  /* @ngInject */
  constructor(
    public LocationsService: LocationsService,
    private Notification: Notification,
    private $translate: ng.translate.ITranslateService,
  ) {}

  public validationMessages = {
    required: this.$translate.instant('common.invalidRequired'),
    uniqueAsyncValidator: this.$translate.instant('locations.usedLocation'),
  };

  public $onInit() {
    this.LocationsService.getLocation(this.uuid).then((result) => {
      this.location = result;
      this.location.name = '';
      this.location.defaultLocation = false;
    });
  }

  public onNameChanged(name: string) {
    this.location.name = name;
  }

  public save(): void {
    this.saveInProcess = true;
    this.LocationsService.createLocation(this.location).then(() => this.close())
      .catch(error => this.Notification.errorResponse(error, 'locations.copyFailed'))
      .finally(() => this.saveInProcess = false);
  }

}

export class CopyLocationComponent implements ng.IComponentOptions {
  public controller = CopyLocationCtrl;
  public template = require('modules/call/locations/locations-copy/locations-copy.component.html');
  public bindings = {
    dismiss: '&',
    close: '&',
    uuid: '@',
  };
}
