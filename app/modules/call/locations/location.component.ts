import { CallLocationSettingsData, CallLocationSettingsService } from 'modules/call/locations/shared';
import { Notification } from 'modules/core/notifications';

class CallLocationCtrl implements ng.IComponentController {
  public uuid: string;
  public name: string;
  public callLocationSettingsData: CallLocationSettingsData;
  public processing: boolean = false;
  public huronFeaturesUrl: string = 'call-locations';

  /* @ngInject */
  constructor(
    private CallLocationSettingsService: CallLocationSettingsService,
    private Notification: Notification,
  ) {}

  public $onInit(): void {
    this.processing = true;
    this.CallLocationSettingsService.get(this.uuid)
      .then(location => this.callLocationSettingsData = location)
      .catch(error => this.Notification.processErrorResponse(error, 'locations.getFailed'))
      .finally(() => this.processing = false);
  }

  public onNameChanged(name: string): void {
    this.callLocationSettingsData.location.name = name;
  }
}

export class CallLocationComponent implements ng.IComponentOptions {
  public controller = CallLocationCtrl;
  public templateUrl = 'modules/call/locations/location.component.html';
  public bindings = {
    uuid: '<',
    name: '<',
  };
}
