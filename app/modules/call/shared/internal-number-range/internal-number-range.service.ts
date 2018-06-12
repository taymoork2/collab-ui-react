import { IRInternalNumberRange, InternalNumberRange } from 'modules/call/shared/internal-number-range/internal-number-range';

interface ILocationInternalNumberRangeResource extends ng.resource.IResourceClass<ng.resource.IResource<IRInternalNumberRange>> {}
interface ICustomerInternalNumberRangeResource extends ng.resource.IResourceClass<ng.resource.IResource<IRInternalNumberRange>> {}
const PATTERN_USAGE_DEVICE: string = 'Device';
const DEFAULT_RANGE_BEGIN_SEED: number = 5;
const DEFAULT_RANGE_END_SEED: number = 9;

export class InternalNumberRangeService {
  private locationInternalNumberRangeResource: ILocationInternalNumberRangeResource;
  private customerInternalNumberRangeResource: ICustomerInternalNumberRangeResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {

    const saveAction: ng.resource.IActionDescriptor = {
      method: 'POST',
      headers: {
        'Access-Control-Expose-Headers': 'Location',
      },
    };

    this.locationInternalNumberRangeResource = <ILocationInternalNumberRangeResource>this.$resource(`${this.HuronConfig.getCmiUrl()}/voice/customers/:customerId/locations/:locationId/internalnumberranges/:internalNumberRangeId`, {}, {
      save: saveAction,
    });

    this.customerInternalNumberRangeResource = <ICustomerInternalNumberRangeResource>this.$resource(`${this.HuronConfig.getCmiUrl()}/voice/customers/:customerId/internalnumberranges/:internalNumberRangeId`, {}, {
      save: saveAction,
    });
  }

  public getLocationRangeList(locationId: string): ng.IPromise<InternalNumberRange[]> {
    return this.locationInternalNumberRangeResource.query({
      customerId: this.Authinfo.getOrgId(),
      locationId: locationId,
    }).$promise
      .then(response => {
        return _.map<any, IRInternalNumberRange>(response, range => {
          return new InternalNumberRange(range);
        }).sort( (a, b) => { // sort - order by beginNumber ascending
          return _.toSafeInteger(a.beginNumber) - _.toSafeInteger(b.beginNumber);
        });
      });
  }

  public createLocationInternalNumberRange(locationId: string, internalNumberRange: InternalNumberRange): ng.IPromise<string> {
    let locationHeader: string = '';
    internalNumberRange.name = internalNumberRange.beginNumber + ' - ' + internalNumberRange.endNumber;
    return this.locationInternalNumberRangeResource.save({
      customerId: this.Authinfo.getOrgId(),
      locationId: locationId,
    }, {
      name: internalNumberRange.name,
      description: internalNumberRange.name,
      patternUsage: PATTERN_USAGE_DEVICE,
      beginNumber: internalNumberRange.beginNumber,
      endNumber: internalNumberRange.endNumber,
    }, (_response, headers) => {
      locationHeader = headers('Location');
    }).$promise
      .then(() => locationHeader);
  }

  public deleteLocationInternalNumberRange(locationId: string, internalNumberRange: InternalNumberRange): ng.IPromise<InternalNumberRange> {
    return this.locationInternalNumberRangeResource.delete({
      customerId: this.Authinfo.getOrgId(),
      locationId: locationId,
      internalNumberRangeId: internalNumberRange.uuid,
    }).$promise;
  }

  public getCustomerRangeList(): ng.IPromise<InternalNumberRange[]> {
    return this.customerInternalNumberRangeResource.query({
      customerId: this.Authinfo.getOrgId(),
    }).$promise
      .then(response => {
        return _.map<any, IRInternalNumberRange>(response, range => {
          return new InternalNumberRange(range);
        }).sort( (a, b) => { // sort - order by beginNumber ascending
          return _.toSafeInteger(a.beginNumber) - _.toSafeInteger(b.beginNumber);
        });
      });
  }

  public createCustomerInternalNumberRange(internalNumberRange: InternalNumberRange): ng.IPromise<string> {
    let locationHeader: string = '';
    internalNumberRange.name = internalNumberRange.beginNumber + ' - ' + internalNumberRange.endNumber;
    return this.customerInternalNumberRangeResource.save({
      customerId: this.Authinfo.getOrgId(),
    }, {
      name: internalNumberRange.name,
      description: internalNumberRange.name,
      patternUsage: PATTERN_USAGE_DEVICE,
      beginNumber: internalNumberRange.beginNumber,
      endNumber: internalNumberRange.endNumber,
    }
    , (_response, headers) => {
      locationHeader = headers('Location');
    }).$promise
      .then(() => locationHeader);
  }

  public deleteCustomerInternalNumberRange(internalNumberRange: InternalNumberRange): ng.IPromise<InternalNumberRange> {
    return this.customerInternalNumberRangeResource.delete({
      customerId: this.Authinfo.getOrgId(),
      internalNumberRangeId: internalNumberRange.uuid,
    }).$promise;
  }

  public calculateDefaultExtensionRange(extensionLength: number): InternalNumberRange {
    const extension: number[] = [DEFAULT_RANGE_BEGIN_SEED];
    for (let index = 0; index < (extensionLength - 1); index++) {
      extension.push(0);
    }
    const beginNumber: number = _.toSafeInteger(extension.join(''));
    const endNumber: number = beginNumber + DEFAULT_RANGE_END_SEED;

    return new InternalNumberRange({
      beginNumber: beginNumber.toString(),
      endNumber: endNumber.toString(),
    });
  }
}
