import { LineService, LineConsumerType, Line } from '../services';
import { HuronSiteService } from '../../sites';
import { CallForward, CallForwardAll, CallForwardBusy, CallForwardService } from '../../callForward';

export class LineOverviewData {
  public line: Line;
  public callForward: CallForward;
}

export class LineOverviewService {

  private numberProperties: Array<string> = ['uuid', 'primary', 'internal', 'external', 'siteToSite', 'incomingCallMaximum'];
  private callForwardAllProperties: Array<string> = ['destination', 'voicemailEnabled'];
  private callForwardBusyProperties: Array<string> = ['internalDestination', 'internalVoicemailEnabled', 'externalDestination', 'externalVoicemailEnabled'];
  private lineOverviewData: LineOverviewData;
  private lineOverviewDataCopy: LineOverviewData;

  /* @ngInject */
  constructor(
    private LineService: LineService,
    private HuronSiteService: HuronSiteService,
    private CallForwardService: CallForwardService,
    private $q: ng.IQService
  ) {}

  public get(consumerType: LineConsumerType, ownerId: string, numberId: string): ng.IPromise<LineOverviewData> {
    this.lineOverviewData = new LineOverviewData();
    let promises: Array<ng.IPromise<any>> = [];
    promises.push(this.getLine(consumerType, ownerId, numberId));
    promises.push(this.getCallForward(consumerType, ownerId, numberId));
    return this.$q.all(promises).then( (data) => {
      this.lineOverviewData.line = data[0];
      this.lineOverviewData.callForward = data[1];
      this.lineOverviewDataCopy = this.cloneLineOverviewData(this.lineOverviewData);
      return this.cloneLineOverviewData(this.lineOverviewData);
    });
  }

  public getOriginalConfig(): LineOverviewData {
    return this.cloneLineOverviewData(this.lineOverviewDataCopy);
  }

  public matchesOriginalConfig(lineOverviewData: LineOverviewData): boolean {
    return _.isEqual(lineOverviewData, this.lineOverviewDataCopy);
  }

  public save(consumerType: LineConsumerType, ownerId: string, numberId: string | undefined, data: LineOverviewData) {
    if (!this.lineOverviewData.line.uuid) {
      return this.createLine(consumerType, ownerId, data.line)
        .then( (line) => {
          this.lineOverviewData.line = line;
        })
        .then( () => {
          return this.updateCallForward(consumerType, ownerId, this.lineOverviewData.line.uuid, data.callForward)
            .then( () => {
              this.lineOverviewData.callForward = data.callForward;
            });
        })
        .then( () => {
          this.lineOverviewDataCopy = this.cloneLineOverviewData(this.lineOverviewData);
          return this.cloneLineOverviewData(this.lineOverviewData);
        });
    } else {
      let promises: Array<ng.IPromise<any>> = [];
      if (!_.isEqual(data.line, this.lineOverviewData.line)) {
        promises.push(this.updateLine(consumerType, ownerId, numberId, data.line));
      }

      if (!_.isEqual(data.callForward, this.lineOverviewData.callForward)) {
        promises.push(this.updateCallForward(consumerType, ownerId, numberId, data.callForward));
      }

      return this.$q.all(promises).then( () => {
        this.lineOverviewData = data;
        this.lineOverviewDataCopy = this.cloneLineOverviewData(this.lineOverviewData);
        return this.cloneLineOverviewData(this.lineOverviewData);
      });
    }
  }

  private getLine(consumerType: LineConsumerType, ownerId: string, numberId: string): ng.IPromise<Line> {
    if (!numberId) {
      return this.$q.resolve(new Line());
    } else {
      return this.LineService.getLine(consumerType, ownerId, numberId)
        .then(line => {
          return new Line(_.pick<Line, Line>(line, this.numberProperties));
        });
    }
  }

  private createLine(consumerType: LineConsumerType, ownerId: string, data: Line): ng.IPromise<Line> {
    return this.LineService.createLine(consumerType, ownerId, data).then( location => {
      let newUuid = _.last(location.split('/'));
      return this.LineService.getLine(consumerType, ownerId, newUuid)
        .then(line => {
          return new Line(_.pick<Line, Line>(line, this.numberProperties));
        });
    });
  }

  private updateLine(consumerType: LineConsumerType, ownerId: string, numberId: string | undefined, data: Line): ng.IPromise<Line> {
    return this.LineService.updateLine(consumerType, ownerId, numberId, data);
  }

  private getCallForward(consumerType: LineConsumerType, ownerId: string, numberId: string): ng.IPromise<CallForward> {
    if (!numberId) {
      return this.$q.resolve(new CallForward());
    } else {
      return this.CallForwardService.getCallForward(consumerType, ownerId, numberId)
        .then(callForwardRes => {
          let callForward = new CallForward();
          if (callForwardRes.callForwardAll) {
            callForward.callForwardAll = new CallForwardAll(_.pick<CallForwardAll, CallForwardAll>(callForwardRes.callForwardAll, this.callForwardAllProperties));
          }
          if (callForwardRes.callForwardBusy) {
            callForward.callForwardBusy = new CallForwardBusy(_.pick<CallForwardBusy, CallForwardBusy>(callForwardRes.callForwardBusy, this.callForwardBusyProperties));
          }
          return callForward;
        });
    }
  }

  private updateCallForward(consumerType: LineConsumerType, ownerId: string, numberId: string | undefined, data: CallForward): ng.IPromise<CallForward> {
    return this.CallForwardService.updateCallForward(consumerType, ownerId, numberId, data);
  }

  private cloneLineOverviewData(lineOverviewData: LineOverviewData): LineOverviewData {
    return _.cloneDeep(lineOverviewData);
  }

  public getEsnPrefix(): ng.IPromise<string> {
    return this.HuronSiteService.listSites().then(sites => {
      if (sites.length > 0) {
        return this.HuronSiteService.getSite(sites[0].uuid).then(site => {
          return site.siteSteeringDigit + site.siteCode;
        });
      } else {
        return '';
      }
    });
  }

}
