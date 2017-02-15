import { UserV1, UserV2, UserNumber } from './user';

interface IUserV1Resource extends ng.resource.IResourceClass<ng.resource.IResource<UserV1>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

interface IUserV2Resource extends ng.resource.IResourceClass<ng.resource.IResource<UserV2>> {
}

export class HuronUserService {
  private userV1Resource: IUserV1Resource;
  private userV2Resource: IUserV2Resource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {

    let updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    this.userV1Resource = <IUserV1Resource>this.$resource(this.HuronConfig.getCmiUrl() + '/common/customers/:customerId/users/:userId', {},
      {
        update: updateAction,
      });

    this.userV2Resource = <IUserV2Resource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/users/:userId/', {},
      {
      });
  }

  public getUserV1(userId: string): ng.IPromise<UserV1> {
    return this.userV1Resource.get({
      customerId: this.Authinfo.getOrgId(),
      userId: userId,
    }).$promise;
  }

  public getUserServices(userId: string): ng.IPromise<Array<string>> {
    return this.getUserV1(userId).then(user => {
      return _.get(user, 'services', []);
    });
  }

  public updateUserV1(userId: string, data: UserV1): ng.IPromise<any> {

    return this.userV1Resource.update({
      customerId: this.Authinfo.getOrgId(),
      userId: userId,
    },  data).$promise;
  }

  public getUserV2(userId: string): ng.IPromise<UserV2> {
    return this.userV2Resource.get({
      customerId: this.Authinfo.getOrgId(),
      userId: userId,
    }).$promise;
  }

  public getUserV2Numbers(userId: string): ng.IPromise<Array<UserNumber>> {
    return this.getUserV2(userId).then(user => {
      return _.get(user, 'numbers', []);
    });
  }
}
