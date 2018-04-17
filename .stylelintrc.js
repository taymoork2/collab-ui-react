module.exports = {
  plugins: [
    '@atlas/stylelint-atlas-ui',
    'stylelint-scss',
  ],
  extends: 'stylelint-config-recommended',
  rules: {
    // Activate rules from the stylelint-scss plugin
    'scss/selector-no-redundant-nesting-selector': true,
    // Activate rules from the stylelint-atlas-ui plugin
    // 'atlas-ui/use-collab-toolkit-colors': true,
    // 'atlas-ui/use-collab-toolkit-fonts': true,
    // Override rules from stylelint-config-recommended
    'at-rule-no-unknown': [true, {
      ignoreAtRules: [
        'content',
        'extend',
        'include',
        'mixin',
        'while',
      ]
    }],
    'no-descending-specificity': null,
    'selector-type-no-unknown': null,
  },
};
