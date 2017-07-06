import { LocationsService } from 'modules/call/locations/locations.service';
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
    private Authinfo,
  ) {}

  public validationMessages = {
    required: this.$translate.instant('common.invalidRequired'),
  };

  public $onInit() {
    this.LocationsService.getLocationDetails(this.uuid).then((result) => {
      this.location = result;
      this.location.name = '';
    });
  }

  public save(): void {
    this.saveInProcess = true;
    this.LocationsService.createLocation(this.Authinfo.getOrgId(), this.location).then(() => this.close())
    .catch(error => this.Notification.errorResponse(error, 'locations.copyFailed'))
    .finally(() => this.saveInProcess = false);
  }

}

export class CopyLocationComponent implements ng.IComponentOptions {
  public controller = CopyLocationCtrl;
  public templateUrl = 'modules/call/locations/modals/copy/copyLocationModal.html';
  public bindings = {
    dismiss: '&',
    close: '&',
    uuid: '<',
  };
}
