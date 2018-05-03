import IPlace = csdm.IPlace;

export class PlaceMatcher implements IMatcher<IPlace> {
  public matchesSearch(terms: string, matchable: IPlace): boolean {
    if (!terms) {
      return true;
    }

    const termsExpanded = _.toLower(terms).split(/[\s,]+/);
    return termsExpanded.every((term) => {
      return this.termMatchesAnyFieldOfItem(term, matchable) || this.termMatchesAnyTag(matchable.tags, term);
    });
  }

  private termMatchesAnyTag(tags: string[], term: string): boolean {
    return _.some(tags, (tag) => {
      return _.includes(_.toLower(tag), term);
    });
  }

  private termMatchesAnyFieldOfItem(term: string, item: IPlace): boolean {
    return item && (['displayName', 'readableType', 'sipUrl']
        .some((field) => {
          return _.includes(_.toLower(item[field]), term);
        })
      || _.some(item['entitlements'] || [], (entitlement) => {
        return _.includes(_.toLower(entitlement), term);
      })
      || _.some(item['externalLinkedAccounts'] || [], (extLinkedAcct) => {
        return _.includes(_.toLower(extLinkedAcct.accountGUID), term);
      }));
  }
}
