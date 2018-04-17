import { LineService, LineConsumerType, Line } from 'modules/huron/lines/services';
import { HuronSiteService } from 'modules/huron/sites';
import { CallForward, CallForwardAll, CallForwardBusy, CallForwardService } from 'modules/huron/callForward';
import { SharedLine, SharedLineService, SharedLinePhone, SharedLinePhoneListItem } from 'modules/huron/sharedLine';
import { Member } from 'modules/huron/members';
import { MediaOnHoldService } from 'modules/huron/media-on-hold';
import { CallerID, ICallerID, CallerIDService } from 'modules/huron/callerId';
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
  public lineMoh: string;
  public voicemailEnabled: boolean;
  public services: string[];
}

export class LineOverviewService {

  private numberProperties: string[] = ['uuid', 'primary', 'shared', 'internal', 'external', 'siteToSite', 'incomingCallMaximum', 'label'];
  private callForwardAllProperties: string[] = ['destination', 'voicemailEnabled'];
  private callForwardBusyProperties: string[] = ['internalDestination', 'internalVoicemailEnabled', 'externalDestination', 'externalVoicemailEnabled', 'ringDurationTimer'];
  private lineOverviewDataCopy: LineOverviewData;
  private errors: any[] = [];
  private MAX_LABEL_LENGTH: number = 30;

  /* @ngInject */
  constructor(
    private LineService: LineService,
    private HuronSiteService: HuronSiteService,
    private CallForwardService: CallForwardService,
    private SharedLineService: SharedLineService,
    private MediaOnHoldService: MediaOnHoldService,
    private AutoAnswerService: AutoAnswerService,
    private Notification,
    private $q: ng.IQService,
    private CallerIDService: CallerIDService,
    private HuronVoicemailService: HuronVoicemailService,
    private HuronUserService: HuronUserService,
    private FeatureToggleService,
  ) {}

