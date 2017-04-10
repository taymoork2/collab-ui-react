import { GmHttpService } from '../common/gem.http.service';

export class TelephonyDomainService {

  private url;

  /* @ngInject */
  constructor(
    private GmHttpService: GmHttpService,
    private $translate: ng.translate.ITranslateService,
  ) {
    this.url = {
      telephonyDomain: 'telephonyDomain/',
      getTelephonyDomains: 'telephonyDomains/customerId/',
      getTelephonyDomain: 'telephonydomain/getTelephonyDomainInfoByDomainId/',
      getActivityLogs: 'activityLogs',
      moveSite: 'telephonydomain/moveSite',
      cancelSubmission: 'telephonydomain/cancelSubmission',
    };
  }

  public getTelephonyDomains(customerId: string) {
    let url = `${this.url.getTelephonyDomains}/${customerId}`;
    return this.GmHttpService.httpGet(url).then(this.extractData);
  }

  public getTelephonyDomain(customerId, ccaDomainId) {
    let url = `${this.url.getTelephonyDomain}${customerId}/${ccaDomainId}`;
    return this.GmHttpService.httpGet(url).then(this.extractData);
  }

  public getRegions() {
    let url = `${this.url.telephonyDomain}/regions`;
    return this.GmHttpService.httpGet(url).then(this.extractData);
  }

  public getNotes(customerId: string, ccaDomainId: string) {
    let url = `${this.url.getActivityLogs}/${customerId}/${customerId}/${ccaDomainId}/add_note`;
    return this.GmHttpService.httpGet(url).then(this.extractData);
  }

  public getHistories(customerId: string, ccaDomainId: string, domainName: string) {
    let url = `${this.url.getActivityLogs}/${customerId}/${ccaDomainId}/Telephony%20Domain/${domainName}`;
    return this.GmHttpService.httpGet(url).then(this.extractData);
  }

  public postNotes(data: any) {
    let url = this.url.getActivityLogs;
    return this.GmHttpService.httpPost(url, null, null, data).then(this.extractData);
  }

  public moveSite(data: any) {
    let url = this.url.moveSite;
    return this.GmHttpService.httpPut(url, null, null, data).then(this.extractData);
  }

  public updateTelephonyDomainStatus(customerId: string, ccaDomainId: string, telephonyDomainId: number, operation: string) {
    let url: string = '';
    let postData: any = {
      ccaDomainId: ccaDomainId,
      customerId: customerId,
      TelephonyDomainId: telephonyDomainId,
    };
    if (operation === 'cancel') {
      url = this.url.cancelSubmission;
    }
    return this.GmHttpService.httpPost(url, null, null, postData).then(this.extractData);
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

  private extractData(response) {
    return _.get(response, 'data');
  }

  private formatCsvData(data: any) {
    let newData: any [] = [];
    let oneLine = {
      domainName: this.transformCSVNumber(data.telephonyDomainName || data.domainName),
      totalSites: this.transformCSVNumber(data.telephonyDomainSites.length),
      bridgeSet: this.transformBridgeSet(data.primaryBridgeName, data.backupBridgeName),
      webDomain: this.transformCSVNumber(data.webDomainName || 'N/A'),
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
    return (value == null ? '' : value + '\t');
  }

  private transformBridgeSet(v1: string, v2: string) {
    v1 = !v1 ? 'N/A' : this.transformCSVNumber(v1);
    v2 = !v2 ? 'N/A' : this.transformCSVNumber(v2);

    return (v1 === 'N/A' && v2 === 'N/A') ? 'N/A' : (v1 + '+' + v2);
  }
}
