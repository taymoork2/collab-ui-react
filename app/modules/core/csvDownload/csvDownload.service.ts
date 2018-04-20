import { Config } from 'modules/core/config/config';

interface IWindowService extends ng.IWindowService {
  webkitURL: any;
}

interface IReportDownloadReference {
  checksum: string;
  fileUrl: string;
  length: number;
}

export class CsvDownloadTypes {
  public static readonly TYPE_TEMPLATE = 'template';
  public static readonly TYPE_USER = 'user';
  public static readonly TYPE_HEADERS = 'headers';
  public static readonly TYPE_EXPORT = 'export';
  public static readonly TYPE_REPORT = 'report';
  public static readonly TYPE_ANY = 'any';
  public static readonly TYPE_ERROR = 'error';
}

export class CsvDownloadService {

  public static readonly USER_EXPORT_THRESHOLD = 10000;
  private static readonly MIN_CSV_SIZE_TO_KEEP = 10000;  // delete files with smaller length then this

  public downloadInProgress = false;
  public lastProgressMessage = '';

  private objectUrl;
  private objectUrlTemplate;
  private isTooManyUsers = false;
  private canceler;
  private timeoutCanceler;
  private objectBlob;
  private templateBlob;
  private reportCanceled = false;

  /* @ngInject */
  constructor(
    private $window: IWindowService,
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private $rootScope: ng.IRootScopeService,
    private $timeout: ng.ITimeoutService,
    private Authinfo,
    private Config: Config,
    private UrlConfig,
    private Utils,
    private UserListService,
    private UserCsvService,
    private Log,
    private ExtractTarService,
  ) {
  }

  ///////////////////////

  /* Begin process of exporting the requested file */
  public getCsv(csvType: string, tooManyUsers: boolean, fileName: string, newUserExportToggle: boolean = false): ng.IPromise<any> {
    this.isTooManyUsers = !!tooManyUsers;
    // todo - simplify this once we get rid of newUserExportToggle
    if (!newUserExportToggle && !this.Authinfo.isCisco() && csvType !== CsvDownloadTypes.TYPE_TEMPLATE && tooManyUsers) {
      // old-style bulk export for large datasets that aren't Cisco and not using new export system
      this.canceler = this.UserListService.exportCSV()
        .then((csvData) => {
          const csvString = ($ as any).csv.fromObjects(csvData, { headers: false });
          return this.createObjectUrl(csvString, csvType, fileName);
        });
      return this.canceler;
    } else {
      if (csvType === CsvDownloadTypes.TYPE_USER) {
        this.reportCanceled = false;
        return this.exportUserCsv(fileName, newUserExportToggle);
      } else if (csvType === CsvDownloadTypes.TYPE_ERROR) {
        return this.exportErrorCsv(fileName);
      } else {
        return this.exportDataCsv(csvType, fileName);
      }
    }
  }

  public openInIE(type: string, fileName: string) {
    if (type === CsvDownloadTypes.TYPE_TEMPLATE && this.templateBlob) {
      this.$window.navigator.msSaveOrOpenBlob(this.templateBlob, fileName);
    } else if (type !== CsvDownloadTypes.TYPE_TEMPLATE && this.objectBlob) {
      this.$window.navigator.msSaveOrOpenBlob(this.objectBlob, fileName);
    }
  }

  /* Creates the data URL for downloading the blob of data */
  public createObjectUrl(data: any, type: string, fileName: string) {
    const blob = new this.$window.Blob([data], { type: 'text/plain' });
    const oUrl = (this.$window.URL || this.$window.webkitURL).createObjectURL(blob);
    if (type === CsvDownloadTypes.TYPE_TEMPLATE) {
      this.templateBlob = blob;
      this.setObjectUrlTemplate(oUrl);
    } else {
      this.objectBlob = blob;
      this.setObjectUrl(oUrl);
    }

    // IE download option since IE won't download the created url
    if (this.$window.navigator.msSaveOrOpenBlob) {
      this.openInIE(type, fileName);
    }

    return oUrl;
  }

  public revokeObjectUrl() {
    if (this.getObjectUrl()) {
      (this.$window.URL || this.$window.webkitURL).revokeObjectURL(this.getObjectUrl());
      this.setObjectUrl(null);
      this.objectBlob = null;
    }
  }

  public getObjectUrl(): string {
    return this.objectUrl;
  }

  private setObjectUrl(oUrl: string | null): void {
    this.objectUrl = oUrl;
  }

  public getObjectUrlTemplate(): string {
    return this.objectUrlTemplate;
  }

  private setObjectUrlTemplate(oUrl: string | null) {
    this.objectUrlTemplate = oUrl;
  }

  public isReportCanceled(): boolean {
    return this.reportCanceled;
  }

  public cancelDownload(): void {
    if (!this.reportCanceled) {
      this.reportCanceled = true;
    }
    if (!this.isTooManyUsers) {
      if (this.canceler) {
        this.canceler.resolve();
      }
      if (this.timeoutCanceler) {
        this.$timeout.cancel(this.timeoutCanceler);
      }
    }
  }

