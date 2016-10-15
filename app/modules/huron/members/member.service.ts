import { Member } from './member';

interface IMemberResource extends ng.resource.IResourceClass<ng.resource.IResource<Member>> {}

export class MemberService {
  private memberResource: IMemberResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig
  ) {
    this.memberResource = <IMemberResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/members');
  }

  public getMemberList(name: string, wide: boolean = false): ng.IPromise<Member[]> {
    return this.memberResource.get({
      customerId: this.Authinfo.getOrgId(),
      name: name,
      wide: wide,
    }).$promise
    .then(memberList => {
      return _.get<Member[]>(memberList, 'members', []);
    });
  }

}
