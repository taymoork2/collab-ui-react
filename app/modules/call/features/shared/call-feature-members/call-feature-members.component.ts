import { CallFeatureMember, CardType } from './call-feature-member';
import { MemberService, Member, MemberType, USER_PLACE, USER_REAL_USER } from 'modules/huron/members';
import { FeatureMemberService } from 'modules/huron/features/services';
import { Line } from 'modules/huron/lines/services/line';
import { PhoneNumberService } from 'modules/huron/phoneNumber';
import { CardUtils } from 'modules/core/cards';
import { DraggableService, DraggableInstance } from 'modules/core/accessibility';

export enum ComponentType {
  CALL_PARK = 'CALL_PARK',
  CALL_PICKUP = 'CALL_PICKUP',
  HUNT_GROUP = 'HUNT_GROUP',
  PAGING_GROUP = 'PAGING_GROUP',
}

class CallFeatureMembersCtrl implements ng.IComponentController {
  public static readonly DISPLAYED_MEMBER_SIZE: number = 10;

  public members: CallFeatureMember[];
  public displayedMembers: CallFeatureMember[] = [];
  public filterBy: string[];
  public memberHintKey: string;
  public memberHint: string;
  public memberItemType: string;
  public removeKey: string;
  public removeStr: string;
  public componentType: ComponentType;
  public showExternalNumbers: boolean;
  public isNew: boolean;
  public dragAndDrop: boolean;
  public onChangeFn: Function;
  public onKeyPressFn: Function;
  public selectedMember: Member | undefined;
  public errorMemberInput: boolean = false;
  public searchStr: string;
  public draggableInstance: DraggableInstance;
  public location;
  public memberSearchTemplate: string;

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private MemberService: MemberService,
    private FeatureMemberService: FeatureMemberService,
    private $translate: ng.translate.ITranslateService,
    private PhoneNumberService: PhoneNumberService,
    private CardUtils: CardUtils,
    private DraggableService: DraggableService,
  ) {
    switch (this.componentType) {
      case ComponentType.PAGING_GROUP:
        this.memberSearchTemplate = 'callFeatureMemberWithUsernameTemplate.html';
        break;
      default:
        this.memberSearchTemplate = 'callFeatureMemberWithNumberTemplate.html';
        break;
    }
  }

  public $onInit(): void {
    this.memberHint = this.$translate.instant(this.memberHintKey);
    this.removeStr = this.$translate.instant(this.removeKey);
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const memberChanges = changes['members'];
    if (memberChanges && memberChanges.currentValue) {
      this.processMemberChanges(memberChanges);
    }
  }

  private processMemberChanges(memberChanges: ng.IChangesObject<any>): void {
    this.displayedMembers = _.take<CallFeatureMember>(memberChanges.currentValue, CallFeatureMembersCtrl.DISPLAYED_MEMBER_SIZE);
    this.CardUtils.resize();
  }

  public getMemberList(value: string): ng.IPromise<CallFeatureMember[]> {
    return this.MemberService.getMemberList(value, true, undefined, undefined, undefined, undefined, undefined, undefined, _.get(this.location, 'uuid', undefined)).then( members => {
      return this.convertMemberToCallFeatureMember(members);
    });
  }

  public selectMember(member: CallFeatureMember): void {
    this.selectedMember = undefined;
    let memberId;
    switch (this.memberItemType) {
      case 'number':
        memberId = member.memberItemId;
        break;
      default:
        memberId = member.uuid;
        break;
    }
    this.FeatureMemberService.getMemberPicture(memberId).then(featureMemberPicture => {
      this.addMember(member, _.get(featureMemberPicture, 'thumbnailSrc', undefined));
    }).catch( () => { // request for picture failed, but we don't care!
      this.addMember(member, undefined);
    });
  }

  public getMemberCount(): number {
    if (this.members) {
      return this.members.length;
    } else {
      return 0;
    }
  }

  private convertMemberToCallFeatureMember(members: Member[]): CallFeatureMember[] {
    switch (this.memberItemType) {
      case 'number':
        return this.convertAsNumbers(members);
      default: // memberItemType = 'member'
        switch (this.componentType) {
          case ComponentType.PAGING_GROUP:
            return this.convertAsPagingGroupMembers(members);
          default:
            return this.convertAsHuntGroupMembers(members);
        }
    }
  }

  private convertAsPagingGroupMembers(members: Member[]): CallFeatureMember[] {
    const filteredMembers = _.filter(members, number => this.isNewMember(number.uuid || ''));
    return _.map(filteredMembers, member => {
      return new CallFeatureMember({
        uuid: member.uuid || '',
        name: this.formatDisplayName(member),
        showName: true,
        type: member.type === USER_PLACE ? MemberType.USER_PLACE : MemberType.USER_REAL_USER,
        cardType: CardType.SIMPLE,
        complexCardType: undefined,
        number: member.type === USER_REAL_USER ? _.get(member, 'userName') : '',
        memberItemId: undefined,
        memberItems: [],
        thumbnailSrc: undefined,
      });
    });
  }

  private convertAsHuntGroupMembers(members: Member[]): CallFeatureMember[] {
    const filteredMembers = _.filter(members, number => this.isNewMember(number.uuid || ''));
    return _.map(filteredMembers, member => {
      const primaryNumber = this.getPrimaryNumber(member);
      return new CallFeatureMember({
        uuid: member.uuid || '',
        name: this.formatDisplayName(member),
        showName: true,
        type: member.type === USER_PLACE ? MemberType.USER_PLACE : MemberType.USER_REAL_USER,
        cardType: CardType.SIMPLE,
        complexCardType: undefined,
        number: this.formatNumber(primaryNumber),
        memberItemId: primaryNumber.uuid,
        memberItems: [],
        thumbnailSrc: undefined,
      });
    });
  }

  private convertAsNumbers(members: Member[]): CallFeatureMember[] {
    let convertedMembers: CallFeatureMember[]  = [];
    _.forEach(members, member => {
      const filteredNumbers = _.filter(member.numbers, number => this.isNewMember(number.uuid || ''));
      convertedMembers = _.concat(convertedMembers, _.map(filteredNumbers, (number, index) => {
        return new CallFeatureMember({
          uuid: number.uuid || '',
          name: this.formatDisplayName(member),
          showName: index === 0 ? true : false,
          type: member.type === USER_PLACE ? MemberType.USER_PLACE : MemberType.USER_REAL_USER,
          cardType: CardType.SIMPLE,
          complexCardType: undefined,
          number: this.formatNumber(number, true),
          memberItemId: member.uuid,
          memberItems: [],
          thumbnailSrc: undefined,
        });
      }));
    });
    return convertedMembers;
  }

  private addMember(member: CallFeatureMember, thumbnailSrc: string | undefined): void {
    member.thumbnailSrc = thumbnailSrc;
    this.members.unshift(member);
    this.onMembersChanged(this.members);
  }

  private formatNumber(number: Line, includeExternal: boolean = false): string {
    let formattedNumber = _.get<Line, string>(number, 'internal', '');
    const externalNumber = _.get<Line, string | undefined>(number, 'external');

    if (includeExternal && externalNumber) {
      formattedNumber += ' ' + this.$translate.instant('common.and') + ' ' + this.PhoneNumberService.getNationalFormat(externalNumber);
    }
    return formattedNumber;
  }

  private formatDisplayName(member: Member): string {
    if (member.displayName) {
      return member.displayName;
    } else if (member.firstName && member.lastName) {
      return `${member.firstName} ${member.lastName} (${member.userName})`;
    } else if (member.firstName) {
      return `${member.firstName} (${member.userName})`;
    } else if (member.lastName) {
      return  `${member.lastName} (${member.userName})`;
    } else {
      return member.userName || '';
    }
  }

  public onUpdateCardMember(id: string, data: any): void {
    const member = _.find(this.members, ['memberUuid', id]);
    if (data) {
      member.uuid = _.get<string>(data, 'value');
    }
    this.onMembersChanged(this.members);
  }

  public unSelectMember(member: CallFeatureMember): void {
    _.remove<CallFeatureMember>(this.members, (callFeatureMember) => {
      return callFeatureMember.uuid === member.uuid;
    });
    this.onMembersChanged(this.members);
  }

  private onMembersChanged(members: CallFeatureMember[]): void {
    this.onChangeFn({
      members: _.cloneDeep(members),
    });
  }

  private isNewMember(uuid: string): boolean {
    const existingMembers = _.find(this.members, (member) => {
      return member.uuid === uuid;
    });
    return _.isUndefined(existingMembers);
  }

  private getPrimaryNumber(member: Member): Line {
    return _.find<Line>(member.numbers, (item) => {
      return item.primary === true;
    });
  }

  public onHandleKeyPress($keyCode): void {
    this.onKeyPressFn({
      keyCode: $keyCode,
    });
  }

  public filterDisplayedMembers(): void {
    if (_.isEmpty(this.searchStr)) {
      this.resetDisplayedMembers();
    } else {
      this.displayedMembers = _.filter(this.members, (member) => {
        return _.includes(_.toLower(_.join(_.values(_.pick(member, this.filterBy)))), _.toLower(this.searchStr));
      });
    }
  }

  public showMoreButton(): boolean {
    return (this.getMemberCount() > CallFeatureMembersCtrl.DISPLAYED_MEMBER_SIZE)
      && (this.displayedMembers.length !== this.getMemberCount());
  }

  public showLessButton(): boolean {
    return (this.getMemberCount() > CallFeatureMembersCtrl.DISPLAYED_MEMBER_SIZE)
      && (this.displayedMembers.length === this.getMemberCount());
  }

  public onShowMoreClicked(): void {
    this.displayedMembers = _.cloneDeep(this.members);
  }

  public onShowLessClicked(): void {
    this.resetDisplayedMembers();
  }

  public onReorderClicked(): void {
    this.searchStr = '';
    this.displayedMembers = _.cloneDeep(this.members);

    if (_.isUndefined(this.draggableInstance)) {
      this.draggableInstance = this.DraggableService.createDraggableInstance({
        elem: this.$element,
        identifier: '#membersContainer',
        transitClass: 'upper-panel',
        itemIdentifier: '#cardReorder',
        list: this.displayedMembers,
      });
    } else {
      this.draggableInstance.reordering = true;
      this.draggableInstance.refreshDragularInstance(this.displayedMembers);
    }
  }

  public onApplyReorderClicked(): void {
    this.deactivateDraggable();
    this.onMembersChanged(this.displayedMembers);
  }

  public onCancelReorderClicked(): void {
    this.deactivateDraggable();
    this.resetDisplayedMembers();
  }

  public itemKeypress($event: KeyboardEvent, id: string) {
    if (!this.isReordering) {
      return;
    } else if (_.get(this.draggableInstance, 'keyPress')) {
      const member = _.find(this.displayedMembers, ['uuid', id]);
      this.draggableInstance.keyPress($event, member);
      this.displayedMembers = this.draggableInstance.list;
    }
  }

  get isReordering() {
    return _.get(this.draggableInstance, 'reordering', false);
  }

  public isSelectedItem(item) {
    return item === _.get(this.draggableInstance, 'selectedItem');
  }

  private resetDisplayedMembers(): void {
    this.displayedMembers = _.take(this.members, CallFeatureMembersCtrl.DISPLAYED_MEMBER_SIZE);
  }

  private deactivateDraggable() {
    if (!_.isUndefined(this.draggableInstance)) {
      this.draggableInstance.selectedItem = undefined;
      this.draggableInstance.reordering = false;
    }
  }
}

export class CallFeatureMembersComponent implements ng.IComponentOptions {
  public controller = CallFeatureMembersCtrl;
  public template = require('modules/call/features/shared/call-feature-members/call-feature-members.component.html');
  public bindings = {
    members: '<',
    filterBy: '<',
    componentType: '<',
    showExternalNumbers: '<',
    isNew: '<',
    memberHintKey: '@',
    removeKey: '@',
    dragAndDrop: '<',
    memberItemType: '@',
    onChangeFn: '&',
    onKeyPressFn: '&',
    location: '<',
  };
}
