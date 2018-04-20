import { Member, MemberService, USER_REAL_USER, USER_PLACE } from 'modules/huron/members';
import { IMemberWithPicture } from 'modules/call/features/paging-group/shared';

export interface IFeatureMemberPicture {
  memberUuid: string;
  thumbnailSrc: string | undefined;
}

export class MemberTypeConst {
  public static PLACE: string = 'PROFILE_PLACE';
  public static USER: string  = 'PROFILE_REAL_USER';
}

export class FeatureMemberService {
  /* @ngInject */
  constructor(
    private UrlConfig,
    private HuronConfig,
    private Authinfo,
    private $http: ng.IHttpService,
    private MemberService: MemberService,
  ) {}

  public getMemberPicture(memberId: string): ng.IPromise<IFeatureMemberPicture> {
    const scimUrl = this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) + '/' + memberId;
    return this.$http.get(scimUrl, {}).then((response) => {
      const memberPicture = <IFeatureMemberPicture>{
        memberUuid: memberId,
        thumbnailSrc: _.get(_.find(_.get(response, 'data.photos', []), { type: 'thumbnail' }), 'value', ''),
      };
      return memberPicture;
    });
  }

  public getUser(memberId: string): ng.IPromise<string> {
    const scimUrl = this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) + '/' + memberId;
    return this.$http.get(scimUrl, {}).then((response) => {
      return _.get(response, 'data');
    });
  }

  public getUserPhoto(user: any): string {
    return _.get(_.find(user.photos, { type: 'thumbnail' }), 'value', '');
  }

  public getFullNameFromUser(user: any): string {
    const givenName = this.getFirstNameFromUser(user);
    const familyName = this.getLastNameFromUser(user);
    if (givenName && familyName) {
      return givenName + ' ' + familyName;
    }
    return (user.displayName) ? user.displayName : user.userName;
  }

  public getFirstNameFromUser(user: any): string {
    return _.get(user, 'name.givenName', '');
  }

  public getLastNameFromUser(user: any): string {
    return _.get(user, 'name.familyName', '');
  }

  public getDisplayNameFromUser(user: any): string {
    return user.displayName;
  }

  public getUserNameFromUser(user: any): string {
    return user.userName;
  }

  public getPlace(memberId: string): ng.IPromise<any> {
    const cmiV2Url = this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/' + memberId;
    return this.$http.get(cmiV2Url, {}).then((response) => {
      return _.get(response, 'data');
    });
  }

  public getFirstLastName(member: Member): string {
    if (member.firstName && member.lastName) {
      return member.firstName + ' ' + member.lastName;
    } else if (member.firstName) {
      return member.firstName;
    } else if (member.lastName) {
      return member.lastName;
    } else {
      return '';
    }
  }

  public getUserName(member: Member): string {
    if (member && member.userName) {
      return member.userName;
    } else {
      return '';
    }
  }

  //return will be
  // - "Firstname Lastname (userid@cisco.com)"
  // - "userid@cisco.com" (if there is no firstName and lastNmae)
  public getFullNameFromMember(member: Member): string {
    if (!member) {
      return '';
    }
    let name = '';

    if (member.type === USER_REAL_USER || member.type === MemberTypeConst.USER) {
      const firstLastName = this.getFirstLastName(member);
      if (firstLastName !== '') {
        name = (firstLastName + ' (' + this.getUserName(member) + ')');
      } else {
        name = this.getUserName(member);
      }
    } else if ((member.type === USER_PLACE || member.type === MemberTypeConst.PLACE) && member.displayName) {
      name = member.displayName;
    }
    return name;
  }

  //return will be
  // - "Firstname Lastname"
  // - "Display Name" (if no firstname and lastname )
  // - "Build 9 Lobby" (displayName if it is Place)
  public getDisplayNameFromMember(member: Member): string {
    if (!member) {
      return '';
    }
    let name = '';
    if (member.type === USER_REAL_USER || member.type === MemberTypeConst.USER ) {
      if (this.getFirstLastName(member) !== '') {
        name = (this.getFirstLastName(member));
      } else {
        name = (member.displayName) ? member.displayName : '';
      }
    } else if ((member.type === USER_PLACE || member.type === MemberTypeConst.PLACE) && member.displayName) {
      name = member.displayName;
    }
    return name;
  }

  public getMemberType(member: Member): string {
    if (!member) {
      return '';
    }

    return (member.type === USER_REAL_USER || member.type === MemberTypeConst.USER ) ? 'user' : 'place';
  }

  public getMemberSuggestions(hint: string): ng.IPromise<Member[]> {
    return this.MemberService.getMemberList(hint, false);
  }

  public getMachineAcct(uuid: string): ng.IPromise<any> {
    const domainMgmtUrl = this.UrlConfig.getDomainManagementUrl(this.Authinfo.getOrgId()) + 'Machines/' + uuid;

    return this.$http.get(domainMgmtUrl, {}).then((response) => {
      return _.get(response, 'data');
    });
  }

  public populateFeatureMemberInfo(memberWithPicture: IMemberWithPicture, user: any) {
    memberWithPicture.member.firstName = this.getFirstNameFromUser(user);
    memberWithPicture.member.lastName = this.getLastNameFromUser(user);
    memberWithPicture.member.displayName = this.getDisplayNameFromUser(user);
    memberWithPicture.member.userName = this.getUserNameFromUser(user);
    memberWithPicture.picturePath = this.getUserPhoto(user);
  }

  public getMemberSuggestionsByLimit(hint: string, limit: number): ng.IPromise<Member[]> {
    return this.MemberService.getMemberList(hint, false, undefined, undefined, limit);
  }

}
