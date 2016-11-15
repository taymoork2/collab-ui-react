import { Member, MemberService } from 'modules/huron/members';

export class FeatureMemberService {

  /* @ngInject */
  constructor(private UrlConfig,
              private Authinfo,
              private $http: ng.IHttpService,
              private MemberService: MemberService) {
  }

  public getMemberPicture(memberId: string): ng.IPromise<string> {
    let scimUrl = this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) + '/' + memberId;
    return this.$http.get(scimUrl, {}).then((response) => {
      return _.get(_.find(_.get(response, 'data.photos', []), { type: 'thumbnail' }), 'value', '');
    });
  }

  public getMemberSuggestions(hint: string): ng.IPromise<Member[]> {
    return this.MemberService.getMemberList(hint, false);
  }
}
