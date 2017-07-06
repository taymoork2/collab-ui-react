import {
  ILocation, ILocationGetResource,
  ILocationDetail, //LocationDetailResource, ILocationDetailResource,
} from './location';

export class LocationsService {
  private readonly URL_LOCATION = '/customers/:customerId/locations/:locationId';

  /* @ngInject */
  constructor(private $q: ng.IQService,
              private $resource: ng.resource.IResourceService,
              private HuronConfig,
             // private Authinfo,
  ) {}

  public getLocations(customerId: string): IPromise<ILocation[]> {
    const resource: ILocationGetResource = <ILocationGetResource>this.$resource(this.HuronConfig.getCmiV2Url() + this.URL_LOCATION, { wide: 'true' });
    return resource.get({
      customerId: customerId,
    }).$promise.then(locations_ => {
      const locations: ILocation[] = _.get<ILocation[]>(locations_, 'locations');
      if (locations) {
        return locations;
      }
      return [];
    });
  }

  public createLocation(customerId: string, location: ILocationDetail): ng.IPromise<void> {
    const resource = this.$resource(this.HuronConfig.getCmiV2Url() + this.URL_LOCATION);
    return resource.save({
      customerId: customerId,
    }, location).$promise;
  }

  public updateLocation(customerId: string, location: ILocationDetail): string {
    return customerId + location;
  }

  public deleteLocation(customerId, locationId): ng.IPromise<void> {
    const resource = this.$resource(this.HuronConfig.getCmiV2Url() + this.URL_LOCATION);
    return resource.delete({
      customerId: customerId,
      locationId: locationId,
    }, location).$promise;
  }

  public filterCards(locations: ILocation[], filterText: string): ILocation[] {
    if (_.isEmpty(filterText)) {
      return locations;
    }
    let filteredLocations: ILocation[] = [];
    filteredLocations = _.filter(locations, function(someObject) {
      return someObject.name.toLowerCase().indexOf(filterText.toLowerCase()) !== -1;
    });
    return filteredLocations;
  }

  public getLocationDetails(locationId) {
    // return this.locationsService.get({
    //   customerId: this.Authinfo.getOrgId(),
    //   locationId,
    // }).$promise;
    return this.$q.resolve({
      uuid: locationId,
      name: 'Home Office',
      timezone: 'CST',
      userCount: 0,
      placeCount: 0,
      preferredLanguage: 'USEnglish',
    });
  }

  public hasLocation(name: string): ng.IPromise<boolean> {
    if (name === 'Home Office') {
      return this.$q.resolve(true);
    }
    return this.$q.resolve(false);
  }
}
