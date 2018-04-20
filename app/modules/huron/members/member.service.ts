import { Member, MemberNumberType } from './member';

interface IMemberResource extends ng.resource.IResourceClass<ng.resource.IResource<Member>> {}

export enum MemberOrder {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
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

  public getMemberList(name?: string, wide?: boolean, callback?: string, order?: MemberOrder, limit?: number, offset?: number, number?: string, type?: MemberNumberType, location?: string): ng.IPromise<Member[]> {
    return this.memberResource.get({
      customerId: this.Authinfo.getOrgId(),
      name: name,
      number: number,
      type: type,
      location: location,
      wide: wide,
      emergencyCallbackNumber: callback,
      order: order,
      limit: limit,
      offset: offset,
    }).$promise
    .then(memberList => {
      return _.get<Member[]>(memberList, 'members', []);
    });
  }

  public getDisplayName(member: Member): string {
    if (member.displayName) {
      return member.displayName;
    } else if (!member.firstName && !member.lastName && member.userName) {
      return member.userName;
    } else if (member.firstName && member.lastName) {
      return member.firstName + ' ' + member.lastName;
    } else if (member.firstName) {
      return member.firstName;
    } else if (member.lastName) {
      return member.lastName;
    } else {
      return '';
    }
  }

}
