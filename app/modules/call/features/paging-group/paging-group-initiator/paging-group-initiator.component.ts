import { CallFeatureMember, CardType } from 'modules/call/features/shared/call-feature-members';
import { MemberService, Member, MemberType, USER_PLACE, USER_REAL_USER } from 'modules/huron/members';
import { FeatureMemberService } from 'modules/huron/features/services';

class PagingGroupItitiatorCtrl implements ng.IComponentController {
  public static readonly DISPLAYED_MEMBER_SIZE: number = 10;

  public initiators: CallFeatureMember[];
  public displayedInitiators: CallFeatureMember[] = [];
  public initiatorType: string;
  public onChangeFn: Function;
  public searchStr: string;
  public selectedInitiator: Member | undefined;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private MemberService: MemberService,
    private FeatureMemberService: FeatureMemberService,
  ) {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { initiators } = changes;
    if (initiators && initiators.currentValue) {
      this.processMemberChanges(initiators);
    }
  }

  private processMemberChanges(initiators: ng.IChangesObject<any>): void {
    this.displayedInitiators = _.take(initiators.currentValue, PagingGroupItitiatorCtrl.DISPLAYED_MEMBER_SIZE);
  }

  public getInitiatorList(value: string): ng.IPromise<CallFeatureMember[]> {
    return this.MemberService.getMemberList(value, true).then(members => {
      const initiatorList: CallFeatureMember[] = [];
      const promises: ng.IPromise<any>[] = [];
      _.forEach(members, member => {
        if (member.type === USER_PLACE) {
          promises.push(this.isRoomSystem(member.uuid).then(result => {
            if (!result && this.isNewInitiator(member.uuid)) {
              initiatorList.push(this.mapMember(member));
            }
          }));
        } else {
          if (this.isNewInitiator(member.uuid)) {
            initiatorList.push(this.mapMember(member));
          }
        }
      });
      return this.$q.all(promises).then(() => initiatorList);
    });
  }

  private mapMember(member: Member): CallFeatureMember {
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
  }

  private isNewInitiator(uuid: string): boolean {
    const existingMembers = _.find(this.initiators, initiator => {
      return initiator.uuid === uuid;
    });
    return _.isUndefined(existingMembers);
  }

  private isRoomSystem(uuid: string): ng.IPromise<boolean> {
    return this.FeatureMemberService.getMachineAcct(uuid)
      .then(response => response.machineType === 'lyra_space')
      .catch(() => false);
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

  public onUpdateCardInitiator(id: string, data: any): void {
    const initiator = _.find(this.initiators, ['memberUuid', id]);
    if (data) {
      initiator.uuid = _.get<string>(data, 'value');
    }
    this.onInitiatorsChanged(this.initiators);
  }

  public getInitiatorCount(): number {
    if (this.initiators) {
      return this.initiators.length;
    } else {
      return 0;
    }
  }

  public filterDisplayedInitiators(): void {
    if (_.isEmpty(this.searchStr)) {
      this.resetDisplayedMembers();
    } else {
      this.displayedInitiators = _.filter(this.initiators, (member) => {
        return _.includes(_.toLower(_.join(_.values(_.pick(member, ['name', 'number'])))), _.toLower(this.searchStr));
      });
    }
  }

  public selectInitiator(initiator: CallFeatureMember): void {
    this.selectedInitiator = undefined;
    this.FeatureMemberService.getMemberPicture(initiator.uuid).then(featureMemberPicture => {
      this.addInitiator(initiator, _.get(featureMemberPicture, 'thumbnailSrc', undefined));
    }).catch( () => { // request for picture failed, but we don't care!
      this.addInitiator(initiator, undefined);
    });
  }

  public unSelectInitiator(member: CallFeatureMember): void {
    _.remove<CallFeatureMember>(this.initiators, callFeatureMember => {
      return callFeatureMember.uuid === member.uuid;
    });
    this.onInitiatorsChanged(this.initiators);
  }

  public onInitiatorTypeChanged(): void {
    this.onInitiatorsChanged([]);
  }

  private onInitiatorsChanged(initiators: CallFeatureMember[]): void {
    this.onChangeFn({
      initiatorType: _.clone(this.initiatorType),
      initiators: _.cloneDeep(initiators),
    });
  }

  private addInitiator(member: CallFeatureMember, thumbnailSrc: string | undefined): void {
    member.thumbnailSrc = thumbnailSrc;
    this.initiators.unshift(member);
    this.onInitiatorsChanged(this.initiators);
  }

  public showMoreButton(): boolean {
    return (this.getInitiatorCount() > PagingGroupItitiatorCtrl.DISPLAYED_MEMBER_SIZE)
      && (this.displayedInitiators.length !== this.getInitiatorCount());
  }

  public showLessButton(): boolean {
    return (this.getInitiatorCount() > PagingGroupItitiatorCtrl.DISPLAYED_MEMBER_SIZE)
      && (this.displayedInitiators.length === this.getInitiatorCount());
  }

  public onShowMoreClicked(): void {
    this.displayedInitiators = _.cloneDeep(this.initiators);
  }

  public onShowLessClicked(): void {
    this.resetDisplayedMembers();
  }

  private resetDisplayedMembers(): void {
    this.displayedInitiators = _.take(this.initiators, PagingGroupItitiatorCtrl.DISPLAYED_MEMBER_SIZE);
  }
}

export class PagingGroupIntitiatorComponent implements ng.IComponentOptions {
  public controller = PagingGroupItitiatorCtrl;
  public template = require('modules/call/features/paging-group/paging-group-initiator/paging-group-initiator.component.html');
  public bindings = {
    initiators: '<',
    initiatorType: '<',
    onChangeFn: '&',
  };
}
