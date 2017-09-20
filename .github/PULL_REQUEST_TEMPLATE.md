**Pre-Creation Checklist**
- [ ] All pre-PR checks have been run and they're passing:
  - The code is linted (running `yarn lint` produces no errors or warnings).  Appending `--fix` to the specific command (eg. `eslint`, `tslint`, `stylelint`) fixes most problems
  - The code passes unit tests (`yarn test`)
  - The code passes e2e tests (`yarn start` in one terminal and `yarn e2e` in another)
  - Modifications to the project configuration files (e.g. `package.json`) were only [changed through Yarn](https://yarnpkg.com/en/docs/usage).
- [ ] All git commits are tidy and formatted properly:
  - The code was committed using [Commitizen](https://sqbu-github.cisco.com/WebExSquared/wx2-admin-web-client/wiki/How-to-commit-changes), or the commit messages are identical to those produced by Commitizen
  - Extraneous commits were [squashed](https://sqbu-github.cisco.com/WebExSquared/wx2-admin-web-client/wiki/How-to-_squash_-commits) from the log via `git rebase -i` (or equivalent)
- [ ] All changes are covered by automated tests (if applicable):
  - Unit tests:
    - The positive or 'happy' path is covered. Examples of unit tests can be found [here](https://sqbu-github.cisco.com/WebExSquared/wx2-admin-web-client/tree/master/examples/unit)
    - Negative or 'sad' paths are covered (typically there are multiple sad-paths)
  - E2E tests have been updated (if applicable)

**Provide information that will benefit those doing this review:** _(The actual description of the code changes, including new features or relevant links, should be in the code-commit-messages under the 'long description' section, so that we retain an accurate record of the work in the codebase, not the PRs)_



**Applicable screenshots:**


