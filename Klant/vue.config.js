module.exports = {
    lintOnSave: false,
    devServer: {
        https: true
    },
    chainWebpack: config => {
        /* config.plugins.delete('pwa');
         config.plugins.delete('workbox');
        config.module.rule('pdf')
            .test(/\.pdf$/)
            .use('file-loader').loader('file-loader'),*/
        config.optimization.minimizer('terser').tap((args) => {
            args[0].terserOptions.output = {
                ...args[0].terserOptions.output,
                comments: false  // exclude all comments from output
            }
            return args
            })
    },
    pwa: {
        name: 'Coop Lubbers Online',
        themeColor: '#f58320',
        msTileColor: '#000000',
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'black',
    },
    css: {
        loaderOptions: {
            sass: {
                additionalData: `
                    @import "~@/assets/styles/_variables.scss";
                    @import "~@/assets/styles/default.scss";
                `
            }
        }
    }
}