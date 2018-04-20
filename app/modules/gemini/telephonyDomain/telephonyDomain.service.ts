export class TelephonyDomainService {

  private url;

  /* @ngInject */
  constructor(
    private UrlConfig,
    private gemService,
    private $http: ng.IHttpService,
    private $translate: ng.translate.ITranslateService,
  ) {
    this.url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/`;
  }

  public getTelephonyDomains(customerId: string) {
    const url = `${this.url}customerId/${customerId}`;
    return this.$http.get(url).then(this.extractData);
  }

  public getTelephonyDomain(customerId, ccaDomainId) {
    const url = `${this.url}getTelephonyDomainInfoByDomainId/${customerId}/${ccaDomainId}`;
    return this.$http.get(url).then(this.extractData);
  }

  public getRegionDomains(data: Object) {
    const url = `${this.url}getRegionDomains`;
    return this.$http.post(url, data).then(this.extractData);
  }

  public getRegions() {
    const url = `${this.url}regions`;
    return this.$http.get(url).then(this.extractData);
  }

  public getHistories(data) {
    const url = `${this.UrlConfig.getGeminiUrl()}activityLogs`;
    return this.$http.put(url, data).then(this.extractData);
  }

  public postNotes(data: any) {
    const url = `${this.UrlConfig.getGeminiUrl()}notes`;
    return this.$http.post(url, data).then(this.extractData);
  }

  public moveSite(data: any) {
    const url = `${this.url}moveSite`;
    return this.$http.put(url, data).then(this.extractData);
  }

  public cancelTDSubmission(customerId: string, ccaDomainId: string) {
    const url: string = `${this.url}customerId/${customerId}/ccaDomainId/${ccaDomainId}/cancelSubmission`;
    return this.$http.put(url, null).then(this.extractData);
  }

  public getDownloadUrl() {
    return `${this.UrlConfig.getGeminiUrl()}files/templates/telephony_numbers_template`;
  }

  public getAccessNumberInfo(accessNumber: string) {
    const url = `${this.url}getAccessNumberInfo`;
    return this.$http.post(url, [{ number: accessNumber }]).then(this.extractData);
  }

  public getNumbers(customerId: string, ccaDomainId: string) {
    const url = `${this.url}getTelephonyNumberByDomainId/${customerId}/${ccaDomainId}`;
    return this.$http.get(url).then(this.extractData);
  }

  public postTelephonyDomain(customerId: string, data: any) {
    const url = `${this.url}customerId/${customerId}`;
    return this.$http.post(url, data).then(this.extractData);
  }

  public telephonyDomainsExportCSV(customerId: string) {
    return this.getTelephonyDomains(customerId).then((res: any[]) => {
      let exportedLines: any[] = [];
      const headerLine = {
        domainName: this.$translate.instant('gemini.tds.field.telephonyDomains'),
        totalSites: this.$translate.instant('gemini.tds.field.totalSites'),
        bridgeSet: this.$translate.instant('gemini.tds.field.bridgeSet'),
        status: this.$translate.instant('gemini.tds.field.status'),
        partnerTdName: this.$translate.instant('gemini.tds.field.partnerTdName'),
        sites: this.$translate.instant('gemini.tds.field.sites'),
      };
      exportedLines.push(headerLine);

      if (!res.length) {
        return exportedLines; // only export the header when is empty
      }
      _.forEach(res, (line) => {
        exportedLines = exportedLines.concat(this.formatTdData(line));
      });
      return exportedLines;
    });
  }

  public exportNumbersToCSV(customerId: string, ccaDomainId: string) {
    return this.getNumbers(customerId, ccaDomainId).then((res: any[]) => {
      let exportedLines: any[] = [];
      const headerLine = {
        phoneNumber: this.$translate.instant('gemini.tds.numbers.field.phoneNumber').toUpperCase(),
        phoneLabel: this.$translate.instant('gemini.tds.numbers.field.phoneLabel').toUpperCase(),
        accessNumber: this.$translate.instant('gemini.tds.numbers.field.accessNumber').toUpperCase(),
        tollType: this.$translate.instant('gemini.tds.numbers.field.tollType').toUpperCase(),
        callType: this.$translate.instant('gemini.tds.numbers.field.callType').toUpperCase(),
        country: this.$translate.instant('gemini.tds.numbers.field.country').toUpperCase(),
        hiddenOnClient: this.$translate.instant('gemini.tds.numbers.field.hiddenOnClient').toUpperCase(),
      };
      exportedLines.push(headerLine);

      if (!res.length) {
        return exportedLines;
      }
      _.forEach(res, (line) => {
        this.makeNumberItemReadable(line);
        exportedLines = exportedLines.concat(this.formatNumbersData(line));
      });
      return exportedLines;
    });
  }

  public makeNumberItemReadable(item): void {
    if (item.defaultNumber === '1') {
      switch (item.tollType) {
        case 'CCA Toll':
          item.defaultNumber = this.$translate.instant('gemini.tds.defaultToll');
          break;

        case 'CCA Toll Free':
          item.defaultNumber = this.$translate.instant('gemini.tds.defaultTollFree');
          break;
      }
    }

    if (item.defaultNumber === '0') {
      item.defaultNumber = this.$translate.instant('gemini.tds.numbers.field.labels.no');
    }

    item.globalListDisplay = item.globalListDisplay === '1'
      ? this.$translate.instant('gemini.tds.numbers.field.labels.display')
      : this.$translate.instant('gemini.tds.numbers.field.labels.no');

    item.isHidden = item.isHidden
      ? this.$translate.instant('gemini.tds.numbers.field.labels.hidden')
      : this.$translate.instant('gemini.tds.numbers.field.labels.display');

    const gmCountry = this.gemService.getStorage('gmCountry');
    if (gmCountry) {
      item.countryName = gmCountry.countryId2NameMapping[item.countryId];
    }
  }

  private formatNumbersData(data: any) {
    const oneLine = {
      phoneNumber: this.formatAsCsvString(data.phone),
      phoneLabel: this.formatAsCsvString(data.label),
      accessNumber: this.formatAsCsvString(data.dnisNumberFormat),
      tollType: this.formatAsCsvString(data.tollType),
      callType: this.formatAsCsvString(data.phoneType),
      country: this.formatAsCsvString(data.countryName),
      hiddenOnClient: this.formatAsCsvString(data.isHidden),
    };

    return oneLine;
  }

  private formatTdData(data: any) {
    const newData: any [] = [];
    let oneLine = {
      domainName: this.formatAsCsvString(data.telephonyDomainName || data.domainName),
      totalSites: this.formatAsCsvString(data.telephonyDomainSites.length),
      bridgeSet: this.transformBridgeSet(data.primaryBridgeName, data.backupBridgeName),
      status: data.status ? this.$translate.instant('gemini.cbgs.field.status.' + data.status) : '',
      partnerTdName: this.formatAsCsvString(data.customerAttribute),
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
        oneLine.status = '';
        oneLine.partnerTdName = '';
        oneLine.siteUrl = '';
      }

      oneLine.siteUrl = this.formatAsCsvString(v.siteUrl);
      newData.push(oneLine);
    });

    return newData;
  }

  public formatAsCsvString(data: any) {
    if (data === null) {
      data = '';
    }
    return '="' + data + '"';
  }

  private transformBridgeSet(v1: string, v2: string) {
    v1 = !v1 ? 'N/A' : v1;
    v2 = !v2 ? 'N/A' : v2;

    return (v1 === 'N/A' && v2 === 'N/A') ? 'N/A' : this.formatAsCsvString(v1 + '+' + v2);
  }

  private extractData(response) {
    return _.get(response, 'data');
  }
}
