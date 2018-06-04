export class PreviousState {
  private state?: string;
  private params?: object;
  private unallowedReturnStates = [
    'login',
  ];

  /* @ngInject */
  constructor (
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

  public isValid(): boolean {
    return this.isStateValid(this.state);
  }

  public go() {
    if (this.isStateValid(this.state)) {
      return this.$state.go(this.state, this.params);
    }
  }

  private isStateValid(state?: string): state is string {
    return _.isString(state) && state.length > 0 && !_.includes(this.unallowedReturnStates, state);
  }
}
