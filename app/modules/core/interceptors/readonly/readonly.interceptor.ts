export class ReadonlyInterceptor implements ng.IHttpInterceptor {

  private allowedList: string[] = [
    '/pcs/api/v2/',
    '/pcs/api/v3/',
    '/api/v1/metrics',
    '/api/v1/compliance/',
    '/api/v1/logs/',
    '/conversation/api/v1/users/deskFeedbackUrl',
    '/idb/oauth2/v1/revoke',
    '/idb/oauth2/v1/tokens/user',
    '/idb/oauth2/v1/access_token',
    '/resendinvitation/invoke',
    '/sendverificationcode/invoke',
    '/elevatereadonlyadmin/invoke',
    '/WBXService/XMLService',
    '/meetingsapi/v1/users/',
    '/meetingsapi/v1/files/',
    '/channels',
    '/api/v1/internals/actions/invalidateUser/invoke',
    '/releaseChannels',
    '/qlik-gtwy/api/v1/report/',
    '/qlik-gtwy/api/v1/log',
    '/custportal/extensions/',
    '/users/report',
    '/devices/_search',
    '/devices/_alert',
    '/devices/?field=',
    '/devices/bulk/export',
    '/preloadCaches',
    'webex.com/status',
    'collaborationhelp.cisco.com/status',
  ];

  private allowedState: string[] = [
    'helpdesk',
  ];

  private PERIOD = '.';

  /* @ngInject */
  constructor(
    private $injector,
    private $log: ng.ILogService,
    private $q: ng.IQService,
    private Authinfo,
  ) {}

  /**
   * instance method for interceptor
   */
  public request = (request: ng.IRequestConfig) => this.rejectOnNotRead(request);

  private rejectOnNotRead(config) {
    // injected manually to get around circular dependency problem with $translateProvider
    const Notification = this.$injector.get('Notification');
    if (this.hasSomeReadOnlyRestrictions(config)) {
      Notification.notifyReadOnly(config);
      this.$log.warn('Intercepting request in read-only mode: ', config);
      return this.$q.reject(config);
    } else {
      return config;
    }
  }

  private hasSomeReadOnlyRestrictions(config) {
    const $state = this.$injector.get('$state');
    const currentState = _.get($state, 'current.name');

    return (this.isReadOnly() || this.Authinfo.isReadOnlyState(currentState)) && this.isWriteOp(config.method) && !this.isInAllowedList(config.url) && !this.isInAllowedState(currentState);
  }

  private isReadOnly() {
    const Authinfo = this.$injector.get('Authinfo');
    const isReadOnlyAdmin = _.isFunction(Authinfo.isReadOnlyAdmin) && Authinfo.isReadOnlyAdmin();
    const isPartnerReadOnlyAdmin = _.isFunction(Authinfo.isPartnerReadOnlyAdmin) && Authinfo.isPartnerReadOnlyAdmin();
    return isReadOnlyAdmin || isPartnerReadOnlyAdmin;
  }

  private isWriteOp(method) {
    return (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE');
  }

  private isInAllowedState(currentState) {
    return _.some(this.allowedState, (state) => {
      return state === currentState || _.startsWith(currentState, state + this.PERIOD);
    });
  }

  private isInAllowedList(url) {
    const foundInAllowList = _.find(this.allowedList, function (p) {
      return _.includes(url, p);
    });
    return foundInAllowList || this.isUpdatingSelfInCI(url);
  }

  private isUpdatingSelfInCI(url) {
    const Authinfo = this.$injector.get('Authinfo');
    return _.includes(url, 'identity/scim/' + Authinfo.getUserOrgId() + '/v1/Users/' + Authinfo.getUserId());
  }

}
