import HybridServicesFlagServiceModuleName, { HybridServicesFlagService } from 'modules/hercules/services/hs-flag-service';

interface INumbersChangedObject {
  options: {
    numberChecked: number,
    totalNumber: number,
  };
}

export class HybridServicesPrerequisitesHelperService {

  /* @ngInject */
  constructor(
    private HybridServicesFlagService: HybridServicesFlagService,
  ) { }

  public readFlags(prefixedFlags: string[], flagPrefix: string, checkboxes): ng.IPromise<any> {
    return this.HybridServicesFlagService.readFlags(prefixedFlags)
      .then((rawFlags) => {
        _.forEach(rawFlags, (flag) => {
          checkboxes[flag.name.replace(flagPrefix, '')] = flag.raised;
        });
        return checkboxes;
      });
  }

  public processFlagChanges(newValue, oldValue, flagPrefix: string, checkboxes) {
    _.forEach(Object.keys(checkboxes), (flagName) => {
      if (oldValue[flagName] !== newValue[flagName]) {
        if (newValue[flagName]) {
          this.HybridServicesFlagService.raiseFlag(`${flagPrefix}${flagName}`);
        } else {
          this.HybridServicesFlagService.lowerFlag(`${flagPrefix}${flagName}`);
        }
      }
    });
  }

  public processFlagChange(flagName: string, flagPrefix: string, newValue: boolean) {
    if (newValue) {
      this.HybridServicesFlagService.raiseFlag(`${flagPrefix}${flagName}`);
    } else {
      this.HybridServicesFlagService.lowerFlag(`${flagPrefix}${flagName}`);
    }
  }

  public buildNumbersCheckedObject(checkboxes): INumbersChangedObject {
    return {
      options: {
        numberChecked: this.getNumberOfCheckboxes(checkboxes),
        totalNumber: Object.keys(checkboxes).length,
      },
    };
  }

  public getPrefixedFlags(flagPrefix: string, checkboxes): string[] {
    return _.map(Object.keys(checkboxes), (checkbox) => `${flagPrefix}${checkbox}`);
  }

  private getNumberOfCheckboxes(checkboxes): number {
    return _.reduce(checkboxes, (sumTotalChecked, isChecked) => isChecked ? sumTotalChecked + 1 : sumTotalChecked, 0);
  }

}

export default angular
  .module('services-overview.hybrid-services-prerequisites-helper-service', [
    HybridServicesFlagServiceModuleName,
  ])
  .service('HybridServicesPrerequisitesHelperService', HybridServicesPrerequisitesHelperService)
  .name;
