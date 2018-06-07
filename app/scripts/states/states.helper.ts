const loadedModules: string[] = [];

export function resolveLazyLoad(requireFunction: Function) {
  // https://github.com/ocombe/ocLazyLoad/issues/321
  // $$animateJs issue when 'ng' module is "reloaded" through $ocLazyLoad
  // force $$animateJs to be loaded before we try to lazy load
  return ['$$animateJs', '$ocLazyLoad', '$q', function lazyLoad(_$$animateJs, $ocLazyLoad, $q) {
    return $q(function resolvePromise(resolve) {
      requireFunction(requireDoneCallback);

      function requireDoneCallback(_module) {
        let moduleName;
        if (_.isObject(_module) && _.has(_module, 'default')) {
          moduleName = _module.default;
        } else {
          moduleName = _module;
        }
        // Don't reload a loaded module or core angular module
        if (_.includes(loadedModules, moduleName) || _.includes($ocLazyLoad.getModules(), moduleName) || _.startsWith(moduleName, 'ng')) {
          resolve();
        } else {
          loadedModules.push(moduleName);
          $ocLazyLoad.toggleWatch(true);
          $ocLazyLoad.inject(moduleName)
            .finally(function finishLazyLoad() {
              $ocLazyLoad.toggleWatch(false);
              resolve();
            });
        }
      }
    });
  }];
}

export function translateDisplayName(translateKey: string): Function {
  return /* @ngInject */ function translate($translate) {
    _.set(this, 'data.displayName', $translate.instant(translateKey));
  };
}

export function stateParamsToResolveParams(stateParams: {[key: string]: any}): {[key: string]: Function} {
  return _.reduce(stateParams, function (result, defaultVal, paramName) {
    result[paramName] = toResolveParam(paramName, defaultVal);
    return result;
  }, {});
}

function toResolveParam(paramName, defaultVal): Function {
  return /* @ngInject */ function ($stateParams: object) {
    return _.get($stateParams, paramName, defaultVal);
  };
}