  //////////

  private userExportUrl() {
    return this.UrlConfig.getAdminServiceUrl() + 'csv/organizations/' + this.Authinfo.getOrgId() + '/users/%s';
  }

  // download the compressed file, decompress it, and return data
  private downloadReport(context: IReportDownloadReference): ng.IPromise<any> {

    // fetch the tar.gz file
    return this.$http.get(context.fileUrl, {
      timeout: this.canceler.promise,
      responseType: 'blob',
    })
      .then((response) => {
        const promise = this.ExtractTarService.extractFile(<Blob>response.data, context.checksum);
        return promise;
        //return this.$q.race([defer.promise, this.canceler.promise]);
      });
  }

  // waits until the user report is compiled on the server, downloads it, and returns
  // reference to the CSV data.
  private getUserReport(url: string): ng.IPromise<any> {

    // continue get
    this.canceler = this.$q.defer();  // used to cancel the request
    // this event is picked up by idleTimeoutService to keep the user logged in
    this.$rootScope.$emit(this.Config.idleTabKeepAliveEvent);
    return this.$http.get(url, { timeout: this.canceler.promise })
      .then((response) => {
        this.lastProgressMessage = _.get(response, 'data.message', '');
        this.Log.info('getUserReport: ', this.lastProgressMessage);

        if (response.status === 200) {
          if (_.isEqual(_.get(response, 'data.processStatus'), 'COMPLETE')) {
            // Received the complete signal, so the file is ready to download
            return this.downloadReport(_.get<IReportDownloadReference>(response, 'data.context'))
              .then((result) => {
                // delete the file on the server if it is small
                if (_.get(response, 'data.context.length', 0) < CsvDownloadService.MIN_CSV_SIZE_TO_KEEP) {
                  this.$http.delete(url);
                }
                return result;
              });
          } else if (_.isEqual(_.get(response, 'data.processStatus'), 'RUNNING')) {
            // Set 3 second delay to limit the amount of times
            // we continually hit the user reports REST api.
            this.timeoutCanceler = this.$timeout(() => {
              return this.getUserReport(url);
            }, 3000);
            return this.timeoutCanceler;
          } else {
            // Unknown processStatus (probably a FAILED)
            return this.$q.reject(response.data);
          }
        } else {
          // response status is an error of some sort
          return this.$q.reject(response);
        }
      });
  }

  // Request the backend compile a CSV of the requested data and then save it locally.
  private newExportUserCsv(fileName: string): ng.IPromise<any> {
    const req: ng.IRequestConfig = {
      url: this.Utils.sprintf(this.userExportUrl(), [CsvDownloadTypes.TYPE_REPORT]),
      method: 'POST',
      data: null,
    };
    return this.$http(req)
      .then((response: any) => {
        if (response.status === 202) {
          const location = response.data.location;
          return this.getUserReport(location)
            .then((csvData) => {
              // at this point, we should have the CSV data downloaded and extracted, ready
              // for the user to finally save it.
              return this.createObjectUrl(csvData, CsvDownloadTypes.TYPE_USER, fileName);
            })
            .finally(() => {
              this.canceler = undefined;
              this.timeoutCanceler = undefined;
            });
        } else {
          // failed to start the process
          return this.$q.reject(response);
        }
      });
  }

  private exportUserCsv(fileName: string, newUserExportToggle: boolean): ng.IPromise<any> {
    if (newUserExportToggle || this.Authinfo.isCisco()) {
      // new Export API
      return this.newExportUserCsv(fileName);
    } else {
      // old export API
      // todo - remove this once we remove feature toggle!
      const url = this.Utils.sprintf(this.userExportUrl(), [CsvDownloadTypes.TYPE_EXPORT]);
      this.canceler = this.$q.defer();
      return this.$http.get(url, { timeout: this.canceler.promise })
        .then((csvData) => {
          return this.createObjectUrl(csvData.data, CsvDownloadTypes.TYPE_USER, fileName);
        })
        .finally(() => {
          this.canceler = undefined;
        });
    }
  }

  private exportErrorCsv(fileName): ng.IPromise<any> {
    return this.$q((resolve) => {
      const csvErrorArray = this.UserCsvService.getCsvStat().userErrorArray;
      const csvString = ($ as any).csv.fromObjects(_.union([{
        row: 'Row Number',
        email: 'User ID/Email',
        error: 'Error Message',
      }],
        csvErrorArray), {
          headers: false,
        });
      resolve(this.createObjectUrl(csvString, CsvDownloadTypes.TYPE_ERROR, fileName));
    });
  }

  private exportDataCsv(csvType, fileName): ng.IPromise<any> {
    const url = this.Utils.sprintf(this.userExportUrl(), [csvType]);
    return this.$http.get(url)
      .then((csvData) => {
        if (csvType === CsvDownloadTypes.TYPE_HEADERS) {
          return csvData.data;
        } else {
          return this.createObjectUrl(csvData.data, csvType, fileName);
        }
      });
  }

}
