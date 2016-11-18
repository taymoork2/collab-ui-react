import { Member, MemberService, USER_REAL_USER, USER_PLACE } from 'modules/huron/members';

export class FeatureMemberService {

  /* @ngInject */
  constructor(private UrlConfig,
              private HuronConfig,
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

  public getUser(memberId: string): ng.IPromise<string> {
    let scimUrl = this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) + '/' + memberId;
    return this.$http.get(scimUrl, {}).then((response) => {
      return _.get(response, 'data');
    });
  }

  public getUserPhoto(user: any): string {
    return _.get(_.find(user.photos, { type: 'thumbnail' }), 'value', '');
  }

  public getFullNameFromUser(user: any): string {
    let givenName = this.getFirstNameFromUser(user);
    let familyName = this.getLastNameFromUser(user);
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
    let cmiV2Url = this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/' + memberId;
    return this.$http.get(cmiV2Url, {}).then((response) => {
      return _.get(response, 'data');
    });
  }

  public getFirstLastName(member: Member) {
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

  public getUserName(member: Member) {
    if (member.userName) {
      return member.userName;
    } else {
      return '';
    }
  }

  //return will be 
  // - "Firstname Lastname (userid@cisco.com)" 
  // - "userid@cisco.com" (if there is no firstName and lastNmae)
  public getFullNameFromMember(member: Member) {
    if (!member) {
      return '';
    }
    let name = '';

    if (member.type === USER_REAL_USER) {
      let firstLastName = this.getFirstLastName(member);
      if (firstLastName !== '') {
        name = (firstLastName + ' (' + this.getUserName(member) + ')');
      } else {
        name = this.getUserName(member);
      }
    } else if (member.type === USER_PLACE && member.displayName) {
      name = member.displayName;
    }
    return name;
  }

  //return will be 
  // - "Firstname Lastname"
  // - "Display Name" (if no firstname and lastname )
  // - "Build 9 Lobby" (displayName if it is Place)
  public getDisplayNameFromMember(member: Member) {
    if (!member) {
      return '';
    }

    let name = '';
    if (member.type === USER_REAL_USER) {
      if (this.getFirstLastName(member) !== '') {
        name = (this.getFirstLastName(member));
      } else {
        name = (member.displayName) ? member.displayName : '';
      }
    } else if (member.type === USER_PLACE && member.displayName) {
      name = member.displayName;
    }
    return name;
  }

  public getMemberType(member: Member) {
    if (!member) {
      return '';
    }

    return (member.type === USER_REAL_USER) ? 'user' : 'place';
  }

  public getMemberSuggestions(hint: string): ng.IPromise<Member[]> {
    return this.MemberService.getMemberList(hint, false);
  }
}
