class EdiscoverySearchResultDirective implements ng.IDirective {
  public template = require('./ediscovery-search-result.html');
  public scope = true;
  public restrict = 'E';
}

export const EdiscoverySearchResultDirectiveFactory: ng.IDirectiveFactory = () => new EdiscoverySearchResultDirective();
