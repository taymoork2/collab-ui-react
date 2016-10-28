import { AlertService } from './alert.service';

export class Notification {
  private static readonly SUCCESS = 'success';
  private static readonly WARNING = 'warning';
  private static readonly ERROR = 'error';
  private static readonly TYPES = [Notification.SUCCESS, Notification.WARNING, Notification.ERROR];
  private static readonly MESSAGES = 'messages';
  private static readonly HTML_MESSAGES = 'htmlMessages';
  private static readonly NO_TIMEOUT = 0;
  private static readonly DEFAULT_TIMEOUT = 3000;
  private static readonly HTTP_STATUS = {
    NOT_FOUND: 404,
    REJECTED: -1,
    UNKNOWN: 0,
  };
  private failureTimeout: number;
  private successTimeout: number;
  private preventToasters = false;
  private isNetworkOffline = false;

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private $q: ng.IQService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private $window: ng.IWindowService,
    private AlertService: AlertService,
    private Config,
    private toaster,
  ) {
    this.initTimeouts();
    this.initOfflineListeners();
  }

  public success(messageKey: string, messageParams?: Object, titleKey?: string, allowHtml: boolean = false): void {
    this.notify(this.$translate.instant(messageKey, messageParams), Notification.SUCCESS, this.getTitle(titleKey), allowHtml);
  }

  public warning(messageKey: string, messageParams?: Object, titleKey?: string, allowHtml: boolean = false): void {
    this.notify(this.$translate.instant(messageKey, messageParams), Notification.WARNING, this.getTitle(titleKey), allowHtml);
  }

  public error(messageKey: string, messageParams?: Object, titleKey?: string, allowHtml: boolean = false): void {
    this.notify(this.$translate.instant(messageKey, messageParams), Notification.ERROR, this.getTitle(titleKey), allowHtml);
  }

  public errorWithTrackingId(response: ng.IHttpPromiseCallbackArg<any>, errorKey?: string, errorParams?: Object): void {
    let errorMsg = this.getErrorMessage(errorKey, errorParams);
    errorMsg = this.buildResponseMessage(errorMsg, response, false);
    this.notifyErrorResponse(errorMsg, response);
  }

  public processErrorResponse(response: ng.IHttpPromiseCallbackArg<any>, errorKey?: string, errorParams?: Object): string {
    let errorMsg = this.getErrorMessage(errorKey, errorParams);
    return this.buildResponseMessage(errorMsg, response, true);
  }

  public errorResponse(response: ng.IHttpPromiseCallbackArg<any>, errorKey?: string, errorParams?: Object): void {
    let errorMsg = this.processErrorResponse(response, errorKey, errorParams);
    this.notifyErrorResponse(errorMsg, response);
  }

  private notifyErrorResponse(errorMsg: string, response: ng.IHttpPromiseCallbackArg<any>): void {
    if (!this.isCancelledResponse(response)) {
      this.notify(errorMsg, Notification.ERROR);
    }
  }

  public notify(notifications: string[] | string, type: string = Notification.ERROR, title?: string, allowHtml: boolean = false): void {
    if (this.preventToasters) {
      this.$log.warn('Deliberately prevented a notification:', notifications);
      return;
    }
    if (!notifications) {
      return;
    }
    if (_.isString(notifications)) {
      notifications = [notifications];
    }
    if (!notifications.length) {
      return;
    }
    let closeHtml = '<button type="button" class="close toast-close-button"><span class="sr-only">' + this.$translate.instant('common.close') + '</span></button>';
    let directiveData = {};
    _.set(directiveData, allowHtml ? Notification.HTML_MESSAGES : Notification.MESSAGES , notifications);

    this.toaster.pop({
      title: title,
      type: _.includes(Notification.TYPES, type) ? type : Notification.ERROR,
      body: 'cr-bind-unsafe-html',
      bodyOutputType: 'directive',
      directiveData: directiveData,
      timeout: type === Notification.SUCCESS ? this.successTimeout : this.failureTimeout,
      closeHtml: closeHtml,
    });
  }

  // TODO should this usage be replaced with a dialog modal?
  public confirmation(message: string): ng.IPromise<any> {
    let deferred = this.$q.defer();

    this.AlertService.setDeferred(deferred);
    this.AlertService.setMessage(message);
    this.toaster.pop({
      type: Notification.WARNING,
      body: 'cr-confirmation',
      bodyOutputType: 'directive',
      showCloseButton: false,
    });

    this.$timeout(function () {
      angular.element('.notification-yes').on('click', function () {
        this.toaster.clear('*');
        deferred.resolve();
      });

      angular.element('.notification-no').on('click', function () {
        this.toaster.clear('*');
        deferred.reject();
      });
    });

    return deferred.promise;
  }

  public notifyReadOnly(): void {
    this.notify(this.$translate.instant('readOnlyMessages.notAllowed'), Notification.WARNING);
    this.preventToasters = true;
    this.$timeout(() => this.preventToasters = false, 1000);
  }

  private buildResponseMessage(errorMsg: string, response: ng.IHttpPromiseCallbackArg<any>, useResponseData: boolean = false): string {
    let status = _.get<number>(response, 'status');
    if (this.isCancelledResponse(response)) {
      errorMsg += ' ' + this.$translate.instant('errors.statusCancelled');
    } else if (this.isOfflineStatus(status)) {
      errorMsg += ' ' + this.$translate.instant('errors.statusOffline');
    } else if (this.isRejectedStatus(status)) {
      errorMsg += ' ' + this.$translate.instant('errors.statusRejected');
    } else if (this.isNotFoundStatus(status)) {
      errorMsg += ' ' + this.$translate.instant('errors.status404');
    } else if (this.isUnknownStatus(status)) {
      errorMsg += ' ' + this.$translate.instant('errors.statusUnknown');
    } else if (useResponseData) {
      errorMsg = this.addResponseMessage(errorMsg, response);
    }
    errorMsg = this.addTrackingId(errorMsg, response);
    return _.trim(errorMsg);
  }

  private isCancelledResponse(response: ng.IHttpPromiseCallbackArg<any>): boolean {
    return this.isRejectedStatus(_.get<number>(response, 'status')) && _.get(response, 'config.timeout.$$state.status') > 0;
  }
  private isOfflineStatus(status: number): boolean {
    return this.isNetworkOffline && this.isRejectedStatus(status);
  }

  private isRejectedStatus(status: number): boolean {
    return status === Notification.HTTP_STATUS.REJECTED;
  }

  private isNotFoundStatus(status: number): boolean {
    return status === Notification.HTTP_STATUS.NOT_FOUND;
  }

  private isUnknownStatus(status: number): boolean {
    return status === Notification.HTTP_STATUS.UNKNOWN;
  }

  private addResponseMessage(errorMsg: string, response: ng.IHttpPromiseCallbackArg<any>): string {
    if (_.get(response, 'data.errorMessage')) {
      // TODO: rip out 'stringify()' usage once ATLAS-1338 is resolved
      errorMsg += ' ' + this.stringify(response.data.errorMessage);
    } else if (_.get(response, 'data.error')) {
      // TODO: rip out 'stringify()' usage once ATLAS-1338 is resolved
      errorMsg += ' ' + this.stringify(response.data.error);
    } else if (_.isString(response)) {
      errorMsg += ' ' + response;
    } else {
      this.$log.warn('Unable to notify an error response', response);
    }
    return errorMsg;
  }

  private addTrackingId(errorMsg: string, response: ng.IHttpPromiseCallbackArg<any>): string {
    let headers = _.get(response, 'headers');
    let trackingId = _.isFunction(headers) && headers('TrackingID');
    if (!trackingId) {
      trackingId = _.get(response, 'data.trackingId');
    }
    if (_.isString(trackingId) && trackingId.length) {
      if (errorMsg.length > 0 && !_.endsWith(errorMsg, '.')) {
        errorMsg += '.';
      }
      errorMsg += ' TrackingID: ' + trackingId;
    }
    return errorMsg;
  }

  private getErrorMessage(key?: string, params?: Object): string {
    return _.isString(key) ? this.$translate.instant(key, params) : '';
  }

  private getTitle(titleKey?: string): string | undefined {
    return _.isString(titleKey) ? this.$translate.instant(titleKey) : undefined;
  }

  // TODO: rip this out once ATLAS-1338 is resolved
  private stringify(jsonifiableVal) {
    return (_.isObjectLike(jsonifiableVal)) ? JSON.stringify(jsonifiableVal) : jsonifiableVal;
  }

  private initTimeouts(): void {
    this.failureTimeout = Notification.NO_TIMEOUT;
    this.successTimeout = this.Config.isE2E() ? Notification.NO_TIMEOUT : Notification.DEFAULT_TIMEOUT;
  }

  private initOfflineListeners(): void {
    this.$window.addEventListener('offline', () => this.isNetworkOffline = true);
    this.$window.addEventListener('online', () => this.isNetworkOffline = false);
  }
}
