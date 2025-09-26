// Style Dictionary base config for @ara/tokens (Tier-0)
// Inputs : tokens/**/*.json
// Outputs: dist/tokens/*.css (CSS variables, :root), dist/tokens/*.json (merged)
// Transforms: kebab-case names, hex colors, px->rem (size), time→seconds

module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      transforms: ['attribute/cti', 'name/cti/kebab', 'time/seconds', 'size/rem', 'color/hex'],
      buildPath: 'dist/tokens/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables',
          options: { selector: ':root' },
        },
      ],
    },
    json: {
      transformGroup: 'js',
      transforms: ['attribute/cti', 'name/cti/kebab', 'time/seconds', 'size/rem', 'color/hex'],
      buildPath: 'dist/tokens/',
      files: [{ destination: 'tokens.json', format: 'json/nested' }],
    },
  },
};
