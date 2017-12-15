declare namespace atlas {
  export namespace test {
    interface IInitControllerOptions {
      controllerAs?: string;
      controllerLocals?: Object;
    }

    interface ICompileComponentOptions {
      [keys: string]: any;
    }

    interface IComponentSpy<T extends ng.IComponentOptions> {
      bindings: Array<{[key in keyof T['bindings']]: any}>;
    }

    interface IDependenciesBase {
      $http: ng.IHttpService;
      $httpBackend: ng.IHttpBackendService;
      $q: ng.IQService;
      $scope: ng.IScope & {
        [key: string]: any; // backwards compatibility
      };
    }

    type ITest<Dependencies = {}, This = {}> = Dependencies & IDependenciesBase & This & {
      [name: string]: any; // backwards compatibility

      initController(name: string, options: IInitControllerOptions): void;
      initModules(...args: Array<string | Function | Object>): void;

      injectDependencies(...args: Array<keyof Dependencies | keyof IDependenciesBase>): void;
      injectProviders(...args: Array<string>): void

      compileComponent(name: string, options: ICompileComponentOptions): void;
      compileComponentNoApply(name: string, options: ICompileComponentOptions): void;
      compileTemplate(name: string): void;
      compileTemplateNoApply(name: string): void;
      compileViewTemplate(name: string, template: string, options: IInitControllerOptions): void;

      spyOnComponent<T>(name: string): IComponentSpy<T>;
    }

    type IComponentTest<ComponentController extends ng.IComponentController, Dependencies = {}, This = {}> = ITest<Dependencies, This> & {
      controller: ComponentController;
      view: JQuery;
    }

    type IServiceTest<Dependencies = {}, This = {}> = ITest<Dependencies, This>;
  }
}
