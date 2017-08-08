import { Notification } from 'modules/core/notifications';
import { HybridServiceUserSidepanelHelperService } from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import { L2SipService, VerificationStep, ISipDestinationSteps, StepSeverity } from 'modules/hercules/services/l2sip-service';
import { USSService } from 'modules/hercules/services/uss.service';

interface IPhoto {
  value: string;
}

interface IUserFromCommonIdentity {
  id: string;
  displayName: string;
  photos?: IPhoto[];
}

interface ITestToolUser {
  input?: string;
  userId?: string;
  displayName?: string;
  photo?: string;
  ussStatus?: string;
}

class HybridCallServiceTestToolModalController {

  public loading = true;
  public caller: ITestToolUser = {};
  public callee: ITestToolUser = {};
  public result: VerificationStep[];

  /* @ngInject */
  constructor(
    private Notification: Notification,
    private L2SipService: L2SipService,
    private Userservice,
    private UserListService,
    private USSService: USSService,
    private HybridServiceUserSidepanelHelperService: HybridServiceUserSidepanelHelperService,
    public incomingCallerUserId: string,
    public allowChangingCaller = true,
  ) {
    this.caller.userId = this.incomingCallerUserId;
    if (this.caller.userId) {
      this.fetchCaller();
    } else {
      this.loading = false;
    }
  }

  private fetchCaller(): void {
    this.Userservice.getUserAsPromise(this.caller.userId)
      .then((reply: { data: IUserFromCommonIdentity }) => {
        this.caller = this.setUser(reply.data);
        return this.caller.userId;
      })
      .then(this.getUserFromUss)
      .then((ussStatus) => {
        this.caller.ussStatus = ussStatus;
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      })
      .finally(() => {
        this.loading = false;
      });
  }

  private getUserFromUss = (userId): IPromise<string> =>  {
    return this.HybridServiceUserSidepanelHelperService.getDataFromUSS(userId)
      .then((data) => {
        return this.USSService.decorateWithStatus(data[1]);
      })
      .catch(() => {
        return this.USSService.decorateWithStatus(undefined);
      });
  }

  public search(searchString: string) {
    const params = {
      filter: {
        nameStartsWith: searchString,
      },
    };
    return this.UserListService.listUsersAsPromise(params)
      .then((reply) => {
        if (reply.data && reply.data.totalResults > 0) {
          return reply.data.Resources;
        }
      });
  }

  public selectCaller(selectedUser: IUserFromCommonIdentity) {
    this.caller = this.setUser(selectedUser);
    this.getUserFromUss(this.caller.userId)
      .then((status) => {
        this.caller.ussStatus = status;
      });
  }

  public selectCallee(selectedUser: IUserFromCommonIdentity) {
    this.callee = this.setUser(selectedUser);
    this.getUserFromUss(this.callee.userId)
      .then((status) => {
        this.callee.ussStatus = status;
      });
  }

  private setUser(selectedUser: IUserFromCommonIdentity): ITestToolUser {
    const updatedUser: ITestToolUser = {};
    updatedUser.input = selectedUser.displayName;
    updatedUser.displayName = selectedUser.displayName;
    updatedUser.userId = selectedUser.id;
    if (selectedUser.photos && selectedUser.photos[0] && selectedUser.photos[0].value) {
      updatedUser.photo = selectedUser.photos[0].value;
    }
    return updatedUser;
  }

  public resetCaller(): void {
    this.caller = {};
  }

  public resetCallee(): void {
    this.callee = {};
  }

  public showChangeCaller(): boolean {
    return this.allowChangingCaller && !_.isUndefined(this.caller.userId);
  }

  public showChangeCallee(): boolean {
    return !_.isUndefined(this.callee.userId);
  }

  public callerAndCalleeAreTheSame(): boolean {
    return this.caller.userId === this.callee.userId && !_.isUndefined(this.callee.userId);
  }

  public warnAboutPhonesRinging(): boolean {
    return this.caller.userId !== this.callee.userId && !_.isUndefined(this.caller.userId) && !_.isUndefined(this.callee.userId);
  }

  public startTest(callerUserId: string, calleeUserId: string): void {
    this.loading = true;
    this.L2SipService.userTestCall(callerUserId, calleeUserId)
      .then((result: ISipDestinationSteps) => {
        this.result =  result.steps;
      })
      .finally(() => {
        this.loading = false;
      });
  }

  public getNumberOfSteps(level: StepSeverity): number {
    return _.chain(this.result)
      .filter((step: VerificationStep) => step.severity === level)
      .size()
      .value();
  }

}

angular
  .module('Hercules')
  .controller('HybridCallServiceTestToolModalController', HybridCallServiceTestToolModalController);
