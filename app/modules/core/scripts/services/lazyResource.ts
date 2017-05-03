export default function LazyResource($resource, lazyUrlGenerator, paramDefaults, actions, options) {
  let methods = {};
  let defaultMethods = ['save', 'get', 'query', 'remove', 'delete'];

  if (actions) {
    defaultMethods = defaultMethods.concat(Object.keys(actions));
  }

  defaultMethods.map((action) => {
    methods[action] = (...args) => {
      let url = lazyUrlGenerator();
      return $resource(url, paramDefaults, actions, options)[action](...args);
    };
  });

  return methods;
}
