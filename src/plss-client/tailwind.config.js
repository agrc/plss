module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: ['./src/**/*.js', './public/index.html'],
  theme: {
    extend: {
      maxWidth: {
        '2/3': '66%',
      },
    },
  },
  variants: {},
  plugins: [],
};
