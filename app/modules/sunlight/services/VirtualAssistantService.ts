import uuid = require('uuid');

export interface IConfigurationResource extends ng.resource.IResourceClass<any> {
  update(any): any;
}

export class VirtualAssistantService {

  /* types of configurations supported by virtualAssistant
   as more are added they should be put here and used in the controller.
   and a new create<type>ConfigObject() func should be created to create its config object.
   */
  public configurationTypes = {
    apiai: 'apiai',
  };

  // Service Card definition. describes how to render the top-level virtual assistant 'card' for care.
  public serviceCard = {
    id: 'Va',
    type: 'virtualAssistant',
    code: this.getVaMessageKey('featureText.virtualAssistantCode'),
    label: this.getVaMessageKey('featureText.virtualAssistantType'),
    description: this.getVaMessageKey('featureText.selectVADesc'),
    icons: ['icon-bot-four'],
    disabled: false,
    goToService: this.goToService.bind(this),
  };
  // Feature List definition. describes how to fetch and render list of existing virtual assistant configurations as
  // 'cards' for care.
  public featureList = {
    name: this.serviceCard.id,
    getFeature: this.listConfigs.bind(this),
    formatter: this.formatVirtualAssistantConfigs.bind(this),
    i18n: 'careChatTpl.chatTemplate',
    isEmpty: false,
    color: 'cta',
    icons: this.serviceCard.icons,
    data: [],
  };
  // Feature List Filter definition. describes how to filter this feature
  public featureFilter = {
    name: this.getVaText('featureText.virtualAssistantMediaType'),
    filterValue: this.serviceCard.type,
  };


  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $translate: ng.translate.ITranslateService,
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private UrlConfig,
    private $q: any,
  ) {
  }


  /**
   * Function to obtain translated string off virtual-assistant's area for strings
   * @param textIdExtension
   * @returns {string|{[p: string]: string}|*}
   */
  public getVaText(textIdExtension: string): string {
    return this.$translate.instant('careChatTpl.virtualAssistant.' + textIdExtension);
  }

  /**
   * Function to obtain literal key for later lookup/translation.
   * @param textIdExtension
   * @returns {string}
   */
  public getVaMessageKey(textIdExtension: string): string {
    return 'careChatTpl.virtualAssistant.' + textIdExtension;
  }

  /** Functions used by service object **/
  /**
   * go to this Service's state
   * @param {Object} $state  current state object from controller.
   * @param {Object} params optional added parameters to pass
   * @returns {String} id of Service
   */
  private goToService($state: ng.ui.IStateService, params?: object): string {
    $state.go('care.assistant', (<any>Object).assign({
      type: this.serviceCard.type,
    }, params));
    return this.serviceCard.id;
  }
  // LogMetricsService.logMetrics('Created template for Care', LogMetricsService.getEventType('careTemplateFinish'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
  /**
   * obtain resource for Virtual Assistant configuration API Rest calls.
   * @param orgId
   * @param botServicesConfigId
   * @returns {*}
   */
  private getConfigResource(orgId: string, botServicesConfigId?: string): IConfigurationResource {
    const  baseUrl = this.UrlConfig.getVirtualAssistantConfigServiceUrl();
    return <IConfigurationResource>this.$resource(baseUrl + '/organization/:orgId/botconfig/:botServicesConfigId', {
      orgId: orgId,
      botServicesConfigId: botServicesConfigId,
    }, {
      update: {
        method: 'PUT',
      },
    });
  }
  /**
   * list all configurations for orgId
   * @param orgId
   * returns promise resolving to JSON array of configurations or empty array on error
   */
  public listConfigs(orgId: string): ng.IPromise<any> {
    return this.getConfigResource(orgId || this.Authinfo.getOrgId())
      .get().$promise;
  }

  /**
   * get a single identified configuration for orgId
   * @param botServicesConfigId
   * @param orgId
   * returns promise
   */
  public getConfig(botServicesConfigId: string, orgId: string): ng.IPromise<any> {
    return this.getConfigResource(orgId || this.Authinfo.getOrgId(), botServicesConfigId)
      .get().$promise;
  }

  /**
   * delete a single identified configuration for orgId
   * @param botServicesConfigId
   * @param orgId
   * returns promise
   */
  public deleteConfig(botServicesConfigId: string, orgId: string): ng.IPromise<void>  {
    return this.getConfigResource(orgId || this.Authinfo.getOrgId(), botServicesConfigId)
      .delete().$promise;
  }

  /**
   * add a new configuration
   * @param type
   * @param name
   * @param config
   * @param orgId
   * returns promise
   */
  public addConfig(type: string, name: string, config: object, orgId: string): ng.IPromise<any> {
    return this.getConfigResource(orgId || this.Authinfo.getOrgId())
      .save({
        type: type,
        name: name,
        config: config,
      }, function (data, headers) {
        data.botServicesConfigId = headers('location').split('/').pop();
        return data;
      }).$promise;
  }

  /**
   * update an identified APIAI configuration
   * @param botServicesConfigId
   * @param type
   * @param name
   * @param config
   * @param orgId
   * returns promise
   */
  public updateConfig(botServicesConfigId: string, type: string, name: string, config: object, orgId: string): ng.IPromise<void> {
    return this.getConfigResource(orgId || this.Authinfo.getOrgId(), botServicesConfigId)
      .update({
        type: type,
        name: name,
        config: config,
      }).$promise;
  }
  /**
   * test the apiai client access token to see if it works.
   * @param token
   * returns promise resolving true on success, false on failure
   */
  public isAPIAITokenValid(token: string): ng.IPromise<boolean> {
    const result = this.$q.defer();
    const request = {
      method: 'POST',
      url: 'https://api.api.ai/v1/query?v=20150910',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json; charset=utf-8',
      },
      data: {
        lang: 'en',
        sessionId: uuid.v4(),
        query: 'Hello',
      },
    };
    this.$http(request)
      .then(function (response: any) {
        const statusCode = (response.data.statusCode || response.data.status.code || 426); //Upgrade of code required
        if (200 <= statusCode && statusCode < 300) {
          result.resolve(true);
        } else {
          result.reject(false);
        }
      }, function () {
        result.reject(false);
      });
    return result.promise;
  }

  /**
   * Return formatted list to render as cards
   * on CareFeatures page
   * @param {Object} list fetched list of configurations
   * @param {Object} feature definition to use when rendering the list as cards.
   * @returns {T[]|boolean[]|Array} card definitions to be rendered.
   */
  private formatVirtualAssistantConfigs(list: any, feature: any): any[] {
    const service = this;
    const formattedList = _.map(list.items, function (item: any) {
      item.templateId = item.id;
      if (!item.name) {
        item.name = item.templateId;
      }
      item.mediaType = service.serviceCard.type;
      item.status = 'Not in use';
      item.featureType = feature.name;
      item.color = feature.color;
      item.icons = feature.icons;
      return item;
    });
    return _.sortBy(formattedList, function (item: any) {
      //converting cardName to lower case as _.sortBy by default does a case sensitive sorting
      return item.name.toLowerCase();
    });
  }

}
export default angular
  .module('Sunlight')
  .service('VirtualAssistantService', VirtualAssistantService)
  .name;