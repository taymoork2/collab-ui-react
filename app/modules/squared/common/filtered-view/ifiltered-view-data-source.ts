import IPromise = ng.IPromise;

interface IFilteredViewDataSource<T> {
  getAll(): IPromise<{ [url: string]: T; }>;

  search(term: string): IPromise<{ [url: string]: T; }>;

  isSearchOnly(): IPromise<boolean>;
}
