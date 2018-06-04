import { IRLocationCos, LocationCos, IRestriction } from './cos';

interface ILocationCosResource extends ng.resource.IResourceClass<ng.resource.IResource<IRLocationCos>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

export class LocationCosService {
  private locationCosResource: ILocationCosResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
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

    this.locationCosResource = <ILocationCosResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/locations/:locationId/features/restrictions/:restrictionId`, {},
      {
        update: updateAction,
        save: saveAction,
      });
  }

  public getLocationCos(locationId: string): ng.IPromise<LocationCos> {
    return this.locationCosResource.get({
      customerId: this.Authinfo.getOrgId(),
      locationId: locationId,
    }).$promise.then(response => new LocationCos(response));
  }

  public createLocationCos(locationId: string, restriction: IRestriction): ng.IPromise<string> {
    let locationHeader: string;
    return this.locationCosResource.save({
      customerId: this.Authinfo.getOrgId(),
      locationId: locationId,
    }, restriction,
      (_response, headers) => {
        locationHeader = headers('Location');
      }).$promise
      .then(() => locationHeader);
  }

  public updateLocationCos(locationId: string, restrictionId: string, restriction: IRestriction): ng.IPromise<void> {
    return this.locationCosResource.update({
      customerId: this.Authinfo.getOrgId(),
      locationId: locationId,
      restrictionId: restrictionId,
    }, {
      blocked: restriction.blocked,
    }).$promise;
  }

  public deleteLocationCos(locationId: string, restrictionId: string): ng.IPromise<IRLocationCos> {
    return this.locationCosResource.delete({
      customerId: this.Authinfo.getOrgId(),
      locationId: locationId,
      restrictionId: restrictionId,
    }).$promise;
  }
}
