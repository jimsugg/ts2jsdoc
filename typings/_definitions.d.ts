/// <reference path="jsdoc/jsdoc.d.ts" />

declare module JSDoc {
    export interface Doclet {
        isConstructor?: boolean;
        isCallSignature?: boolean;
        isCtorSignature?: boolean;
        generic?: string;
    }
}
