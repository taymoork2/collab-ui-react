import { IPagingGroup, IMemberData, IInitiatorData, IMemberWithPicture, USER, PLACE, PUBLIC, CUSTOM } from 'modules/huron/features/pagingGroup/pagingGroup';
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

  //Paging group members
  public members: IMemberWithPicture[] = [];
  private originalMembersList: IMemberWithPicture[] = [];
  private availableMembers: Member[] = [];
  private memberName: string;
  private userCount: number;
  private placeCount: number;

  //Paging group initiators
  public initiatorType: string = PUBLIC;
  public initiators: IMemberWithPicture[] = [];
  private initiatorName: string;
  private availableInitiators: Member[] = [];
  private initiatorCount: number = 0;
  public errorNoIntiators: boolean = false;
  private originalInitiatorsList: IMemberWithPicture[] = [];

  //Search
  private listOfDisplayMembers: IMemberWithPicture[] = [];
  private listOfDisplayInitiators: IMemberWithPicture[] = [];
  private searchStr: string;
  private searchStrInitiator: string;

  public back: boolean = true;
  public huronFeaturesUrl: string = 'huronfeatures';
  public saveInProgress: boolean = false;
  public form: ng.IFormController;
  public loading: boolean = true;

  public cardThreshold: number = 6;
  public numberOfCardsUsers: number | undefined = this.cardThreshold;
  public numberOfCardsPlaces: number | undefined = this.cardThreshold;
  public numberOfCardsInitiators: number | undefined = this.cardThreshold;

  /* @ngInject */
  constructor(private $state: ng.ui.IStateService,
              private $translate: ng.translate.ITranslateService,
              private Notification,
              private PagingGroupService: PagingGroupService,
              private PagingNumberService: PagingNumberService,
              private FeatureMemberService: FeatureMemberService,
              private $q: ng.IQService) {}

  public $onInit(): void {
    if (this.pgId) {
      this.PagingGroupService.getPagingGroup(this.pgId).then(
        (data) => {
          this.pg = data;
          this.name = this.pg.name;
          this.number = this.pg.extension;
          this.userCount = _.get(_.countBy(this.pg.members, 'type'), USER, 0);
          this.placeCount = _.get(_.countBy(this.pg.members, 'type'), PLACE, 0);
          this.getMembers(this.pg.members);
          if (this.pg.initiatorType !== undefined) {
            this.initiatorType = this.pg.initiatorType;
          }
          if (this.pg.initiators !== undefined) {
            this.initiatorCount = this.pg.initiators.length;
            this.getInitiators(this.pg.initiators);
          }
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

  public getMembers(members: IMemberData[]): void {
    _.forEach(members, (mem) => {
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
            this.FeatureMemberService.populateFeatureMemberInfo(memberWithPic, user);
            this.saveAndSortLists(memberWithPic, 'USER', 'members');
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
            this.saveAndSortLists(memberWithPic, 'PLACE', 'members');
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
  }

  public getInitiators(initiators: IInitiatorData[]): void {
    _.forEach(initiators, (mem) => {
      let memberWithPic: IMemberWithPicture = {
        member: {
          uuid: mem.initiatorId,
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
        this.FeatureMemberService.getUser(mem.initiatorId).then(
          (user) => {
            this.FeatureMemberService.populateFeatureMemberInfo(memberWithPic, user);
            this.saveAndSortLists(memberWithPic, 'USER', 'initiators');
          })
          .catch((error) => {
            if (error && error.status === 404) {
              //Found out of Sync between UPDM and PagingService, update PagingService to fix it
              this.initiatorCount--;
              if (this.pg.initiators !== undefined) {
                this.pg.initiators = _.reject(this.pg.initiators, mem);
              }
              this.PagingGroupService.updatePagingGroup(this.pg);
            }
          });
      } else {
        this.FeatureMemberService.getPlace(mem.initiatorId).then(
          (place) => {
            memberWithPic.member.displayName = place.displayName;
            this.saveAndSortLists(memberWithPic, 'PLACE', 'initiators');
          })
          .catch((error) => {
            if (error && error.status === 404) {
              //Found out of Sync between UPDM and PagingService, update PagingService to fix it
              this.initiatorCount--;
              if (this.pg.initiators !== undefined) {
                this.pg.initiators = _.reject(this.pg.initiators, mem);
              }
              this.PagingGroupService.updatePagingGroup(this.pg);
            }
          });
      }
    });
  }

  public saveAndSortLists(memberWithPic: IMemberWithPicture, memberType: string, memberOrInitiator: string): void {
    if (memberOrInitiator === 'members') {
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

    } else if (memberOrInitiator === 'initiators') {
      this.initiators.push(memberWithPic);
      this.originalInitiatorsList.push(memberWithPic);
      this.listOfDisplayInitiators.push(memberWithPic);
      this.initiators = _.sortBy(this.initiators, (member) => { return this.sortForUser(member.member); });
      this.originalInitiatorsList = _.sortBy(this.originalInitiatorsList, (member) => { return this.sortForUser(member.member); });
      this.listOfDisplayInitiators = _.sortBy(this.listOfDisplayInitiators, (member) => { return this.sortForUser(member.member); });
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

  public fetchMembers(memOrInit): ng.IPromise<Array<Member>> {
    let searchStr: string;
    let availableList: Member [] = [];
    let selectedList: IMemberWithPicture [];

    if (memOrInit === 'MEMBER') {
      searchStr = this.memberName;
      availableList = this.availableMembers;
      selectedList = this.members;
    } else {
      searchStr = this.initiatorName;
      availableList = this.availableInitiators;
      selectedList = this.initiators;
    }

    return this.FeatureMemberService.getMemberSuggestions(searchStr).then(
      (suggestedMembers: Member[]) => {
        availableList = _.reject(suggestedMembers, (mem) => {
          return _.some(selectedList, (member) => {
            return _.get(member, 'member.uuid') === mem.uuid;
          });
        });

        let promises: Array<ng.IPromise<any>> = [];
        _.forEach(availableList, (item: any): void => {
          // If Place is a room device type, remove from availableMembers
          if (item.type === USER_PLACE) {
            promises.push(this.FeatureMemberService.getMachineAcct(item.uuid).then(
              (data) => {
                if (data.machineType === 'lyra_space') {
                  availableList = _.reject(availableList, item);
                }
              }).catch(() => {
                availableList = _.reject(availableList, item);
              }));
          }
        });

        return this.$q.all(promises).then(() => {
          (memOrInit === 'MEMBER') ? (this.availableMembers = availableList) : (this.availableInitiators = availableList);
          return availableList;
        });

      }, (response) => {
      if (memOrInit === 'MEMBER') {
        this.Notification.errorResponse(response, 'pagingGroup.memberFetchFailure');
      } else {
        this.Notification.errorResponse(response, 'pagingGroup.InitiatorFetchFailure');
      }
    });
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
            this.FeatureMemberService.populateFeatureMemberInfo(memberWithPicture, user);
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

  public selectInitiators(member: Member): void {
    if (member) {
      let memberWithPicture: IMemberWithPicture = {
        member: member,
        picturePath: '',
      };

      if (member.type === USER_REAL_USER) {
        this.FeatureMemberService.getUser(member.uuid).then(
          (user) => {
            this.FeatureMemberService.populateFeatureMemberInfo(memberWithPicture, user);
          });
      }

      this.initiators.unshift(memberWithPicture);
      if (this.isMeetSearch(memberWithPicture, this.searchStrInitiator)) {
        this.listOfDisplayInitiators.unshift(memberWithPicture);
      }
      this.initiatorCount++;
      this.initiatorName = '';
      this.formChanged = true;
      this.errorNoIntiators = false;
    }
    this.availableInitiators = [];
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

  public removeInitiators(member: IMemberWithPicture): void {
    if (member) {
      this.initiators = _.reject(this.initiators, member);
      if (this.isMeetSearch(member, this.searchStrInitiator)) {
        this.listOfDisplayInitiators = _.reject(this.listOfDisplayInitiators, member);
      }
    }
    this.initiatorCount--;
    this.initiatorName = '';
    if (this.initiatorCount === 0) {
      this.errorNoIntiators = true;
    } else {
      this.formChanged = true;
    }
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

  public getSearchedCount(members: IMemberWithPicture[], userType: string): number {
    return _.get(_.countBy(members, 'member.type'), userType, 0);
  }

  public onCancel(): void {
    this.name = this.pg.name;
    this.number = this.pg.extension;
    if (this.pg.initiatorType !== undefined) {
      this.initiatorType = this.pg.initiatorType;
    }
    this.members = [];
    this.initiators = [];
    this.listOfDisplayMembers = [];
    this.listOfDisplayInitiators = [];
    _.forEach(this.originalMembersList, (mem) => {
      this.members.push(mem);
      this.listOfDisplayMembers.push(mem);
    });

    _.forEach(this.originalInitiatorsList, (initiator) => {
      this.initiators.push(initiator);
      this.listOfDisplayInitiators.push(initiator);
    });

    this.userCount = _.get(_.countBy(this.originalMembersList, 'member.type'), USER_REAL_USER, 0);
    this.placeCount = _.get(_.countBy(this.originalMembersList, 'member.type'), USER_PLACE, 0);
    this.initiatorCount = this.originalInitiatorsList.length;
    this.errorNameInput = false;
    this.formChanged = false;
    this.form.$setPristine();
    this.form.$setUntouched();
  }

  public onChange(): void {
    this.errorNoIntiators = false;
    let reg = /^[A-Za-z\-\_\d\s]+$/;
    this.errorNameInput = !reg.test(this.name);
    if (this.initiatorType === CUSTOM && this.initiators.length === 0) {
      this.errorNoIntiators = true;
    }
    this.formChanged = true;
  }

  public showDisableSave() {
    return this.errorNameInput || this.errorNoIntiators;
  }

  public saveForm(): void {
    let emptyDeviceId: string[] = [];
    let members: IMemberData[] = [];
    let initiators: IInitiatorData[] = [];
    _.forEach(this.members, function (mem) {
      let member: IMemberData = <IMemberData> {
        memberId: mem.member.uuid,
        deviceIds: emptyDeviceId,
        type: (mem.member.type === USER_REAL_USER) ? USER : PLACE,
      };
      members.push(member);
    });
    //Populate Initiator data
    if (this.initiatorType === CUSTOM) {
      _.forEach(this.initiators, function (mem) {
        let initiator: IInitiatorData = <IInitiatorData> {
          initiatorId: mem.member.uuid,
          type: (mem.member.type === USER_REAL_USER) ? USER : PLACE,
        };
        initiators.push(initiator);
      });
    }
    let pg: IPagingGroup = <IPagingGroup>{
      name: this.name,
      extension: this.number,
      members: members,
      initiatorType: this.initiatorType,
      initiators: initiators,
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

  public showMoreClicked(memberType, memOrInit): void {
    if (memOrInit === 'MEMBER' ) {
      (memberType === 'USER_REAL_USER') ? (this.numberOfCardsUsers = undefined) : (this.numberOfCardsPlaces = undefined);
    } else {
      this.numberOfCardsInitiators = undefined;
    }
  }

  public showLessClicked(memberType, memOrInit): void {
    if (memOrInit === 'MEMBER') {
      (memberType === 'USER_REAL_USER') ? (this.numberOfCardsUsers = this.cardThreshold) : (this.numberOfCardsPlaces = this.cardThreshold);
    } else {
      this.numberOfCardsInitiators = this.cardThreshold;
    }
  }

  public showMoreButton(memberType, memOrInit): boolean {
    if (memOrInit === 'MEMBER') {
      return (memberType === 'USER_REAL_USER')
        ? (this.getUserCount() > this.cardThreshold && this.numberOfCardsUsers === this.cardThreshold &&
          this.getSearchedCount(this.listOfDisplayMembers, USER_REAL_USER) > this.cardThreshold)
        : (this.getPlaceCount() > this.cardThreshold && this.numberOfCardsPlaces === this.cardThreshold &&
          this.getSearchedCount(this.listOfDisplayMembers, USER_PLACE) > this.cardThreshold);
    } else {
      return (this.initiatorCount > this.cardThreshold && this.numberOfCardsInitiators === this.cardThreshold &&
      this.listOfDisplayInitiators.length > this.cardThreshold && this.initiatorType === CUSTOM);
    }
  }

  public showLessButton(memberType, memOrInit): boolean {
    if (memOrInit === 'MEMBER') {
      return (memberType === 'USER_REAL_USER')
        ? (this.getUserCount() > this.cardThreshold && this.numberOfCardsUsers === undefined &&
          this.getSearchedCount(this.listOfDisplayMembers, USER_REAL_USER) > this.cardThreshold)
        : (this.getPlaceCount() > this.cardThreshold && this.numberOfCardsPlaces === undefined &&
          this.getSearchedCount(this.listOfDisplayMembers, USER_PLACE) > this.cardThreshold);
    } else {
      return (this.initiatorCount > this.cardThreshold && this.numberOfCardsInitiators === undefined &&
        this.listOfDisplayInitiators.length > this.cardThreshold && this.initiatorType === CUSTOM);
    }
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

  public filterListInitiator() {
    let str = this.searchStrInitiator.toLowerCase();
    let filteredList = _.filter(this.initiators, (mem) => {
      return this.isMeetSearch(mem, str);
    });
    this.listOfDisplayInitiators = _.sortBy(filteredList, str);
  }

  public resetFilter(): void {
    this.searchStr = '';
    this.filterList();
  }

  public resetFilterInitiator(): void {
    this.searchStrInitiator = '';
    this.filterListInitiator();
  }
}

export class PgEditComponent implements ng.IComponentOptions {
  public controller = PgEditComponentCtrl;
  public templateUrl = 'modules/huron/features/pagingGroup/edit/pgEdit.html';
  public bindings = {
    pgId: '<',
  };
}
