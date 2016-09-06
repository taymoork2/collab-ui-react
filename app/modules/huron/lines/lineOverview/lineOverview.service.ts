import { LineService, LineConsumerType, Number } from '../services';
import { DirectoryNumberOptionsService } from '../../directoryNumber';
import { HuronSiteService, Site } from '../../sites';

export class LineOverviewData {
  line: Number;
}

export class LineOverviewService {

  private numberProperties: Array<string> = ['uuid', 'primary', 'internal', 'external', 'siteToSite', 'incomingCallMaximum'];

  /* @ngInject */
  constructor(
    private LineService: LineService,
    private DirectoryNumberOptionsService: DirectoryNumberOptionsService,
    private HuronSiteService: HuronSiteService,
    private $q: ng.IQService
  ) {}

  public getLineOverviewData(consumerType: LineConsumerType, ownerId: string, numberId: string): ng.IPromise<LineOverviewData> {
    let lineOverview: LineOverviewData = new LineOverviewData();
    if (!numberId) {
      lineOverview.line = new Number();
      return this.$q.resolve(lineOverview);
    } else {
      return this.LineService.getLine(consumerType, ownerId, numberId)
        .then(line => {
          lineOverview.line = _.pick<Number, Number>(line, this.numberProperties);
          return lineOverview;
        });
    }
  }

  public updateLine(consumerType: LineConsumerType, ownerId: string, numberId: string, data: Number): ng.IPromise<Number> {
    return this.LineService.updateLine(consumerType, ownerId, numberId, data)
      .then(line => {
        return line;
      });
  }

  public createLine(consumerType: LineConsumerType, ownerId: string, data: Number): ng.IPromise<Number> {
    return this.LineService.createLine(consumerType, ownerId, data).then( location => {
      let newUuid = _.last(location.split('/'));
      return this.LineService.getLine(consumerType, ownerId, newUuid)
        .then(line => {
          return _.pick<Number, Number>(line, this.numberProperties);
        })
    })
  }

  public getEsnPrefix(): ng.IPromise<string> {
    return this.HuronSiteService.listSites().then(sites => {
      if (sites.length > 0) {
        return this.HuronSiteService.getSite(sites[0].uuid).then(site => {
          return site.siteSteeringDigit + site.siteCode;
        })
      }
    });
  }

}