  public get(consumerType: LineConsumerType, ownerId: string, numberId: string = '', wide: boolean = true): ng.IPromise<LineOverviewData> {
    const lineOverviewData = new LineOverviewData();
    this.errors = [];
    return this.$q.all({
      getLine: this.getLine(consumerType, ownerId, numberId, wide),
      getCallForward: this.getCallForward(consumerType, ownerId, numberId),
      getSharedLines: this.getSharedLines(consumerType, ownerId, numberId),
      getCallerId: this.getCallerId(consumerType, ownerId, numberId),
      listCompanyNumbers: this.listCompanyNumbers(),
      getAutoAnswerSupportedDeviceAndMember: this.getAutoAnswerSupportedDeviceAndMember(consumerType, ownerId, numberId),
      getUserServices: this.HuronUserService.getUserServices(ownerId),
      getLineMediaOnHold: this.getLineMediaOnHold(consumerType, numberId),
      getUserV2LineLabel: this.HuronUserService.getUserV2LineLabel(ownerId),
    }).then(response => {
      if (this.errors.length > 0) {
        this.Notification.notify(this.errors, 'error');
        return this.$q.reject() as atlas.QRejectWorkaround<LineOverviewData>;
      }
      lineOverviewData.line = _.get<Line>(response, 'getLine');
      lineOverviewData.callForward = _.get<CallForward>(response, 'getCallForward');
      lineOverviewData.sharedLines = _.get<SharedLine[]>(response, 'getSharedLines');
      lineOverviewData.callerId = _.get<ICallerID>(response, 'getCallerId');
      lineOverviewData.companyNumbers = _.get<any>(response, 'listCompanyNumbers');
      lineOverviewData.autoAnswer = _.get<AutoAnswer>(response, 'getAutoAnswerSupportedDeviceAndMember');
      lineOverviewData.services = _.get<string[]>(response, 'getUserServices');
      lineOverviewData.lineMoh = _.get<string>(response, 'getLineMediaOnHold');
      lineOverviewData.voicemailEnabled = this.HuronVoicemailService.isEnabledForUser(lineOverviewData.services);
      if (lineOverviewData.line.uuid === undefined) {
        if (lineOverviewData.line.label != null) {
          lineOverviewData.line.label.value = _.get<string>(response, 'getUserV2LineLabel');
        }
      }
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
      const promises: ng.IPromise<any>[] = [];
      _.forEach(newSharedLineMembers, (sharedLineMember) => {
        promises.push(this.createSharedLine(consumerType, ownerId, lineOverviewData.line.uuid, sharedLineMember));
      });
      return this.$q.all(promises);
    }
  }

  public save(consumerType: LineConsumerType, ownerId: string, numberId: string = '', data: LineOverviewData, newSharedLineMembers: Member[]) {
    const lineOverviewData = new LineOverviewData();
    if (!data.line.uuid) {
      return this.createLine(consumerType, ownerId, data.line)
        .then((line) => lineOverviewData.line = line)
        .then(() => this.rejectAndNotifyPossibleErrors())
        .then(() => this.updateCallForward(consumerType, ownerId, lineOverviewData.line.uuid, data.callForward))
        .then(() => lineOverviewData.callForward = data.callForward)
        .then(() => this.rejectAndNotifyPossibleErrors())
        .then<any>(() => this.createSharedLineMembers(consumerType, ownerId, lineOverviewData, newSharedLineMembers))
        .then(() => this.rejectAndNotifyPossibleErrors())
        // The following needs to come after createSharedLineMembers
        .then(() => {
          if (data.line.label != null) {
            let tempLineLabel: string;
            tempLineLabel = lineOverviewData.line.internal + ' - ' + _.get(this, 'lineOverviewDataCopy.line.label.value');
            if (_.isEqual(data.line.label.value, tempLineLabel.substr(0, this.MAX_LABEL_LENGTH))) {
              data.line.label = null;
            }
            return this.updateLine(consumerType, ownerId, lineOverviewData.line.uuid, data.line);
          }
        })
        .then(() => this.rejectAndNotifyPossibleErrors())
        .then(() => this.get(consumerType, ownerId, lineOverviewData.line.uuid));
    } else { // update
      const promises: ng.IPromise<any>[] = [];
      let isLineUpdated: boolean = false;

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
          const phoneList: SharedLinePhone[] = _.get(_.find(data.sharedLines, { uuid: sharedLine.uuid }), 'phones', []);
          if (phoneList.length > 0 && !_.isEqual(phoneList, sharedLine.phones)) {
            const updatedPhoneList: SharedLinePhoneListItem[] = _.filter(phoneList, 'assigned');
            promises.push(this.updateSharedLinePhoneList(consumerType, ownerId, numberId, sharedLine.uuid, updatedPhoneList));
          }
        });
      }

      // update auto answer members
      if (!_.isEqual(data.autoAnswer, this.lineOverviewDataCopy.autoAnswer)) {
        const updateData = this.AutoAnswerService.createUpdateAutoAnswerPayload(this.lineOverviewDataCopy.autoAnswer.phones, data.autoAnswer.phones);
        if (!_.isUndefined(updateData) && !_.isNull(updateData)) {
          promises.push(this.AutoAnswerService.updateAutoAnswer(consumerType, ownerId, numberId, updateData!));
        }
      }

      // update line media on hold
      if (!_.isEqual(data.lineMoh, this.lineOverviewDataCopy.lineMoh) &&
         (_.isEqual(consumerType, LineConsumerType.USERS) || _.isEqual(consumerType, LineConsumerType.PLACES))) {
        const GENERIC_MEDIA_ID = '98765432-DBC2-01BB-476B-CFAF98765432';
        if (_.isEqual(data.lineMoh, GENERIC_MEDIA_ID)) {
          promises.push(this.MediaOnHoldService.unassignMediaOnHold('Line', numberId));
        } else {
          promises.push(this.MediaOnHoldService.updateMediaOnHold(data.lineMoh, 'Line', numberId));
        }
      }

