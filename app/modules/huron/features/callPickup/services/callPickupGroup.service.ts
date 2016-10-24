import { IPickupGroup } from 'modules/huron/features/callPickup/services/callPickupGroup';

interface IPickupGroupResource extends ng.resource.IResourceClass<ng.resource.IResource<IPickupGroup>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<IPickupGroup>>;
}

export class CallPickupGroupService {
  private pickupGroupResource: IPickupGroupResource;

 /* @ngInject */
  constructor(private $resource: ng.resource.IResourceService,
              private HuronConfig,
              private Authinfo) {
    this.pickupGroupResource = <IPickupGroupResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/features/callpickups/:callPickupGroupId', {},
      {
        update: {
          method: 'PUT',
        },
      });
  }

  public saveCallPickupGroup(pickupGroup: IPickupGroup): ng.IPromise<IPickupGroup> {
    return this.pickupGroupResource.save({
      customerId: this.Authinfo.getOrgId(),
    }, pickupGroup).$promise;
  }

  public getListOfPickupGroups(): ng.IPromise<IPickupGroup[]> {
    return this.pickupGroupResource.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise.then(response => _.get(response, 'callpickups'));
  }
}
