'use strict';

const Confidence = require('confidence');
const Config = require('./config');
const Meta = require('./meta');


let internals = {
    criteria: {
        env: process.env.NODE_ENV
    }
};

internals.manifest = {
    $meta: 'App manifest document',
    server: {
        connections: {
            router: {
                stripTrailingSlash: true,
                isCaseSensitive: false
            },
            routes: {
                security: true
            }
        }
    },
    connections: [{
        port: Config.get('/port/web'),
        tls: Config.get('/tlsOptions'),
        labels: ['web']
    },{
        port: Config.get('/port/api'),
        tls: Config.get('/tlsOptions'),
        labels: ['api']
    }],
    registrations: [

        //**************************************************************
        //                                                             *
        //                      COMMON PLUGINS                         *
        //                                                             *
        //**************************************************************

        //  App context decorator
        {
            plugin: {
                register: './lib/context',
                options: {
                    meta: Meta.get('/')
                }
            }
        },
        // Email connector 
        {
            plugin: {
                register: './lib/email',
                options: Config.get('/email')
            }
        },
        //  MongoDB connector 
        {
            plugin: {
                register: './lib/mongoose',
                options: Config.get('/mongoose')
            }
        },
        //  Logging connector 
        {
            plugin: {
                register: 'good',
                options: Config.get('/good')
            }
        },

        //**************************************************************
        //                                                             *
        //                      WEB PLUGINS                            *
        //                                                             *
        //**************************************************************
        // Cookie authentication
        {
            plugin: 'hapi-auth-cookie',
            options: {
                select: ['web'] 
            }
        },
        //  Crumb
        {
            plugin: {
                register: 'crumb',
                options: {
                    cookieOptions: {
                        isSecure: false
                    }
                }
            },
            options: {
                select: ['web'] 
            }
        },
        // Static file and directory handlers
        {
            plugin: 'inert',
            options: {
                select: ['web', 'api'] 
            }
        },
        // Templates rendering support 
        {
            plugin: 'vision',
            options: {
                select: ['web', 'api']
            }
        },
        // Swagger support 
        {
            plugin: {
                register: 'hapi-swagger',
                options: {
                    securityDefinitions: {
                        'jwt': {
                            'type': 'apiKey',
                            'name': 'Authorization',
                            'in': 'header'
                        }
                    },
                    security: [{ 'jwt': [] }]
                },
            },
            options: {
                select: ['web', 'api']
            }
        },
        // Views loader 
        {
            plugin: {
                register: 'visionary',
                options: {
                    engines: {
                        hbs: 'handlebars'
                    },
                    path: './app/templates',
                    layoutPath: './app/templates/layouts',
                    helpersPath: './app/templates/helpers',
                    partialsPath: './app/templates/partials',
                    layout: 'default'
                }
            },
            options: {
                select: ['web'] 
            }
        },
        // Flash Plugin
        {
            plugin: {
                register: './lib/flash'
            },
            options: {
                select: ['web'] 
            }
        },
        // Hapi cookie jar
        {
            plugin: {
                register: 'yar',
                options: Config.get('/yarCookie')
            },
            options: {
                select: ['web'] 
            }
        },
        //  Authentication strategy
        {
            plugin: {
                register: './lib/auth',
                options: Config.get('/authCookie')
            },
            options: {
                select: ['web'] 
            }
        },

        //**************************************************************
        //                                                             *
        //                      API PLUGINS                            *
        //                                                             *
        //**************************************************************

        // JWT authentication
        {
            plugin: 'hapi-auth-jwt2',
            options: {
                select: ['api'] 
            }
        },
        //  JWT-Authentication strategy
        {
            plugin: {
                register: './lib/jwtAuth',
                options: Config.get('/jwtAuthOptions')
            },
            options: {
                select: ['api'] 
            }
        },
    
        //**************************************************************
        //                                                             *
        //                      APPLICATION ROUTES                     *
        //                                                             *
        //**************************************************************

        //  Core routes
        {
            plugin: './app/routes/core.js'
        },
        //  Auth routes
        {
            plugin: './app/routes/auth.js',
            options: {
                select: ['web'] 
            }
        },
        //  Dashboard routes
        {
            plugin: './app/routes/dashboard.js',
            options: {
                select: ['web']
            }
        },
        //  Auth routes
        {
            plugin: './app/routes/jwtauth.js',
            options: {
                select: ['api'] 
            }
        },
        // web end routes.
        {
            plugin: './app/routes/web.js',
            options: {
                select: ['web'] //Restrcited availability of this plugin to 'web' server only
            }
        }
    ]
};

internals.store = new Confidence.Store(internals.manifest);

exports.get = function(key) {
    return internals.store.get(key, internals.criteria);
};
exports.meta = function(key) {
    return internals.store.meta(key, internals.criteria);
};
