export class PreviousState {
  private state?: string;
  private params?: object;
  private unallowedReturnStates = [
    'login',
  ];

  /* @ngInject */
  constructor (
    private $q: ng.IQService,
    private $state: ng.ui.IStateService,
  ) {}

  public set(_state: string): void {
    this.state = _state;
  }

  public get(): string | undefined {
    return this.state;
  }

  public setParams(_params): void {
    this.params = _params;
  }

  public getParams(): object | undefined {
    return this.params;
  }

  public isValid(state = this.state): state is string  {
    return _.isString(state) && state.length > 0 && !_.includes(this.unallowedReturnStates, state);
  }

  public go(): ng.IPromise<void> {
    if (!this.isValid(this.state)) {
      return this.$q.reject();
    }
    return this.$state.go(this.state, this.params);
  }
}
