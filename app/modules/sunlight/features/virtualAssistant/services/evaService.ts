import * as _ from 'lodash';

export interface IConfigurationResource extends ng.resource.IResourceClass<any> {
  update(any): any;
}

export class EvaService {

  // Service Card definition. describes how to render the top-level virtual assistant 'card' for care.
  public evaServiceCard = {
    id: 'expertVirtualAssistant',
    type: 'expertVirtualAssistant',
    code: this.getMessageKey('featureText.code'),
    label: this.getMessageKey('featureText.type'),
    description: this.getMessageKey('featureText.selectDesc'),
    icons: ['icon-bot-five'],
    style: 'larger-icon',
    color: 'feature-va-color',
    disabled: false,
    disabledTooltip:  this.getMessageKey('featureText.disabledTooltip'),
    editDeleteWarning: this.getMessageKey('featureText.nonAdminEditDeleteWarning'),
    noDefaultSpaceWarning: this.getMessageKey('featureText.noDefaultSpaceWarning'),
    noDefaultSpaceAndNoAccess: this.getMessageKey('featureText.nonAdminNoDefaultSpace'),
    goToService: this.goToService.bind(this),
  };

  // Feature List definition. describes how to fetch and render list of existing expert virtual assistants as
  // 'cards' for care.
  public featureList = {
    name: this.evaServiceCard.id,
    getFeature: this.listExpertAssistants.bind(this),
    formatter: this.formatExpertAssistants.bind(this),
    i18n: 'careChatTpl.chatTemplate',
    isEmpty: false,
    color: 'cta',
    icons: this.evaServiceCard.icons,
    data: [],
  };

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private UrlConfig,
    private $q: ng.IQService,
    private SparkService,
    private CareFeatureList,
  ) {
  }

  /**
   * Get the feature name text
   * @returns {string}
   */
  public getFeatureName(): string {
    return this.$translate.instant('careChatTpl.virtualAssistant.eva.featureText.name');
  }

  /**
   * Function to obtain literal key for later lookup/translation.
   * @param textIdExtension
   * @returns {string}
   */
  public getMessageKey(textIdExtension: string): string {
    return 'careChatTpl.virtualAssistant.eva.' + textIdExtension;
  }

  /** Functions used by service object **/
  /**
   * go to this Service's state
   * @param $state  current state object from controller.
   * @param params optional added parameters to pass
   * @returns {String} id of Service
   */
  private goToService($state: ng.ui.IStateService, params?: object): string {
    $state.go('care.expertVirtualAssistant', _.assign({
      type: params,
    }, params));
    return this.evaServiceCard.id;
  }

  /**
   * obtain resource for Expert Virtual Assistant API Rest calls.
   * @param orgId
   * @param expertAssistantId
   * @returns {IConfigurationResource}
   */
  private getExpertAssistantResource(orgId: string, expertAssistantId?: string): IConfigurationResource {
    const  baseUrl = this.UrlConfig.getEvaServiceUrl();
    return <IConfigurationResource>this.$resource(baseUrl + 'config/organization/:orgId/expert-assistant/:expertAssistantId', {
      orgId: orgId,
      expertAssistantId: expertAssistantId,
    }, {
      update: {
        method: 'PUT',
      },
      save: {
        method: 'POST',
      },
    });
  }

  private getExpertAssistants (orgId?: string, expertAssistantId?: string): ng.IPromise<any> {
    return this.getExpertAssistantResource(orgId || this.Authinfo.getOrgId(), expertAssistantId)
      .get().$promise;
  }

  /**
   * Add to all expertAssistants (EVAs), the owner details for those evas if its not the logged in user
   * @param {Object} expertAssistantsResponse response by calling getExpertAssistants
   * @returns {angular.IPromise<any>}
   */
  private addOtherOwnerDetails (expertAssistants: any): ng.IPromise<any> {
    const mePersonDetails = this.SparkService.getMyPerson();

    const otherOwnerIds = _.map(_.filter(expertAssistants.items, function (item: any) { return item.ownerId !== mePersonDetails.id; }), 'ownerId');
    return this.SparkService.listPeopleByIds(otherOwnerIds)
      .then((owners) => {
        const ownerMap = {};
        owners.items.forEach((owner) => { ownerMap[owner['id']] = owner; });
        expertAssistants.items.forEach((item) => {
          item.ownerDetails = item.ownerId === mePersonDetails.id ? mePersonDetails : _.get(ownerMap, item.ownerId, {});
        });
        return { items: expertAssistants.items };
      });
  }

  /**
   * list all Expert Virtual Assistants for orgId
   * @param orgId
   * returns {ng.IPromise<any>} promise resolving to JSON array of configurations or empty array on error
   */
  public listExpertAssistants(orgId: string): ng.IPromise<any> {
    const service = this;
    return this.getExpertAssistants(orgId)
      .then(function (expertAssistants) {
        return service.addOtherOwnerDetails(expertAssistants);
      });
  }

  /**
   * get a single identified expert virtual assistant for orgId
   * @param expertAssistantId
   * @param orgId
   * returns {ng.IPromise<any>} promise
   */
  public getExpertAssistant(expertAssistantId: string, orgId: string): ng.IPromise<any> {
    const service = this;
    return this.getExpertAssistants (orgId, expertAssistantId)
      .then(function (response) {
        // in unit test, response found to contain additional properties:
        //  toJSON function, and '$promise' and '$response'
        // we want to omit these properties
        const expertAssistantDataOnly = _.omitBy(response, function (value, key) {
          return (key || '')[0] === '$' || _.isFunction(value);
        });
        return service.addOtherOwnerDetails({ items: [expertAssistantDataOnly] })
          .then(function (expertAssistants) {
            return expertAssistants.items[0];
          });
      });
  }

  /**
   * delete a single identified expert virtual assistant for orgId
   * @param expertAssistantId
   * @param orgId
   * returns {ng.IPromise<any>} promise
   */
  public deleteExpertAssistant(expertAssistantId: string, orgId: string): ng.IPromise<any>  {
    return this.getExpertAssistantResource(orgId || this.Authinfo.getOrgId(), expertAssistantId)
      .delete().$promise;
  }

  /**
   * add a new expert virtual assistant
   * @param name
   * @param orgId
   * @param email
   * @param defaultSpaceId
   * @param iconUrl URL to avatar icon file
   * returns {ng.IPromise<any>} promise
   */
  public addExpertAssistant(name: string, orgId: string, email: string, defaultSpaceId: string, iconUrl?: string): ng.IPromise<any> {
    return this.getExpertAssistantResource(orgId || this.Authinfo.getOrgId())
      .save({
        name: name,
        email: email,
        icon: iconUrl,
        defaultSpaceId: defaultSpaceId,
      }, function (data, headers) {
        data.expertAssistantId = headers('location').split('/').pop();
        return data;
      }).$promise;
  }

  /**
   * update an identified expert virtual assistant
   * @param expertAssistantId
   * @param name
   * @param orgId
   * @param email
   * @param defaultSpaceId
   * returns {ng.IPromise<any>} promise
   */
  public updateExpertAssistant(expertAssistantId: string, name: string, orgId: string, email: string, defaultSpaceId: string): ng.IPromise<void> {
    return this.getExpertAssistantResource(orgId || this.Authinfo.getOrgId(), expertAssistantId)
      .update({
        name: name,
        email: email,
        defaultSpaceId: defaultSpaceId,
      }).$promise;
  }

  /**
   * obtain resource for Expert Virtual Assistant Icon Update API Rest call.
   * @param orgId
   * @param expertAssistantId
   * @returns {IConfigurationResource}
   */
  private getExpertAssistantIconResource(orgId: string, expertAssistantId: string): IConfigurationResource {
    const  baseUrl = this.UrlConfig.getEvaServiceUrl();
    return <IConfigurationResource>this.$resource(baseUrl + 'config/organization/:orgId/expert-assistant/:expertAssistantId/icon', {
      orgId,
      expertAssistantId,
    }, {
      update: {
        method: 'PUT',
      },
    });
  }

  /**
   * update icon of an identified expert virtual assistant
   * @param expertAssistantId
   * @param orgId
   * @param iconUrl URL to avatar icon file
   * returns {ng.IPromise<any>} promise
   */
  public updateExpertAssistantIcon(expertAssistantId: string, orgId: string, iconUrl: string): ng.IPromise<void> {
    return this.getExpertAssistantIconResource(orgId || this.Authinfo.getOrgId(), expertAssistantId)
      .update({
        icon: iconUrl,
      }).$promise;
  }

  public canIEditThisEva(feature: any): boolean {
    return feature.ownerId === this.SparkService.getMyPersonId();
  }

  /**
   * Return the name of the admin that created this Expert Virtual Assistant
   * @param feature
   * @returns {string}
   */
  public getEvaOwner(feature: any): string {
    return _.get(feature, 'ownerDetails.displayName', '');
  }

  /**
   * Return formatted list to render as cards on CareFeatures page
   * @param list
   * @param feature
   * @returns {any[]}
     */
  private formatExpertAssistants(list: any, feature: any): any[] {
    const service = this;
    const formattedList = _.map(list.items, function (item: any) {
      item.templateId = item.id;
      if (!item.name) {
        item.name = service.getFeatureName();
      }
      item.featureType = feature.name;
      item.color = feature.color;
      item.icons = feature.icons;
      item.templates = [];
      item.filterValue = service.CareFeatureList.filterConstants.virtualAssistant;
      return item;
    });
    return _.sortBy(formattedList, function (item: any) {
      //converting cardName to lower case as _.sortBy by default does a case sensitive sorting
      return item.name.toLowerCase();
    });
  }

  /**
   * obtain resource for Expert Virtual Assistant Icon Validation API Rest calls.
   * @param orgId
   * @returns {*}
   */
  private getValidateResource(orgId?: string): IConfigurationResource {
    const baseUrl = this.UrlConfig.getEvaServiceUrl();
    return <IConfigurationResource>this.$resource(baseUrl + 'validateIcon', {
      orgId: orgId,
    }, {
      update: {
        method: 'POST',
      },
    });
  }

  /**
   * Test the avatar file to see if it is within expected boundaries: PNG file, 1MB max
   *
   * @param orgId
   * @param iconUrl
   * returns promise resolving true on success, false on failure
   */
  public isAvatarFileValid(orgId: string, iconUrl: string): ng.IPromise<void> {
    return this.getValidateResource(orgId || this.Authinfo.getOrgId())
      .update({
        icon: iconUrl,
      }).$promise;
  }

  /**
   * Get the data url from file object
   * @param fileObject
   * @returns {Promise<String>} promise resolving to the data url on success; otherwise promise rejected
   */
  public getFileDataUrl(fileObject: any): ng.IPromise<String> {
    return this.$q((resolve, reject) => {
      if (!fileObject) {
        return reject('');
      }
      const fileReader = new FileReader();
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = () => {
        reject('');
      };
      fileReader.readAsDataURL(fileObject);
    });
  }

  public getMissingDefaultSpaceEva(orgId?: string): ng.IPromise<any> {
    const service = this;
    return this.listExpertAssistants(orgId || this.Authinfo.getOrgId())
      .then(function (expertAssistants) {
        return _.find(expertAssistants.items, service.isMissingDefaultSpace);
      });
  }

  public isMissingDefaultSpace(feature: any) {
    return !_.find(feature.spaces, 'default');
  }
}
export default angular
  .module('Sunlight')
  .service('EvaService', EvaService)
  .name;
