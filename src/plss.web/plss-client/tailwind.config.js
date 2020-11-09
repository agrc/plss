module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: [
      './src/**/*.js',
      './public/index.html'
  ],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
}
