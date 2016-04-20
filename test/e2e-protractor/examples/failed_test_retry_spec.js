'use strict';

/* global getE2eRunCounter, getE2eRunCounterMax */

// notes:
// - this spec is intentionally excluded
// - to demo the behavior with this spec, remove the 'x' prefix and run:
//   ```
//   export E2E_RUN_COUNTER_MAX=2
//   gulp e2e --specs=$PATH_TO_THIS_FILE
//   ```
xdescribe('Environment var test', function () {
  it('should fail if environment variable E2E_RUN_COUNTER is < E2E_RUN_COUNTER_MAX', function () {
    expect(getE2eRunCounter()).toBe(getE2eRunCounterMax());
  });
});
