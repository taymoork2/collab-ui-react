import { IUserCos, IRestriction, IDialPlan } from './userCos';

interface IUserCosResource extends ng.resource.IResourceClass<ng.resource.IResource<IUserCos>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

interface IDialPlanResource extends ng.resource.IResourceClass<ng.resource.IResource<IDialPlan>> {}

export class UserCosService {
  private userCosService: IUserCosResource;
  private dialPlanService: IDialPlanResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {
    let updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    this.userCosService = <IUserCosResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/:memberType/:memberId/features/restrictions/:cosId', {},
      {
        update: updateAction,
      });

    this.dialPlanService = <IDialPlanResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/dialplans', {}, {});
  }

  public getUserCos(memberType: string, memberId: string): ng.IPromise<IUserCos> {
    return this.userCosService.get({
      customerId: this.Authinfo.getOrgId(),
      memberType: memberType,
      memberId: memberId,
    }).$promise;
  }

  public createUserCos(memberId: string, memberType: string, restriction: IRestriction): ng.IPromise<IUserCos> {
    return this.userCosService.save({
      customerId: this.Authinfo.getOrgId(),
      memberId: memberId,
      memberType: memberType,
    }, restriction).$promise;
  }

  public updateUserCos(memberId: string, memberType: string, cosId: string, restriction: IRestriction): ng.IPromise<void> {
    return this.userCosService.update({
      customerId: this.Authinfo.getOrgId(),
      memberType: memberType,
      memberId: memberId,
      cosId: cosId,
    }, restriction).$promise;
  }

  public deleteUserCos(memberId: string, memberType: string, cosId: string): ng.IPromise<any> {
    return this.userCosService.remove({
      customerId: this.Authinfo.getOrgId(),
      memberType: memberType,
      memberId: memberId,
      cosId: cosId,
    }).$promise;
  }

  public getPremiumNumbers(): ng.IPromise<IDialPlan> {
    return this.dialPlanService.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise;
  }

}
