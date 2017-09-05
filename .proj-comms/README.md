### Notes:

- './announcement' is used in tandem with a githook to broadcast changes to project-wide contributors
- when it is changed and pushed to mainline, contributors will have its contents printed to their console the next time it is pulled or rebased
- please use this mechanism sparingly (e.g. migrating to 'webpack', migrating to 'yarn', upgrading 'node', etc.)

### Other Notes:

- only changes to the file './announcement' are printed (changes to this README.md do nothing)
- formatting does not need to be markdown (contents are simply printed to stdout)
- try to keep line width under 80 chars
