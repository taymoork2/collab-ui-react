import { HuronUserService, UserV2 } from 'modules/huron/users';
import { IPrimaryLineFeature } from './primaryLine.interfaces';
import { PlaceCallOverviewService } from 'modules/squared/places/callOverview';
import { Line } from 'modules/huron/lines/services';
import { PrimaryNumber } from './primaryLine';

export class PrimaryLineService {
  /* @ngInject */
  constructor(
    private HuronUserService: HuronUserService,
    private FeatureToggleService,
    private PlaceCallOverviewService: PlaceCallOverviewService,
  ) {}

  public update(userId: string, lineSelection: IPrimaryLineFeature): ng.IPromise<any> {
    if (lineSelection.module === 'user') {
      const userPrimaryNumberData = {
        alwaysUseForOutboundCalls: lineSelection.primaryLineEnabled,
      };
      const primaryNumber = new PrimaryNumber(userPrimaryNumberData);
      const user = new UserV2({
        uuid: undefined,
        firstName: undefined,
        lastName: undefined,
        userName: undefined,
        sipAddress: undefined,
        preferredLanguage: undefined,
        numbers: undefined,
        primaryNumber: primaryNumber,
      });
      return this.HuronUserService.updateUserV2(userId, user).then((data) => {
        return data;
      });
    } else {
      const lineSelectionData = {
        primaryNumber: {
          alwaysUseForOutboundCalls: lineSelection.primaryLineEnabled,
        },
      };
      return this.PlaceCallOverviewService.updateCmiPlacePrimaryNumber(userId, lineSelectionData).then((data) => {
        return data;
      });
    }
  }

  public isPrimaryLineFeatureEnabled(): ng.IPromise<boolean> {
    return this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1474);
  }

  public checkIfMultiLineExists(lines: Line[]): boolean {
    let sharedLine: Line[];
    sharedLine = _.filter(lines, (line) => {
      return line.shared === true;
    });
    return (lines.length > 1) || (sharedLine.length > 0);
  }
}
