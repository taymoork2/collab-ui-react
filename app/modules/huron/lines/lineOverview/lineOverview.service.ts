import { LineService, LineConsumerType, Number } from '../services';
import { DirectoryNumberOptionsService } from '../../directoryNumber';

export class LineOverviewData {
  line: Number;
}

export class LineOverviewService {

  /* @ngInject */
  constructor(
    private LineService: LineService,
    private DirectoryNumberOptionsService: DirectoryNumberOptionsService,
    private $q: ng.IQService,
    private ServiceSetup
  ) {}

  public getLineOverviewData(consumerType: LineConsumerType, ownerId: string, numberId: string): ng.IPromise<LineOverviewData> {
    let lineOverview: LineOverviewData = new LineOverviewData();
    if (!numberId) {
      lineOverview.line = new Number();
      return this.$q.resolve(lineOverview);
    } else {
      return this.LineService.getLine(consumerType, ownerId, numberId)
        .then(line => {
          lineOverview.line = line;
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

  public getEsnPrefix(): ng.IPromise<string> {
    return this.ServiceSetup.listSites().then(sites => {
      if (sites.length > 0) {
        return this.ServiceSetup.getSite(sites[0].uuid).then(site => {
          return site.siteSteeringDigit + site.siteCode;
        })
      }
    })
  }

}