import { LocationsService } from 'modules/call/locations/locations.service';
import { Notification } from 'modules/core/notifications';

class DeleteLocationCtrl implements ng.IComponentController {
  public placeCount: number;
  public userCount: number;
  public saveInProcess: boolean;

  public uuid: string;
  public close: Function;

  /* @ngInject */
  constructor (
      private LocationsService: LocationsService,
      private Notification: Notification,
  ) {
  }

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
  public templateUrl = 'modules/call/locations/modals/delete/deleteLocationModal.html';
  public bindings = {
    dismiss: '&',
    close: '&',
    uuid: '<',
    userCount: '<',
    placeCount: '<',
    name: '@',
  };
}

