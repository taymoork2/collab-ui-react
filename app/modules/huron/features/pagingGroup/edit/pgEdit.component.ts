import { IPagingGroup, IMemberData, IMemberWithPicture, USER, PLACE } from 'modules/huron/features/pagingGroup/pagingGroup';
import { PagingNumberService } from 'modules/huron/features/pagingGroup/pgNumber.service';
import { PagingGroupService } from 'modules/huron/features/pagingGroup/pagingGroup.service';
import { FeatureMemberService } from 'modules/huron/features/featureMember.service';
import { Member, USER_PLACE, USER_REAL_USER } from 'modules/huron/members';

class PgEditComponentCtrl implements ng.IComponentController {

  private pgId: string;
  private pg: IPagingGroup;

  //Paging group name
  public name: string = '';
  public errorNameInput: boolean = false;
  public formChanged: boolean = false;

  //Paging group number
  public number: string;
  private availableNumbers: string[] = [];
  private availableMembers: Member[] = [];

  //Paging group members
  public members: IMemberWithPicture[] = [];
  private originalMembersList: IMemberWithPicture[] = [];
  private memberName: string;
  private userCount: number;
  private placeCount: number;

  //Search 
  private listOfDisplayMembers: IMemberWithPicture[] = [];
  private searchStr: string;

  public back: boolean = true;
  public huronFeaturesUrl: string = 'huronfeatures';
  public saveInProgress: boolean = false;
  public form: ng.IFormController;
  public loading: boolean = true;

  public cardThreshold: number = 6;
  public numberOfCardsUsers: number | undefined = this.cardThreshold;
  public numberOfCardsPlaces: number | undefined = this.cardThreshold;

  /* @ngInject */
  constructor(private $state: ng.ui.IStateService,
              private $translate: ng.translate.ITranslateService,
              private Notification,
              private PagingGroupService: PagingGroupService,
              private PagingNumberService: PagingNumberService,
              private FeatureMemberService: FeatureMemberService) {
  }

  public $onInit(): void {
    if (this.pgId) {
      this.PagingGroupService.getPagingGroup(this.pgId).then(
        (data) => {
          this.pg = data;
          this.name = this.pg.name;
          this.number = this.pg.extension;
          this.userCount = _.get(_.countBy(this.pg.members, 'type'), USER, 0);
          this.placeCount = _.get(_.countBy(this.pg.members, 'type'), PLACE, 0);
          _.forEach(this.pg.members, (mem) => {
            let memberWithPic: IMemberWithPicture = {
              member: {
                uuid: mem.memberId,
                type: (mem.type === USER) ? USER_REAL_USER : USER_PLACE,
                firstName: undefined,
                lastName: undefined,
                userName: undefined,
                displayName: undefined,
                numbers: [],
              },
              picturePath: '',
            };
            if (mem.type === USER) {
              this.FeatureMemberService.getUser(mem.memberId).then(
                (user) => {
                  memberWithPic.member.firstName = this.FeatureMemberService.getFirstNameFromUser(user);
                  memberWithPic.member.lastName = this.FeatureMemberService.getLastNameFromUser(user);
                  memberWithPic.member.displayName = this.FeatureMemberService.getDisplayNameFromUser(user);
                  memberWithPic.member.userName = this.FeatureMemberService.getUserNameFromUser(user);
                  memberWithPic.picturePath = this.FeatureMemberService.getUserPhoto(user);
                  this.saveAndSortLists(memberWithPic, 'USER');
                })
                .catch((error) => {
                  if (error && error.status === 404) {
                    //Found out of Sync between UPDM and PagingService, update PagingService to fix it
                    this.userCount--;
                    this.pg.members = _.reject(this.pg.members, mem);
                    this.PagingGroupService.updatePagingGroup(this.pg);
                  }
                });
            } else {
              this.FeatureMemberService.getPlace(mem.memberId).then(
                (place) => {
                  memberWithPic.member.displayName = place.displayName;
                  this.saveAndSortLists(memberWithPic, 'PLACE');
                })
                .catch((error) => {
                  if (error && error.status === 404) {
                    //Found out of Sync between UPDM and PagingService, update PagingService to fix it
                    this.placeCount--;
                    this.pg.members = _.reject(this.pg.members, mem);
                    this.PagingGroupService.updatePagingGroup(this.pg);
                  }
                });
            }
          });
          this.loading = false;
        },
        (error) => {
          let message = '';
          if (error && _.has(error, 'data')
            && _.has(error.data, 'error')
            && _.has(error.data.error, 'message')
            && _.has(error.data.error.message, 'length')
            && error.data.error.message.length > 0
            && _.has(error.data.error.message[0], 'description')) {
            message = error.data.error.message[0].description;
          }
          this.Notification.error('pagingGroup.errorUpdate', { message: message });
        });
      this.fetchNumbers();
    } else {
      this.$state.go(this.huronFeaturesUrl);
    }
  }

