import { LineService, LineConsumerType, Line } from 'modules/huron/lines/services';
import { HuronSiteService } from 'modules/huron/sites';
import { CallForward, CallForwardAll, CallForwardBusy, CallForwardService } from 'modules/huron/callForward';
import { SharedLine, SharedLineService, SharedLinePhone, SharedLinePhoneListItem } from 'modules/huron/sharedLine';
import { Member } from 'modules/huron/members';
import { ICallerID, CallerIDService } from 'modules/huron/callerId';
import { AutoAnswer, AutoAnswerService } from 'modules/huron/autoAnswer';
import { HuronVoicemailService } from 'modules/huron/voicemail';
import { HuronUserService } from 'modules/huron/users';

export class LineOverviewData {
  public line: Line;
  public callForward: CallForward;
  public sharedLines: SharedLine[];
  public callerId: ICallerID;
  public companyNumbers: any;
  public autoAnswer: AutoAnswer;
  public voicemailEnabled: boolean;
}

export class LineOverviewService {

  private numberProperties: Array<string> = ['uuid', 'primary', 'shared', 'internal', 'external', 'siteToSite', 'incomingCallMaximum'];
  private callForwardAllProperties: Array<string> = ['destination', 'voicemailEnabled'];
  private callForwardBusyProperties: Array<string> = ['internalDestination', 'internalVoicemailEnabled', 'externalDestination', 'externalVoicemailEnabled', 'ringDurationTimer'];
  private lineOverviewDataCopy: LineOverviewData;
  private errors: Array<any> = [];

  /* @ngInject */
  constructor(
    private LineService: LineService,
    private HuronSiteService: HuronSiteService,
    private CallForwardService: CallForwardService,
    private SharedLineService: SharedLineService,
    private AutoAnswerService: AutoAnswerService,
    private Notification,
    private $q: ng.IQService,
    private CallerIDService: CallerIDService,
    private HuronVoicemailService: HuronVoicemailService,
    private HuronUserService: HuronUserService,
  ) {}

  public get(consumerType: LineConsumerType, ownerId: string, numberId: string = ''): ng.IPromise<LineOverviewData> {
    let lineOverviewData = new LineOverviewData();
    this.errors = [];
    let promises: Array<ng.IPromise<any>> = [];
    promises.push(this.getLine(consumerType, ownerId, numberId));
    promises.push(this.getCallForward(consumerType, ownerId, numberId));
    promises.push(this.getSharedLines(consumerType, ownerId, numberId));
    promises.push(this.getCallerId(consumerType, ownerId, numberId));
    promises.push(this.listCompanyNumbers());
    promises.push(this.getAutoAnswerSupportedDeviceAndMember(consumerType, ownerId, numberId));
    promises.push(this.HuronUserService.getUserServices(ownerId));
    return this.$q.all(promises).then( (data) => {
      if (this.errors.length > 0) {
        this.Notification.notify(this.errors, 'error');
        return this.$q.reject();
      }
      lineOverviewData.line = data[0];
      lineOverviewData.callForward = data[1];
      lineOverviewData.sharedLines = data[2];
      lineOverviewData.callerId = data[3];
      lineOverviewData.companyNumbers = data[4];
      lineOverviewData.autoAnswer = data[5];
      let services = data[6];
      lineOverviewData.voicemailEnabled = this.HuronVoicemailService.isEnabledForUser(services);
      this.lineOverviewDataCopy = this.cloneLineOverviewData(lineOverviewData);
      return lineOverviewData;
    });
  }

  public getOriginalConfig(): LineOverviewData {
    return this.cloneLineOverviewData(this.lineOverviewDataCopy);
  }

  public matchesOriginalConfig(lineOverviewData: LineOverviewData): boolean {
    return _.isEqual(lineOverviewData, this.lineOverviewDataCopy);
  }

  private rejectAndNotifyPossibleErrors(): void | ng.IPromise<any> {
    if (this.errors.length > 0) {
      this.Notification.notify(this.errors, 'error');
      return this.$q.reject();
    }
  }

  private createSharedLineMembers(consumerType: LineConsumerType, ownerId: string, lineOverviewData: LineOverviewData, newSharedLineMembers: Member[]) {
    if (newSharedLineMembers.length > 0) {
      let promises: Array<ng.IPromise<any>> = [];
      _.forEach(newSharedLineMembers, (sharedLineMember) => {
        promises.push(this.createSharedLine(consumerType, ownerId, lineOverviewData.line.uuid, sharedLineMember));
      });
      return this.$q.all(promises);
    }
  }

