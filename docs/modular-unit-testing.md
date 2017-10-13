# Modular Unit Testing

We currently load all application files (`bootstrap.js` and `main.js`) before executing unit tests. This ensures that all modules have been loaded, but requires webpack to bundle the entire application like we are doing a build.

Self-contained angular modules can be unit tested by only loading themselves. They explicitly import/require all dependencies that are necessary. Using modular testing (`KTEST__MODULAR=true`) allows webpack to only bundle what is required, resulting in quicker bundling and faster execution.

### Example

```bash
export KTEST__MODULAR=true
# only loads the spec file and its dependencies
yarn test ./example-feature/example-feature.service.spec.ts
```

#### ./example-feature/index.ts
```ts
import * as ngResource from 'angular-resource';

import { ExampleFeatureService } from './example-feature.service.ts';

export default angular
  .module('example-feature', [
    ngResource, // allows $resource to be available to services in this module
  ])
  .service('ExampleFeatureService', ExampleFeatureService)
  .name;
```

#### ./example-feature/example-feature.service.ts
```ts
export class ExampleFeatureService {
  /* @ngInject */
  constructor(
    public $resource: ng.resource.IResourceService, // injectable because of ngResource module
  ) {}

  public doSomething() {
    return true;
  }
}
```

#### ./example-feature/example-feature.service.spec.ts
```ts
import exampleFeatureModule from './index';

describe('ExampleFeatureService', () => {
  beforeEach(function () {
    this.initModules(exampleFeatureModule); // only loads our 'example-feature' module and its dependencies
    this.injectDependencies(
      'ExampleFeatureService',
    );
  });
  it('should have $resource available', function () {
    expect(this.ExampleFeatureService.$resource).toBeTruthy();
  });
  it('should do something', function () {
    expect(this.ExampleFeatureService.doSomething()).toBe(true);
  });
});
```

### Tips:

#### Cheetsheet of Injected Dependencies -> `require()`-modules

| Dependency | `require()`-module |
| ---------- | ------------------ |
| `$sanitize` | `require('angular-sanitize')` |
| `$state` | `require('angular-ui-router')` |
| `$translate` | `require('angular-translate')` |