  public saveAndSortLists(memberWithPic: IMemberWithPicture, memberType: string): void {
    this.members.push(memberWithPic);
    this.originalMembersList.push(memberWithPic);
    this.listOfDisplayMembers.push(memberWithPic);
    if (memberType === 'USER') {
      this.members = _.sortBy(this.members, (member) => { return this.sortForUser(member.member); });
      this.originalMembersList = _.sortBy(this.originalMembersList, (member) => { return this.sortForUser(member.member); });
      this.listOfDisplayMembers = _.sortBy(this.listOfDisplayMembers, (member) => { return this.sortForUser(member.member); });
    } else if (memberType === 'PLACE') {
      this.members = _.sortBy(this.members, (member) => { return this.sortForPlace(member.member); });
      this.originalMembersList = _.sortBy(this.originalMembersList, (member) => { return this.sortForPlace(member.member); });
      this.listOfDisplayMembers = _.sortBy(this.listOfDisplayMembers, (member) => { return this.sortForPlace(member.member); });
    }
  }

  public sortForUser(member: Member) {
    return (member.displayName ? member.displayName.toLowerCase() : undefined,
      member.lastName ? member.lastName.toLowerCase() : undefined,
      member.firstName ? member.firstName.toLowerCase() : undefined);
  }

  public sortForPlace(member: Member) {
    return (member.displayName ? member.displayName.toLowerCase() : undefined);
  }

  public getDisplayNameOnCard(member: Member) {
    return this.FeatureMemberService.getDisplayNameFromMember(member);
  }

  public getMemberType(member: Member) {
    return this.FeatureMemberService.getMemberType(member);
  }

  public fetchNumbers(filter?: string): void {
    this.PagingNumberService.getNumberSuggestions(filter).then(
      (data: string[]) => {
        this.availableNumbers = data;
      }, (response) => {
        this.Notification.errorResponse(response, 'pagingGroup.numberFetchFailure');
      });
  }

  public fetchMembers(): void {
    if (this.memberName && this.memberName.length >= 3) {
      this.FeatureMemberService.getMemberSuggestions(this.memberName).then(
          (suggestedMembers: Member[]) => {
            this.availableMembers = _.reject(suggestedMembers, (mem) => {
              return _.some(this.members, (member) => {
                return _.get(member, 'member.uuid') === mem.uuid;
              });
            });
          }, (response) => {
            this.Notification.errorResponse(response, 'pagingGroup.memberFetchFailure');
          });
    }
  }

  public selectMembers(member: Member): void {
    if (member) {
      let memberWithPicture: IMemberWithPicture = {
        member: member,
        picturePath: '',
      };

      if (member.type === USER_REAL_USER) {
        this.FeatureMemberService.getUser(member.uuid).then(
          (user) => {
            memberWithPicture.member.firstName = this.FeatureMemberService.getFirstNameFromUser(user);
            memberWithPicture.member.lastName = this.FeatureMemberService.getLastNameFromUser(user);
            memberWithPicture.member.displayName = this.FeatureMemberService.getDisplayNameFromUser(user);
            memberWithPicture.member.userName = this.FeatureMemberService.getUserNameFromUser(user);
            memberWithPicture.picturePath = this.FeatureMemberService.getUserPhoto(user);
          });
      }

      this.members.unshift(memberWithPicture);
      this.incrementCount(member);
      if (this.isMeetSearch(memberWithPicture, this.searchStr)) {
        this.listOfDisplayMembers.unshift(memberWithPicture);
      }
      this.memberName = '';
      this.formChanged = true;
    }
    this.availableMembers = [];
  }

  private incrementCount(member: Member): void {
    if (member.type === USER_REAL_USER) {
      this.userCount++;
    } else if (member.type === USER_PLACE) {
      this.placeCount++;
    }
  }

  private decreaseCount(member: Member): void {
    if (member.type === USER_REAL_USER) {
      this.userCount--;
    } else if (member.type === USER_PLACE) {
      this.placeCount--;
    }
  }
  public removeMembers(member: IMemberWithPicture): void {
    if (member) {
      this.members = _.reject(this.members, member);
      if (this.isMeetSearch(member, this.searchStr)) {
        this.listOfDisplayMembers = _.reject(this.listOfDisplayMembers, member);
      }
    }
    this.decreaseCount(member.member);
    this.memberName = '';
    this.formChanged = true;
  }

  public getDisplayNameInDropdown(member: Member) {
    return this.FeatureMemberService.getFullNameFromMember(member);
  }

  public getUserCount(): number {
    return this.userCount;
  }

