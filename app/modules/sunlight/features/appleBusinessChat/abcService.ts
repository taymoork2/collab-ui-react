import * as _ from 'lodash';

export interface IConfigurationResource extends ng.resource.IResourceClass<any> {
  update(any): any;
}

export class AbcService {

  // Service Card definition. describes how to render the top-level Apple Business Chat 'card' for care.
  public abcServiceCard = {
    id: 'appleBusinessChat',
    type: 'appleBusinessChat',
    label: this.getMessageKey('featureText.type'),
    description: this.getMessageKey('featureText.selectDesc'),
    icons: ['icon-message'],
    color: 'feature-abc-color',
    style: 'abc-icon',
    disabled: false,
    goToService: this.goToService.bind(this),
  };

  // Feature List definition. describes how to fetch and render list of existing ABC config as
  // 'cards' for care.
  public featureList = {
    name: this.abcServiceCard.id,
    getFeature: this.listAbcConfig.bind(this),
    formatter: this.formatAppleConfigList.bind(this),
    i18n: 'careChatTpl.chatTemplate',
    isEmpty: false,
    color: 'abc',
    icons: this.abcServiceCard.icons,
    featureIcons: { cva: this.CvaService.featureList.icons[0] },
    data: [],
  };

  // Feature List Filter definition. describes how to filter this feature
  public featureFilter = {
    name: this.$translate.instant('careChatTpl.filterValue.appleBusinessChat'),
    filterValue: this.CareFeatureList.filterConstants.appleBusinessChat,
  };

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private UrlConfig,
    private CvaService,
    private CareFeatureList,
  ) {
  }

  /**
   * Get the feature name text
   * @returns {string}
   */
  public getFeatureName(): string {
    return this.$translate.instant('careChatTpl.appleBusinessChat.featureText.name');
  }

  /**
   * Function to obtain literal key for later lookup/translation.
   * @param textIdExtension
   * @returns {string}
   */
  public getMessageKey(textIdExtension: string): string {
    return 'careChatTpl.appleBusinessChat.' + textIdExtension;
  }

  /**
   * obtain resource for Apple Business Chat configuration API Rest calls.
   * @param orgId
   * @param businessId
   * @returns {*}
   */
  private getConfigResource(orgId: string, businessId?: string): IConfigurationResource {
    const  baseUrl = this.UrlConfig.getMediaManagerUrl();
    return <IConfigurationResource>this.$resource(baseUrl + 'abc/config/organization/:orgId/businessId/:businessId', {
      orgId: orgId,
      businessId: businessId,
    }, {
      update: {
        method: 'PUT',
      },
    });
  }

  /**
   * list all Apple Business Chat configurations for orgId
   * @param orgId
   * returns promise resolving to JSON array of configurations or empty array on error
   */
  public listAbcConfig(orgId: string): ng.IPromise<any> {
    return this.getConfigResource(orgId || this.Authinfo.getOrgId())
      .get().$promise;
  }

  /**
   * get a single abc config
   * @param businessId
   * @param orgId
   * returns promise
   */
  public getAbcConfig(businessId: string, orgId: string): ng.IPromise<any> {
    return this.getConfigResource(orgId || this.Authinfo.getOrgId(), businessId)
      .get().$promise;
  }

  /**
   * delete a single abc config
   * @param businessId
   * @param orgId
   * returns promise
   */
  public deleteAbcConfig(businessId: string, orgId: string): ng.IPromise<void>  {
    return this.getConfigResource(orgId || this.Authinfo.getOrgId(), businessId)
      .delete().$promise;
  }

  /**
   * add a new abc configuration
   * @param businessId
   * @param name
   * @param orgId
   * @param cvaId (optional)
   * returns promise
   */
  public addAbcConfig(businessId: string, name: string, orgId: string, cvaId?: string): ng.IPromise<any> {
    return this.getConfigResource(orgId || this.Authinfo.getOrgId(), businessId)
      .save({
        name,
        cvaId,
        queueIds: [orgId],
      }, function (data, headers) {
        data.businessId = headers('location').split('/').pop();
        return data;
      }).$promise;
  }

  /**
   * update an abc configuration
   * @param businessId
   * @param name
   * @param orgId
   * @param cvaId (optional)
   * returns promise
   */
  public updateAbcConfig(businessId: string, name: string, orgId: string, cvaId?: string): ng.IPromise<void> {
    return this.getConfigResource(orgId || this.Authinfo.getOrgId(), businessId)
      .update({
        name,
        cvaId,
        queueIds: [orgId],
      }).$promise;
  }

  /**
   * Return formatted list to render as cards on CareFeatures page
   * @param list
   * @param feature
   * @returns {any}
   */
  private formatAppleConfigList(list: any, feature: any): any[] {
    const service = this;
    const formattedList = _.map(list.items, function (item: any) {
      item.templateId = item.id;
      item.featureType = feature.name;
      item.color = feature.color;
      item.icons = feature.icons;
      item.featureIcons = feature.featureIcons;
      item.filterValue = service.CareFeatureList.filterConstants.appleBusinessChat;
      return item;
    });

    return _.sortBy(formattedList, function (item: any) {
      //converting cardName to lower case as _.sortBy by default does a case sensitive sorting
      return item.name.toLowerCase();
    });
  }

  /** Functions used by service object **/
  /**
   * go to this Service's state
   * @param $state  current state object from controller.
   * @param params optional added parameters to pass
   * @returns {String} id of Service
   */
  private goToService($state: ng.ui.IStateService, params?: object): string {
    $state.go('care.appleBusinessChat', _.assign({
      type: params,
    }, params));
    return this.abcServiceCard.id;
  }
}
export default angular
  .module('Sunlight')
  .service('AbcService', AbcService)
  .name;
