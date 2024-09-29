export default {
    introspection: {
        type: 'sdl',
        paths: ['schemas/**/*.graphql'],
    },
    website: {
        template: 'carbon-multi-page',
        output: 'docs/api',
        staticAssets: 'docs/assets',
        options: {
            appTitle: 'Junqo Documentation',
            appLogo: 'https://seeklogo.com/images/G/green-bird-logo-B0C45C520C-seeklogo.com.png',
            siteRoot: '/api',
            siteMeta: {
                description: 'The Junqo Project API Documentation',
                keywords: 'docs,cool,42,api,junqo',
            },
            pages: [{
                title: 'Introduction',
                content: `
                # Welcome to Junqo GraphQL API Documentation
                `
            }],
            externalLinks: [
                {
                    href: 'https://github.com',
                    label: 'Main repository',
                    position: 'header',
                    group: 'Repositories',
                    kind: 'Github',
                },
            ],
        },
    },
}