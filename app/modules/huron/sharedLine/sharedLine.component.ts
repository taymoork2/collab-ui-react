import { SharedLine } from './sharedLine';
import { Member, USER_REAL_USER } from '../members';

class SharedLineCtrl implements ng.IComponentController {
  public selectedMember: Member | undefined;
  public newSharedLineMembers: Array<Member>;
  public selectedSharedLine: SharedLine;
  public sharedLines: Array<SharedLine>;
  public oneAtATime: boolean = true;

  public selectSharedLineUserFn: Function;
  public getUserListFn: Function;
  public onSharedLineChangeFn: Function;
  public onDeleteSharedLineMemberFn: Function;

  public $onInit(): void {
    this.newSharedLineMembers = [];
  }

  public getUserList(filter: string): void {
    return this.getUserListFn({
      filter: filter,
    });
  }

  public getDisplayName(sharedLine: SharedLine): string {
    if (_.get(sharedLine, 'user.userName')) {
      let userName = _.get(sharedLine, 'user.firstName', '') + ' ' + _.get(sharedLine, 'user.lastName', '');
      return userName.trim() || _.get(sharedLine, 'user.userName', '');
    } else if (_.get(sharedLine, 'place.displayName')) {
      return _.get(sharedLine, 'place.displayName', '');
    } else {
      return '';
    }
  }

  public getMemberDisplayName(member: Member): string {
    if (member.type === USER_REAL_USER) {
      let userName = _.get(member, 'firstName', '') + ' ' + _.get(member, 'lastName', '');
      return userName.trim() || _.get(member, 'userName', '');
    } else {
      return _.get(member, 'displayName', '');
    }
  }

  public onSelectSharedLineMember(member: Member): void {
    this.selectedMember = undefined;
    this.newSharedLineMembers.push(member);
    this.selectSharedLineUserFn({
      members: this.newSharedLineMembers,
    });
  }

  public onDeleteSharedLineMember(sharedLineMember: SharedLine): void {
    this.onDeleteSharedLineMemberFn({
      sharedLineMember: sharedLineMember,
    });
  }

  public onSharedLineChange(): void {
    this.onSharedLineChangeFn({
      sharedLines: _.cloneDeep(this.sharedLines),
    });
  }
}

export class SharedLineComponent implements ng.IComponentOptions {
  public controller = SharedLineCtrl;
  public templateUrl = 'modules/huron/sharedLine/sharedLine.html';
  public bindings = {
    sharedLines: '<',
    newSharedLineMembers: '<',
    oneAtATime: '<',
    selectSharedLineUserFn: '&',
    getUserListFn: '&',
    onSharedLineChangeFn: '&',
    onDeleteSharedLineMemberFn: '&',
  };
}
