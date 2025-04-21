module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    darkMode: false, // or 'media' or 'class'
    prefix: 'tw-',
    theme: {
      extend: {
        backgroundImage: {
          'custom-gradient':
            'linear-gradient(94.67deg, #8019B0 0%, #EE593C 100%)',
          'primary-gradient': '#EE593C',
        },
        colors: {
          primary: '#EE593C',
          darks: '#191A15',
          black: '#121212',
          secondary: '#475467',
          'custom-green': '#087443',
        },
        boxShadow: {
          custom:
            '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
        },
      },
    },
    variants: {
      extend: {},
    },
    plugins: [],
  };
