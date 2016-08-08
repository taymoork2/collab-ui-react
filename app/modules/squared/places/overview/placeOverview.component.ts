import { IFeature } from '../../../core/components/featureList/featureList.component';

class PlaceOverviewCtrl {

  private _currentPlace;
  private _csdmHuronUserDeviceService;
  private _services: IFeature[] = [];

  get currentPlace() {
    return this._currentPlace
  }

  get services() {
    return this._services;
  }

  /* @ngInject */
  constructor(
    private $state,
    private $stateParams,
    private CsdmPlaceService,
    private CsdmHuronUserDeviceService,
    private $translate,
    private XhrNotificationService
  ) {
    this._currentPlace = $stateParams.currentPlace;
    this._csdmHuronUserDeviceService = CsdmHuronUserDeviceService.create(this._currentPlace.cisUuid);
  }

  private $onInit(): void {
    if (this.hasEntitlement('ciscouc')) {
      let service: IFeature = {
        name: this.$translate.instant('onboardModal.call'),
        icon: this.$translate.instant('onboardModal.call'),
        state: 'place-overview.communication',
        detail: this.$translate.instant('onboardModal.callFree'),
        actionsAvailable: true
      }
      this._services.push(service);
    }
  }

  public save(newName: string) {
    return this.CsdmPlaceService
      .updatePlaceName(this._currentPlace.url, newName)
      .catch(this.XhrNotificationService.notify);
  }

  public showDeviceDetails(device) {
    this.$state.go('place-overview.csdmDevice', {
      currentDevice: device,
      huronDeviceService: this._csdmHuronUserDeviceService
    });
  }

  private hasEntitlement(entitlement: string): boolean {
    let hasEntitlement = false;
    if (this._currentPlace.entitlements) {
      this._currentPlace.entitlements.forEach(element => {
        if (element === entitlement) {
          hasEntitlement = true;
        }
      });
    }
    return hasEntitlement;
  }
}
angular
  .module('Squared')
  .component('placeOverview', {
    templateUrl: 'modules/squared/places/overview/placeOverview.tpl.html',
    controller: PlaceOverviewCtrl
  });
