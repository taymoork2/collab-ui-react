import { Member } from './member';

interface IMemberResource extends ng.resource.IResourceClass<ng.resource.IResource<Member>> {}

export enum MemberOrder {
  ASCENDING = <any>'asc',
  DESCENDING = <any>'desc',
}

export class MemberService {
  private memberResource: IMemberResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {
    this.memberResource = <IMemberResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/members');
  }

  public getMemberList(name?: string, wide?: boolean, callback?: string, order?: MemberOrder, limit?: number, offset?: number): ng.IPromise<Member[]> {
    return this.memberResource.get({
      customerId: this.Authinfo.getOrgId(),
      name: name,
      wide: wide,
      order: order,
      limit: limit,
      offset: offset,
      emergencyCallbackNumber: callback,
    }).$promise
    .then(memberList => {
      return _.get<Member[]>(memberList, 'members', []);
    });
  }

}
