export default function LazyResource($resource, lazyUrlGenerator, paramDefaults, actions, options) {
  const methods = {};
  let defaultMethods = ['save', 'get', 'query', 'remove', 'delete'];

  if (actions) {
    defaultMethods = defaultMethods.concat(Object.keys(actions));
  }

  defaultMethods.map((action) => {
    methods[action] = (...args) => {
      const url = lazyUrlGenerator();
      return $resource(url, paramDefaults, actions, options)[action](...args);
    };
  });

  return methods;
}
