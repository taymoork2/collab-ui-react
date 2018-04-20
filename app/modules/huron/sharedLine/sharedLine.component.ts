import { SharedLine } from './sharedLine';
import { Member, USER_REAL_USER } from '../members';

class SharedLineCtrl implements ng.IComponentController {
  public selectedMember: Member | undefined;
  public newSharedLineMembers: Member[];
  public selectedSharedLine: SharedLine;
  public sharedLines: SharedLine[];
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
      return this.formatUserName(_.get<string>(sharedLine, 'user.firstName'), _.get<string>(sharedLine, 'user.lastName'), _.get<string>(sharedLine, 'user.userName'));
    } else  {
      return _.get(sharedLine, 'place.displayName', '');
    }
  }

  public getMemberDisplayName(member: Member): string {
    if (member.type === USER_REAL_USER) {
      return this.formatUserName(_.get<string>(member, 'firstName'), _.get<string>(member, 'lastName'), _.get<string>(member, 'userName'));
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

  private formatUserName(firstName: string, lastName: string, userName: string): string {
    let _userName = userName;
    const _firstName = firstName || '';
    const _lastName = lastName || '';
    if (_firstName.length > 0 || _lastName.length > 0) {
      _userName = _.trim(_firstName + ' ' + _lastName);
    }
    return _userName;
  }

}

export class SharedLineComponent implements ng.IComponentOptions {
  public controller = SharedLineCtrl;
  public template = require('modules/huron/sharedLine/sharedLine.html');
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
