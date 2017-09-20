class EdiscoverySearchResultAdvDirective implements ng.IDirective {
  public template = require('./ediscovery-search-result-adv.html');
  public scope = true;
  public restrict = 'E';
}

export const EdiscoverySearchResultAdvDirectiveFactory: ng.IDirectiveFactory = () => new EdiscoverySearchResultAdvDirective();
