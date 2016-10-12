import { AlertService } from './alert.service';

export class Notification {
  private static readonly SUCCESS = 'success';
  private static readonly WARNING = 'warning';
  private static readonly ERROR = 'error';
  private static readonly TYPES = [Notification.SUCCESS, Notification.WARNING, Notification.ERROR];
  private static readonly NO_TIMEOUT = 0;
  private static readonly DEFAULT_TIMEOUT = 3000;
  private failureTimeout: number;
  private successTimeout: number;
  private preventToasters = false;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private AlertService: AlertService,
    private Config,
    private Log,
    private toaster,
  ) {
    this.failureTimeout = Notification.NO_TIMEOUT;
    this.successTimeout = this.Config.isE2E() ? Notification.NO_TIMEOUT : Notification.DEFAULT_TIMEOUT;
  }

  public success(messageKey: string, messageParams?: Object, titleKey?: string): void {
    this.notify(this.$translate.instant(messageKey, messageParams), Notification.SUCCESS, this.getTitle(titleKey));
  }

  public warning(messageKey: string, messageParams?: Object, titleKey?: string): void {
    this.notify(this.$translate.instant(messageKey, messageParams), Notification.WARNING, this.getTitle(titleKey));
  }

  public error(messageKey: string, messageParams?: Object, titleKey?: string): void {
    this.notify(this.$translate.instant(messageKey, messageParams), Notification.ERROR, this.getTitle(titleKey));
  }

  public errorWithTrackingId(response: ng.IHttpPromiseCallbackArg<any>, errorKey?: string, errorParams?: Object): void {
    let errorMsg = this.getErrorMessage(errorKey, errorParams);
    errorMsg = this.addTrackingId(errorMsg, response);
    this.notify(_.trim(errorMsg), Notification.ERROR);
  }

  public errorResponse(response: ng.IHttpPromiseCallbackArg<any>, errorKey?: string, errorParams?: Object): void {
    let errorMsg = this.processErrorResponse(response, errorKey, errorParams);
    this.notify(errorMsg, Notification.ERROR);
  }

  public processErrorResponse(response: ng.IHttpPromiseCallbackArg<any>, errorKey?: string, errorParams?: Object): string {
    let errorMsg = this.getErrorMessage(errorKey, errorParams);
    errorMsg = this.addResponseMessage(errorMsg, response);
    errorMsg = this.addTrackingId(errorMsg, response);
    return _.trim(errorMsg);
  }

  public notify(notifications: string[] | string, type: string = Notification.ERROR, title?: string): void {
    if (this.preventToasters) {
      this.Log.warn('Deliberately prevented a notification:', notifications);
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

    this.toaster.pop({
      title: title,
      type: _.includes(Notification.TYPES, type) ? type : Notification.ERROR,
      body: 'cr-bind-unsafe-html',
      bodyOutputType: 'directive',
      directiveData: { data: notifications },
      timeout: type === Notification.SUCCESS ? this.successTimeout : this.failureTimeout,
      closeHtml: closeHtml,
    });
  }

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

  private addResponseMessage(errorMsg: string, response: ng.IHttpPromiseCallbackArg<any>): string {
    if (_.get(response, 'data.errorMessage')) {
      // TODO: rip out 'stringify()' usage once ATLAS-1338 is resolved
      errorMsg += ' ' + this.stringify(response.data.errorMessage);
    } else if (_.get(response, 'data.error')) {
      // TODO: rip out 'stringify()' usage once ATLAS-1338 is resolved
      errorMsg += ' ' + this.stringify(response.data.error);
    } else if (_.get(response, 'status') === 404) {
      errorMsg += ' ' + this.$translate.instant('errors.status404');
    } else if (_.isString(response)) {
      errorMsg += ' ' + response;
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
}
