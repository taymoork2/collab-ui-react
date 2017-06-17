import IDevice = csdm.IDevice;
import IDeviceDiagnosticEvent = csdm.IDeviceDiagnosticEvent;

export class DeviceMatcher implements IMatcher<IDevice> {

  public matchesSearch(terms: string, matchable: IDevice): boolean {
    if (!terms) {
      return true;
    }

    const termsExpanded = _.toLower(terms).split(/[\s,]+/);
    return termsExpanded.every((term) => {
      if (!term) {
        return true;
      }
      return this.termMatchesAnyFieldOfItem(matchable, term)
          || this.termMatchesState(matchable.state, term)
          || this.termMatchesAnyTag(matchable.tags, term)
          || this.termMatchesAnyIssue(matchable.diagnosticsEvents, term)
          || this.termMatchesUpgradeChannel(matchable.upgradeChannel, term)
          || this.termMatchesFormattedMac(matchable.mac, term);
    });
  }

  private termMatchesAnyFieldOfItem(item: IDevice, term: string): boolean {
    return item && ['displayName', 'product', 'ip', 'serial', 'readableActiveInterface'].some(
        (field) => {
          return this.fieldContainsTerm(item[field], term);
        });
  }

  private termMatchesState(state: any, term: string): boolean {
    return state && this.fieldContainsTerm(state.readableState, term);
  }

  private termMatchesAnyTag(tags: string[], term: string): boolean {
    return _.some(tags, (tag) => {
      return this.fieldContainsTerm(tag, term);
    });
  }

  private termMatchesAnyIssue(issues: IDeviceDiagnosticEvent[], term: string): boolean {
    return _.some(issues, (issue) => {
      return issue && ( this.fieldContainsTerm(issue.message, term) || this.fieldContainsTerm(issue.type, term) );
    });
  }

  private termMatchesUpgradeChannel(upgradeChannel, term: string): boolean {
    return upgradeChannel &&
      (this.fieldContainsTerm(upgradeChannel.label, term) || this.fieldContainsTerm(upgradeChannel.value, term));
  }

  private termMatchesFormattedMac(mac, term: string): boolean {
    return mac && this.fieldContainsTerm(mac.replace(/:/g, ''), term.replace(/:/g, ''));
  }

  private fieldContainsTerm(field: string, term: string) {
    return _.includes(_.toLower(field), term);
  }
}
