export class TelephonyDomainService {

  private url;

  /* @ngInject */
  constructor(
    private UrlConfig,
    private $http: ng.IHttpService,
    private $translate: ng.translate.ITranslateService,
  ) {
    let gemUrl = this.UrlConfig.getGeminiUrl();
    this.url = {
      getTelephonyDomains: gemUrl + 'telephonyDomains/' + 'customerId/',
    };
  }

  public getTelephonyDomains(customerId: string) {
    let url = this.url.getTelephonyDomains + customerId;
    return this.$http.get(url, {}).then((response) => {
      return _.get(response, 'data');
    });
  }

  public telephonyDomainsExportCSV(customerId: string) {
    return this.getTelephonyDomains(customerId).then((response) => {
      let lines: any = _.get(response, 'content.data');

      let exportedLines: any[] = [];
      let headerLine = {
        domainName: this.$translate.instant('gemini.tds.field.telephonyDomains'),
        totalSites: this.$translate.instant('gemini.tds.field.totalSites'),
        bridgeSet: this.$translate.instant('gemini.tds.field.bridgeSet'),
        webDomain: this.$translate.instant('gemini.tds.field.webDomain'),
        status: this.$translate.instant('gemini.tds.field.status'),
        description: this.$translate.instant('gemini.tds.field.description'),
        sites: this.$translate.instant('gemini.tds.field.sites'),
      };
      exportedLines.push(headerLine);

      if (!lines.body.length) {
        return exportedLines; // only export the header when is empty
      }
      _.forEach(lines.body, (line) => {
        exportedLines = exportedLines.concat(this.formatCsvData(line));
      });
      return exportedLines;
    });
  }

  private formatCsvData(data: any) {
    let newData: any [] = [];
    let oneLine = {
      domainName: this.transformCSVNumber(data.domainName),
      totalSites: this.transformCSVNumber(data.telephonyDomainSites.length),
      bridgeSet: this.transformBridgeSet(data.primaryBridgeName, data.backupBridgeName),
      webDomain: this.transformCSVNumber(data.webDomainName),
      status: data.status ? this.$translate.instant('gemini.cbgs.field.status.' + data.status) : '',
      description: this.transformCSVNumber(data.customerAttribute),
      siteUrl: '',
    };

    if (!data.telephonyDomainSites.length) {
      newData.push(oneLine);
      return newData;
    }

    _.forEach(data.telephonyDomainSites, (v, k) => {
      if (k) {
        oneLine = _.clone(oneLine);
        oneLine.domainName = '';
        oneLine.totalSites = '';
        oneLine.bridgeSet = '';
        oneLine.webDomain = '';
        oneLine.status = '';
        oneLine.description = '';
        oneLine.siteUrl = '';
      }

      oneLine.siteUrl = this.transformCSVNumber(v.siteUrl);
      newData.push(oneLine);
    });

    return newData;
  }

  private transformCSVNumber(value: any) {
    let result = (_.isNumber(value) ? '=' + value + '' : value);
    return result;
  }

  private transformBridgeSet(v1: string, v2: string) {
    v1 = !v1 ? 'N/A' : this.transformCSVNumber(v1);
    v2 = !v2 ? 'N/A' : this.transformCSVNumber(v2);

    return (v1 === 'N/A' && v2 === 'N/A') ? 'N/A' : (v1 + '+' + v2);
  }
}
