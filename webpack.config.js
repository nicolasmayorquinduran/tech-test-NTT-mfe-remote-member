const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');
const { getMfeEnv } = require('../libs/projects/shared/src/lib/core/config/mfe-env.config.js');

const isProduction = process.env.NODE_ENV === 'production';
const mfeEnv = getMfeEnv(isProduction);

const config = withModuleFederationPlugin({

  name: 'mfMembers',

  exposes: {
    './AppModule': './src/app/app-module.ts'
  },

  shared: {
    ...shareAll({ 
      singleton: true, 
      strictVersion: true, 
      requiredVersion: 'auto' 
    }),
    'shared': { 
      singleton: false,
      strictVersion: false,
      requiredVersion: false
    }
  },

});

config.output.publicPath = `${mfeEnv.members.url}/`;

module.exports = config
