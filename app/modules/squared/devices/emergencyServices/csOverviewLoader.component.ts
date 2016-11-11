class CSOverviewLoader implements ng.IComponentController {
  public size: string;
  constructor() {
    this.size = this.size || 'md';
  }
}

export class CSOverviewLoaderComponent implements ng.IComponentOptions {
  public controller = CSOverviewLoader;
  public template = `
    <div class="cs-overview-loader cs-overview-loader--{{::$ctrl.size}}" ng-if="$ctrl.loading">
      <div class="cs-overview-loader__content">
        <span class="icon icon-spinner"></span>
        <div class="cs-overview-loader__text">{{$ctrl.loadingText}}</div>
      </div>
    </div>
  `;
  public bindings = <{ [binding: string]: string }>{
    loading: '<',
    loadingText: '<',
    size: '@',
  };
}

angular
  .module('Huron')
  .component('csOverviewLoader', new CSOverviewLoaderComponent());
