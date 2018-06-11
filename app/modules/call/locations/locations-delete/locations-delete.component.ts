import { LocationsService } from 'modules/call/locations/shared';
import { Notification } from 'modules/core/notifications';

class DeleteLocationCtrl implements ng.IComponentController {
  public saveInProcess: boolean;
  public close: Function;
  public userCount: number;
  public placeCount: number;
  public uuid: string;

  /* @ngInject */
  constructor (
    private LocationsService: LocationsService,
    private Notification: Notification,
  ) {}

  public deleteLocation() {
    this.saveInProcess = true;
    this.LocationsService.deleteLocation(this.uuid).then(() => {
      this.close();
    })
      .catch(error => this.Notification.errorResponse(error, 'locations.deleteFailed'))
      .finally(() => this.saveInProcess = false);
  }

  public canDelete(): boolean {
    return this.userCount === 0 && this.placeCount === 0;
  }
}

export class DeleteLocationComponent implements ng.IComponentOptions {
  public controller = DeleteLocationCtrl;
  public template = require('modules/call/locations/locations-delete/locations-delete.component.html');
  public bindings = {
    dismiss: '&', //used in HTML
    name: '@', //used in HTML
    close: '&',
    userCount: '<',
    placeCount: '<',
    uuid: '@',
  };
}

