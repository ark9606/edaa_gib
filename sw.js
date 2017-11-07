/**
 * Created by ARK on 07.11.2017.
 */

'use strict';
importScripts('sw-toolbox.js'); toolbox.precache(["index.html","style/style.css"]); toolbox.router.get('/images/*', toolbox.cacheFirst); toolbox.router.get('/*', toolbox.networkFirst, { networkTimeoutSeconds: 5});
