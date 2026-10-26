module.exports = {
    devServer: {
        allowedHosts: 'all',
        https: true
    },
    chainWebpack: config => {
        /* config.plugins.delete('pwa');
         config.plugins.delete('workbox');*/
        config.module.rule('pdf')
            .test(/\.pdf$/)
            .use('file-loader').loader('file-loader')
    },
    css: {
        loaderOptions: {
            sass: {
                additionalData: `
                    @import "~@/assets/scss/_variables.scss";
                    @import "~@/assets/scss/default.scss";
                `
            }
        }
    },
    parallel: false
}