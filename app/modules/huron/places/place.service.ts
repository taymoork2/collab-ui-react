import { IPlace, Place } from './place';

interface IPlaceResource extends ng.resource.IResourceClass<ng.resource.IResource<IPlace>> {}

export class HuronPlaceService {
  private placeResouce: IPlaceResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {

    this.placeResouce = <IPlaceResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/places/:placeId`, {}, {});
  }

  public getPlace(placeId: string) {
    return this.placeResouce.get({
      customerId: this.Authinfo.getOrgId(),
      placeId: placeId,
    }).$promise.then(response => new Place(response));
  }

}
