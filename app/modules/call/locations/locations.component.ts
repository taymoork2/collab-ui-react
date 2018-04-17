import { IToolkitModalService } from 'modules/core/modal';
import { LocationsService, ILocationListItem } from './shared';
import { CardUtils } from 'modules/core/cards';
const STATE_LOADING: string = 'STATE_LOADING';
const STATE_SHOW_LOCATIONS: string = 'STATE_SHOW_LOCATIONS';
const STATE_RELOAD: string = 'STATE_RELOAD';
const STATE_NEW_LOCATION: string = 'STATE_NEW_LOCATION';

class CallLocationsCtrl implements ng.IComponentController {
  public locations: ILocationListItem[] = [];
  public pageState: string = STATE_LOADING;
  public currentLocation: ILocationListItem;

  /* @ngInject */
  constructor(
    public LocationsService: LocationsService,
    public CardUtils: CardUtils,
    public $state: ng.ui.IStateService,
    public $modal: IToolkitModalService,
    public $q: ng.IQService,
    ) {

  }
  public $onInit(): void {
    this.LocationsService.getLocationList().then((locations: ILocationListItem[]) => {
      this.locations = locations;
      if (this.locations.length === 0) {
        this.pageState = STATE_NEW_LOCATION;
      } else {
        this.pageState = STATE_SHOW_LOCATIONS;
      }
      this.reInstantiateMasonry();
    }).catch(() => this.handleFailures());
  }

  public handleFailures(): void {
    this.showReloadPageIfNeeded();
  }

  public showReloadPageIfNeeded(): void {
    if (this.pageState === STATE_LOADING && this.locations.length === 0) {
      this.pageState = STATE_RELOAD;
    }
  }

  /* This function does an in-page search for the string typed in search box*/
  public searchData(searchStr: string): void {
    this.LocationsService.getLocationList().then((result) => {
      this.locations = this.LocationsService.filterCards(result, searchStr);
    });
    this.reInstantiateMasonry();
  }

  public reInstantiateMasonry(): void {
    this.CardUtils.resize();
  }

  public reload(): void {
    this.$state.go(this.$state.current, {}, {
      reload: true,
    });
  }

  public addLocation(): void {
    this.$state.go('call-locations-add');
  }

  public copyLocation(location: ILocationListItem): void {
    this.$modal.open({
      type: 'small',
      template: `<uc-copy-location class="modal-content" uuid="${location.uuid}" style="margin:initial" dismiss="$dismiss()" close="$close()"></uc-copy-location>`,
    }).result.then(() => {
      this.pageState = STATE_LOADING;
      this.$onInit();
    });
  }

  public editLocation(location: ILocationListItem): void {
    this.$state.go('call-locations-edit', {
      currentLocation: location,
    });
  }

  public deleteLocation(location: ILocationListItem): void {
    this.currentLocation = location;
    this.$modal.open({
      type: 'dialog',
      template: `<uc-delete-location class="modal-content" uuid="${location.uuid}" user-count="${location.userCount}"  place-count="${location.placeCount}" name="${location.name}" style="margin:initial" dismiss="$dismiss()" close="$close()"></uc-delete-location>`,
    }).result.then(() => {
      this.pageState = STATE_LOADING;
      this.$onInit();
    });
  }

  public makeDefaultLocation(location): void {
    this.$modal.open({
      type: 'dialog',
      template: `<uc-make-default-location class="modal-content" uuid="${location.uuid}" style="margin:initial" dismiss="$dismiss()" close="$close()"></uc-make-default-location>`,
    }).result.then(() => {
      this.pageState = STATE_LOADING;
      this.$onInit();
      this.locations.forEach((location) => {
        location.defaultLocation = false;
      });
      location.defaultLocation = true;
    });
  }

}

export class CallLocationsComponent implements ng.IComponentOptions {
  public controller = CallLocationsCtrl;
  public template = require('modules/call/locations/locations.component.html');
  public bindings = {};
}
