import {
  SharedLineUser,
  User,
  SharedLineDevice,
} from './sharedLine';

class SharedLineCtrl {
  public selectedUser: SharedLineUser;
  public sharedLineUsers: SharedLineUser[];
  public sharedLineEndpoints: SharedLineDevice[];
  public oneAtATime: boolean = true;

  public selectSharedLineUserFn: Function;
  public getUserListFn: Function;
  public isSingleDeviceFn: Function;
  public disassociateSharedLineUserFn: Function;

  public getUserList(filter: string): void {
    return this.getUserListFn({
      filter: filter,
    });
  }

  public getUserName(name: { givenName: string, familyName: string }, userId: string): string {
    var userName = _.get(name, 'name.givenName', '') +  ' '  +  _.get(name, 'name.familyName', '');
    return userName.trim() || userId;
  }

  public selectSharedLineUser(user: User): void {
    this.selectedUser = undefined;
    let userInfo: SharedLineUser = new SharedLineUser();
    _.assign(userInfo, user);
    userInfo.name = this.getUserName(user.name, user.userName);
    this.selectSharedLineUserFn({
      user: userInfo,
    });
  }

  public isSingleDevice(userUuid: string): boolean {
    return this.isSingleDeviceFn({
      sharedLineEndpoints: this.sharedLineEndpoints,
      uuid: userUuid,
    })
  }

  public disassociateSharedLineUser(user: SharedLineUser, batchDelete: boolean): void {
    this.disassociateSharedLineUserFn({
      userInfo: user,
      batchDelete: batchDelete
    })
  }
}

export class SharedLineComponent implements ng.IComponentOptions {
  public controller = SharedLineCtrl;
  public templateUrl = 'modules/huron/sharedLine/sharedLine.html';
  public bindings: { [binding: string]: string } = {
    selectedUser: '<',
    sharedLineUsers: '<',
    sharedLineEndpoints: '<',
    oneAtATime: '<',
    selectSharedLineUserFn: '&',
    getUserListFn: '&',
    isSingleDeviceFn: '&',
    disassociateSharedLineUserFn: '&',
  };
}