  public save(consumerType: LineConsumerType, ownerId: string, numberId: string = '', data: LineOverviewData, newSharedLineMembers: Member[]) {
    let lineOverviewData = new LineOverviewData();
    if (!data.line.uuid) {
      return this.createLine(consumerType, ownerId, data.line)
        .then((line) => lineOverviewData.line = line)
        .then(() => this.rejectAndNotifyPossibleErrors())
        .then(() => this.updateCallForward(consumerType, ownerId, lineOverviewData.line.uuid, data.callForward))
        .then(() => lineOverviewData.callForward = data.callForward)
        .then(() => this.rejectAndNotifyPossibleErrors())
        .then<any>(() => this.createSharedLineMembers(consumerType, ownerId, lineOverviewData, newSharedLineMembers))
        .then(() => this.rejectAndNotifyPossibleErrors())
        .then(() => this.get(consumerType, ownerId, lineOverviewData.line.uuid));
    } else { // update
      let promises: Array<ng.IPromise<any>> = [];
      if (!_.isEqual(data.line, this.lineOverviewDataCopy.line)) {
        promises.push(this.updateLine(consumerType, ownerId, numberId, data.line));
      }

      if (!_.isEqual(data.callForward, this.lineOverviewDataCopy.callForward)) {
        promises.push(this.updateCallForward(consumerType, ownerId, numberId, data.callForward));
      }

      // add new shared line members
      if (newSharedLineMembers.length > 0) {
        _.forEach(newSharedLineMembers, (sharedLineMember) => {
          promises.push(this.createSharedLine(consumerType, ownerId, numberId, sharedLineMember));
        });
      }

      // update shared line members
      if (!_.isEqual(data.sharedLines, this.lineOverviewDataCopy.sharedLines)) {
        // check if we need to update phone lists for any of the shared line members
        _.forEach(this.lineOverviewDataCopy.sharedLines, (sharedLine) => {
          let phoneList: Array<SharedLinePhone> = _.get(_.find(data.sharedLines, { uuid: sharedLine.uuid }), 'phones', []);
          if (phoneList.length > 0 && !_.isEqual(phoneList, sharedLine.phones)) {
            let updatedPhoneList: Array<SharedLinePhoneListItem> = _.filter(phoneList, 'assigned');
            promises.push(this.updateSharedLinePhoneList(consumerType, ownerId, numberId, sharedLine.uuid, updatedPhoneList));
          }
        });
      }

      // update auto answer members
      if (!_.isEqual(data.autoAnswer, this.lineOverviewDataCopy.autoAnswer)) {
        let updateData = this.AutoAnswerService.createUpdateAutoAnswerPayload(this.lineOverviewDataCopy.autoAnswer.phones, data.autoAnswer.phones);
        if (!_.isUndefined(updateData) && !_.isNull(updateData)) {
          promises.push(this.AutoAnswerService.updateAutoAnswer(consumerType, ownerId, numberId, updateData!));
        }
      }

      return this.$q.all(promises)
        .then(() => this.rejectAndNotifyPossibleErrors())
        .then<any>(() => {
          if (!_.isEqual(data.callerId, this.lineOverviewDataCopy.callerId)) {
            return this.updateCallerId(consumerType, ownerId, numberId, data.callerId);
          }
        })
        .then(() => this.get(consumerType, ownerId, this.lineOverviewDataCopy.line.uuid));
    }
  }

