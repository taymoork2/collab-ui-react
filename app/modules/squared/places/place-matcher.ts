import IPlace = csdm.IPlace;

export class PlaceMatcher implements IMatcher<IPlace> {
  public matchesSearch(terms: string, matchable: IPlace): boolean {
    if (!terms) {
      return true;
    }

    let termsExpanded = _.lowerCase(terms).split(/[\s,]+/);
    return termsExpanded.every((term) => {
      return this.termMatchesAnyFieldOfItem(term, matchable) || this.termMatchesAnyTag(matchable.tags, term);
    });
  }

  private termMatchesAnyTag(tags: string[], term: string): boolean {
    return _.some(tags, (tag) => {
      return _.includes(_.lowerCase(tag), term);
    });
  }

  private termMatchesAnyFieldOfItem(term: string, item: IPlace): boolean {
    return ['displayName']
        .some((field) => {
          return item && _.includes(_.lowerCase(item[field]), term);
        })
      || ['readableType']
        .some((field) => {
          return item && _.includes(_.lowerCase(item[field]), term);
        })
      || ['sipUrl']
        .some((field) => {
          return item && _.includes(_.lowerCase(item[field]), term);
        });
  }
}
