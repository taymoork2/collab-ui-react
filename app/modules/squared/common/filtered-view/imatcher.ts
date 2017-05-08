interface IMatcher<T> {
  matchesSearch(term: string, matchable: T): boolean;
}
