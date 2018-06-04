import { LocationsService } from 'modules/call/locations/shared';
import { Notification } from 'modules/core/notifications';

class MakeDefaultLocationCtrl implements ng.IComponentController {
  public saveInProcess: boolean;

  public uuid: string;
  public close: Function;

  /* @ngInject */
  constructor (
    private LocationsService: LocationsService,
    private Notification: Notification,
  ) {}

  public makeDefaultLocation(): void {
    this.saveInProcess = true;
    this.LocationsService.makeDefault(this.uuid)
      .then(() => this.close())
      .catch((error) => this.Notification.errorResponse(error))
      .finally(() => this.saveInProcess = false);
  }
}

export class MakeDefaultLocationComponent implements ng.IComponentOptions {
  public controller = MakeDefaultLocationCtrl;
  public template = require('modules/call/locations/locations-make-default/locations-make-default.component.html');
  public bindings = {
    dismiss: '&',
    close: '&',
    uuid: '@',
  };
}
