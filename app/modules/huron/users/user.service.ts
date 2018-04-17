import { UserV1, UserV2, UserNumber, UserRemoteDestination } from './user';
import { PrimaryNumber } from 'modules/huron/primaryLine';

interface IUserV1Resource extends ng.resource.IResourceClass<ng.resource.IResource<UserV1>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

interface IUserV2Resource extends ng.resource.IResourceClass<ng.resource.IResource<UserV2>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

interface IRemoteDestinationResource extends UserRemoteDestination, ng.resource.IResourceClass<ng.resource.IResource<UserRemoteDestination>> {
}

export class HuronUserService {
  private userV1Resource: IUserV1Resource;
  private userV2Resource: IUserV2Resource;
  private remoteDestinationResource: IRemoteDestinationResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {

    const updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    this.userV1Resource = <IUserV1Resource>this.$resource(this.HuronConfig.getCmiUrl() + '/common/customers/:customerId/users/:userId', {},
      {
        update: updateAction,
      });

    this.userV2Resource = <IUserV2Resource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/users/:userId', {},
      {
        update: updateAction,
      });

    this.remoteDestinationResource = <IRemoteDestinationResource>this.$resource(this.HuronConfig.getCmiUrl() + '/voice/customers/:customerId/users/:userId/remotedestinations', {},
      {
      });
  }

  public getUserV1(userId: string): ng.IPromise<UserV1> {
    return this.userV1Resource.get({
      customerId: this.Authinfo.getOrgId(),
      userId: userId,
    }).$promise;
  }

  public getUserServices(userId: string): ng.IPromise<string[]> {
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

  public getUserV2Numbers(userId: string): ng.IPromise<UserNumber[]> {
    return this.getUserV2(userId).then(user => {
      return _.get(user, 'numbers', []);
    });
  }

  public getUserV2LineLabel(userId: string): ng.IPromise<string> {
    return this.getUserV2(userId).then(user => {
      const firstName = _.get(user, 'firstName');
      const lastName = _.get(user, 'lastName');
      let tempLineLabel = '';
      if (firstName || lastName) {
        if (firstName) {
          tempLineLabel = firstName as string;
          if (lastName) {
            tempLineLabel = tempLineLabel + ' ' + lastName;
          }
        } else if (lastName) {
          tempLineLabel = lastName as string;
        }
      } else {
        tempLineLabel = _.get(user, 'userName');
      }
      return tempLineLabel;
    });
  }

  public getRemoteDestinations(userId: string): ng.IPromise<any[]> {
    return this.remoteDestinationResource.query({
      customerId: this.Authinfo.getOrgId(),
      userId: userId,
    }).$promise;
  }

  public getUserLineSelection(userId: string): ng.IPromise<PrimaryNumber> {
    return this.userV2Resource.get({
      customerId: this.Authinfo.getOrgId(),
      userId: userId,
      wide: true,
    }).$promise
    .then(user => {
      return _.get(user, 'primaryNumber');
    });
  }

  public updateUserV2(userId: string, data: UserV2): ng.IPromise<any> {
    return this.userV2Resource.update({
      customerId: this.Authinfo.getOrgId(),
      userId: userId,
    },  data).$promise;
  }

  public getFullNameFromUser(user: any): string {
    const firstName = this.getFirstNameFromUser(user);
    const lastName = this.getLastNameFromUser(user);
    if (firstName && lastName) {
      return firstName + ' ' + lastName;
    }
    return user.userName;
  }

  private getFirstNameFromUser(user: any): string {
    return _.get(user, 'firstName', '');
  }

  private getLastNameFromUser(user: any): string {
    return _.get(user, 'lastName', '');
  }
}
