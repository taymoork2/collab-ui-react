import { ILocation, ILocationListItem } from './location';

interface ILocationResource extends ng.resource.IResourceClass<ng.resource.IResource<ILocation>> {}

interface ILocationDetailResource extends ng.resource.IResourceClass<ng.resource.IResource<ILocationListItem>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

export class LocationsService {
  private locationListResource: ILocationResource;
  private locationDetailResource: ILocationDetailResource;

  private locationPickList: string[] = [
    'uuid',
    'name',
    'routingPrefix',
    'defaultLocation',
    'timeZone',
    'preferredLanguage',
    'tone',
    'dateFormat',
    'timeFormat',
    'steeringDigit',
    'siteSteeringDigit',
    'allowExternalTransfer',
    'voicemailPilotNumber',
    'regionCodeDialing',
    'callerIdNumber',
  ];

  private locationListItemPickList: string[] = [
    'uuid',
    'name',
    'routingPrefix',
    'defaultLocation',
    'userCount',
    'placeCount',
  ];

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
    this.locationDetailResource = <ILocationDetailResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/locations/:locationId`, {},
      {
        update: updateAction,
        save: saveAction,
      });
  }

  public getLocationList(): IPromise<ILocationListItem[]> {
    return this.locationListResource.get({
      customerId: this.Authinfo.getOrgId(),
      wide: true,
    }).$promise.then(locations => {
      return _.map(_.get<ILocationListItem[]>(locations, 'locations', []), location => {
        return _.pick(location, this.locationListItemPickList);
      });
    });
  }

  public getLocation(locationId: string): ng.IPromise<ILocation> {
    return this.locationDetailResource.get({
      customerId: this.Authinfo.getOrgId(),
      locationId,
    }).$promise
    .then(location => {
      return _.pick(location, this.locationPickList);
    });
  }

  public createLocation(location: ILocation): ng.IPromise<string> {
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

  public updateLocation(location: ILocation): ng.IPromise<void> {
    return this.locationDetailResource.update({
      customerId: this.Authinfo.getOrgId(),
    }, location).$promise;
  }

  public deleteLocation(locationId: string): ng.IPromise<ILocationListItem> {
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

  public filterCards(locations: ILocationListItem[], filterText: string): ILocationListItem[] {
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
      return _.get<ILocationListItem[]>(locations, 'locations', []).length > 0;
    });
  }
}