  private getLine(consumerType: LineConsumerType, ownerId: string, numberId: string): ng.IPromise<Line | void> {
    if (!numberId) {
      return this.$q.resolve(new Line());
    } else {
      return this.LineService.getLine(consumerType, ownerId, numberId)
        .then(line => {
          return new Line(_.pick<Line, Line>(line, this.numberProperties));
        }).catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'directoryNumberPanel.getLineError'));
        });
    }
  }

  private createLine(consumerType: LineConsumerType, ownerId: string, data: Line): ng.IPromise<Line> {
    return this.LineService.createLine(consumerType, ownerId, data).then( location => {
      let newUuid = _.last(location.split('/'));
      return this.LineService.getLine(consumerType, ownerId, newUuid)
        .then(line => {
          return new Line(_.pick<Line, Line>(line, this.numberProperties));
        }).catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'directoryNumberPanel.createLineError'));
          return new Line();
        });
    });
  }

  private updateLine(consumerType: LineConsumerType, ownerId: string, numberId: string, data: Line): ng.IPromise<void> {
    return this.LineService.updateLine(consumerType, ownerId, numberId, data)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'directoryNumberPanel.updateLineError'));
      });
  }

  private getCallForward(consumerType: LineConsumerType, ownerId: string, numberId: string): ng.IPromise<CallForward | void> {
    if (!numberId) {
      return this.$q.resolve(new CallForward());
    } else {
      return this.CallForwardService.getCallForward(consumerType, ownerId, numberId)
        .then(callForwardRes => {
          let callForward = new CallForward();
          if (callForwardRes.callForwardAll) {
            callForward.callForwardAll = new CallForwardAll(_.pick<CallForwardAll, CallForwardAll>(callForwardRes.callForwardAll, this.callForwardAllProperties));
          }
          if (callForwardRes.callForwardNoAnswer) {
            callForward.callForwardBusy = new CallForwardBusy(_.pick<CallForwardBusy, CallForwardBusy>(callForwardRes.callForwardNoAnswer, this.callForwardBusyProperties));
          }
          return callForward;
        }).catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'directoryNumberPanel.getCallForwardError'));
        });
    }
  }

  private updateCallForward(consumerType: LineConsumerType, ownerId: string, numberId: string = '', data: CallForward): ng.IPromise<void> {
    return this.CallForwardService.updateCallForward(consumerType, ownerId, numberId, data)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'directoryNumberPanel.updateCallForwardError'));
      });
  }

  private getSharedLines(consumerType: LineConsumerType, ownerId: string, numberId: string): ng.IPromise<SharedLine[]> {
    if (!numberId) {
      return this.$q.resolve([]);
    } else {
      return this.SharedLineService.getSharedLineList(consumerType, ownerId, numberId)
        .then( sharedLines => {
          let promises: Array<ng.IPromise<any>> = [];
          _.forEach(sharedLines, (sharedLine) => {
            promises.push(this.SharedLineService.getSharedLinePhoneList(consumerType, ownerId, numberId, sharedLine.uuid));
          });
          return this.$q.all(promises).then(data => {
            _.map(sharedLines, (sharedLine, index) => {
              return sharedLine.phones = <Array<SharedLinePhone>>data[index];
            });
            return sharedLines;
          });
        })
        .catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'directoryNumberPanel.getSharedLinesError'));
          return [];
        });
    }
  }
  private getCallerId(consumerType: LineConsumerType, ownerId: string, numberId: string): ng.IPromise<ICallerID> {
    if (!numberId) {
      return this.$q.resolve({});
    } else {
      return this.CallerIDService.getCallerId(consumerType, ownerId, numberId)
        .then(callerIdRes => {
          return callerIdRes;
        });
    }
  }

  private getAutoAnswerSupportedDeviceAndMember(consumerType: LineConsumerType, ownerId: string, numberId: string): ng.IPromise<AutoAnswer> {
    if (!numberId) {
      return this.$q.resolve({});
    } else {
      return this.AutoAnswerService.getSupportedPhonesAndMember(consumerType, ownerId, numberId)
        .then ( autoAnswerRes => {
          if (!_.isUndefined(autoAnswerRes) && !_.isNull(autoAnswerRes) && !_.isUndefined(autoAnswerRes.member) &&
              !_.isNull(autoAnswerRes.member) && autoAnswerRes.member.uuid !== ownerId) {
            autoAnswerRes.enabledForSharedLineMember = true;
          }
          return autoAnswerRes;
        });
    }
  }

  private listCompanyNumbers() {
    return this.CallerIDService.listCompanyNumbers();
  }

  private createSharedLine(consumerType: LineConsumerType, ownerId: string, numberId: string = '', data: Member) {
    return this.SharedLineService.createSharedLine(consumerType, ownerId, numberId, data)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'directoryNumberPanel.createSharedLinesError'));
      });
  }

  private updateSharedLinePhoneList(consumerType: LineConsumerType, ownerId: string, numberId: string, sharedLineId: string, data: Array<SharedLinePhoneListItem>) {
    return this.SharedLineService.updateSharedLinePhoneList(consumerType, ownerId, numberId, sharedLineId, data)
    .catch(error => {
      this.errors.push(this.Notification.processErrorResponse(error, 'directoryNumberPanel.updateSharedLinePhoneError'));
    });
  }

  private updateCallerId(consumerType: LineConsumerType, ownerId: string, numberId: string | undefined, data: any): ng.IPromise<ICallerID> {
    return this.CallerIDService.updateCallerId(consumerType, ownerId, numberId, data);
  }

  private cloneLineOverviewData(lineOverviewData: LineOverviewData): LineOverviewData {
    return _.cloneDeep(lineOverviewData);
  }

  public getEsnPrefix(): ng.IPromise<string> {
    return this.HuronSiteService.listSites().then(sites => {
      if (sites.length > 0) {
        return this.HuronSiteService.getSite(_.get<string>(sites[0], 'uuid')).then(site => {
          return site.siteSteeringDigit + site.siteCode;
        });
      } else {
        return '';
      }
    });
  }

}
