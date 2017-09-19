
export interface IOption {
  label: string;
  value: string;
}

export class Option {
  public label: string;
  public value: string;

  constructor(option: IOption = {
    label: '',
    value: '',
  }) {
    this.label = option.label;
    this.value = option.value;
  }
}

export interface ICOSRestriction {
  restriction: string;
  blocked: boolean;
  uuid?: string;
}

export interface ICOSRestrictionResponse {
  customer: ICOSRestriction[];
  place?: ICOSRestriction[];
  user?: ICOSRestriction[];
}

interface IDialingResource extends ng.resource.IResourceClass<ng.resource.IResource<ICOSRestrictionResponse>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<ICOSRestrictionResponse>>;
}

export class DialingType {
  public static INTERNATIONAL = 'DIALINGCOSTAG_INTERNATIONAL';
  public static LOCAL = 'DIALINGCOSTAG_NATIONAL';
}

export class DialingService {
  public cbUseGlobal: IOption;
  public cbAlwaysAllow: IOption;
  public cbNeverAllow: IOption;
  private internationalDialing: string | undefined;
  private localDialing: string | undefined;
  private dialingService: IDialingResource;
  private cosRestriction: ICOSRestrictionResponse;
  private dialingUuids = {};
  public disableInternationalDialing: boolean;
  /* @ngInject */
  constructor(
    private $translate,
    private $q: ng.IQService,
    private $resource: ng.resource.IResourceService,
    private HuronConfig,
    private Authinfo,
    private FeatureToggleService,
    private $state: ng.ui.IStateService) {

    const updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    this.dialingService = <IDialingResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/:type/:typeId/features/restrictions/:restrictionId', {},
      {
        update: updateAction,
      });
    this.cbUseGlobal = {
      label: $translate.instant('internationalDialingPanel.useGlobal'),
      value: '-1',
    };
    this.cbAlwaysAllow = {
      label: $translate.instant('internationalDialingPanel.alwaysAllow'),
      value: '1',
    };
    this.cbNeverAllow = {
      label: $translate.instant('internationalDialingPanel.neverAllow'),
      value: '0',
    };
  }

  public initializeDialing: (type: string, typeId: string) => ng.IPromise<any> = (type, typeId) => {
    this.internationalDialing = undefined;
    this.localDialing = undefined;
    this.dialingUuids = {};
    return this.dialingService.get({
      customerId: this.Authinfo.getOrgId(),
      type: type,
      typeId: typeId,
    }, (cosRestriction) => {
      this.cosRestriction = cosRestriction;
    }).$promise;
  }

  public getDialing(type: string, dialingType: string) {
    let response;
    let overRide = false;
    let custRestriction = false;
    type = type.slice(0, -1);

    this.cosRestriction[type].filter((cos: ICOSRestriction) => cos.restriction === dialingType).map((cos: ICOSRestriction) => {
      overRide = true;
      this.dialingUuids[dialingType] = cos.uuid;
    });

    this.cosRestriction.customer.filter((cos: ICOSRestriction) => cos.restriction === dialingType).map(() => {
      custRestriction = true;
    });

    if (overRide) {
      this.cosRestriction[type].filter((cos: ICOSRestriction) => cos.restriction === dialingType).map((cos: ICOSRestriction) => {
        if (cos.blocked) {
          response = this.cbNeverAllow.label;
        } else {
          response = this.cbAlwaysAllow.label;
        }
      });
    }

    let globalText;
    if (custRestriction) {
      globalText = this.cbUseGlobal.label + ' ' + this.$translate.instant('internationalDialingPanel.off');
    } else {
      globalText = this.cbUseGlobal.label + ' ' + this.$translate.instant('internationalDialingPanel.on');
    }

    if (!overRide) {
      response = globalText;
    }

    return response;
  }

  public setDialing(item: IOption, type: string, typeId: string, dialingType: string): ng.IPromise<any> {
    const cosType: ICOSRestriction = {
      restriction: dialingType,
      blocked: false,
    };

    if (item.value === '0') {
      cosType.blocked = true;
    } else {
      cosType.blocked = false;
    }
    return this.updateDialing(item, type, typeId, cosType, dialingType);
  }

  public updateDialing(item: IOption, type: string, typeId: string, cosType: ICOSRestriction, dialingType: string) {
    if (this.dialingUuids[dialingType] && item.value === '-1') {
      return this.dialingService.delete({
        customerId: this.Authinfo.getOrgId(),
        type: type,
        typeId: typeId,
        restrictionId: this.dialingUuids[dialingType],
      }).$promise;
    } else {
      if (!this.dialingUuids[dialingType]) {
        return this.dialingService.save({
          customerId: this.Authinfo.getOrgId(),
          type: type,
          typeId: typeId,
        }, cosType).$promise;
      } else {
        return this.dialingService.update({
          customerId: this.Authinfo.getOrgId(),
          type: type,
          typeId: typeId,
          restrictionId: this.dialingUuids[dialingType],
        }, cosType).$promise;
      }
    }

  }

  public getSelected(value: number) {
    switch (value) {
      case 0: return this.cbNeverAllow;
      case 1: return this.cbAlwaysAllow;
      case -1: return this.cbUseGlobal;
    }
  }

  public getInternationalDialing(type: string) {
    if (!this.internationalDialing) {
      this.internationalDialing = this.getDialing(type, DialingType.INTERNATIONAL);
    }
    return this.internationalDialing;
  }

  public setInternationalDialing: (item: IOption, type: string, typeId: string) => ng.IPromise<any> = (item, type, typeId) => {
    const deferred = this.$q.defer();
    this.setDialing(item, type, typeId, DialingType.INTERNATIONAL).then(() => {
      this.$state.go(_.get<string>(this.$state, '$current.parent.name'));
      deferred.resolve(true);
    }, (response) => {
      deferred.reject(response);
    });
    return deferred.promise;
  }

  public getLocalDialing(type: string) {
    if (!this.localDialing) {
      this.localDialing = this.getDialing(type, DialingType.LOCAL);
    }
    return this.localDialing;
  }

  public setLocalDialing: (item: IOption, type: string, typeId: string) => ng.IPromise<any> = (item, type, typeId) => {
    const deferred = this.$q.defer();
    this.setDialing(item, type, typeId, DialingType.LOCAL).then(() => {
      this.$state.go(_.get<string>(this.$state, '$current.parent.name'));
      deferred.resolve(true);
    }, (response) => {
      deferred.reject(response);
    });
    return deferred.promise;
  }

  public isDisableInternationalDialing(): ng.IPromise<boolean> {
    return this.FeatureToggleService.supports(this.FeatureToggleService.features.huronInternationalDialingTrialOverride)
      .then((data) => {
        this.disableInternationalDialing = this.getLicenseCommunicationIsTrial(data);
        return this.disableInternationalDialing;
      });
  }

  public getLicenseCommunicationIsTrial(isOverride: boolean): boolean {
    if (isOverride) {
      // customer has trial override feature toggle for international dialing
      this.disableInternationalDialing = false;
      return this.disableInternationalDialing;
    }
    // no override, check if communication license is in trial period
    this.disableInternationalDialing = this.Authinfo.getLicenseIsTrial('COMMUNICATION', 'ciscouc');
    return _.isUndefined(this.disableInternationalDialing) || this.disableInternationalDialing;
  }

}
