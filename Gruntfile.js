﻿"use strict";

module.exports = function (grunt) {
    // Load grunt tasks automatically
    require("jit-grunt")(grunt, {
        nugetpack: "grunt-nuget",
        nugetpush: "grunt-nuget",
        buildcontrol: "grunt-build-control"
    });
    require("time-grunt")(grunt); // Time how long tasks take. Can help when optimizing build times
    
    var pkg = require("./package.json");
    
    grunt.initConfig({
        pkg: pkg,
        // Configurable paths
        paths: {
            bin: "bin",
            lib: "lib",
            tmpl: "template",
            build: "build",
            dist: "dist",
            all: "{<%= paths.bin %>,<%= paths.lib %>,<%= paths.tmpl %>}",
            defs: "typings/_definitions.d.ts",
            temp: "temp"
        },
        
        ts: {
            options: {
                target: "es5",
                module: "commonjs",
                sourceMap: true,
                declaration: false,
                removeComments: false
            },
            src: {
                src: ["<%= paths.defs %>", "<%= paths.all %>/**/*.ts", "./*.ts"]
            },
            dist: {
                src: ["<%= ts.src.src %>"],
                options: {
                    sourceMap: false
                }
            }
        },
        
        jsdoc : {
            typescript : {
                src: ["node_modules/typescript/lib/typescriptServices.d.ts"],
                dest: "<%= paths.dist %>/typescript",
                options: { configure: "<%= paths.build %>/conf.typescript.json" }
            },
            lib : {
                src: ["node_modules/typescript/lib/lib.d.ts"],
                dest: "<%= paths.dist %>/lib",
                options: { configure: "<%= paths.build %>/conf.lib.json" }
            },
            node : {
                src: ["node_modules/@types/node/node.d.ts"],
                dest: "<%= paths.dist %>/node",
                options: { configure: "<%= paths.build %>/conf.node.json" }
            }
        },
        
        copy: {
            site: {
                expand: true,
                cwd: "<%= paths.build %>/site",
                src: ["*/*.*", "CNAME"],
                dest: "<%= paths.dist %>"
            }
        },
        
        markdown: {
            site: {
                options: {
                    template: "<%= paths.build %>/site/index.html"
                },

                src: "README.md",
                dest: "<%= paths.dist %>/index.html"
            }
        },

        "gh-pages": {
            options: {
                base: "<%= paths.dist %>",
                message: "Update documentation for version <%= pkg.version %>"
            },
            src: ["**"]
        },

        tslint: {
            options: {
                configuration: grunt.file.readJSON("tslint.json")
            },
            src: {
                src: ["<%= paths.all %>/**/*.ts", "./*.ts"]
            }
        },
        
        clean: {
            src: [
                "<%= paths.all %>/**/*.{d.ts,js,js.map}", 
                "./*.{d.ts,js,js.map}", 
                "!<%= paths.tmpl %>/static/**",
                "!./Gruntfile.js",
            ],
            dist: "<%= paths.dist %>",
            temp: "<%= paths.temp %>"
        },
        
        connect: {
            options: {
                port: "8080",
                livereload: 56765
            },
            dist: {
                options: {
                    base: "<%= paths.dist %>"
                }
            }
        },
        
        watch: {
            tslint: { files: ["<%= tslint.src.src %>"], tasks: ["tslint:src"] },
            typescript: { files: ["<%= typescript.src.src %>"], tasks: ["typescript:src"] },
            gruntfile: { files: ["Gruntfile.js"] },
            
            livereload: {
                options: {
                    livereload: "<%= connect.options.livereload %>"
                },
                files: ["<%= paths.dist %>/**/*.{js,html,css}"]
            }
        }

    });
    
    grunt.registerTask("dev", ["tslint:src", "clean:src", "ts:src"]);
    grunt.registerTask("build", ["tslint:src", "clean:src", "ts:dist"]);

    grunt.registerTask("doc", ["clean:dist", "jsdoc:typescript", "jsdoc:node"]);
    grunt.registerTask("site", ["copy:site", "markdown:site"]);
    
    grunt.registerTask("serve", ["dev", "doc", "site", "connect:dist", "watch"]);
    grunt.registerTask("publish", ["build", "doc", "site", "gh-pages"]);
    
    grunt.registerTask("default", ["build"]);
};