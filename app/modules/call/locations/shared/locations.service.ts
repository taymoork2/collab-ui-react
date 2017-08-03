import { IRLocation, Location, IRLocationListItem, LocationListItem } from './location';

interface ILocationResource extends ng.resource.IResourceClass<ng.resource.IResource<IRLocationListItem>> {}

interface IUserLocationDetailResource extends ng.resource.IResourceClass<ng.resource.IResource<IRLocation>> {}

interface ILocationDetailResource extends ng.resource.IResourceClass<ng.resource.IResource<IRLocation>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

export class LocationsService {
  private locationListResource: ILocationResource;
  private userLocationDetailResource: IUserLocationDetailResource;
  private locationDetailResource: ILocationDetailResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private HuronConfig,
    private Authinfo,
  ) {

    const updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    const saveAction: ng.resource.IActionDescriptor = {
      method: 'POST',
      headers: {
        'Access-Control-Expose-Headers': 'Location',
      },
    };

    this.locationListResource = <ILocationResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/locations`, {}, {});
    this.userLocationDetailResource = <IUserLocationDetailResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/users/:userId`, {}, {});
    this.locationDetailResource = <ILocationDetailResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/locations/:locationId`, {},
      {
        update: updateAction,
        save: saveAction,
      });
  }

  public getLocationList(): IPromise<LocationListItem[]> {
    return this.locationListResource.get({
      customerId: this.Authinfo.getOrgId(),
      wide: true,
    }).$promise.then(locations => {
      return _.map(_.get<IRLocationListItem[]>(locations, 'locations', []), location => {
        return new LocationListItem(location);
      });
    });
  }

  public getLocation(locationId: string): ng.IPromise<Location> {
    return this.locationDetailResource.get({
      customerId: this.Authinfo.getOrgId(),
      locationId,
    }).$promise
    .then(response => new Location(response));
  }

  public getUserLocation(userId: string): ng.IPromise<Location> {
    return this.userLocationDetailResource.get({
      customerId: this.Authinfo.getOrgId(),
      userId,
    }).$promise
    .then(response =>  _.get<Location>(response, 'location'));
  }

  public createLocation(location: Location): ng.IPromise<string> {
    const locationHeader: string = '';
    return this.locationListResource.save({
      customerId: this.Authinfo.getOrgId(),
    }, {
      name: location.name,
      routingPrefix: location.routingPrefix,
      defaultLocation: location.defaultLocation,
      timeZone: location.timeZone,
      preferredLanguage: location.preferredLanguage,
      tone: location.tone,
      dateFormat: location.dateFormat,
      timeFormat: location.timeFormat,
      steeringDigit: location.steeringDigit,
      allowExternalTransfer: location.allowExternalTransfer,
      voicemailPilotNumber: location.voicemailPilotNumber,
      regionCodeDialing: location.regionCodeDialing,
      callerIdNumber: location.callerIdNumber,
    },
    (_response, headers) => {
      location = headers('Location');
    }).$promise
    .then(() => locationHeader);
  }

  public updateLocation(location: Location): ng.IPromise<void> {
    return this.locationDetailResource.update({
      customerId: this.Authinfo.getOrgId(),
      locationId: location.uuid,
    }, {
      name: location.name,
      routingPrefix: location.routingPrefix,
      defaultLocation: location.defaultLocation,
      timeZone: location.timeZone,
      preferredLanguage: location.preferredLanguage,
      tone: location.tone,
      dateFormat: location.dateFormat,
      timeFormat: location.timeFormat,
      steeringDigit: location.steeringDigit,
      allowExternalTransfer: location.allowExternalTransfer,
      voicemailPilotNumber: location.voicemailPilotNumber,
      regionCodeDialing: location.regionCodeDialing,
      callerIdNumber: location.callerIdNumber,
    }).$promise;
  }

  public deleteLocation(locationId: string): ng.IPromise<IRLocation> {
    return this.locationDetailResource.delete({
      customerId: this.Authinfo.getOrgId(),
      locationId: locationId,
    }, location).$promise;
  }

  public makeDefault(locationId: string): ng.IPromise<void> {
    return this.locationDetailResource.update({
      customerId: this.Authinfo.getOrgId(),
      locationId: locationId,
    }, {
      defaultLocation: true,
    }).$promise;
  }

  public filterCards(locations: LocationListItem[], filterText: string): LocationListItem[] {
    if (_.isEmpty(filterText)) {
      return locations;
    }
    return _.filter(locations, filteredLocation => {
      return filteredLocation.name.toLowerCase().indexOf(filterText.toLowerCase()) !== -1;
    });
  }

  public hasLocation(name: string): ng.IPromise<boolean> {
    return this.locationListResource.get({
      customerId: this.Authinfo.getOrgId(),
      name: name,
    }).$promise.then(locations => {
      const filterList = _.get<LocationListItem[]>(locations, 'locations', []).filter((item) => {
        return item.name === name;
      });
      return filterList.length > 0;
    });
  }
}