  public getPlaceCount(): number {
    return this.placeCount;
  }

  public onCancel(): void {
    this.name = this.pg.name;
    this.number = this.pg.extension;
    this.members = [];
    this.listOfDisplayMembers = [];
    _.forEach(this.originalMembersList, (mem) => {
      this.members.push(mem);
      this.listOfDisplayMembers.push(mem);
    });

    this.userCount = _.get(_.countBy(this.originalMembersList, 'member.type'), USER_REAL_USER, 0);
    this.placeCount = _.get(_.countBy(this.originalMembersList, 'member.type'), USER_PLACE, 0);
    this.errorNameInput = false;
    this.formChanged = false;
    this.form.$setPristine();
    this.form.$setUntouched();
  }

  public onChange(): void {
    let reg = /^[A-Za-z\-\_\d\s]+$/;
    this.errorNameInput = !reg.test(this.name);
    this.formChanged = true;
  }

  public showDisableSave() {
    return this.errorNameInput;
  }

  public saveForm(): void {
    let emptyDeviceId: string[] = [];
    let members: IMemberData[] = [];
    _.forEach(this.members, function (mem) {
      let member: IMemberData = <IMemberData> {
        memberId: mem.member.uuid,
        deviceIds: emptyDeviceId,
        type: (mem.member.type === USER_REAL_USER) ? USER : PLACE,
      };
      members.push(member);
    });
    let pg: IPagingGroup = <IPagingGroup>{
      name: this.name,
      extension: this.number,
      members: members,
    };
    pg.groupId = this.pg.groupId;

    this.PagingGroupService.updatePagingGroup(pg).then(
      (data) => {
        this.Notification.success(this.$translate.instant('pagingGroup.successUpdate', {
          pagingGroupName: data.name,
        }));
        this.$state.go(this.huronFeaturesUrl);
      },
      (error) => {
        let message = '';
        if (error && _.has(error, 'data')
          && _.has(error.data, 'error')
          && _.has(error.data.error, 'message')
          && _.has(error.data.error.message, 'length')
          && error.data.error.message.length > 0
          && _.has(error.data.error.message[0], 'description')) {
          message = error.data.error.message[0].description;
        }
        this.Notification.error('pagingGroup.errorUpdate', { message: message });
      });
  }

  public showFilterIcon(): boolean {
    return (this.getUserCount() > this.cardThreshold || this.getPlaceCount() > this.cardThreshold);
  }

  public showMoreClicked(memberType): void {
    (memberType === 'USER_REAL_USER') ? (this.numberOfCardsUsers = undefined) : (this.numberOfCardsPlaces = undefined);
  }

  public showLessClicked(memberType): void {
    (memberType === 'USER_REAL_USER') ? (this.numberOfCardsUsers = this.cardThreshold) : (this.numberOfCardsPlaces = this.cardThreshold);
  }

  public showMoreButton(memberType): boolean {
    return (memberType === 'USER_REAL_USER')
      ? (this.getUserCount() > this.cardThreshold && this.numberOfCardsUsers === this.cardThreshold)
      : (this.getPlaceCount() > this.cardThreshold && this.numberOfCardsPlaces === this.cardThreshold);
  }

  public showLessButton(memberType): boolean {
    return (memberType === 'USER_REAL_USER')
      ? (this.getUserCount() > this.cardThreshold && this.numberOfCardsUsers === undefined)
      : (this.getPlaceCount() > this.cardThreshold && this.numberOfCardsPlaces === undefined);
  }

  private isMeetSearch(member: IMemberWithPicture, str: string): boolean {
    if (_.isEmpty(str)) {
      return true;
    }
    if (member.member.firstName && (member.member.firstName.toLowerCase().indexOf(str) !== -1 )) {
      return true;
    } else if (member.member.lastName && (member.member.lastName.toLowerCase().indexOf(str) !== -1 )) {
      return true;
    } else if (member.member.userName && (member.member.userName.toLowerCase().indexOf(str) !== -1 )) {
      return true;
    } else if (member.member.displayName && (member.member.displayName.toLowerCase().indexOf(str) !== -1 )) {
      return true;
    } else {
      return false;
    }
  }

  public filterList() {
    let str = this.searchStr.toLowerCase();
    let filteredList = _.filter(this.members, (mem) => {
      return this.isMeetSearch(mem, str);
    });
    this.listOfDisplayMembers = _.sortBy(filteredList, str);
  }

  public resetFilter(): void {
    this.searchStr = '';
    this.filterList();
  }
}

export class PgEditComponent implements ng.IComponentOptions {
  public controller = PgEditComponentCtrl;
  public templateUrl = 'modules/huron/features/pagingGroup/edit/pgEdit.html';
  public bindings = {
    pgId: '<',
  };
}