      return this.$q.all(promises)
        .then(() => this.rejectAndNotifyPossibleErrors())
        .then(() => {
          // update line needs to come after shared line updates
          if (!_.isEqual(data.line, _.get(this, 'lineOverviewDataCopy.line'))) {
            // if nothing changed in line label fields, do not send anything to backend
            if (_.isEqual(data.line.label, _.get(this, 'lineOverviewDataCopy.line.label'))) {
              data.line.label = null;
            }
            isLineUpdated = true;
            return this.updateLine(consumerType, ownerId, numberId, data.line);
          }
        })
        .then(() => {
          if (!_.isEqual(data.callerId, this.lineOverviewDataCopy.callerId)) {
            return this.updateCallerId(consumerType, ownerId, numberId, data.callerId);
          }
          if (data.voicemailEnabled && isLineUpdated && consumerType === LineConsumerType.USERS) {
            promises.push(this.HuronVoicemailService.update(ownerId, data.voicemailEnabled, this.lineOverviewDataCopy.services));
          }
        })
        .then(() => this.get(consumerType, ownerId, this.lineOverviewDataCopy.line.uuid));
    }
  }

  private getLine(consumerType: LineConsumerType, ownerId: string, numberId: string, wide: boolean = false): ng.IPromise<Line | void> {
    if (!numberId) {
      return this.$q.resolve(new Line());
    } else {
      return this.LineService.getLine(consumerType, ownerId, numberId, wide)
        .then(line => {
          return new Line(_.pick<Line, Line>(line, this.numberProperties));
        }).catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'directoryNumberPanel.getLineError'));
        });
    }
  }

  private createLine(consumerType: LineConsumerType, ownerId: string, data: Line, wide: boolean = false): ng.IPromise<Line> {
    return this.LineService.createLine(consumerType, ownerId, data).then(location => {
      const newUuid = _.last(location.split('/'));
      return this.LineService.getLine(consumerType, ownerId, newUuid, wide)
        .then(line => {
          return new Line(_.pick<Line, Line>(line, this.numberProperties));
        }).catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'directoryNumberPanel.createLineError'));
          return new Line();
        });
    });
  }

  private updateLine(consumerType: LineConsumerType, ownerId: string, numberId: string = '', data: Line): ng.IPromise<void> {
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
          const callForward = new CallForward();
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

  private getLineMediaOnHold(consumerType: LineConsumerType, numberId: string = ''): ng.IPromise<string> {
    return this.FeatureToggleService.supports(this.FeatureToggleService.features.huronMOHEnable)
      .then(supportsLineMoh => {
        if (supportsLineMoh && (_.isEqual(consumerType, LineConsumerType.USERS) || _.isEqual(consumerType, LineConsumerType.PLACES)))  {
          return this.MediaOnHoldService.getLineMedia(numberId);
        } else {
          return this.$q.resolve('');
        }
      })
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'mediaOnHold.mohGetError'));
      });
  }

  private getSharedLines(consumerType: LineConsumerType, ownerId: string, numberId: string): ng.IPromise<SharedLine[]> {
    if (!numberId) {
      return this.$q.resolve([]);
    } else {
      return this.SharedLineService.getSharedLineList(consumerType, ownerId, numberId)
        .then(sharedLines => {
          const promises: ng.IPromise<any>[] = [];
          _.forEach(sharedLines, (sharedLine) => {
            promises.push(this.SharedLineService.getSharedLinePhoneList(consumerType, ownerId, numberId, sharedLine.uuid));
          });
          return this.$q.all(promises).then(data => {
            _.map(sharedLines, (sharedLine, index) => {
              return sharedLine.phones = <SharedLinePhone[]>data[index];
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
      return this.$q.resolve(new CallerID());
    } else {
      return this.CallerIDService.getCallerId(consumerType, ownerId, numberId)
        .then(callerIdRes => {
          return callerIdRes;
        });
    }
  }

  private getAutoAnswerSupportedDeviceAndMember(consumerType: LineConsumerType, ownerId: string, numberId: string): ng.IPromise<AutoAnswer> {
    if (!numberId) {
      return this.$q.resolve(new AutoAnswer());
    } else {
      return this.AutoAnswerService.getSupportedPhonesAndMember(consumerType, ownerId, numberId)
        .then(autoAnswerRes => {
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

  private updateSharedLinePhoneList(consumerType: LineConsumerType, ownerId: string, numberId: string, sharedLineId: string, data: SharedLinePhoneListItem[]) {
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
        return this.HuronSiteService.getTheOnlySite().then(site => {
          return _.get(site, 'routingPrefix', '');
        });
      } else {
        return '';
      }
    });
  }

}
