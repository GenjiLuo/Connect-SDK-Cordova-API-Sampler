
// ../source/boot/enyo.js
(function() {
    var e = "enyo.js";
    enyo = window.enyo || {
        options: {}
    }, enyo.locateScript = function(e) {
        for (var t, o, n = document.getElementsByTagName("script"), a = n.length - 1, r = e.length; a >= 0 && (t = n[a]); a--) if (!t.located && (o = t.getAttribute("src") || "", 
        o.slice(-r) == e)) return t.located = !0, {
            path: o.slice(0, Math.max(0, o.lastIndexOf("/"))),
            node: t
        };
    }, enyo.args = enyo.args || {};
    var t = enyo.locateScript(e);
    if (t) {
        enyo.args.root = (enyo.args.root || t.path).replace("/source", "");
        for (var o, n = 0, a = t.node.attributes.length; a > n && (o = t.node.attributes.item(n)); n++) enyo.args[o.nodeName] = o.value;
    }
})();

// ../source/boot/version.js
enyo.version = {
    enyo: "2.4.0-pre.1"
};

// ../source/boot/ready.js
(function(e, t) {
    var n, a, o, r, d, i = e.document, c = [], s = "complete" === i.readyState, y = !1;
    t.ready = function(e, n) {
        c.push([ e, n ]), s && !y && (t.asyncMethod(window, d), y = !0);
    }, n = function(e, n) {
        e.call(n || t.global);
    }, a = function(e) {
        (s = "interactive" === i.readyState) && (~t.indexOf(e.type, [ "DOMContentLoaded", "readystatechange" ]) || (o(e.type, a), 
        d())), (s = "complete" === i.readyState || "loaded" === i.readyState) && (o(e.type, a), 
        d());
    }, r = function(e, t) {
        var n = i.addEventListener ? "addEventListener" : "attachEvent", a = "attachEvent" === n ? "on" : "";
        i[n](a + e, t, !1);
    }, o = function(e, t) {
        var n = i.addEventListener ? "removeEventListener" : "detachEvent", a = "detachEvent" === n ? "on" : "";
        i[n](a + e, t, !1);
    }, d = function() {
        if (s && c.length) for (;c.length; ) n.apply(e, c.shift());
        y = !1;
    }, r("DOMContentLoaded", a), r("readystatechange", a);
})(window, enyo);

// ../source/boot/rendered.js
(function(e) {
    var t = [], n = function(n) {
        for (var o, a = 0; o = t[a]; a++) o[0].apply(o[1] || e.global, [ n ]);
    };
    e.rendered = function(e, n) {
        t.push([ e, n ]);
    }, e.addToRoots = function(t) {
        e.exists(e.roots) ? e.roots.push(t) : e.roots = [ t ];
        var o = t.rendered;
        t.rendered = function() {
            o.apply(t, []), n(t);
        }, t._isRoot = !0;
    };
})(enyo);

// ../loader.js
(function() {
    enyo = window.enyo || {
        options: {}
    }, enyo.pathResolverFactory = function() {
        this.paths = {}, this.pathNames = [];
    }, enyo.pathResolverFactory.prototype = {
        addPath: function(e, t) {
            return this.paths[e] = t, this.pathNames.push(e), this.pathNames.sort(function(e, t) {
                return t.length - e.length;
            }), t;
        },
        addPaths: function(e) {
            if (e) for (var t in e) this.addPath(t, e[t]);
        },
        includeTrailingSlash: function(e) {
            return e && "/" !== e.slice(-1) ? e + "/" : e;
        },
        rewrite: function(e) {
            var t, a = this.includeTrailingSlash, i = this.paths, n = function(e, n) {
                return t = !0, a(i[n]) || "";
            }, o = e;
            do {
                t = !1;
                for (var s = 0; this.pathNames.length > s; s++) {
                    var r = RegExp("\\$(" + this.pathNames[s] + ")(\\/)?", "g");
                    o = o.replace(r, n);
                }
            } while (t);
            return o;
        }
    }, enyo.path = new enyo.pathResolverFactory(), enyo.loaderFactory = function(e, t) {
        this.machine = e, this.packages = [], this.modules = [], this.sheets = [], this.designs = [], 
        this.stack = [], this.pathResolver = t || enyo.path, this.packageName = "", this.packageFolder = "", 
        this.finishCallbacks = {};
    }, enyo.loaderFactory.prototype = {
        verbose: !1,
        loadScript: function(e, t, a) {
            this.machine.script(e, t, a);
        },
        loadSheet: function(e) {
            this.machine.sheet(e);
        },
        loadPackage: function(e) {
            this.machine.script(e);
        },
        report: function() {},
        load: function() {
            this.more({
                index: 0,
                depends: arguments || []
            });
        },
        more: function(e) {
            if (!e || !this.continueBlock(e)) {
                var t = this.stack.pop();
                t ? (enyo.runtimeLoading && e.failed && (t.failed = t.failed || [], t.failed.push.apply(t.failed, e.failed)), 
                this.verbose && window.console.groupEnd("* finish package (" + (t.packageName || "anon") + ")"), 
                this.packageFolder = t.folder, this.packageName = "", this.more(t)) : this.finish(e);
            }
        },
        finish: function(e) {
            this.packageFolder = "", this.verbose && window.console.log("-------------- fini");
            for (var t in this.finishCallbacks) if (this.finishCallbacks[t]) {
                var a = this.finishCallbacks[t];
                this.finishCallbacks[t] = null, a(e);
            }
        },
        continueBlock: function(e) {
            for (;e.index < e.depends.length; ) {
                var t = e.depends[e.index++];
                if (t) if ("string" == typeof t) {
                    if (this.require(t, e)) return !0;
                } else this.pathResolver.addPaths(t);
            }
        },
        require: function(e, t) {
            var a = this.pathResolver.rewrite(e), i = this.getPathPrefix(e);
            if (a = i + a, ".css" == a.slice(-4).toLowerCase() || ".less" == a.slice(-5).toLowerCase()) this.verbose && window.console.log("+ stylesheet: [" + i + "][" + e + "]"), 
            this.requireStylesheet(a); else {
                if (".js" == a.slice(-3).toLowerCase() && "package.js" != a.slice(-10).toLowerCase()) return this.verbose && window.console.log("+ module: [" + i + "][" + e + "]"), 
                this.requireScript(e, a, t);
                if (".design" != a.slice(-7).toLowerCase()) return this.requirePackage(a, t), !0;
                this.verbose && window.console.log("+ design metadata: [" + i + "][" + e + "]"), 
                this.requireDesign(a);
            }
        },
        getPathPrefix: function(e) {
            var t = e.slice(0, 1);
            return "/" == t || "\\" == t || "$" == t || /^https?:/i.test(e) ? "" : this.packageFolder;
        },
        requireStylesheet: function(e) {
            this.sheets.push(e), this.loadSheet(e);
        },
        requireScript: function(e, t, a) {
            if (this.modules.push({
                packageName: this.packageName,
                rawPath: e,
                path: t
            }), enyo.runtimeLoading) {
                var i = this, n = function() {
                    i.more(a);
                }, o = function() {
                    a.failed = a.failed || [], a.failed.push(t), i.more(a);
                };
                this.loadScript(t, n, o);
            } else this.loadScript(t);
            return enyo.runtimeLoading;
        },
        requireDesign: function(e) {
            this.designs.push({
                packageName: this.packageName,
                path: e
            });
        },
        decodePackagePath: function(e) {
            var t = "", a = "package.js", i = e.replace(/\\/g, "/").replace(/\/\//g, "/").replace(/:\//, "://").split("/");
            if (i.length) {
                var n = i.pop() || i.pop() || "";
                n.slice(-a.length) !== a ? i.push(n) : a = n, t = i.join("/"), t = t ? t + "/" : "", 
                a = t + a;
            }
            return {
                folder: t,
                manifest: a
            };
        },
        aliasPackage: function(e) {
            var t = this.decodePackagePath(e);
            this.manifest = t.manifest;
        },
        requirePackage: function(e, t) {
            t.folder = this.packageFolder;
            var a = this.decodePackagePath(e);
            this.manifest = a.manifest, this.packageFolder = a.folder, t.packageName = this.packageName, 
            this.stack.push(t), this.report("loading package", this.packageName), this.verbose && window.console.group("* start package [" + this.packageName + "]"), 
            this.loadPackage(this.manifest);
        }
    };
})();

// ../source/boot/boot.js
enyo.machine = {
    sheet: function(e) {
        var t = "text/css", a = "stylesheet", n = ".less" == e.slice(-5);
        n && (window.less ? (t = "text/less", a = "stylesheet/less") : e = e.slice(0, e.length - 4) + "css");
        var i;
        enyo.runtimeLoading || n ? (i = document.createElement("link"), i.href = e, i.media = "screen", 
        i.rel = a, i.type = t, document.getElementsByTagName("head")[0].appendChild(i)) : document.write('<link href="' + e + '" media="screen" rel="' + a + '" type="' + t + '" />'), 
        n && window.less && (window.less.sheets.push(i), enyo.loader.finishCallbacks.lessRefresh || (enyo.loader.finishCallbacks.lessRefresh = function() {
            window.less.refresh(!0);
        }));
    },
    script: function(e, t, a) {
        if (enyo.runtimeLoading) {
            var n = document.createElement("script");
            n.src = e, n.onload = t, n.onerror = a, n.charset = "utf-8", document.getElementsByTagName("head")[0].appendChild(n);
        } else document.write('<script src="' + e + '"' + (t ? ' onload="' + t + '"' : "") + (a ? ' onerror="' + a + '"' : "") + "></scri" + "pt>");
    },
    inject: function(e) {
        document.write('<script type="text/javascript">' + e + "</scri" + "pt>");
    }
}, enyo.loader = new enyo.loaderFactory(enyo.machine), enyo.depends = function() {
    var e = enyo.loader;
    if (!e.packageFolder) {
        var t = enyo.locateScript("package.js");
        t && t.path && (e.aliasPackage(t.path), e.packageFolder = t.path + "/");
    }
    e.load.apply(e, arguments);
}, function() {
    function e(n) {
        if (n && n(), a.length) {
            var i = a.shift(), o = i[0], s = t.isArray(o) ? o : [ o ], r = i[1];
            t.loader.finishCallbacks.runtimeLoader = function(t) {
                e(function() {
                    r && r(t);
                });
            }, t.loader.packageFolder = "./", t.depends.apply(this, s);
        } else t.runtimeLoading = !1, t.loader.packageFolder = "";
    }
    var t = window.enyo, a = [], n = !1;
    t.ready(function() {
        n = !0;
    }), t.load = function(i) {
        if (n) a.push(arguments), t.runtimeLoading || (t.runtimeLoading = !0, e()); else if (t.isArray(i)) for (var o = 0; i.length > o; ++o) t.loader.require(i[o]); else t.loader.require(i);
    };
}(), enyo.path.addPaths({
    enyo: enyo.args.root,
    lib: "$enyo/../lib"
});

// ../source/kernel/log.js
enyo.logging = {
    level: 99,
    levels: {
        log: 20,
        warn: 10,
        error: 0
    },
    shouldLog: function(e) {
        var t = parseInt(this.levels[e], 0);
        return this.level >= t;
    },
    _log: function(e, t) {
        var n = window.console;
        if (void 0 !== n) {
            var a = enyo.isArray(t) ? t : enyo.cloneArray(t);
            enyo.dumbConsole && (a = [ a.join(" ") ]);
            var o = n[e];
            o && o.apply ? o.apply(n, a) : n.log.apply ? n.log.apply(n, a) : n.log(a.join(" "));
        }
    },
    log: function(e, t) {
        var n = window.console;
        n !== void 0 && this.shouldLog(e) && this._log(e, t);
    }
}, enyo.setLogLevel = function(e) {
    var t = parseInt(e, 0);
    isFinite(t) && (enyo.logging.level = t);
}, enyo.log = function() {
    enyo.logging.log("log", arguments);
}, enyo.warn = function() {
    enyo.logging.log("warn", arguments);
}, enyo.error = function() {
    enyo.logging.log("error", arguments);
};

// ../source/kernel/lang.js
(function() {
    enyo.global = this;
    var e = 0;
    enyo.exists = function(e) {
        return void 0 !== e;
    };
    var n = enyo.exists;
    enyo.lastIndexOf = function(e, n, t) {
        if (n.lastIndexOf) return n.lastIndexOf(e, t || n.length);
        var o, r = "string" == typeof n, i = (r ? n.split("") : n).reverse(), a = i.length - 1, s = n.length;
        return r && (i = i.join("")), o = enyo.indexOf(e, i, s - (t || s)), r || i.reverse(), 
        -1 === o ? o : a - o;
    };
    var t = enyo.lastIndexOf, o = function(e) {
        return e && "function" == typeof e && (e._FinalCtor || e._finishKindCreation);
    };
    enyo.getPath = function(e) {
        if (void 0 === e || null === e) return e;
        var n = this === enyo ? enyo.global : this, t = "." == e[0] ? e.replace(/^\.+/, "") : e;
        if (!t) return n;
        for (var o, r, i, a = t.split("."), s = a.pop(), c = 0; (i = a[c]) && (n && (n._isObject ? n = n._getters && (r = n._getters[i]) ? n[r]() : n.computed && n.get && null != n.computed[i] ? n[i]() : n[i] : ("function" == typeof n && (n = enyo.checkConstructor(n)), 
        n = n[i])), n); ++c) ;
        return c == a.length ? (o = n[s], "function" == typeof o && enyo.checkConstructor(o) || o) : void 0;
    }, enyo.getPath.fast = function(e) {
        var n, t, o = this;
        return t = o._getters && (n = o._getters[e]) ? o[n]() : o.get && o.computed && null != o.computed[e] ? o[e]() : o[e], 
        "function" == typeof t && enyo.checkConstructor(t) || t;
    }, enyo.setPath = function(e, n, t) {
        var r = this === enyo ? enyo.global : this, i = r;
        if (!e) return r;
        var a = "." == e[0] ? e.replace(/^\.+/, "") : e;
        if (!a) return r;
        for (var s, c, u, l, f = a.split("."), y = f.pop(), h = 0; l = f[h]; ++h) ("enyo" != l || enyo !== r) && ((s = r[l]) ? "object" == typeof s ? r = s : "function" == typeof s && (r = r._isObject && r.computed && null != r.computed[l] ? r.get(l) : o(s) ? enyo.checkConstructor(s) : s) : r = r[l] = {});
        return c = r && r._isObject && r._getters && (u = r._getters[y]) ? r[u]() : r[y], 
        r[y] = n, (r.notifyObservers && c !== n || t) && r.notifyObservers(y, c, n), i;
    }, enyo.setPath.fast = function(e, n) {
        var t, o, r = this;
        return r.computed && null != r.computed[e] ? r : (t = r._getters && (o = r._getters[e]) ? r[o]() : r[e], 
        r[e] = n, t !== n && r.notifyObservers(e, t, n), r);
    }, enyo.uid = function(n) {
        return (n ? n : "") + e++ + "";
    }, enyo.irand = function(e) {
        return Math.floor(Math.random() * e);
    }, enyo.toUpperCase = function(e) {
        return e.toUpperCase();
    }, enyo.toLowerCase = function(e) {
        return e.toLowerCase();
    }, enyo.cap = function(e) {
        return e.slice(0, 1).toUpperCase() + e.slice(1);
    }, enyo.uncap = function(e) {
        return e.slice(0, 1).toLowerCase() + e.slice(1);
    }, enyo.format = function(e) {
        var n = /\%./g, t = 0, o = e, r = arguments, i = function() {
            return r[++t];
        };
        return o.replace(n, i);
    };
    var r = Object.prototype.toString;
    enyo.isString = function(e) {
        return "[object String]" === r.call(e);
    }, enyo.isFunction = function(e) {
        return "[object Function]" === r.call(e);
    }, enyo.isArray = Array.isArray || function(e) {
        return "[object Array]" === r.call(e);
    }, enyo.isObject = Object.isObject || function(e) {
        return null != e && "[object Object]" === r.call(e);
    }, enyo.isTrue = function(e) {
        return !("false" === e || e === !1 || 0 === e || null === e || void 0 === e);
    }, enyo.find = function(e, n, t) {
        var o, r, i, a = enyo.isArray(e) && e, s = t || enyo.global, c = n, u = 0;
        if (a && c && enyo.isFunction(c)) for (r = enyo.clone(a), o = a.length; o > u; ++u) if (i = c.call(s, a[u], u, r)) return u;
        return !1;
    }, enyo.indexOf = function(e, n, t) {
        if (n.indexOf) return n.indexOf(e, t);
        if (t && (0 > t && (t = 0), t > n.length)) return -1;
        for (var o, r = t || 0, i = n.length; (o = n[r]) || i > r; r++) if (o == e) return r;
        return -1;
    }, enyo.remove = function(e, n) {
        var t = enyo.indexOf(e, n);
        t >= 0 && n.splice(t, 1);
    }, enyo.forEach = function(e, n, t) {
        if (e) {
            var o = t || this;
            if (enyo.isArray(e) && e.forEach) e.forEach(n, o); else for (var r = Object(e), i = r.length >>> 0, a = 0; i > a; a++) a in r && n.call(o, r[a], a, r);
        }
    }, enyo.map = function(e, n, t) {
        var o = t || this;
        if (enyo.isArray(e) && e.map) return e.map(n, o);
        var r = [], i = function(e, t, i) {
            r.push(n.call(o, e, t, i));
        };
        return enyo.forEach(e, i, o), r;
    }, enyo.merge = function() {
        for (var e, n = Array.prototype.concat.apply([], arguments), t = [], o = 0; e = n[o]; ++o) ~enyo.indexOf(e, t) || t.push(e);
        return t;
    };
    var i = enyo.merge;
    enyo.values = function(e) {
        if (e) {
            var n = [];
            for (var t in e) e.hasOwnProperty(t) && n.push(e[t]);
            return n;
        }
    }, enyo.union = function() {
        for (var e, n = Array.prototype.concat.apply([], arguments), o = [], r = [], i = 0, a = n.length; a > i; ++i) e = n[i], 
        ~enyo.indexOf(e, o) || (o.push(e), i === t(e, n) && r.push(e));
        return r;
    };
    var a = enyo.union;
    enyo.unique = a;
    var s = enyo.unique;
    enyo.reduce = i, enyo.only = function(e, t, o) {
        var r, i, a = {}, c = 0;
        if (!(n(e) && e instanceof Array)) return a;
        if (!n(t) || "object" != typeof t) return a;
        for (e = s(e), r = e.length; r > c; ++c) if (i = e[c], i in t) {
            if (!0 === o && !t[i]) continue;
            a[i] = t[i];
        }
        return a;
    }, enyo.remap = function(e, n, t) {
        var o, r, i = t ? enyo.clone(n) : {};
        for (o in e) r = e[o], o in n && (i[r] = n.get ? n.get(o) : n[o]);
        return i;
    }, enyo.except = function(e, t) {
        var o, r, i, s = {}, u = 0;
        if (!(n(e) && e instanceof Array)) return s;
        if (!n(t) || "object" != typeof t) return s;
        for (o = a(e, c(t)), r = o.length; r > u; ++u) i = o[u], i in t && (s[i] = t[i]);
        return s;
    }, enyo.indexBy = function(e, t, o) {
        var r, i, a = {}, s = 0;
        if (!(n(t) && t instanceof Array)) return a;
        if (!n(e) || "string" != typeof e) return a;
        var c = enyo.clone(t);
        for (o = n(o) && "function" == typeof o ? o : void 0, i = t.length; i > s; ++s) r = t[s], 
        n(r) && n(r[e]) && (o ? o(e, r, a, c) : a[r[e]] = r);
        return a;
    }, enyo.pluck = function(e, t) {
        var o, r = [], i = 0;
        if (!n(e) || !n(t)) return r;
        if (!(t instanceof Array)) return r;
        if ("string" != typeof e) return r;
        for (o = t.length; o > i; ++i) n(t[i]) && n(t[i][e]) && r.push(t[i][e]);
        return r;
    }, enyo.filter = function(e, n, t) {
        var o = t || this;
        if (enyo.isArray(e) && e.filter) return e.filter(n, o);
        var r = [], i = function(e, t, i) {
            var a = e;
            n.call(o, e, t, i) && r.push(a);
        };
        return enyo.forEach(e, i, o), r;
    }, enyo.keys = Object.keys || function(e) {
        var n = [], t = Object.prototype.hasOwnProperty;
        for (var o in e) t.call(e, o) && n.push(o);
        if (!{
            toString: null
        }.propertyIsEnumerable("toString")) for (var r, i = [ "toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor" ], a = 0; r = i[a]; a++) t.call(e, r) && n.push(r);
        return n;
    };
    var c = enyo.keys;
    enyo.cloneArray = function(e, n, t) {
        for (var o = t || [], r = n || 0, i = e.length; i > r; r++) o.push(e[r]);
        return o;
    }, enyo.toArray = enyo.cloneArray, enyo.clone = function(e) {
        return enyo.isArray(e) ? enyo.cloneArray(e) : enyo.mixin({}, e);
    };
    var u = {};
    enyo.mixin = function(e, n, t) {
        var o, r, i, a, s, c;
        if (enyo.isArray(e) ? (o = {}, r = e, n && enyo.isObject(n) && (i = n)) : (o = e || {}, 
        r = n, i = t), enyo.isObject(i) || (i = {}), !0 === t && (i.ignore = !0, i.exists = !0), 
        enyo.isArray(r)) for (a = 0; c = r[a]; ++a) enyo.mixin(o, c, i); else for (s in r) c = r[s], 
        u[s] !== c && (i.exists && !c || i.ignore && o[s] || (i.filter && enyo.isFunction(i.filter) ? !i.filter(s, c, r, o, i) : 0) || (o[s] = c));
        return o;
    }, enyo.bind = function(e, n) {
        if (n || (n = e, e = null), e = e || enyo.global, enyo.isString(n)) {
            if (!e[n]) throw 'enyo.bind: scope["' + n + '"] is null (scope="' + e + '")';
            n = e[n];
        }
        if (enyo.isFunction(n)) {
            var t = enyo.cloneArray(arguments, 2);
            return n.bind ? n.bind.apply(n, [ e ].concat(t)) : function() {
                var o = enyo.cloneArray(arguments);
                return n.apply(e, t.concat(o));
            };
        }
        throw 'enyo.bind: scope["' + n + '"] is not a function (scope="' + e + '")';
    }, enyo.bindSafely = function(e, n) {
        if (enyo.isString(n)) {
            if (!e[n]) throw 'enyo.bindSafely: scope["' + n + '"] is null (this="' + this + '")';
            n = e[n];
        }
        if (enyo.isFunction(n)) {
            var t = enyo.cloneArray(arguments, 2);
            return function() {
                if (!e.destroyed) {
                    var o = enyo.cloneArray(arguments);
                    return n.apply(e, t.concat(o));
                }
            };
        }
        throw 'enyo.bindSafely: scope["' + n + '"] is not a function (this="' + this + '")';
    }, enyo.asyncMethod = function(e, n) {
        return n ? setTimeout(enyo.bind.apply(enyo, arguments), 1) : setTimeout(e, 1);
    }, enyo.call = function(e, n, t) {
        var o = e || this;
        if (n) {
            var r = o[n] || n;
            if (r && r.apply) return r.apply(o, t || []);
        }
    }, enyo.now = Date.now || function() {
        return new Date().getTime();
    }, enyo.perfNow = function() {
        var e = window.performance || {};
        return e.now = e.now || e.mozNow || e.msNow || e.oNow || e.webkitNow || enyo.now, 
        function() {
            return e.now();
        };
    }(), enyo.nop = function() {}, enyo.nob = {}, enyo.nar = [], enyo.instance = function() {}, 
    enyo.setPrototype || (enyo.setPrototype = function(e, n) {
        e.prototype = n;
    }), enyo.delegate = function(e) {
        return enyo.setPrototype(enyo.instance, e), new enyo.instance();
    }, enyo.trim = function(e) {
        return e && e.replace ? e.replace(/^\s+|\s+$/g, "") : e;
    }, String.prototype.trim && (enyo.trim = function(e) {
        return e && e.trim ? e.trim() : e;
    }), enyo.uuid = function() {
        var e, n = Math.random().toString(16).substr(2, 8) + "-" + (e = Math.random().toString(16).substr(2, 8)).substr(0, 4) + "-" + e.substr(4, 4) + (e = Math.random().toString(16).substr(2, 8)).substr(0, 4) + "-" + e.substr(4, 4) + Math.random().toString(16).substr(2, 8);
        return n;
    };
})();

// ../source/kernel/dev.js
(function() {
    "use strict";
    function e(e) {
        enyo.mixin(this, e), n[this.name] = this, !0 !== this.average || t[this.name] || (t[this.name] = []), 
        t[this.name] && !1 !== this.average && (this._averaging = !0), !0 === this.autoStart && this.start();
    }
    enyo.bench = enyo.perfNow;
    var n = {}, t = {}, o = "- - - - - - - - - - - - - - - - -\nBENCHMARK REPORT (%.): %.\nTOTAL TIME (ms): %.\nAVERAGE TIME (ms): %.\nMINIMUM TIME (ms): %.\nMAXIMUM TIME (ms): %.\nNUMBER OF ENTRIES: %.\n- - - - - - - - - - - - - - - - -\n", r = function(e) {
        var n = 0, t = 1/0, o = -1/0, r = e.length, i = {
            total: null,
            average: null,
            number: r,
            min: null,
            max: null
        };
        return enyo.forEach(e, function(e) {
            n += e, t = Math.min(e, t), o = Math.max(e, o);
        }), i.total = n, i.min = t, i.max = o, i.average = Math.abs(n / (r || 1)), i;
    };
    enyo.dev = {
        enabled: !0,
        bench: function(n) {
            if (!0 !== this.enabled) return !1;
            var t = n || {
                name: enyo.uid("bench")
            };
            return new e(t);
        },
        report: function(e) {
            var i = t[e] || n[e];
            if (!i) return !1;
            if (i.report && "function" == typeof i.report) return i.report();
            var a = r(i);
            enyo.log(enyo.format(o, "averages", e, a.total, a.average, a.min, a.max, a.number));
        },
        clear: function(e) {
            var o = n[e] ? n : t[e] ? t : null;
            return o ? (o.complete && o.complete(), o[e] instanceof Array ? o[e] = [] : delete o[e], 
            !0) : !1;
        }
    }, e.prototype = {
        logging: !0,
        autoStart: !0,
        _started: !1,
        _averaging: !1,
        _begin: null,
        _end: null,
        _time: null,
        start: function() {
            return !0 === this._started ? !1 : (this._log("starting benchmark"), this._begin = enyo.bench(), 
            this._started = !0, !0);
        },
        stop: function() {
            return this._started ? (this._end = enyo.bench(), this._time = this._end - this._begin, 
            this._log("benchmark complete: " + this._time), !0 === this._averaging && t[this.name].push(this._time), 
            this._started = !1, !0) : !1;
        },
        _log: function(e) {
            return this.logging ? (enyo.log("bench (" + this.name + "): " + e), void 0) : !1;
        }
    };
})();

// ../source/kernel/job.js
enyo.job = function(e, n, t) {
    enyo.job.stop(e), enyo.job._jobs[e] = setTimeout(function() {
        enyo.job.stop(e), n();
    }, t);
}, enyo.job.stop = function(e) {
    enyo.job._jobs[e] && (clearTimeout(enyo.job._jobs[e]), delete enyo.job._jobs[e]);
}, enyo.job.throttle = function(e, n, t) {
    enyo.job._jobs[e] || (n(), enyo.job._jobs[e] = setTimeout(function() {
        enyo.job.stop(e);
    }, t));
}, enyo.job._jobs = {};

// ../source/kernel/Oop.js
enyo.kind = function(e) {
    var n = e.name || "";
    if (enyo.options.noDefer || !n || e.noDefer) return enyo.kind.finish(e);
    var t = function() {
        var e;
        if (t._FinalCtor) e = t._FinalCtor; else {
            if (!(this instanceof t)) throw "enyo.kind: constructor called directly, not using 'new'";
            e = t._finishKindCreation();
        }
        var n = enyo.delegate(e.prototype), o = e.apply(n, arguments);
        return o ? o : n;
    };
    return t._finishKindCreation = function() {
        t._finishKindCreation = void 0, enyo.setPath(n, void 0);
        var o = enyo.kind.finish(e);
        return t._FinalCtor = o, e = null, o;
    }, e.statics && enyo.mixin(t, e.statics), t.extend = enyo.kind.statics.extend, t._deferred = !0, 
    n && !enyo.getPath(n) || enyo.kind.allowOverride ? enyo.setPath(n, t) : n && enyo.error("enyo.kind: " + n + " is already in use by another " + "kind, all kind definitions must have unique names."), 
    t;
}, enyo.kind.finish = function(e) {
    enyo._kindCtors = {};
    var n = e.name || "";
    delete e.name;
    var t = "kind" in e, o = e.kind;
    delete e.kind;
    var r = enyo.constructorForKind(o), i = r && r.prototype || null;
    if (t && void 0 === o || void 0 === r) {
        var a = void 0 === o ? "undefined kind" : "unknown kind (" + o + ")";
        throw "enyo.kind: Attempt to subclass an " + a + ". Check dependencies for [" + (n || "<unnamed>") + "].";
    }
    var s = enyo.kind.makeCtor();
    return e.hasOwnProperty("constructor") && (e._constructor = e.constructor, delete e.constructor), 
    enyo.setPrototype(s, i ? enyo.delegate(i) : {}), enyo.concatHandler(s, e), enyo.mixin(s.prototype, e), 
    s.prototype.kindName = n ? n : r && r.prototype ? r.prototype.kindName : "", s.prototype.base = r, 
    s.prototype.ctor = s, enyo.forEach(enyo.kind.features, function(n) {
        n(s, e);
    }), n && !enyo.getPath(n) || enyo.kind.allowOverride ? enyo.setPath(n, s) : n && enyo.error("enyo.kind: " + n + " is already in use by another " + "kind, all kind definitions must have unique names."), 
    s;
}, enyo.singleton = function(e, n) {
    var t = e.name;
    delete e.name;
    var o, r = enyo.kind(e);
    return enyo.setPath.call(n || enyo.global, t, o = new r()), o;
}, enyo.kind.makeCtor = function() {
    var e = function() {
        if (!(this instanceof e)) throw "enyo.kind: constructor called directly, not using 'new'";
        var n;
        return this._constructor && (n = this._constructor.apply(this, arguments)), this.constructed && this.constructed.apply(this, arguments), 
        n ? n : void 0;
    };
    return e;
}, enyo.kind.defaultNamespace = "enyo", enyo.kind.features = [], enyo.kind.extendMethods = function(e, n, t) {
    var o = e.prototype || e, r = o.base;
    !o.inherited && r && (o.inherited = enyo.kind.inherited), n.hasOwnProperty("constructor") && (n._constructor = n.constructor, 
    delete n.constructor);
    for (var i in n) {
        var a = n[i];
        enyo.isInherited(a) && (a = o[i] = t ? a.fn(o[i] || enyo.nop) : a.fn(r ? r.prototype[i] || enyo.nop : enyo.nop)), 
        enyo.isFunction(a) && (t ? (o[i] = a, a.displayName = i + "()") : (a._inherited = r ? r.prototype[i] : null, 
        a.displayName = o.kindName + "." + i + "()"));
    }
}, enyo.kind.features.push(enyo.kind.extendMethods), enyo.kind.inherited = function(e, n) {
    var t = e.callee, o = t._inherited;
    if ("function" == typeof o) {
        var r = e;
        if (n) {
            r = [];
            for (var i = 0, a = n.length; a > i; ++i) r[i] = n[i];
            for (a = e.length; a > i; ++i) r[i] = e[i];
        }
        return o.apply(this, r);
    }
    enyo.warn("enyo.kind.inherited: unable to find requested super-method from -> " + e.callee.displayName + " in " + this.kindName);
}, function(e) {
    var n = function(e) {
        this.fn = e;
    };
    e.inherit = function(e) {
        return new n(e);
    }, e.isInherited = function(e) {
        return e && e instanceof n;
    };
}(enyo), enyo.kind.features.push(function(e, n) {
    e.subclass || (e.subclass = enyo.kind.statics.subclass), e.extend || (e.extend = enyo.kind.statics.extend), 
    n.statics && (enyo.mixin(e, n.statics), delete e.prototype.statics), n.protectedStatics && (enyo.mixin(e, n.protectedStatics), 
    delete e.prototype.protectedStatics);
    for (var t = e.prototype.base; t; ) t.subclass(e, n), t = t.prototype.base;
}), enyo.kind.statics = {
    subclass: function() {},
    extend: function(e, n) {
        var t, o, r = this, i = enyo.isArray(e) ? e : [ e ];
        o = function(e, n) {
            return !(enyo.isFunction(n) || enyo.isInherited(n));
        }, !n && r._deferred && (r = enyo.checkConstructor(r)), t = n || r.prototype;
        for (var a, s = 0; a = i[s]; ++s) enyo.concatHandler(t, a), enyo.kind.extendMethods(t, a, !0), 
        enyo.mixin(t, a, {
            filter: o
        });
        return n || r;
    }
}, enyo.concatHandler = function(e, n) {
    for (var t = e.prototype || e, o = t.ctor, r = t === e; o; ) o.concat && o.concat(e, n, r), 
    o = o.prototype.base;
}, enyo.checkConstructor = function(e) {
    if (enyo.isFunction(e)) {
        if (e._FinalCtor) return e._FinalCtor;
        if (e._finishKindCreation) return e._finishKindCreation();
    }
    return e;
}, enyo._kindCtors = {}, enyo.constructorForKind = function(e) {
    if (null === e) return e;
    if (void 0 === e) return enyo.defaultCtor;
    if (enyo.isFunction(e)) return enyo.checkConstructor(e);
    var n = enyo._kindCtors[e];
    if (n) return n;
    if (n = enyo.Theme[e] || enyo[e] || enyo.getPath("enyo." + e) || window[e] || enyo.getPath(e), 
    n && n._finishKindCreation && (n = n._finishKindCreation()), !enyo.isFunction(n)) throw "[" + e + "] is not the name of a valid kind.";
    return enyo._kindCtors[e] = n, n;
}, enyo.Theme = {}, enyo.registerTheme = function(e) {
    enyo.mixin(enyo.Theme, e);
};

// ../source/kernel/Binding.js
(function(e) {
    var t = {}, n = /(string|number|boolean)/;
    e.BindingCount = 0, e.kind({
        name: "enyo.Binding",
        kind: null,
        noDefer: !0,
        from: "",
        to: "",
        source: null,
        allowUndefined: !0,
        target: null,
        transform: "",
        connected: !1,
        id: "",
        oneWay: !0,
        autoConnect: !0,
        autoSync: !0,
        owner: null,
        destroyed: !1,
        statics: {
            find: function(e) {
                return t[e];
            }
        },
        sourceObserver: null,
        targetObserver: null,
        sourceConnected: !1,
        targetConnected: !1,
        sourceRegistered: !1,
        targetRegistered: !1,
        registeredSource: null,
        registeredTarget: null,
        sourcePath: "",
        targetPath: "",
        sourceProp: "",
        targetProp: "",
        building: !0,
        originals: null,
        constructor: function(n) {
            n && e.mixin(this, n), this.id = e.uid("binding"), t[this.id] = this, this.originals = this.originals || {}, 
            this.originals.from = this.from, this.originals.to = this.to, this.originals.source = this.source, 
            this.originals.target = this.target, this.initTransform(), this.refresh(), e.BindingCount++;
        },
        isConnected: function() {
            return this.connected = this.sourceConnected && this.targetConnected, this.connected;
        },
        registered: function(e, t) {
            "source" == e ? (this.sourceRegistered = !0, this.registeredSource = t) : "target" == e && (this.targetRegistered = !0, 
            this.registeredTarget = t), this.autoSync && this.isRegistered() && !this.synchronizing && this.sync();
        },
        isRegistered: function() {
            return !(!this.sourceRegistered || !this.targetRegistered);
        },
        syncFromSource: function() {
            if (!this.synchronizing) {
                if (this.synchronizing = !0, this.isConnected() && this.isRegistered()) {
                    var e = this.getSourceValue(), t = this.transform;
                    t && "function" == typeof t && (e = t.call(this.owner || this, e, "source", this)), 
                    (this.allowUndefined || void 0 !== e) && this.setTargetValue(e);
                }
                this.synchronizing = !1;
            }
        },
        syncFromTarget: function() {
            if (!this.oneWay && !this.synchronizing) {
                if (this.synchronizing = !0, this.isConnected() && this.isRegistered()) {
                    var e = this.getTargetValue(), t = this.transform;
                    t && "function" == typeof t && (e = t.call(this.owner || this, e, "target", this)), 
                    (this.allowUndefined || void 0 !== e) && this.setSourceValue(e);
                }
                this.synchronizing = !1;
            }
        },
        resolve: function() {
            var t, n, o = this.source, r = this.target, i = this.from, s = this.to;
            if (i && s) {
                if (this.building) {
                    if ("." != i[0] && "^" != i[0]) throw "enyo.Binding: from path must begin with `.` or `^`";
                    if ("." != s[0] && "^" != s[0]) throw "enyo.Binding: to path must beging with `.` or `^`";
                    if ("string" == typeof o) {
                        if ("." != o[0] && "^" != o[0]) throw "enyo.Binding: if source is a string it must begin with `.` or `^`";
                        i = ("." == o ? "" : o) + i, o = null;
                    }
                    if ("string" == typeof r) {
                        if ("." != r[0] && "^" != r[0]) throw "enyo.Binding: if target is a string it must begin with `.` or `^`";
                        s = ("." == r ? "" : r) + s, r = null;
                    }
                    o || (this.source = o = "." == i[0] ? this.owner : e.global), r || (this.target = r = "." == s[0] ? this.owner : e.global), 
                    n = i.slice(1).split("."), t = s.slice(1).split(".");
                    var a = e.lastIndexOf(".", i), c = e.lastIndexOf(".", s);
                    this.sourcePath = ("^" == i[0] ? n.slice(0, -1) : n).join("."), this.targetPath = ("^" == s[0] ? t.slice(0, -1) : t).join("."), 
                    this.sourceProp = a > -1 && "$" == i[a - 1] ? n.slice(-2).join(".") : n.pop(), this.targetProp = c > -1 && "$" == i[c - 1] ? t.slice(-2).join(".") : t.pop(), 
                    this.building = !1;
                }
                return o === e.global && (this.source = e.getPath(this.sourcePath), this.sourceGlobal = !0), 
                r === e.global && (t = this.targetPath.split("."), this.targetGlobalPath = t.slice(0, -1).join("."), 
                this.targetPath = t.pop(), this.target = e.getPath(this.targetGlobalPath), this.targetGlobal = !0), 
                this;
            }
        },
        connectSource: function() {
            var t = this.source, n = this.sourceGlobal ? this.sourceProp : this.sourcePath, o = this.sourceObserver, r = this.sourceObserverId || (this.sourceObserverId = e.uid("__bindingObserver__"));
            t === e.global && (t = this.resolve().source), t && t.addObserver && !this.sourceConnected ? (o || (o = this.sourceObserver = e.bindSafely(this, this.syncFromSource), 
            o.binding = this, o.bindingProp = "source"), this.sourceConnected = !0, this.sourceObserver = t.addObserver(n, o, null, r)) : this.sourceConnected = !1;
        },
        connectTarget: function() {
            var t = this.target, n = this.targetGlobal ? this.targetProp : this.targetPath, o = this.targetObserver, r = this.targetObserverId || (this.targetObserverId = e.uid("__bindingObserver__"));
            t === e.global && (t = this.resolve().target), t && t.addObserver && !this.targetConnected ? (!o && n && (o = this.targetObserver = e.bindSafely(this, this.syncFromTarget), 
            o.binding = this, o.bindingProp = "target"), this.targetConnected = !0, n ? this.targetObserver = t.addObserver(n, o, null, r) : this.registered("target", this.target)) : this.targetConnected = !1;
        },
        disconnectSource: function() {
            if (this.source && this.sourceConnected) {
                var t = this.source, n = this.sourceObserver, o = this.sourceObserverId, r = e._observerMap[t.objectObserverId], i = r && r[o];
                i && t && t.addObserver && this.sourceConnected && n && t.removeObserver(i.observerProp, n);
            }
            this.sourceObserver = null, this.sourceConnected = !1;
        },
        disconnectTarget: function() {
            if (this.target && this.targetConnected) {
                var t = this.target, n = this.targetObserver, o = this.targetObserverId, r = e._observerMap[t.objectObserverId], i = r && r[o];
                i && t && t.addObserver && this.targetConnected && n && t.removeObserver(i.observerProp, n);
            }
            this.targetObserver = null, this.targetConnected = !1;
        },
        getSourceValue: function() {
            var e = this.registeredSource;
            return e ? e.get(this.sourceProp) : void 0;
        },
        getTargetValue: function() {
            var e = this.registeredTarget;
            return e ? e.get(this.targetProp) : void 0;
        },
        setSourceValue: function(e) {
            var t = this.registeredSource;
            if (t) {
                if (t.destroyed) return this.destroy(), void 0;
                this.stop ? this.stop = !1 : t.set(this.sourceProp, e, !n.test(typeof e));
            }
        },
        setTargetValue: function(e) {
            var t = this.registeredTarget;
            if (t) {
                if (t.destroyed) return this.destroy(), void 0;
                this.stop ? this.stop = !1 : t.set(this.targetProp, e, !n.test(typeof e));
            }
        },
        connect: function() {
            var e = this.isConnected();
            return e || (this.connecting = !0, this.sourceConnected || this.connectSource(), 
            this.targetConnected || this.connectTarget(), this.connecting = !1, this.isConnected()), 
            this.connected && !e && this.autoSync && this.sync(), this;
        },
        sync: function() {
            return this.connecting || this.syncFromSource(), this;
        },
        disconnect: function() {
            return this.disconnectSource(), this.disconnectTarget(), this.isConnected(), this;
        },
        refresh: function() {
            return this.stop = !1, this.resolve(), this.autoConnect && this.connect(), this;
        },
        reset: function() {
            return this.disconnect(), e.mixin(this, this.originals), this.building = !0, this.stop = !1, 
            this.sourceRegistered = !1, this.targetRegistered = !1, this.registeredSource = null, 
            this.registeredTarget = null, this;
        },
        stop: function() {
            this.stop = !0;
        },
        rebuild: function() {
            return this.reset().refresh();
        },
        destroy: function() {
            this.disconnect(), this.destroyed = !0, this.source = null, this.target = null, 
            this.registeredSource = null, this.registeredTarget = null, this.sourceObserver = null, 
            this.targetObserver = null, this.transform = null, this.originals = null, this.owner && (this.owner.removeBinding(this), 
            this.owner = null), delete t[this.id], e.BindingCount--;
        },
        initTransform: function() {
            var t = this.transform, n = this.owner, o = n ? n.bindingTransformOwner : null;
            t && e.isString(t) && ((o || n) && (t = e.getPath.call(o || n, this.transform), 
            !t && o && n && (t = e.getPath.call(n, this.transform))), t || (t = e.getPath(this.transform))), 
            this.transform = e.isFunction(t) ? t : null;
        }
    }), e.defaultBindingKind = e.Binding;
})(enyo);

// ../source/kernel/mixins/MixinSupport.js
(function(e) {
    var t = function(t, n) {
        var i, o = t._appliedMixins, r = n;
        if (e.isString(r) && (r = e.getPath(r), !r)) return e.warn("could not find the requested mixin " + n), 
        void 0;
        if (r.name) {
            if (~e.indexOf(r.name, o)) return e.warn("attempt to add the same mixin more than once, " + r.name + " onto -> " + t.kindName), 
            void 0;
            o.push(r.name), i = r.name, delete r.name;
        } else i = null;
        var s = e.clone(r);
        r.hasOwnProperty("constructor") && (s._constructor = r.constructor, delete s.constructor), 
        e.kind.statics.extend(s, t), i && (r.name = i);
    }, n = function(n, i) {
        if (i.mixins) {
            var o = n.prototype || n, r = i.mixins;
            o._appliedMixins = o._appliedMixins ? e.cloneArray(o._appliedMixins) : [], delete i.mixins;
            for (var s, a = 0; s = r[a]; ++a) t(o, s);
        }
    };
    e.kind.features.push(n);
    var i = e.concatHandler;
    e.concatHandler = function(e, t) {
        if (t.mixins) {
            var n = e.prototype || e;
            n.mixins = n.mixins ? n.mixins.concat(t.mixins) : t.mixins.slice();
        }
        i.apply(this, arguments);
    }, e.kind.extendMethods(e.kind.statics, {
        extend: e.inherit(function(t) {
            return function(i, o) {
                var r = o || this.prototype;
                return i.mixins && (r.mixins = e.merge(r.mixins, i.mixins), n(r, i)), t.apply(this, arguments);
            };
        })
    }, !0), e.MixinSupport = {
        name: "MixinSupport",
        extend: function(e) {
            t(this, e);
        },
        importProps: e.inherit(function(e) {
            return function(t) {
                t && n(this, t), e.apply(this, arguments);
            };
        })
    };
})(enyo);

// ../source/kernel/mixins/ObserverSupport.js
(function(e) {
    var t = function(t) {
        return t.hasOwnProperty("observerMap") || (t.observerMap = e.clone(t.observerMap)), 
        t.observerMap;
    }, n = e._observerMap = {};
    e.ObserverSupport = {
        name: "ObserverSupport",
        addObserver: function(r, i, o) {
            var s, a, c = ("." == r[0] ? r.slice(1) : r).split("."), u = c.shift(), h = i, l = arguments[3], d = arguments[4], f = l || i.observerId || e.uid("__observer__"), y = t(this), p = this.objectObserverId || (this.objectObserverId = e.uid("__objectObserverId__")), g = n[p] || (n[p] = {}), v = g[f] || (g[f] = {});
            return d && d.chain && (v.chain = d.chain), "$" == u && (u = u + "." + c.shift()), 
            c.length && (v.chain = v.chain || [], r = c.join("."), i = e.bindSafely(this, "updateObserver", r, h, o, f, v), 
            a = this.get(u)), (s = y[u]) ? ("string" == typeof s && (s = y[u] = e.trim(s).split(" ")), 
            s.push(f)) : y[u] = [ f ], i = this[f] = o ? e.bindSafely(o, i) : i, i.observer = !0, 
            v.observerId = f, v.observerProp = u, v.observerOwner = this, v.objectObserverId = p, 
            v.observer = i, v.chain && v.chain.push(v), a && a.addObserver && a.addObserver(r, h, o, f, v), 
            i;
        },
        updateObserver: function(e, t, n, r, i, o, s) {
            this.removeChainedObservers(r), s && s !== o && s.addObserver(e, t, n, r, i);
        },
        removeChainedObservers: function(t) {
            for (var r, i = n[this.objectObserverId], o = i[t], s = e.find(o.chain, function(e) {
                return e === o;
            }), a = o.chain.splice(s + 1, o.chain.length), c = 0; r = a[c]; ++c) r.chain = null, 
            r.observerOwner.removeObserver(r.observerProp, r.observer), n[r.objectObserverId][r.observerId] = void 0;
        },
        removeObserver: function(r, i) {
            var o, s, a = t(this), c = n[this.objectObserverId];
            if (s = a[r]) {
                "string" == typeof s && (s = a[r] = e.trim(s).split(" "));
                for (var u, h, l = 0; u = s[l]; ++l) ((h = this[u]) && i && h === i || !i) && (s.splice(l, 1), 
                o = c && c[u], o && o.chain && this.removeChainedObservers(u), h.observer && (c[u] = void 0, 
                delete this[u]));
                0 !== s.length && i || delete a[r];
            }
        },
        removeAllObservers: function() {
            var e = t(this);
            for (var n in e) this.removeObserver(n);
            return this;
        },
        notifyObservers: function(n, r, i) {
            var o = t(this);
            if (o) {
                var s = o[n], a = this.observerNotificationsEnabled;
                if (!a) return this._addObserverToQueue(n, [ r, i, n ]), this;
                if ("string" == typeof s && (s = o[n] = e.trim(s).split(" ")), o["*"] && ("string" == typeof o["*"] && (o["*"] = e.trim(o["*"]).split(" ")), 
                s = s ? s.concat(o["*"]) : o["*"]), s && s.length) {
                    s = s.slice();
                    for (var c, u, h = 0; c = s[h]; ++h) (u = this[c]) && u.call(this, r, this.get(n), n);
                }
            }
            return this;
        },
        stopNotifications: function(e) {
            return this.observerNotificationsEnabled = !1, this.observerStopCount += 1, e && this.disableNotificationQueue(), 
            this;
        },
        startNotifications: function(e) {
            return 0 !== this.observerStopCount && (this.observerStopCount -= 1), 0 === this.observerStopCount && (this.observerNotificationsEnabled = !0, 
            this._flushObserverQueue()), e && this.enableNotificationQueue(), this;
        },
        enableNotificationQueue: function() {
            return this.observerNotificationQueueEnabled = !0, this;
        },
        disableNotificationQueue: function() {
            return this.observerNotificationQueueEnabled = !1, this.observerNotificationQueue = {}, 
            this;
        },
        _addObserverToQueue: function(e, t) {
            if (this.observerNotificationQueueEnabled) {
                var n = this.observerNotificationQueue || (this.observerNotificationQueue = {});
                t || (t = []), n[e] = t;
            }
        },
        _flushObserverQueue: function() {
            if (0 === this.observerStopCount && this.observerNotificationQueueEnabled) {
                if (!this.observerNotificationQueue) return;
                var e, t, n = this.observerNotificationQueue;
                this.observerNotificationQueue = {};
                for (e in n) t = n[e], t.unshift(e), this.notifyObservers.apply(this, t);
            }
        },
        observerStopCount: 0,
        observerNotificationsEnabled: !0,
        observerNotificationQueueEnabled: !0
    };
    var r = function(e, t, n, r) {
        var i = r.observers || (r.observers = {});
        (i[t] = i[t] || []).push(e);
    }, i = e.concatHandler;
    e.concatHandler = function(t, n) {
        i.apply(this, arguments);
        var o = t.prototype || t;
        for (var s in n) "Changed" == s.slice(-7) && r(s.slice(0, -7), s, o, n);
        if (n.observers) {
            o.observers ? (o.observers = e.clone(o.observers), o.observerMap = e.clone(o.observerMap)) : (o.observers = {}, 
            o.observerMap = {});
            for (var a in n.observers) {
                o.observers[a] = o.observers[a] || "";
                for (var c, u = "string" == typeof n.observers[a] ? e.trim(n.observers[a]).split(" ") : n.observers[a], h = 0; c = u[h]; ++h) ~o.observers[a].indexOf(c) || (o.observers[a] += " " + c, 
                o.observerMap[c] = e.trim((o.observerMap[c] || "") + " " + a).replace(/\s+/g, " "));
                o.observers[a] = e.trim(o.observers[a]).replace(/\s+/g, " ");
            }
            delete n.observers;
        }
    };
})(enyo);

// ../source/kernel/mixins/ComputedSupport.js
(function(e) {
    var t = function(t, n) {
        return t.hasOwnProperty(n) || (t[n] = t[n] ? e.clone(t[n]) : {}), t[n];
    };
    e.ComputedSupport = {
        name: "ComputedSupport",
        get: e.inherit(function(e) {
            return function(t) {
                return this._isComputed(t) ? this._getComputed(t) : e.apply(this, arguments);
            };
        }),
        set: e.inherit(function(e) {
            return function(t) {
                return this._isComputed(t) ? this : e.apply(this, arguments);
            };
        }),
        notifyObservers: e.inherit(function(n) {
            return function(r) {
                var o, i = t(this, "computedMap");
                if (i && (o = i[r])) {
                    "string" == typeof o && (o = i[r] = e.trim(o).split(" "));
                    for (var s, a = 0; s = o[a]; ++a) this._markComputed(s);
                    n.apply(this, arguments), this._flushComputedQueue();
                } else n.apply(this, arguments);
            };
        }),
        _getComputed: function(e) {
            var n, r = t(this, "computedCached"), o = t(this, "computedConfig"), i = o ? t(o, e) : null;
            if (n = r[e]) return "object" != typeof n && (n = r[e] = {}, i && i.hasOwnProperty("defaultValue") ? (n.dirty = !1, 
            n.value = i.defaultValue) : n.dirty = !0), n.dirty && (n.value = this[e](), n.dirty = !1), 
            n.value;
            if (i && i.hasOwnProperty("defaultValue")) {
                var s = i.defaultValue;
                return delete i.defaultValue, s;
            }
            return this[e]();
        },
        _markComputed: function(e) {
            var n, r = t(this, "computedCached"), o = this.computedQueue || (this.computedQueue = {}), i = null;
            (n = r[e]) && ("object" != typeof n && (n = r[e] = {}), i = n.value, n.dirty = !0), 
            o[e] = i;
        },
        _isComputed: function(e) {
            var n = t(this, "computed");
            return n && void 0 !== n[e] && null !== n[e];
        },
        _flushComputedQueue: function() {
            if (this.computedQueue && this.observerNotificationsEnabled) {
                var e = this.computedQueue;
                this.computedQueue = {};
                for (var t in e) this.notifyObservers(t, e[t], this._getComputed(t));
            }
        }
    };
    var n = e.concatHandler;
    e.concatHandler = function(t, r) {
        if (n.apply(this, arguments), r.computed) {
            var o = t.prototype || t;
            o.computed ? (o.computed = e.clone(o.computed), o.computedCached = e.clone(o.computedCached), 
            o.computedMap = e.clone(o.computedMap), o.computedConfig = e.clone(o.computedConfig)) : (o.computed = {}, 
            o.computedCached = {}, o.computedMap = {}, o.computedConfig = {});
            for (var i in r.computed) {
                o.computed[i] = o.computed[i] || "";
                for (var s, a = "string" == typeof r.computed[i] ? e.trim(r.computed[i]).split(" ") : r.computed[i], c = 0; s = a[c]; ++c) "object" == typeof s ? (s.cached === !0 && (o.computedCached[i] = !0), 
                o.computedConfig[i] = o.computedConfig[i] ? e.mixin(e.clone(o.computedConfig[i]), s) : s) : ~o.computed[i].indexOf(s) || (o.computed[i] += " " + s, 
                o.computedMap[s] = e.trim((o.computedMap[s] || "") + " " + i).replace(/\s+/g, " "));
                o.computed[i] = e.trim(o.computed[i]).replace(/\s+/g, " ");
            }
            delete r.computed;
        }
    };
})(enyo);

// ../source/kernel/mixins/BindingSupport.js
enyo.BindingSupport = {
    name: "BindingSupport",
    binding: function() {
        var e, t = enyo.toArray(arguments), n = enyo.mixin(t), i = this.bindings || (this.bindings = []);
        return n.owner = n.owner || this, n.kind = n.kind || this.defaultBindingKind || enyo.defaultBindingKind, 
        this.bindingSupportInitialized === !1 ? i.push(n) : (enyo.isFunction(n.kind) || (n.kind = enyo.getPath(n.kind)), 
        i.push(e = new n.kind(n))), e;
    },
    clearBindings: function(e) {
        var t = e || this.bindings;
        if (t) for (var n, i = 0; n = t[i]; ++i) n.destroy();
    },
    refreshBindings: function(e) {
        var t = e || this.bindings;
        if (t) for (var n, i = 0; n = t[i]; ++i) n.refresh();
    },
    rebuildBindings: function(e) {
        var t = e || this.bindings;
        if (t) for (var n, i = 0; n = t[i]; ++i) n.rebuild();
    },
    removeBinding: function(e) {
        var t = this.bindings;
        if (e && t && t.length) {
            var n = enyo.indexOf(e, t);
            n > -1 && t.splice(n, 1);
        }
    },
    initBindings: function() {
        var e, t;
        if (!1 === this.bindingSupportInitialized) {
            this.bindingSupportInitialized = void 0;
            var n = this.bindings;
            if (!n) return;
            for (this.bindings = [], e = 0; t = n[e]; ++e) this.binding(t);
        }
    },
    constructed: enyo.inherit(function(e) {
        return function() {
            this.bindings ? this.initBindings() : this.bindingSupportInitialized = void 0, e.apply(this, arguments);
        };
    }),
    destroy: enyo.inherit(function(e) {
        return function() {
            var t = this.bindings;
            if (t) for (var n, i = t.length - 1; n = t[i]; --i) n.destroy();
            e.apply(this, arguments);
        };
    }),
    addObserver: enyo.inherit(function(e) {
        return function(t, n) {
            var i, r = e.apply(this, arguments), o = this;
            return n.binding && ((-1 === (i = enyo.lastIndexOf(".", t)) || 1 === i && "$" == t[0] && ("source" == n.bindingProp || (o = this.get(t)))) && n.binding.registered(n.bindingProp, o), 
            r.binding = n.binding), r;
        };
    }),
    bindingSupportInitialized: !1,
    bindingSyncAllowed: !0
}, function(e) {
    var t = e.concatHandler;
    e.concatHandler = function(n, i) {
        if (t.apply(this, arguments), i.bindings) {
            for (var r, o = n.prototype || n, s = i.defaultBindingKind || e.defaultBindingKind, a = i.bindingDefaults, u = 0; r = i.bindings[u]; ++u) a && e.mixin(r, a, {
                ignore: !0
            }), r.kind = r.kind || s;
            o.bindings = o.bindings ? o.bindings.concat(i.bindings) : i.bindings, delete i.bindings;
        }
    };
}(enyo), enyo.ComponentBindingSupport = {
    name: "ComponentBindingSupport",
    adjustComponentProps: enyo.inherit(function(e) {
        return function(t) {
            e.apply(this, arguments), t.bindingTransformOwner = t.bindingTransformOwner || this.getInstanceOwner();
        };
    })
};

// ../source/kernel/mixins/ApplicationSupport.js
enyo.ApplicationSupport = {
    name: "ApplicationSupport",
    adjustComponentProps: enyo.inherit(function(e) {
        return function(t) {
            t.app = t.app || this.app || this instanceof enyo.Application && this, e.apply(this, arguments);
        };
    }),
    destroy: enyo.inherit(function(e) {
        return function() {
            this.app = null, e.apply(this, arguments);
        };
    })
};

// ../source/kernel/mixins/MultipleDispatchSupport.js
enyo.MultipleDispatchSupport = {
    name: "MultipleDispatchSupport",
    addDispatchTarget: function(e) {
        var t = this._dispatchTargets;
        e && !~enyo.indexOf(e, t) && t.push(e);
    },
    removeDispatchTarget: function(e) {
        var t, n = this._dispatchTargets;
        t = enyo.indexOf(e, n), t > -1 && n.splice(t, 1);
    },
    bubbleUp: enyo.inherit(function(e) {
        return function(t, n, i) {
            this._dispatchDefaultPath && e.apply(this, arguments);
            for (var r, o = this._dispatchTargets, s = 0; r = o[s]; ++s) r && !r.destroyed && r.dispatchBubble(t, n, i);
        };
    }),
    ownerChanged: enyo.inherit(function(e) {
        return function() {
            e.apply(this, arguments);
            var t = this.owner;
            this._dispatchDefaultPath = !!t;
        };
    }),
    constructor: enyo.inherit(function(e) {
        return function() {
            return this._dispatchTargets = [], e.apply(this, arguments);
        };
    }),
    destroy: enyo.inherit(function(e) {
        return function() {
            this._dispatchTargets = null, e.apply(this, arguments);
        };
    }),
    _dispatchDefaultPath: !1
};

// ../source/kernel/mixins/RegisteredEventSupport.js
(function(e) {
    var t = {};
    e.RegisteredEventSupport = {
        name: "RegisteredEventSupport",
        silence: function() {
            this._silenced = !0, this._silenceCount += 1;
        },
        unsilence: function() {
            0 !== this._silenceCount && --this._silenceCount, 0 === this._silenceCount && (this._silenced = !1);
        },
        isSilenced: function() {
            return this._silenced;
        },
        addListener: function(n, i, r) {
            var o = this.eventId || (this.eventId = e.uid("__eventId__")), s = t[o] || (t[o] = {}), a = s[n] || (s[n] = []);
            if (i = i && r ? e.bindSafely(r, i) : i, "function" != typeof i) throw "enyo.RegisteredEventSupport.addListener: must supply a valid function or if a string must supply a context";
            return a.length && ~e.indexOf(i, a) || a.push(i), i;
        },
        removeListener: function(t, n) {
            var i = this.listeners(t);
            if (i.length) {
                var r = e.indexOf(n, i);
                ~r && i.splice(r, 1);
            }
            return this;
        },
        removeAllListeners: function(e) {
            var n, i = this.eventId, r = t[i];
            return r && (e ? (n = this.listeners(e), n.splice(0, n.length)) : t[i] = {}), this;
        },
        triggerEvent: function(e, t) {
            if (!this.isSilenced()) {
                var n = this.listeners(e);
                if (n.length) {
                    n = n.slice();
                    for (var i, r = 0; n.length > r; ++r) i = n[r], i(this, e, t);
                }
            }
            return this;
        },
        listeners: function(e) {
            var n = this.eventId, i = t[n], r = i && i[e] || [];
            return r;
        },
        _silenced: !1,
        _silenceCount: 0
    };
})(enyo);

// ../source/kernel/Object.js
enyo.kind({
    name: "enyo.Object",
    kind: null,
    noDefer: !0,
    mixins: [ enyo.MixinSupport, enyo.ObserverSupport, enyo.ComputedSupport, enyo.BindingSupport ],
    constructor: function(e) {
        enyo._objectCount++, this.importProps(e);
    },
    importProps: function(e) {
        if (e) {
            var t;
            if (enyo.concatHandler(this, e), e.kindName) for (t in e) e.hasOwnProperty(t) && (this[t] = e[t]); else for (t in e) this[t] = e[t];
        }
    },
    destroyObject: function(e) {
        this[e] && this[e].destroy && this[e].destroy(), this[e] = null;
    },
    log: function() {
        var e = arguments.callee.caller, t = ((e ? e.displayName : "") || "(instance method)") + ":";
        enyo.logging.log("log", [ t ].concat(enyo.cloneArray(arguments)));
    },
    warn: function() {
        this._log("warn", arguments);
    },
    error: function() {
        this._log("error", arguments);
    },
    _log: function(e, t) {
        if (enyo.logging.shouldLog(e)) try {
            throw Error();
        } catch (n) {
            enyo.logging._log(e, [ t.callee.caller.displayName + ": " ].concat(enyo.cloneArray(t))), 
            enyo.log(n.stack);
        }
    },
    get: function() {
        return enyo.getPath.apply(this, arguments);
    },
    set: function() {
        return enyo.setPath.apply(this, arguments);
    },
    bindSafely: function() {
        var e = Array.prototype.concat.apply([ this ], arguments);
        return enyo.bindSafely.apply(enyo, e);
    },
    destroy: function() {
        this.set("destroyed", !0);
    },
    _isObject: !0
}), enyo._objectCount = 0, enyo.Object.concat = function(e, t) {
    var n = t.published;
    if (n) {
        var i = e.prototype || e;
        for (var r in n) t[r] && enyo.isFunction(t[r]) || enyo.Object.addGetterSetter(r, n[r], i);
    }
}, enyo.Object.addGetterSetter = function(e, t, n) {
    var i, r = enyo.cap(e), o = enyo.getPath.fast, s = enyo.setPath.fast, a = "set" + r, u = "get" + r, c = n._getters || (n._getters = {}), h = n._setters || (n._setters = {});
    n[e] = t, (i = n[u]) && enyo.isFunction(i) ? i && "function" == typeof i && !i.generated && (c[e] = u) : (i = n[u] = function() {
        return o.call(this, e);
    }, i.generated = !0), (i = n[a]) && enyo.isFunction(i) ? i && "function" == typeof i && !i.generated && (h[e] = a) : (i = n[a] = function(t) {
        return s.call(this, e, t);
    }, i.generated = !0);
};

// ../source/kernel/Component.js
enyo.kind({
    name: "enyo.Component",
    kind: "enyo.Object",
    published: {
        name: "",
        id: "",
        owner: null,
        componentOverrides: null
    },
    protectedStatics: {
        _kindPrefixi: {},
        _unnamedKindNumber: 0
    },
    defaultKind: "Component",
    noDefer: !0,
    handlers: {},
    mixins: [ enyo.ApplicationSupport, enyo.ComponentBindingSupport ],
    toString: function() {
        return this.id + " [" + this.kindName + "]";
    },
    constructor: enyo.inherit(function(e) {
        return function() {
            this._componentNameMap = {}, this.$ = {}, e.apply(this, arguments);
        };
    }),
    constructed: enyo.inherit(function(e) {
        return function(t) {
            this.create(t), e.apply(this, arguments);
        };
    }),
    create: function() {
        this.stopNotifications(), this.ownerChanged(), this.initComponents(), this.startNotifications();
    },
    initComponents: function() {
        this.createChrome(this.kindComponents), this.createClientComponents(this.components);
    },
    createChrome: function(e) {
        this.createComponents(e, {
            isChrome: !0
        });
    },
    createClientComponents: function(e) {
        this.createComponents(e, {
            owner: this.getInstanceOwner()
        });
    },
    getInstanceOwner: function() {
        return !this.owner || this.owner.notInstanceOwner ? this : this.owner;
    },
    destroy: enyo.inherit(function(e) {
        return function() {
            this.destroyComponents(), this.setOwner(null), e.apply(this, arguments), this.stopAllJobs();
        };
    }),
    destroyComponents: function() {
        enyo.forEach(this.getComponents(), function(e) {
            e.destroyed || e instanceof enyo.Controller && e.global || e.destroy();
        });
    },
    makeId: function() {
        var e = "_", t = this.owner && this.owner.getId(), n = this.name || "@@" + ++enyo.Component._unnamedKindNumber;
        return (t ? t + e : "") + n;
    },
    ownerChanged: function(e) {
        e && e.removeComponent && e.removeComponent(this), this.owner && this.owner.addComponent && this.owner.addComponent(this), 
        this.id || (this.id = this.makeId());
    },
    nameComponent: function(e) {
        var t, n = enyo.Component.prefixFromKindName(e.kindName), i = this._componentNameMap[n] || 0;
        do t = n + (++i > 1 ? i + "" : ""); while (this.$[t]);
        return this._componentNameMap[n] = Number(i), e.name = t, e.name;
    },
    addComponent: function(e) {
        var t = e.getName();
        t || (t = this.nameComponent(e)), this.$[t] && this.warn('Duplicate component name "' + t + '" in owner "' + this.id + '" violates ' + "unique-name-under-owner rule, replacing existing component in the hash and continuing, " + "but this is an error condition and should be fixed."), 
        this.$[t] = e, this.notifyObservers("$." + t, null, e);
    },
    removeComponent: function(e) {
        delete this.$[e.getName()];
    },
    getComponents: function() {
        var e = [];
        for (var t in this.$) e.push(this.$[t]);
        return e;
    },
    adjustComponentProps: function(e) {
        this.defaultProps && enyo.mixin(e, this.defaultProps, {
            ignore: !0
        }), e.kind = e.kind || e.isa || this.defaultKind, e.owner = e.owner || this;
    },
    _createComponent: function(e, t) {
        if (!e.kind && "kind" in e) throw "enyo.create: Attempt to create a null kind. Check dependencies for [" + e.name + "].";
        var n = enyo.mixin(enyo.clone(t), e);
        return this.adjustComponentProps(n), enyo.Component.create(n);
    },
    createComponent: function(e, t) {
        return this._createComponent(e, t);
    },
    createComponents: function(e, t) {
        if (e) {
            for (var n, i = [], o = 0; n = e[o]; o++) i.push(this._createComponent(n, t));
            return i;
        }
    },
    getBubbleTarget: function() {
        return this.bubbleTarget || this.owner;
    },
    bubble: function(e, t, n) {
        if (!this._silenced) {
            var i = t || {};
            return enyo.exists(i.originator) || (i.originator = n || this), this.dispatchBubble(e, i, n || this);
        }
    },
    bubbleUp: function(e, t) {
        if (!this._silenced) {
            var n = t || {}, i = this.getBubbleTarget();
            return i ? i.dispatchBubble(e, n, n.delegate || this) : !1;
        }
    },
    dispatchEvent: function(e, t, n) {
        if (!this._silenced) {
            var i, o = (t || (t = {})).delegate;
            if (this.decorateEvent !== enyo.Component.prototype.decorateEvent && this.decorateEvent(e, t, n), 
            o && o.owner === this) {
                if (this[e] && "function" == typeof this[e]) return this.dispatch(e, t, n);
            } else if (!o) {
                if (this.handlers && this.handlers[e] && this.dispatch(this.handlers[e], t, n)) return !0;
                if (this[e] && enyo.isString(this[e])) return t.delegate = this, i = this.bubbleUp(this[e], t, n), 
                delete t.delegate, i;
            }
        }
    },
    dispatchBubble: function(e, t, n) {
        return this._silenced ? void 0 : this.dispatchEvent(e, t, n) ? !0 : this.bubbleUp(e, t, n);
    },
    decorateEvent: function() {},
    stopAllJobs: function() {
        if (this.__jobs) for (var e in this.__jobs) this.stopJob(e);
    },
    dispatch: function(e, t, n) {
        if (!this._silenced) {
            var i = e && this[e];
            return i && "function" == typeof i ? i.call(this, n || this, t) : void 0;
        }
    },
    waterfall: function(e, t, n) {
        return this._silenced ? void 0 : (t = t || {}, this.dispatchEvent(e, t, n) ? !0 : (this.waterfallDown(e, t, n || this), 
        void 0));
    },
    waterfallDown: function(e, t, n) {
        if (!this._silenced) for (var i in this.$) this.$[i].waterfall(e, t, n);
    },
    _silenced: !1,
    _silenceCount: 0,
    silence: function() {
        this._silenced = !0, this._silenceCount += 1;
    },
    isSilenced: function() {
        return this._silenced;
    },
    unsilence: function() {
        0 !== this._silenceCount && --this._silenceCount, 0 === this._silenceCount && (this._silenced = !1);
    },
    startJob: function(e, t, n, i) {
        i = i || 5;
        var o = this.__jobs = this.__jobs || {};
        enyo.isString(t) && (t = this[t]), this.stopJob(e), o[e] = setTimeout(this.bindSafely(function() {
            enyo.jobs.add(this.bindSafely(t), i, e);
        }), n);
    },
    stopJob: function(e) {
        var t = this.__jobs = this.__jobs || {};
        t[e] && (clearTimeout(t[e]), delete t[e]), enyo.jobs.remove(e);
    },
    throttleJob: function(e, t, n) {
        var i = this.__jobs = this.__jobs || {};
        i[e] || (enyo.isString(t) && (t = this[t]), t.call(this), i[e] = setTimeout(this.bindSafely(function() {
            this.stopJob(e);
        }), n));
    }
}), enyo.defaultCtor = enyo.Component, enyo.create = enyo.Component.create = function(e) {
    if (!e.kind && "kind" in e) throw "enyo.create: Attempt to create a null kind. Check dependencies for [" + (e.name || "") + "].";
    var t = e.kind || e.isa || enyo.defaultCtor, n = enyo.constructorForKind(t);
    return n || (enyo.error('no constructor found for kind "' + t + '"'), n = enyo.Component), 
    new n(e);
}, enyo.Component.subclass = function(e, t) {
    var n = e.prototype;
    t.components ? (n.kindComponents = t.components, delete n.components) : t.componentOverrides && (n.kindComponents = enyo.Component.overrideComponents(n.kindComponents, t.componentOverrides, n.defaultKind));
}, enyo.Component.concat = function(e, t) {
    var n = e.prototype || e;
    if (t.handlers) {
        var i = n.handlers ? enyo.clone(n.handlers) : {};
        n.handlers = enyo.mixin(i, t.handlers), delete t.handlers;
    }
    t.events && enyo.Component.publishEvents(n, t);
}, enyo.Component.overrideComponents = function(e, t, n) {
    var i = function(e, t) {
        return !(enyo.isFunction(t) || enyo.isInherited(t));
    };
    e = enyo.clone(e);
    for (var o = 0; e.length > o; o++) {
        var r = enyo.clone(e[o]), s = t[r.name], a = enyo.constructorForKind(r.kind || n);
        if (s) {
            enyo.concatHandler(r, s);
            for (var c = r.kind && ("string" == typeof r.kind && enyo.getPath(r.kind) || "function" == typeof r.kind && r.kind) || enyo.defaultCtor; c; ) c.concat && c.concat(r, s, !0), 
            c = c.prototype.base;
            enyo.mixin(r, s, {
                filter: i
            });
        }
        r.components && (r.components = enyo.Component.overrideComponents(r.components, t, a.prototype.defaultKind)), 
        e[o] = r;
    }
    return e;
}, enyo.Component.publishEvents = function(e, t) {
    var n = t.events;
    if (n) {
        var i = e.prototype || e;
        for (var o in n) enyo.Component.addEvent(o, n[o], i);
    }
}, enyo.Component.addEvent = function(e, t, n) {
    var i, o;
    enyo.isString(t) ? ("on" != e.slice(0, 2) && (enyo.warn("enyo.Component.addEvent: event names must start with 'on'. " + n.kindName + " event '" + e + "' was auto-corrected to 'on" + e + "'."), 
    e = "on" + e), i = t, o = "do" + enyo.cap(e.slice(2))) : (i = t.value, o = t.caller), 
    n[e] = i, n[o] || (n[o] = function(t) {
        var n = t;
        n || (n = {});
        var i = n.delegate;
        n.delegate = void 0, enyo.exists(n.type) || (n.type = e), this.bubble(e, n), i && (n.delegate = i);
    });
}, enyo.Component.prefixFromKindName = function(e) {
    var t = enyo.Component._kindPrefixi[e];
    if (!t) {
        var n = e.lastIndexOf(".");
        t = n >= 0 ? e.slice(n + 1) : e, t = t.charAt(0).toLowerCase() + t.slice(1), enyo.Component._kindPrefixi[e] = t;
    }
    return t;
};

// ../source/kernel/UiComponent.js
enyo.kind({
    name: "enyo.UiComponent",
    kind: "enyo.Component",
    published: {
        container: null,
        parent: null,
        controlParentName: "client",
        layoutKind: ""
    },
    handlers: {
        onresize: "resizeHandler"
    },
    addBefore: void 0,
    protectedStatics: {
        _resizeFlags: {
            showingOnly: !0
        }
    },
    controllerChanged: function() {
        var e = this.controller;
        e && enyo.isString(e) && (this.warn("the `controller` properties special handling has been deprecated, please use bindings to help resolve paths as this feature will be removed"), 
        e = this.controller = enyo.getPath.call("." == e[0] ? this : enyo.global, e));
    },
    create: enyo.inherit(function(e) {
        return function() {
            this.controls = this.controls || [], this.children = this.children || [], this.containerChanged(), 
            e.apply(this, arguments), this.layoutKindChanged(), this.controller && this.notifyObservers("controller", null, this.controller);
        };
    }),
    destroy: enyo.inherit(function(e) {
        return function() {
            this.destroyClientControls(), this.setContainer(null), e.apply(this, arguments);
        };
    }),
    importProps: enyo.inherit(function(e) {
        return function() {
            e.apply(this, arguments), this.owner || (this.owner = enyo.master);
        };
    }),
    createComponents: enyo.inherit(function(e) {
        return function() {
            var n = e.apply(this, arguments);
            return this.discoverControlParent(), n;
        };
    }),
    discoverControlParent: function() {
        this.controlParent = this.$[this.controlParentName] || this.controlParent;
    },
    adjustComponentProps: enyo.inherit(function(e) {
        return function(n) {
            n.container = n.container || this, e.apply(this, arguments);
        };
    }),
    containerChanged: function(e) {
        e && e.removeControl(this), this.container && this.container.addControl(this, this.addBefore);
    },
    parentChanged: function(e) {
        e && e != this.parent && e.removeChild(this);
    },
    isDescendantOf: function(e) {
        for (var n = this; n && n != e; ) n = n.parent;
        return e && n == e;
    },
    getControls: function() {
        return this.controls;
    },
    getClientControls: function() {
        for (var e, n = [], t = 0, i = this.controls; e = i[t]; t++) e.isChrome || n.push(e);
        return n;
    },
    destroyClientControls: function() {
        for (var e, n = this.getClientControls(), t = 0; e = n[t]; t++) e.destroy();
    },
    addControl: function(e, n) {
        if (void 0 !== n) {
            var t = null === n ? 0 : this.indexOfControl(n);
            this.controls.splice(t, 0, e);
        } else this.controls.push(e);
        this.addChild(e, n);
    },
    removeControl: function(e) {
        return e.setParent(null), enyo.remove(e, this.controls);
    },
    indexOfControl: function(e) {
        return enyo.indexOf(e, this.controls);
    },
    indexOfClientControl: function(e) {
        return enyo.indexOf(e, this.getClientControls());
    },
    indexInContainer: function() {
        return this.container.indexOfControl(this);
    },
    clientIndexInContainer: function() {
        return this.container.indexOfClientControl(this);
    },
    controlAtIndex: function(e) {
        return this.controls[e];
    },
    addChild: function(e, n) {
        if (this.controlParent) this.controlParent.addChild(e, n); else if (e.setParent(this), 
        void 0 !== n) {
            var t = null === n ? 0 : this.indexOfChild(n);
            this.children.splice(t, 0, e);
        } else this.children.push(e);
    },
    removeChild: function(e) {
        return enyo.remove(e, this.children);
    },
    indexOfChild: function(e) {
        return enyo.indexOf(e, this.children);
    },
    layoutKindChanged: function() {
        this.layout && this.layout.destroy(), this.layout = enyo.createFromKind(this.layoutKind, this), 
        this.generated && this.render();
    },
    flow: function() {
        this.layout && this.layout.flow();
    },
    reflow: function() {
        this.layout && this.layout.reflow();
    },
    resized: function() {
        this.waterfall("onresize", enyo.UiComponent._resizeFlags), this.waterfall("onpostresize", enyo.UiComponent._resizeFlags);
    },
    resizeHandler: function() {
        this.reflow();
    },
    waterfallDown: function(e, n, t) {
        n = n || {};
        for (var i in this.$) this.$[i] instanceof enyo.UiComponent || this.$[i].waterfall(e, n, t);
        for (var o, r = 0, s = this.children; o = s[r]; r++) !o.showing && n && n.showingOnly || o.waterfall(e, n, t);
    },
    getBubbleTarget: function() {
        return this.bubbleTarget || this.parent || this.owner;
    }
}), enyo.createFromKind = function(e, n) {
    var t = e && enyo.constructorForKind(e);
    return t ? new t(n) : void 0;
}, enyo.master = new enyo.Component({
    name: "master",
    notInstanceOwner: !0,
    eventFlags: {
        showingOnly: !0
    },
    getId: function() {
        return "";
    },
    isDescendantOf: enyo.nop,
    bubble: function(e, n) {
        "onresize" == e ? (enyo.master.waterfallDown("onresize", this.eventFlags), enyo.master.waterfallDown("onpostresize", this.eventFlags)) : enyo.Signals.send(e, n);
    }
});

// ../source/kernel/Layout.js
enyo.kind({
    name: "enyo.Layout",
    kind: null,
    layoutClass: "",
    constructor: function(e) {
        this.container = e, e && e.addClass(this.layoutClass);
    },
    destroy: function() {
        this.container && this.container.removeClass(this.layoutClass);
    },
    flow: function() {},
    reflow: function() {}
});

// ../source/kernel/Signals.js
enyo.kind({
    name: "enyo.Signals",
    kind: "enyo.Component",
    noDefer: !0,
    create: enyo.inherit(function(e) {
        return function() {
            e.apply(this, arguments), enyo.Signals.addListener(this);
        };
    }),
    destroy: enyo.inherit(function(e) {
        return function() {
            enyo.Signals.removeListener(this), e.apply(this, arguments);
        };
    }),
    notify: function(e, n) {
        this.dispatchEvent(e, n);
    },
    protectedStatics: {
        listeners: [],
        addListener: function(e) {
            this.listeners.push(e);
        },
        removeListener: function(e) {
            enyo.remove(e, this.listeners);
        }
    },
    statics: {
        send: function(e, n) {
            enyo.forEach(this.listeners, function(t) {
                t.notify(e, n);
            });
        }
    }
});

// ../source/kernel/MultipleDispatchComponent.js
enyo.kind({
    name: "enyo.MultipleDispatchComponent",
    kind: "enyo.Component",
    mixins: [ enyo.MultipleDispatchSupport ]
});

// ../source/kernel/Controller.js
enyo.kind({
    name: "enyo.Controller",
    kind: "enyo.MultipleDispatchComponent",
    global: !1,
    data: null,
    constructor: enyo.inherit(function(e) {
        return function() {
            e.apply(this, arguments), this.global && enyo.setPath(this.name, this);
        };
    }),
    _isController: !0
});

// ../source/kernel/Router.js
(function(e) {
    var t = [], n = function(e) {
        for (var n = t, i = n.length, o = 0; i > o; ++o) n[o]._hashChanged(e);
    }, i = /\:[a-zA-Z0-9]*/g, o = function(e) {
        return "#" === e[0] ? e.slice(1) : e;
    };
    e.ready(function() {
        e.dispatcher.listen(window, "hashchange", n);
    }), e.kind({
        name: "enyo.Router",
        listening: !0,
        internalOnly: !1,
        defaultPathOnStart: !1,
        defaultRoute: null,
        triggerOnStart: !0,
        useHistory: !1,
        routes: null,
        kind: "enyo.Controller",
        _staticRoutes: null,
        _dynamicRoutes: null,
        _current: "",
        _history: null,
        computed: {
            location: [ "_current", {
                cached: !0
            } ],
            defaultPath: []
        },
        location: function(t) {
            return t ? (t = o(t), this.internalOnly ? this.set("_current", t) : e.asyncMethod(this, "trigger", {
                location: t,
                change: !0
            }), void 0) : o(this.get("_current"));
        },
        defaultPath: function() {
            return this.defaultRoute ? this.defaultRoute.path : "";
        },
        trigger: function(e) {
            e ? "string" == typeof e && (e = {
                location: e
            }) : e = {
                location: this.get("_current")
            };
            var t = e.location, i = e.global, o = e.change, r = this.get("location");
            o ? r !== t ? window.location.hash = t : this._hashChanged(t) : i ? n(t) : this._hashChanged(t);
        },
        handle: function(e) {
            this._handleStatic(e) || this._handleDynamic(e) || this._handleDefault(e);
        },
        back: function() {
            this.useHistory && this._history.length >= 2 && (this._history.shift(), this.set("location", this._history.shift()));
        },
        addHistory: function(e, t) {
            if (this.useHistory) switch (typeof t) {
              case "undefined":
                this._history.unshift(e);
                break;

              case "number":
                t >= 0 && this._history.length > t && this._history.splice(t, 0, e);
                break;

              case "boolean":
                this._history.push(e);
            }
            return this;
        },
        clearHistory: function() {
            return this._history = [], this;
        },
        addRoute: function(e) {
            var t, n = this._staticRoutes, o = this._dynamicRoutes;
            return !0 === e["default"] ? this.defaultRoute = e : i.test(e.path) ? (t = RegExp(e.path.replace(i, "([a-zA-Z0-9-]*)")), 
            e.regex = t, o.push(e)) : n[e.path] = e, this;
        },
        constructor: e.inherit(function(e) {
            return function() {
                this._staticRoutes = {}, this._dynamicRoutes = [], this.routes = this.routes || [], 
                this._history = this._history || [], e.apply(this, arguments);
            };
        }),
        create: e.inherit(function(e) {
            return function() {
                e.apply(this, arguments), this._setupRoutes(), this.set("_current", o(window.location.hash)), 
                t.push(this), this.triggerOnStart && (this.defaultPathOnStart ? this.trigger({
                    change: !0,
                    location: this.get("defaultPath")
                }) : this.trigger());
            };
        }),
        destroy: e.inherit(function(n) {
            return function() {
                var i = e.indexOf(this, t);
                ~i || t.splice(i, 1), n.apply(this, arguments);
            };
        }),
        _hashChanged: function(t) {
            var n = function(t) {
                return e.isString(t) || (t = t.newUrl || window.location.hash), o(t);
            }(t);
            this.listening && (this.set("_current", n), this.handle(n));
        },
        _execHandler: function(t, n, i, o) {
            var r = n, s = "string" == typeof t ? e.getPath.call(this, t) : t || this;
            return "string" == typeof n && (r = this[n] || s[n], "function" == typeof r && (o.handler = r, 
            o.context = s)), r && "function" == typeof r ? (r.apply(s, i), !0) : !1;
        },
        _handleStatic: function(e) {
            var t, n, i, o = this._staticRoutes;
            return (t = o[e]) ? (n = t.handler, i = t.context, this._execHandler(i, n, [ e ], t)) : !1;
        },
        _handleDynamic: function(e) {
            for (var t, n, i, o, r, s = this._dynamicRoutes, a = 0, c = s.length; c > a; ++a) if (n = s[a], 
            t = n.regex, r = t.exec(e)) return r = r.slice(1), i = n.handler, o = n.context, 
            this._execHandler(o, i, r, n);
            return !1;
        },
        _handleDefault: function(e) {
            var t = this.defaultRoute || {}, n = t.context, i = t.handler;
            return this._execHandler(n, i, [ e ], t);
        },
        _setupRoutes: function() {
            for (var e, t = this.routes, n = 0, i = t.length; i > n; ++n) e = t[n], e && this.addRoute(e);
        },
        _currentChanged: function() {
            this.useHistory && this._history.unshift(this.get("location"));
        }
    });
})(enyo);

// ../source/kernel/ViewController.js
enyo.kind({
    name: "enyo.ViewController",
    kind: "enyo.Controller",
    view: null,
    viewKind: null,
    renderTarget: "document.body",
    resetView: !1,
    render: function(e) {
        var t = this.view, n = e || this.renderTarget;
        if (t) {
            if (t.hasNode() && t.generated) return;
            this.container ? t.render() : t.renderInto(enyo.dom.byId(n) || enyo.getPath(n));
        }
    },
    renderInto: function(e) {
        this.render(this.renderTarget = e);
    },
    viewChanged: function(e) {
        if (!e || (e.set("bubbleTarget", null), e.owner !== this || e.destroyed || e.destroy(), 
        !e.destroyed || this.resetView)) {
            var t = this.view;
            if ("string" == typeof t && (t = enyo.getPath(t)), "function" == typeof t && (this.viewKind = t, 
            t = null), "string" == typeof this.viewKind && (this.viewKind = enyo.getPath(this.viewKind)), 
            !t && this.viewKind || t && "object" == typeof t && !(t instanceof enyo.UiComponent)) {
                var n = "object" == typeof t && null !== t && !t.destroyed && t || {
                    kind: this.viewKind
                }, i = this;
                n.kind = n.kind || this.viewKind || enyo.defaultCtor, t = this.createComponent(n, {
                    owner: this,
                    container: this.container || null,
                    bubbleTarget: this
                }), t.extend({
                    destroy: enyo.inherit(function(e) {
                        return function() {
                            e.apply(this, arguments), this.bubbleTarget === i && this.bubbleTarget.set("view", null);
                        };
                    })
                });
            } else t && t instanceof enyo.UiComponent && (this.viewKind || (this.viewKind = t.ctor), 
            t.set("bubbleTarget", this));
            this.view = t;
        }
    },
    create: enyo.inherit(function(e) {
        return function() {
            e.apply(this, arguments), this.viewChanged();
        };
    }),
    destroy: enyo.inherit(function(e) {
        return function() {
            e.apply(this, arguments), this.view = null, this.viewKind = null;
        };
    }),
    notInstanceOwner: !0
});

// ../source/kernel/Application.js
enyo.applications = {}, enyo.kind({
    name: "enyo.Application",
    kind: "enyo.ViewController",
    autoStart: !0,
    renderOnStart: !0,
    defaultKind: "enyo.Controller",
    controllers: null,
    viewReady: !1,
    start: function() {
        this.renderOnStart && this.render();
    },
    render: enyo.inherit(function(e) {
        return function() {
            e.apply(this, arguments), this.view && this.view.generated && this.set("viewReady", !0);
        };
    }),
    constructor: enyo.inherit(function(e) {
        return function(t) {
            t && "string" == typeof t.name && (enyo.setPath(t.name, this), this.id = t && t.name), 
            e.apply(this, arguments), this.controllers = this.$, enyo.applications[this.id || this.makeId()] = this;
        };
    }),
    create: enyo.inherit(function(e) {
        return function() {
            e.apply(this, arguments), this.autoStart && this.start();
        };
    }),
    adjustComponentProps: enyo.inherit(function(e) {
        return function(t) {
            t.app = this, e.apply(this, arguments);
        };
    }),
    destroy: enyo.inherit(function(e) {
        return function() {
            delete enyo.applications[this.id], e.apply(this, arguments);
        };
    }),
    addObserver: enyo.inherit(function(e) {
        return function(t) {
            var n = arguments;
            return /^controllers/.test(t) && (this.warn("the `controllers` property is deprecated, please update bindings to instead use `$` instead (for path `" + t + "`)"), 
            t = t.replace(/^controllers/, "$"), n = enyo.cloneArray(arguments), n[0] = t), e.apply(this, n);
        };
    }),
    owner: enyo.master,
    statics: {
        concat: function(e, t) {
            t.controllers && (enyo.warn("enyo.Application: the `controllers` property has been deprecated, please use the `components` property and update any bindings referencing `controllers` to use `$` instead"), 
            t.components = t.components ? t.components.concat(t.controllers) : t.controllers.slice(), 
            delete t.controllers);
        }
    }
});

// ../source/kernel/jobs.js
enyo.singleton({
    name: "enyo.jobs",
    published: {
        priorityLevel: 0
    },
    _jobs: [ [], [], [], [], [], [], [], [], [], [] ],
    _priorities: {},
    _namedJobs: {},
    _magicWords: {
        low: 3,
        normal: 5,
        high: 7
    },
    add: function(e, t, n) {
        t = t || 5, t = enyo.isString(t) ? this._magicWords[t] : t, n && (this.remove(n), 
        this._namedJobs[n] = t), t >= this.priorityLevel ? e() : this._jobs[t - 1].push({
            fkt: e,
            name: n
        });
    },
    remove: function(e) {
        var t = this._jobs[this._namedJobs[e] - 1];
        if (t) for (var n = t.length - 1; n >= 0; n--) if (t[n].name === e) return t.splice(n, 1);
    },
    registerPriority: function(e, t) {
        this._priorities[t] = e, this.setPriorityLevel(Math.max(e, this.priorityLevel));
    },
    unregisterPriority: function(e) {
        var t = 0;
        delete this._priorities[e];
        for (var n in this._priorities) t = Math.max(t, this._priorities[n]);
        this.setPriorityLevel(t);
    },
    priorityLevelChanged: function(e) {
        e > this.priorityLevel && this._doJob();
    },
    _doJob: function() {
        for (var e, t = 9; t >= this.priorityLevel; t--) if (this._jobs[t].length) {
            e = this._jobs[t].shift();
            break;
        }
        e && (e.fkt(), delete this._namedJobs[e.name], setTimeout(enyo.bind(this, "_doJob"), 10));
    }
});

// ../source/ext/macroize.js
enyo.macroize = function(e, t, n) {
    var i, o, r = e, s = n || enyo.macroize.pattern, a = function(e, n) {
        return i = enyo.getPath.call(t, n), void 0 === i || null === i ? "{$" + n + "}" : (o = !0, 
        i);
    }, c = 0;
    do if (o = !1, r = r.replace(s, a), ++c >= 20) throw "enyo.macroize: recursion too deep"; while (o);
    return r;
}, enyo.quickReplace = function(e, t, n) {
    n = n || enyo.macroize.pattern;
    var i = function(e) {
        var n = t[e];
        return n || e;
    };
    return e.replace(n, i);
}, enyo.quickMacroize = function(e, t, n) {
    var i, o = e, r = n || enyo.macroize.pattern, s = function(e, n) {
        return i = n in t ? t[n] : enyo.getPath.call(t, n), void 0 === i || null === i ? "{$" + n + "}" : i;
    };
    return o = o.replace(r, s);
}, enyo.macroize.pattern = /\{\$([^{}]*)\}/g;

// ../source/ext/hooks.js
(function() {
    window.$L = function(e) {
        return e;
    }, enyo.updateLocale = function() {}, enyo.broadcastLocaleChange = function() {
        enyo.updateLocale(), enyo.Signals.send("onlocalechange");
    }, document.addEventListener && document.addEventListener("localechange", enyo.broadcastLocaleChange, !1);
})();

// ../source/ext/InputBinding.js
enyo.kind({
    name: "enyo.InputBinding",
    kind: enyo.Binding,
    placeholderDirection: "source",
    oneWay: !1,
    transform: function(e, t, n) {
        if (e) return e;
        var i = n.placeholderDirection, o = n[i].placeholder || "";
        return o;
    }
});

// ../source/ext/BooleanBinding.js
enyo.kind({
    name: "enyo.BooleanBinding",
    kind: enyo.Binding,
    transform: function(e) {
        return !!e;
    }
}), enyo.kind({
    name: "enyo.EmptyBinding",
    kind: enyo.Binding,
    transform: function(e) {
        return "" !== e && null != e;
    }
});

// ../source/ext/BooleanOnlyBinding.js
enyo.kind({
    name: "enyo.BooleanOnlyBinding",
    kind: enyo.Binding,
    transform: function(e) {
        return e !== !0 && e !== !1 ? void 0 : e;
    }
});

// ../source/ext/StringBinding.js
enyo.kind({
    name: "enyo.StringBinding",
    kind: enyo.Binding,
    transform: function(e) {
        return enyo.isString(e) ? e : "";
    }
});

// ../source/ext/InvertBooleanBinding.js
enyo.kind({
    name: "enyo.InvertBooleanBinding",
    kind: enyo.Binding,
    transform: function(e) {
        return !e;
    }
});

// ../source/ajax/Async.js
enyo.kind({
    name: "enyo.Async",
    kind: "enyo.Object",
    published: {
        timeout: 0
    },
    failed: !1,
    context: null,
    constructor: enyo.inherit(function(e) {
        return function() {
            e.apply(this, arguments), this.responders = [], this.errorHandlers = [], this.progressHandlers = [];
        };
    }),
    destroy: enyo.inherit(function(e) {
        return function() {
            this.timeoutJob && this.clearTimeout(), e.apply(this, arguments);
        };
    }),
    accumulate: function(e, t) {
        var n = 2 > t.length ? t[0] : enyo.bind(t[0], t[1]);
        e.push(n);
    },
    response: function() {
        return this.accumulate(this.responders, arguments), this;
    },
    error: function() {
        return this.accumulate(this.errorHandlers, arguments), this;
    },
    route: function(e, t) {
        var n = this.bindSafely("respond");
        e.response(function(e, t) {
            n(t);
        });
        var i = this.bindSafely("fail");
        e.error(function(e, t) {
            i(t);
        }), e.go(t);
    },
    handle: function(e, t) {
        var n = t.shift();
        if (n) if (n instanceof enyo.Async) this.route(n, e); else {
            var i = enyo.call(this.context || this, n, [ this, e ]);
            i = void 0 !== i ? i : e, (this.failed ? this.fail : this.respond).call(this, i);
        }
    },
    startTimer: function() {
        this.startTime = enyo.perfNow(), this.timeout && (this.timeoutJob = setTimeout(this.bindSafely("timeoutComplete"), this.timeout));
    },
    endTimer: function() {
        this.timeoutJob && (this.endTime = enyo.perfNow(), clearTimeout(this.timeoutJob), 
        this.timeoutJob = null, this.latency = this.endTime - this.startTime);
    },
    timeoutComplete: function() {
        this.timedout = !0, this.fail("timeout");
    },
    respond: function(e) {
        this.failed = !1, this.endTimer(), this.handle(e, this.responders);
    },
    fail: function(e) {
        this.failed = !0, this.endTimer(), this.handle(e, this.errorHandlers);
    },
    recover: function() {
        this.failed = !1;
    },
    progress: function() {
        return this.accumulate(this.progressHandlers, arguments), this;
    },
    sendProgress: function(e, t, n, i) {
        var o = enyo.mixin({}, i);
        o.type = "progress", o.current = e, o.min = t, o.max = n;
        for (var r = 0; this.progressHandlers.length > r; r++) enyo.call(this.context || this, this.progressHandlers[r], [ this, o ]);
    },
    go: function(e) {
        return this.sendProgress(0, 0, 1), enyo.asyncMethod(this, function() {
            this.sendProgress(1, 0, 1), this.respond(e);
        }), this;
    }
});

// ../source/ajax/json.js
enyo.json = {
    stringify: function(e, t, n) {
        return JSON.stringify(e, t, n);
    },
    parse: function(e, t) {
        return e ? JSON.parse(e, t) : null;
    }
};

// ../source/ajax/cookie.js
enyo.getCookie = function(e) {
    var t = document.cookie.match(RegExp("(?:^|; )" + e + "=([^;]*)"));
    return t ? decodeURIComponent(t[1]) : void 0;
}, enyo.setCookie = function(e, t, n) {
    var i = e + "=" + encodeURIComponent(t), o = n || {}, r = o.expires;
    if ("number" == typeof r) {
        var s = new Date();
        s.setTime(s.getTime() + 1e3 * 60 * 60 * 24 * r), r = s;
    }
    r && r.toUTCString && (o.expires = r.toUTCString());
    var a, u;
    for (a in o) i += "; " + a, u = o[a], u !== !0 && (i += "=" + u);
    document.cookie = i;
};

// ../source/ajax/xhr.js
enyo.xhr = {
    request: function(e) {
        var t = this.getXMLHttpRequest(e), n = this.simplifyFileURL(enyo.path.rewrite(e.url)), i = e.method || "GET", o = !e.sync;
        if (e.username ? t.open(i, n, o, e.username, e.password) : t.open(i, n, o), enyo.mixin(t, e.xhrFields), 
        e.callback && this.makeReadyStateHandler(t, e.callback), e.headers = e.headers || {}, 
        "GET" !== i && enyo.platform.ios && 6 == enyo.platform.ios && null !== e.headers["cache-control"] && (e.headers["cache-control"] = e.headers["cache-control"] || "no-cache"), 
        t.setRequestHeader) for (var r in e.headers) e.headers[r] && t.setRequestHeader(r, e.headers[r]);
        return "function" == typeof t.overrideMimeType && e.mimeType && t.overrideMimeType(e.mimeType), 
        t.send(e.body || null), !o && e.callback && t.onreadystatechange(t), t;
    },
    cancel: function(e) {
        e.onload && (e.onload = null), e.onreadystatechange && (e.onreadystatechange = null), 
        e.abort && e.abort();
    },
    makeReadyStateHandler: function(e, t) {
        window.XDomainRequest && e instanceof window.XDomainRequest ? e.onload = function() {
            var n;
            "arraybuffer" === e.responseType ? n = e.response : "string" == typeof e.responseText && (n = e.responseText), 
            t.apply(null, [ n, e ]), e = null;
        } : e.onreadystatechange = function() {
            if (e && 4 == e.readyState) {
                var n;
                "arraybuffer" === e.responseType ? n = e.response : "string" == typeof e.responseText && (n = e.responseText), 
                t.apply(null, [ n, e ]), e = null;
            }
        };
    },
    inOrigin: function(e) {
        var t = document.createElement("a"), n = !1;
        return t.href = e, (":" === t.protocol || t.protocol === window.location.protocol && t.hostname === window.location.hostname && t.port === (window.location.port || ("https:" === window.location.protocol ? "443" : "80"))) && (n = !0), 
        n;
    },
    simplifyFileURL: function(e) {
        var t = document.createElement("a");
        if (t.href = e, "file:" === t.protocol || ":" === t.protocol && "file:" === window.location.protocol) {
            var n = 4 > enyo.platform.webos ? "" : t.host;
            return t.protocol + "//" + n + t.pathname;
        }
        return ":" === t.protocol && "x-wmapp0:" === window.location.protocol ? window.location.protocol + "//" + window.location.pathname.split("/")[0] + "/" + t.host + t.pathname : e;
    },
    getXMLHttpRequest: function(e) {
        try {
            if (10 > enyo.platform.ie && window.XDomainRequest && !e.headers && !this.inOrigin(e.url) && !/^file:\/\//.test(window.location.href)) return new window.XDomainRequest();
        } catch (t) {}
        try {
            return new XMLHttpRequest();
        } catch (t) {}
        return null;
    }
};

// ../source/ajax/formdata.js
(function(e) {
    function t() {
        this.fake = !0, this._fields = [], this.boundary = "--------------------------";
        for (var e = 0; 24 > e; e++) this.boundary += Math.floor(10 * Math.random()).toString(16);
    }
    function n(e, t) {
        if (this.name = t.name, this.type = t.type || "application/octet-stream", !enyo.isArray(e)) throw Error("enyo.Blob only handles Arrays of Strings");
        if (e.length > 0 && "string" != typeof e[0]) throw Error("enyo.Blob only handles Arrays of Strings");
        this._bufs = e;
    }
    if (e.FormData) try {
        return new e.FormData(), new e.Blob(), enyo.FormData = e.FormData, enyo.Blob = e.Blob, 
        void 0;
    } catch (i) {}
    t.prototype.getContentType = function() {
        return "multipart/form-data; boundary=" + this.boundary;
    }, t.prototype.append = function(e, t, n) {
        this._fields.push([ e, t, n ]);
    }, t.prototype.toString = function() {
        var e = this.boundary, t = "";
        return enyo.forEach(this._fields, function(n) {
            if (t += "--" + e + "\r\n", n[2] || n[1].name) {
                var i = n[1], o = n[2] || i.name;
                t += 'Content-Disposition: form-data; name="' + n[0] + '"; filename="' + o + '"\r\n', 
                t += "Content-Type: " + i.type + "\r\n\r\n", t += i.getAsBinary() + "\r\n";
            } else t += 'Content-Disposition: form-data; name="' + n[0] + '";\r\n\r\n', t += n[1] + "\r\n";
        }), t += "--" + e + "--";
    }, enyo.FormData = t, n.prototype.getAsBinary = function() {
        var e = "", t = e.concat.apply(e, this._bufs);
        return t;
    }, enyo.Blob = n;
})(window);

// ../source/ajax/AjaxProperties.js
enyo.AjaxProperties = {
    cacheBust: !0,
    url: "",
    method: "GET",
    handleAs: "json",
    contentType: "application/x-www-form-urlencoded",
    sync: !1,
    headers: null,
    postBody: "",
    username: "",
    password: "",
    xhrFields: null,
    mimeType: null
};

// ../source/ajax/Ajax.js
enyo.kind({
    name: "enyo.Ajax",
    kind: "enyo.Async",
    published: enyo.AjaxProperties,
    constructor: enyo.inherit(function(e) {
        return function(t) {
            enyo.mixin(this, t), e.apply(this, arguments);
        };
    }),
    destroy: enyo.inherit(function(e) {
        return function() {
            this.xhr = null, e.apply(this, arguments);
        };
    }),
    go: function(e) {
        return this.failed = !1, this.startTimer(), this.request(e), this;
    },
    request: function(e) {
        var t = this.url.split("?"), n = t.shift() || "", i = t.length ? t.join("?").split("&") : [], o = null;
        enyo.isString(e) ? o = e : e && (o = enyo.Ajax.objectToQuery(e)), o && (i.push(o), 
        o = null), this.cacheBust && i.push(Math.random());
        var r, s = i.length ? [ n, i.join("&") ].join("?") : n, a = {};
        "GET" != this.method && (r = this.postBody, "POST" === this.method && r instanceof enyo.FormData ? r.fake && (a["Content-Type"] = r.getContentType(), 
        r = "" + r) : (a["Content-Type"] = this.contentType, r instanceof Object && (r = null !== this.contentType.match(/^application\/json(;.*)?$/) ? JSON.stringify(r) : "application/x-www-form-urlencoded" === this.contentType ? enyo.Ajax.objectToQuery(r) : "" + r))), 
        enyo.mixin(a, this.headers), 0 === enyo.keys(a).length && (a = void 0);
        try {
            this.xhr = enyo.xhr.request({
                url: s,
                method: this.method,
                callback: this.bindSafely("receive"),
                body: r,
                headers: a,
                sync: this.sync,
                username: this.username,
                password: this.password,
                xhrFields: enyo.mixin({
                    onprogress: this.bindSafely(this.updateProgress)
                }, this.xhrFields),
                mimeType: this.mimeType
            });
        } catch (u) {
            this.fail(u);
        }
    },
    receive: function(e, t) {
        if (!this.failed && !this.destroyed) {
            var n;
            n = "string" == typeof t.responseText ? t.responseText : t.responseBody, this.xhrResponse = {
                status: t.status,
                headers: enyo.Ajax.parseResponseHeaders(t),
                body: n
            }, this.isFailure(t) ? this.fail(t.status) : this.respond(this.xhrToResponse(t));
        }
    },
    fail: enyo.inherit(function(e) {
        return function() {
            this.xhr && (enyo.xhr.cancel(this.xhr), this.xhr = null), e.apply(this, arguments);
        };
    }),
    xhrToResponse: function(e) {
        return e ? this[(this.handleAs || "text") + "Handler"](e) : void 0;
    },
    isFailure: function(e) {
        try {
            var t = "";
            return "string" == typeof e.responseText && (t = e.responseText), 0 === e.status && "" === t ? !0 : 0 !== e.status && (200 > e.status || e.status >= 300);
        } catch (n) {
            return !0;
        }
    },
    xmlHandler: function(e) {
        return e.responseXML;
    },
    textHandler: function(e) {
        return e.responseText;
    },
    jsonHandler: function(e) {
        var t = e.responseText;
        try {
            return t && enyo.json.parse(t);
        } catch (n) {
            return enyo.warn("Ajax request set to handleAs JSON but data was not in JSON format"), 
            t;
        }
    },
    updateProgress: function(e) {
        var t = {};
        for (var n in e) "input" !== n && (t[n] = e[n]);
        this.sendProgress(e.loaded, 0, e.total, t);
    },
    statics: {
        objectToQuery: function(e) {
            var t = encodeURIComponent, n = [], i = {};
            for (var o in e) {
                var r = e[o];
                if (r != i[o]) {
                    var s = t(o) + "=";
                    if (enyo.isArray(r)) for (var a = 0; r.length > a; a++) n.push(s + t(r[a])); else n.push(s + t(r));
                }
            }
            return n.join("&");
        }
    },
    protectedStatics: {
        parseResponseHeaders: function(e) {
            var t = {}, n = [];
            e.getAllResponseHeaders && (n = e.getAllResponseHeaders().split(/\r?\n/));
            for (var i = 0; n.length > i; i++) {
                var o = n[i], r = o.indexOf(": ");
                if (r > 0) {
                    var s = o.substring(0, r).toLowerCase(), a = o.substring(r + 2);
                    t[s] = a;
                }
            }
            return t;
        }
    }
});

// ../source/ajax/Jsonp.js
enyo.kind({
    name: "enyo.JsonpRequest",
    kind: "enyo.Async",
    published: {
        url: "",
        charset: null,
        callbackName: "callback",
        cacheBust: !0,
        overrideCallback: null
    },
    protectedStatics: {
        nextCallbackID: 0
    },
    addScriptElement: function() {
        var e = document.createElement("script");
        e.src = this.src, e.async = "async", this.charset && (e.charset = this.charset), 
        e.onerror = this.bindSafely(function() {
            this.fail(400);
        });
        var t = document.getElementsByTagName("script")[0];
        t.parentNode.insertBefore(e, t), this.scriptTag = e;
    },
    removeScriptElement: function() {
        var e = this.scriptTag;
        this.scriptTag = null, e.onerror = null, e.parentNode && e.parentNode.removeChild(e);
    },
    constructor: enyo.inherit(function(e) {
        return function(t) {
            enyo.mixin(this, t), e.apply(this, arguments);
        };
    }),
    go: function(e) {
        return this.startTimer(), this.jsonp(e), this;
    },
    jsonp: function(e) {
        var t = this.overrideCallback || "enyo_jsonp_callback_" + enyo.JsonpRequest.nextCallbackID++;
        this.src = this.buildUrl(e, t), this.addScriptElement(), window[t] = this.bindSafely(this.respond);
        var n = this.bindSafely(function() {
            this.removeScriptElement(), window[t] = null;
        });
        this.response(n), this.error(n);
    },
    buildUrl: function(e, t) {
        var n = this.url.split("?"), i = n.shift() || "", o = n.length ? n.join("?").split("&") : [], r = this.bodyArgsFromParams(e, t);
        return o.push(r), this.cacheBust && o.push(Math.random()), [ i, o.join("&") ].join("?");
    },
    bodyArgsFromParams: function(e, t) {
        if (enyo.isString(e)) return e.replace("=?", "=" + t);
        var n = enyo.mixin({}, e);
        return this.callbackName && (n[this.callbackName] = t), enyo.Ajax.objectToQuery(n);
    }
});

// ../source/ajax/WebService.js
enyo.kind({
    name: "enyo._AjaxComponent",
    kind: "enyo.Component",
    published: enyo.AjaxProperties
}), enyo.kind({
    name: "enyo.WebService",
    kind: "enyo._AjaxComponent",
    published: {
        jsonp: !1,
        callbackName: "callback",
        charset: null,
        timeout: 0
    },
    events: {
        onResponse: "",
        onError: "",
        onProgress: ""
    },
    send: function(e, t) {
        return this.jsonp ? this.sendJsonp(e, t) : this.sendAjax(e, t);
    },
    sendJsonp: function(e, t) {
        var n = new enyo.JsonpRequest();
        for (var i in {
            url: 1,
            callbackName: 1,
            charset: 1,
            timeout: 1
        }) n[i] = this[i];
        return enyo.mixin(n, t), this.sendAsync(n, e);
    },
    sendAjax: function(e, t) {
        var n = new enyo.Ajax(t);
        for (var i in enyo.AjaxProperties) n[i] = this[i];
        return n.timeout = this.timeout, enyo.mixin(n, t), this.sendAsync(n, e);
    },
    sendAsync: function(e, t) {
        return e.go(t).response(this, "response").error(this, "error").progress(this, "progress");
    },
    response: function(e, t) {
        this.doResponse({
            ajax: e,
            data: t
        });
    },
    error: function(e, t) {
        this.doError({
            ajax: e,
            data: t
        });
    },
    progress: function(e, t) {
        this.doProgress(t);
    }
});

// ../source/data/Source.js
enyo.kind({
    name: "enyo.Source",
    kind: null,
    store: null,
    fetch: function() {},
    commit: function() {},
    destroy: function() {},
    find: function() {},
    get: function() {
        return enyo.getPath.apply(this, arguments);
    },
    set: function() {
        return enyo.setPath.apply(this, arguments);
    }
});

// ../source/data/sources/localStorage.js
enyo.kind({
    name: "enyo.LocalStorageSource",
    kind: enyo.Source
});

// ../source/data/sources/xhr.js
(function(e) {
    var t = function(e) {
        return e.replace(/([^:]\/)(\/+)/g, "$1");
    }, n = /^http/, i = function() {
        var e = location.protocol, t = location.pathname.split("/");
        return e += "//" + location.host, t.length > 1 && t[t.length - 1].match(/\./) && t.pop(), 
        e += "/" + t.join("/");
    };
    e.kind({
        name: "enyo.XHRSource",
        kind: e.Source,
        requestKind: null,
        urlRoot: "",
        buildUrl: function(o, r) {
            var s = r.url || e.isFunction(o.getUrl) && o.getUrl() || o.url;
            return n.test(s) || (s = (o.urlRoot || this.urlRoot || i()) + "/" + s), t(s);
        },
        go: function(t) {
            var n = this.requestKind, i = e.only(this._requestOptions, t), o = new n(i);
            o.response(function(e, n) {
                t && t.success && t.success(n, e);
            }), o.error(t.fail), o.go(t.params);
        },
        find: function(e, t) {
            var n = e.prototype, i = n.kindName, o = t.attributes, r = "/find/" + i;
            t.url = r, t.url = this.buildUrl(n, t), t.method = "POST", t.postBody = o, this.go(t);
        }
    }), e.kind({
        name: "enyo.AjaxSource",
        kind: e.XHRSource,
        requestKind: e.Ajax,
        fetch: function(e, t) {
            t.method = "GET", t.url = this.buildUrl(e, t), this.go(t);
        },
        commit: function(e, t) {
            t.method = e.isNew ? "POST" : "PUT", t.url = this.buildUrl(e, t), t.postBody = e.toJSON(), 
            this.go(t);
        },
        destroy: function(e, t) {
            t.method = "DELETE", t.url = this.buildUrl(e, t), this.go(t);
        },
        _requestOptions: e.keys(e.AjaxProperties)
    }), e.kind({
        name: "enyo.JsonpSource",
        kind: e.XHRSource,
        requestKind: e.JsonpRequest,
        fetch: function(e, t) {
            t.cacheBust = !1, t.method = "GET", t.url = this.buildUrl(e, t), this.go(t);
        },
        commit: function(e, t) {
            t.cacheBust = !1, t.method = e.isNew ? "POST" : "PUT", t.url = this.buildUrl(e, t), 
            t.postBody = e.toJSON(), this.go(t);
        },
        destroy: function(e, t) {
            t.cacheBust = !1, t.method = "DELETE", t.url = this.buildUrl(e, t), this.go(t);
        },
        _requestOptions: e.keys(e.getPath("enyo.JsonpRequest").prototype.published)
    });
})(enyo);

// ../source/data/Store.js
(function(e) {
    e.kind({
        name: "enyo.Store",
        kind: e.Object,
        noDefer: !0,
        sources: {
            ajax: "enyo.AjaxSource",
            jsonp: "enyo.JsonpSource"
        },
        ignoreDuplicates: !1,
        records: null,
        collections: null,
        createRecord: function(t, n, i) {
            3 > arguments.length && e.isObject(t) && (i = n, n = t, t = e.Model);
            var o = e.isString(t) && e.getPath(t) || e.isFunction(t) && t;
            return i = i || {}, e.mixin(i, {
                store: this
            }), o || (o = e.Model), new o(n, i);
        },
        getRecord: function(e) {
            return this.records.euid[e];
        },
        getCollection: function(e) {
            return this.collections[e];
        },
        createCollection: function(t, n, i) {
            3 > arguments.length && e.isArray(t) && (i = n, n = t, t = e.Collection);
            var o = e.isString(t) && e.getPath(t) || e.isFunction(t) && t;
            return i = i || {}, e.mixin(i, {
                store: this
            }), o || (o = e.Collection), new o(n, i);
        },
        addRecord: function(e) {
            var t = this.records, n = e.primaryKey, i = t.pk[e.kindName] || (t.pk[e.kindName] = {}), o = e.get(n), r = e.euid;
            if (e.store && e.store !== this && e.store.removeRecord(e), t.euid[r] && t.euid[r] !== e) throw "enyo.Store.addRecord: duplicate and unmatching euid entries - parallel euid's should not exist";
            if (t.euid[r] = e, void 0 !== o && null !== o) if (i[o] && i[o] !== e) {
                if (!this.ignoreDuplicates) throw "enyo.Store.addRecord: duplicate record added to store for kind `" + e.kindName + "` " + "with primaryKey set to `" + n + "` and the same value of `" + o + "` which cannot coexist " + "for the kind without the `ignoreDuplicates` flag of the store set to `true`";
            } else i[o] = e;
            t.kn[e.kindName] = t.kn[e.kindName] || (t.kn[e.kindName] = {}), t.kn[e.kindName][r] = e, 
            e.store || (e.store = this);
        },
        addCollection: function(e) {
            var t = this.collections, n = e.euid;
            e.store && e.store !== this && e.store.removeCollection(e), e.addListener("destroy", this._collectionDestroyed), 
            t[n] = e, e.store || (e.store = this);
        },
        removeCollection: function(e) {
            var t = this.collections, n = e.euid;
            delete t[n], e.removeListener("destroy", this._collectionDestroyed);
        },
        removeRecord: function(e) {
            var t = this.records, n = e.primaryKey, i = e.euid, o = e.get(n);
            delete t.euid[i], delete t.kn[e.kindName][i], delete t.pk[e.kindName][o];
        },
        addSources: function(e) {
            var t = this.sources;
            for (var n in e) t[n] = e[n];
            this._initSources();
        },
        removeSource: function(e) {
            delete this.sources[e];
        },
        removeSources: function(e) {
            for (var t, n = this.sources, i = 0; t = e[i]; ++i) delete n[t];
        },
        find: function(t, n) {
            1 == arguments.length && (n = t, t = e.Model);
            var i = e.isString(t) ? e.constructorForKind(t) : t, o = i.prototype, r = n, s = r.attributes, a = this.sources, c = this.records, u = o.primaryKey, h = r.source && (e.isString(r.source) && a[r.source] || r.source) || a[o.defaultSource], l = r.euid && c.euid[r.euid] || s && s[u] && c.pk[o.kindName][s[u]];
            return l ? r.success(r, l) : h ? (r = e.clone(r), r.success = this.bindSafely("didFind", n), 
            r.fail = this.bindSafely("didFail", "find", n), n.strategy = n.strategy || "merge", 
            h.find(i, r), void 0) : this.warn("could not find source `" + (r.source || o.defaultSource) + "`");
        },
        findLocal: function(t, n, i) {
            3 > arguments.length && e.isObject(t) && (e.isFunction(n) && (i = n), n = t, t = e.Model);
            var o, r = ("string" == typeof t ? e.constructorForKind(t) : t).prototype, s = this.records, a = r ? r.primaryKey : "", c = n[a];
            return n.euid ? s.euid[n.euid] : void 0 !== c && null !== c ? (o = s.pk[r.kindName], 
            o && o[c] || void 0) : n.kindName ? (o = s.kn[n.kindName], o && e.values(o) || []) : (i = i && ("string" == typeof i && this[i] || i) || this.filter, 
            i = this.bindSafely(i, n), e.filter(e.values(s.kn[r.kindName]) || [], i, this));
        },
        filter: function(e, t) {
            for (var n in e) if (t.get(n) !== e[n]) return !1;
            return !0;
        },
        didFind: function() {
            this.log(arguments);
        },
        didFetch: function(e, t, n) {
            t && t.success && t.success(n);
        },
        didCommit: function(e, t, n) {
            t && t.success && t.success(n);
        },
        didDestroy: function(e, t, n) {
            t && t.success && t.success(n);
        },
        didFail: function(e, t, n, i) {
            return n && n.fail ? n.fail(i) : void 0;
        },
        fetchRecord: function(t, n) {
            var i = this.sources, o = n ? e.clone(n) : {}, r = i[o.source || t.defaultSource];
            if (!r) throw "enyo.Store: Could not find source '" + (o.source || t.defaultSource) + "'";
            o.success = this.bindSafely("didFetch", t, n), o.fail = this.bindSafely("didFail", "fetch", t, n), 
            r.fetch(t, o);
        },
        commitRecord: function(t, n) {
            var i = this.sources, o = n ? e.clone(n) : {}, r = i[o.source || t.defaultSource];
            if (!r) throw "enyo.Store: Could not find source '" + (o.source || t.defaultSource) + "'";
            o.success = this.bindSafely("didCommit", t, n), o.fail = this.bindSafely("didFail", "commit", t, n), 
            r.commit(t, o);
        },
        destroyRecord: function(t, n) {
            var i = this.sources, o = n ? e.clone(n) : {}, r = i[o.source || t.defaultSource];
            if (!r) throw "enyo.Store: Could not find source '" + (o.source || t.defaultSource) + "'";
            o.success = this.bindSafely("didDestroy", t, n), o.fail = this.bindSafely("didFail", "destroy", t, n), 
            r.destroy(t, o);
        },
        destroyRecordLocal: function(e, t) {
            this.didDestroy(e, t);
        },
        _initRecords: function() {
            for (var e, t = this.records, n = [ "euid", "pk", "kn" ], i = 0; e = n[i]; ++i) t[e] = t[e] || {};
        },
        _initSources: function() {
            var t, n = this.sources;
            for (var i in n) (t = n[i]) && e.isString(t) && (t = e.getPath(t)), t ? "function" == typeof t && t.prototype ? n[i] = new t({
                store: this
            }) : (n[i] = t, t.store = this) : !t && e.isString(n[i]) && this.warn("could not find source -> `" + n[i] + "`");
        },
        _recordDestroyed: function(e) {
            this.removeRecord(e);
        },
        _collectionDestroyed: function(e) {
            this.removeCollection(e);
        },
        _recordKeyChanged: function(e, t) {
            t && delete this.records.pk[e.kindName][t], this.addRecord(e);
        },
        constructor: e.inherit(function(e) {
            return function() {
                var t = e.apply(this, arguments);
                return this.sources = this.sources || {}, this.records = this.records || {}, this.collections = this.collections || {}, 
                this._initRecords(), this._initSources(), this._recordDestroyed = this.bindSafely("_recordDestroyed"), 
                this._collectionDestroyed = this.bindSafely("_collectionDestroyed"), t;
            };
        })
    }), e.Store.concat = function(t, n) {
        if (n.sources) {
            var i = t.prototype || t;
            i.sources = i.sources ? e.mixin(e.clone(i.sources), n.sources) : n.sources, delete n.sources;
        }
    }, e.store = new e.Store();
})(enyo);

// ../source/data/Model.js
(function(e) {
    var t = {
        ignore: !0,
        filter: function(e, t, n, i) {
            return i[e] === void 0 && t !== void 0;
        }
    };
    e.kind({
        name: "enyo.Model",
        kind: null,
        mixins: [ e.ObserverSupport, e.BindingSupport, e.RegisteredEventSupport ],
        noDefer: !0,
        attributes: null,
        defaults: {},
        readOnly: !1,
        store: null,
        defaultSource: "ajax",
        includeKeys: null,
        url: "",
        urlRoot: "",
        dirty: !1,
        primaryKey: "id",
        mergeKeys: null,
        euid: "",
        isNew: !0,
        get: function(e) {
            if (this.attributes) {
                var t = this.attributes[e];
                return t && "function" == typeof t ? t.call(this) : t;
            }
        },
        set: function(t, n, i) {
            if (this.attributes) {
                if (e.isObject(t)) return this.setObject(t);
                var o, r, s = this.attributes[t];
                if (this._updated = !1, s && "function" == typeof s) return this;
                if (i || s !== n) {
                    if (this.previous[t] = s, this.computedMap && (r = this.computedMap[t])) {
                        "string" == typeof r && (r = this.computedMap[t] = e.trim(r).split(" ")), o = {};
                        for (var a, c = 0; a = r[c]; ++c) this.attributes[t] = s, this.previous[a] = o[a] = this.get(a), 
                        this.attributes[t] = n, this.changed[a] = this.get(a), this._updated = !0;
                    }
                    if (this.changed[t] = this.attributes[t] = n, this.notifyObservers(t, s, n), this._updated = !0, 
                    o) for (var u in o) this.notifyObservers(u, this.previous[u], o[u]);
                    !this.isSilenced() && this._updated && (this._updated = !1, this.triggerEvent("change"), 
                    this.changed = {}), this.dirty = !0;
                }
            }
            return this;
        },
        setObject: function(e) {
            if (this.attributes && e) {
                this.stopNotifications(), this.silence();
                var t = !1;
                for (var n in e) this.set(n, e[n]), t = t || this._updated;
                this.startNotifications(), this.unsilence(), t && (this._updated = !1, this.triggerEvent("change")), 
                this.changed = {};
            }
            return this;
        },
        constructor: function(n, i) {
            i && this.importProps(i), this.euid = e.uuid();
            var o = this.attributes = this.attributes ? e.clone(this.attributes) : {}, r = this.defaults, s = n;
            s && e.mixin(o, this.parse(s)), r && e.mixin(o, r, t), this.changed = {}, this.previous = this.raw(), 
            this.storeChanged();
        },
        importProps: function(t) {
            t && e.kind.statics.extend(t, this);
        },
        raw: function() {
            var t = this.includeKeys, n = this.attributes, i = t ? e.only(t, n) : e.clone(n);
            for (var o in i) "function" == typeof i[o] ? i[o] = i[o].call(this) : i[o] instanceof e.Collection && (i[o] = i[o].raw());
            return i;
        },
        toJSON: function() {
            return e.json.stringify(this.raw());
        },
        getUrl: function() {
            var e = this.primaryKey, t = this.get(e), n = this.urlRoot + "/" + this.url;
            return t && (n += "/" + t), n;
        },
        commit: function(t) {
            var n = t ? e.clone(t) : {};
            n.success = e.bindSafely(this, "didCommit", this, t), n.fail = e.bindSafely(this, "didFail", "commit", this, t), 
            this.store.commitRecord(this, n);
        },
        fetch: function(t) {
            var n = t ? e.clone(t) : {};
            n.success = e.bindSafely(this, "didFetch", this, t), n.fail = e.bindSafely(this, "didFail", "fetch", this, t), 
            this.store.fetchRecord(this, n);
        },
        destroy: function(t) {
            if (this.readOnly || this.isNew) return this.destroyLocal();
            var n = t ? e.clone(t) : {};
            n.success = e.bindSafely(this, "didDestroy", this, t), n.fail = e.bindSafely(this, "didFail", "destroy", this, t), 
            this.store.destroyRecord(this, n);
        },
        destroyLocal: function() {
            var t = {};
            t.success = e.bindSafely(this, "didDestroy", this), this.store.destroyRecordLocal(this, t);
        },
        parse: function(e) {
            return e;
        },
        didFetch: function(e, t, n) {
            var i = this.parse(n);
            i && this.setObject(i), this.dirty = !1, this.isNew = !1, t && t.success && t.success(e, t, n);
        },
        didCommit: function(e, t, n) {
            var i = this.parse(n);
            i && this.setObject(i), this.dirty = !1, this.isNew = !1, t && t.success && t.success(e, t, n);
        },
        didDestroy: function(t, n, i) {
            for (var o in this.attributes) (this.attributes[o] instanceof e.Model || this.attributes[o] instanceof e.Collection) && this.attributes[o].owner === this && this.attributes[o].destroy();
            this.triggerEvent("destroy"), this.store._recordDestroyed(this), this.previous = null, 
            this.changed = null, this.defaults = null, this.includeKeys = null, this.mergeKeys = null, 
            this.store = null, this.destroyed = !0, this.removeAllObservers(), this.removeAllListeners(), 
            n && n.success && n.success(t, n, i);
        },
        didFail: function(e, t, n, i) {
            n && n.fail && n.fail(t, n, i);
        },
        storeChanged: function() {
            var t = this.store || e.store;
            t && e.isString(t) && (t = e.getPath(t), t || e.warn("enyo.Model: could not find the requested store -> ", this.store, ", usingthe default store")), 
            t = this.store = t || e.store, t.addRecord(this);
        },
        _attributeSpy: function() {
            var e = this.primaryKey, t = arguments[2];
            e == t && this.store._recordKeyChanged(this, this.previous[this.primaryKey]);
        },
        observers: {
            _attributeSpy: "*"
        }
    }), e.Model.concat = function(t, n) {
        var i = t.prototype || t;
        n.attributes && (i.attributes = i.attributes ? e.mixin(e.clone(i.attributes), n.attributes) : n.attributes, 
        delete n.attributes), n.defaults && (i.defaults = i.defaults ? e.mixin(e.clone(i.defaults), n.defaults) : n.defaults, 
        delete n.defaults), n.mergeKeys && (i.mergeKeys = i.mergeKeys ? e.merge(i.mergeKeys, n.mergeKeys) : n.mergeKeys.slice(), 
        delete n.mergeKeys);
    };
})(enyo);

// ../source/data/RelationalModel.js
(function(e) {
    e.kind({
        name: "enyo.RelationalModel",
        kind: "enyo.Model"
    });
})(enyo);

// ../source/data/Collection.js
enyo.kind({
    name: "enyo.Collection",
    kind: enyo.Component,
    noDefer: !0,
    mixins: [ enyo.RegisteredEventSupport ],
    model: enyo.Model,
    url: "",
    instanceAllRecords: !1,
    defaultSource: "ajax",
    records: null,
    filtered: !1,
    filters: null,
    filterProps: "",
    activeFilter: "",
    preserveRecords: !1,
    store: null,
    length: 0,
    isFetching: !1,
    fetch: function(e) {
        this.filtered && this.reset();
        var t = e ? enyo.clone(e) : {};
        (e = e || {}) && (e.strategy = e.strategy || "add"), t.success = enyo.bindSafely(this, "didFetch", this, e), 
        t.fail = enyo.bindSafely(this, "didFail", "fetch", this, e), this.set("isFetching", !0), 
        enyo.asyncMethod(this, function() {
            this.store.fetchRecord(this, t);
        });
    },
    fetchAndReplace: function(e) {
        var t = e || {};
        return t.replace = !0, this.fetch(t);
    },
    fetchAndDestroy: function(e) {
        var t = e || {};
        return t.destroy = !0, this.fetch(t);
    },
    fetchAndDestroyLocal: function(e) {
        var t = e || {};
        return t.destroyLocal = !0, this.fetch(t);
    },
    didFetch: function(e, t, n) {
        t.replace && !t.destroy ? this.removeAll() : t.destroy && !t.destroyLocal ? this.destroyAll() : t.destroyLocal && this.destroyAllLocal();
        var i, o = this.parse(n), r = t.strategy;
        if (o) {
            for (var s, a = 0; s = o[a]; ++a) s && (s.isNew = !1);
            (i = this[r]) && enyo.isFunction(i) && i.call(this, o);
        }
        t && t.success && t.success(e, t, n), this.set("isFetching", !1);
    },
    didFail: function(e, t, n, i) {
        n && n.fail && n.fail(t, n, i), this.set("isFetching", !1);
    },
    parse: function(e) {
        return e;
    },
    raw: function() {
        return this.map(function(e) {
            return e.raw();
        });
    },
    toJSON: function() {
        return enyo.json.stringify(this.raw());
    },
    merge: function(e) {
        if (e) {
            var t = this.model.prototype, n = t.primaryKey, i = t.mergeKeys, o = [], r = this.records.slice(), s = !1, a = !1;
            e = enyo.isArray(e) ? e : [ e ];
            for (var c, u = 0; c = e[u]; ++u) {
                s = !1;
                var h = c.get ? c.get(n) : c[n];
                if (i || null !== h && void 0 !== h) {
                    for (var l, d = 0; !s && (l = r[d]); ++d) if (null !== h && void 0 !== h && h === (l.get ? l.get(n) : l[n])) s = !0, 
                    r.splice(d, 1); else if (i) {
                        a = !1;
                        for (var f, p = 0; f = i[p]; ++p) {
                            if (h = c.get ? c.get(f) : c[f], h !== (l.get ? l.get(f) : l[f])) {
                                a = !1;
                                break;
                            }
                            a = !0;
                        }
                        a && (s = !0, r.splice(d, 1));
                    }
                    s ? l.setObject ? l.setObject(c.raw ? c.raw() : l.parse(c)) : enyo.mixin(l, c.raw ? c.raw() : c) : o.push(c);
                } else o.push(c);
            }
            o.length && this.add(o);
        }
    },
    add: function(e, t) {
        this.filtered && this.reset();
        var n = this.records, i = [], o = this.length;
        if (t = null === t || isNaN(t) ? o : Math.max(0, Math.min(o, t)), e = enyo.isArray(e) ? e : [ e ], 
        !e.length) return i;
        for (var r, s = 0; r = e[s]; ++s) {
            if (r instanceof enyo.Model) {
                if (r.destroyed) throw "enyo.Collection.add: cannot add a record that has already been destroyed";
                r.addListener("change", this._recordChanged), r.addListener("destroy", this._recordDestroyed);
            } else this.instanceAllRecords && (e[s] = this.createRecord(r, null, !1));
            i.push(s + t);
        }
        return e.unshift.apply(e, [ t, 0 ]), n.splice.apply(n, e), e.splice(0, 2), this.length = n.length, 
        o !== this.length && this.notifyObservers("length", o, this.length), i.length && this.triggerEvent("add", {
            records: i
        }), i;
    },
    remove: function(e) {
        this.filtered && this.reset();
        var t, n, i = [], o = {}, r = this.length;
        e = enyo.isArray(e) && e || [ e ];
        for (var s, a, c, u = 0; s = e[u]; ++u) if ((a = this.indexOf(s)) > -1) {
            if (void 0 === n || n >= a) n = a, i.unshift(a); else if (void 0 === t || a >= t) t = a, 
            i.push(a); else if (t !== a && n !== a) {
                for (c = 0; a > i[c]; ) ++c;
                i.splice(c, 0, a);
            }
            o[a] = s;
        }
        for (u = i.length - 1; !isNaN(a = i[u]); --u) this.records.splice(a, 1), o[a] instanceof this.model && (o[a].removeListener("change", this._recordChanged), 
        o[a].removeListener("destroy", this._recordDestroyed));
        return this.length = this.records.length, r != this.length && this.notifyObservers("length", r, this.length), 
        i.length && this.triggerEvent("remove", {
            records: o
        }), o;
    },
    reset: function(e) {
        var t, n = !1;
        if (!e && this.filtered) {
            var i = this._uRecords;
            t = this.records.length, this._uRecords = this.records, this._uRecords = null, this.records = i, 
            this.length = this.records.length, this.filtered = !1, n = !0;
        } else e && enyo.isArray(e) && (this.filtering && (this.filtered || (this._uRecords = this.records.slice())), 
        t = this.records.length, this.records = e.slice(), this.length = this.records.length, 
        n = !0);
        return n && (t !== this.length && this.notifyObservers("length", t, this.length), 
        this.triggerEvent("reset", {
            records: this.records
        })), this;
    },
    clearFilter: function() {
        return this.activeFilter ? this.set("activeFilter", "") : this;
    },
    removeAll: function() {
        return this.reset().remove(this.records);
    },
    destroyAll: function(e) {
        var t, n = this.removeAll(), i = e === !0 ? "destroyLocal" : "destroy";
        this._destroyAll = !0;
        for (var o in n) t = n[o], t && t instanceof enyo.Model && t[i]();
        this._destroyAll = !1;
    },
    destroyAllLocal: function() {
        this.destroyAll(!0);
    },
    indexOf: function(e, t) {
        return enyo.indexOf(e, this.records, t);
    },
    map: function(e, t) {
        t = t || this;
        for (var n, i = [], o = 0, r = this.length; r > o && (n = this.at(o)); ++o) i.push(e.call(t, n, o));
        return i;
    },
    filter: function(e, t) {
        var n = [];
        if (e) {
            t = t || this;
            for (var i, o = 0, r = this.length; r > o && (i = this.at(o)); ++o) e.call(t, i, o) && n.push(i);
        } else this._activeFilterChanged(), n = this.records.slice();
        return n;
    },
    at: function(e) {
        var t = this.records[e];
        return !t || t instanceof this.model || (t = this.records[e] = this.createRecord(t, null, !1)), 
        t;
    },
    createRecord: function(e, t, n) {
        var i, o = {
            owner: this
        };
        return e && e.isNew === !1 && ((t || o).isNew = !1, delete e.isNew), i = this.store.createRecord(this.model, e, t ? enyo.mixin(o, t) : o), 
        n = !1 === n ? -1 : null !== n && n >= 0 ? n : this.length, i.addListener("change", this._recordChanged), 
        i.addListener("destroy", this._recordDestroyed), n >= 0 && this.add(i, n), i;
    },
    recordChanged: null,
    constructor: enyo.inherit(function(e) {
        return function(t, n) {
            var i = enyo.isArray(t) ? t.slice() : null, o = n || (t && !i ? t : null);
            o && this.importProps(o), this.records = (this.records || []).concat(i ? this.parse(i) : []), 
            this.length = this.records.length, this._recordChanged = enyo.bindSafely(this, this._recordChanged), 
            this._recordDestroyed = enyo.bindSafely(this, this._recordDestroyed), this.euid = enyo.uuid();
            var r = this.model;
            if (this.model = r && enyo.isString(r) ? enyo.getPath(r) : enyo.checkConstructor(r), 
            this.storeChanged(), this.filters = this.filters || {}, this.filterProps.length) for (var s, a = enyo.bindSafely(this, function() {
                this.triggerEvent("filter");
            }), c = 0, u = this.filterProps.split(" "); s = u[c]; ++c) this.addObserver(s, a);
            this.addListener("filter", this._filterContent, this), this.addObserver("activeFilter", this._activeFilterChanged, this), 
            t = n = void 0, e.apply(this, arguments);
        };
    }),
    destroy: enyo.inherit(function(e) {
        return function() {
            var t, n = this.removeAll();
            for (var i in n) t = n[i], t.owner === this && (this.preserveRecords ? t.owner = null : t.destroy());
            this.triggerEvent("destroy"), this.store = null, this.removeAllListeners(), e.apply(this, arguments);
        };
    }),
    importProps: function(e) {
        e && (e.records && (this.records = this.records ? this.records.concat(e.records) : e.records, 
        delete e.records), enyo.kind.statics.extend(e, this));
    },
    storeChanged: function() {
        var e = this.store || enyo.store;
        e && enyo.isString(e) && (e = enyo.getPath(e), e || enyo.warn("enyo.Collection: could not find the requested store -> ", this.store, ", usingthe default store")), 
        e = this.store = e || enyo.store, e.addCollection(this);
    },
    _activeFilterChanged: function() {
        var e = this.activeFilter, t = this.filters;
        e && t && t[e] ? this.triggerEvent("filter") : this.reset();
    },
    _filterContent: function() {
        if (!this.filtering && (this.length || this._uRecords && this._uRecords.length)) {
            var e = this.filters[this.activeFilter];
            if (e && this[e]) {
                this.filtering = !0, this.silence();
                var t = this[e]();
                this.unsilence(), t && this.reset(!0 === t ? void 0 : t), this.filtering = !1, this._uRecords && this._uRecords.length && (this.filtered = !0);
            }
        }
    },
    _recordChanged: function(e, t, n) {
        this.recordChanged && this.recordChanged(e, t, n);
    },
    _recordDestroyed: function(e) {
        this._destroyAll || this.remove(e);
    }
}), enyo.Collection.concat = function(e, t) {
    var n = e.prototype || e;
    t.filters && n.filters && (n.filters = enyo.mixin(enyo.clone(n.filters), t.filters), 
    delete t.filters), t.filterProps && (enyo.isArray(t.filterProps) && (t.filterProps = t.filterProps.join(" ")), 
    n.filterProps && (n.filterProps += " " + t.filterProps, delete t.filterProps));
};

// ../source/data/ModelController.js
enyo.kind({
    name: "enyo.ModelController",
    kind: enyo.Controller,
    model: null,
    get: function(e) {
        return "model" == e ? this.getLocal(e) : this._isComputed(e) ? this._getComputed(e) : this.model ? this.model.get.apply(this.model, arguments) : null;
    },
    getLocal: function() {
        return enyo.getPath.apply(this, arguments);
    },
    set: function(e, t) {
        return "model" == e ? this.setLocal(e, t) : this.model ? this.model.set.apply(this.model, arguments) : void 0;
    },
    setLocal: function() {
        return enyo.setPath.apply(this, arguments);
    },
    sync: function(e) {
        var t = this.model, n = e || this.model && this.model.attributes;
        for (var i in n) this.notifyObservers(i, t ? t.previous[i] : n[i], t ? this.model.get(i) : null);
    },
    modelChanged: function(e, t) {
        var n = e, i = t;
        n && (n.removeListener("change", this._modelChanged), n.removeListener("destroy", this._modelDestroyed), 
        i || this.sync(n.attributes)), i && (i.addListener("change", this._modelChanged), 
        i.addListener("destroy", this._modelDestroyed), this.sync());
    },
    create: enyo.inherit(function(e) {
        return function() {
            e.apply(this, arguments), this.model && this.notifyObservers("model", null, this.model);
        };
    }),
    constructor: enyo.inherit(function(e) {
        return function() {
            e.apply(this, arguments), this._modelChanged = this.bindSafely("_modelChanged");
        };
    }),
    _modelChanged: function(e) {
        var t = e.changed;
        for (var n in t) this.notifyObservers(n, e.previous[n], t[n]);
    },
    _modelDestroyed: function(e) {
        e === this.model && this.setLocal("model", null);
    }
});

enyo.requiresWindow = function(inFunction) {
	inFunction();
};

enyo.dom = {
	/**
		Shortcut for _document.getElementById_ if _id_ is a string, otherwise returns _id_.
		Uses _window.document_ unless a document is specified in the (optional) _doc_
		parameter.

			// find 'node' if it's a string id, or return it unchanged if it's already a node reference
			var domNode = enyo.dom.byId(node);
	*/
	byId: function(id, doc){
		return (typeof id == "string") ? (doc || document).getElementById(id) : id;
	},
	/**
		return string with ampersand, less-than, and greater-than characters
		replaced with HTML entities, e.g.

			'&lt;code&gt;"This &amp; That"&lt;/code&gt;'

		becomes

			'&amp;lt;code&amp;gt;"This &amp;amp; That"&amp;lt;/code&amp;gt;'
	*/
	escape: function(inText) {
		return inText !== null ? String(inText).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
	},
	/**
		Returns an object describing the geometry of this node, like so:

			{left: _offsetLeft_, top: _offsetTop_, width: _offsetWidth_, height: _offsetHeight_}
	*/
	getBounds: function(n) {
		if (n) {
			return {left: n.offsetLeft, top: n.offsetTop, width: n.offsetWidth, height: n.offsetHeight};
		}
		else {
			return null;
		}
	},
	//* @protected
	// this is designed to be copied into the computedStyle object
	_ie8GetComputedStyle: function(prop) {
		var re = /(\-([a-z]){1})/g;
		if (prop === 'float') {
			prop = 'styleFloat';
		} else if (re.test(prop)) {
			prop = prop.replace(re, function () {
				return arguments[2].toUpperCase();
			});
		}
		return this[prop] !== undefined ? this[prop] : null;
	},
	getComputedStyle: function(inNode) {
		if(enyo.platform.ie < 9 && inNode && inNode.currentStyle) {
			//simple window.getComputedStyle polyfill for IE8
			var computedStyle = enyo.clone(inNode.currentStyle);
			computedStyle.getPropertyValue = this._ie8GetComputedStyle;
			computedStyle.setProperty = function() {
				return inNode.currentStyle.setExpression.apply(inNode.currentStyle, arguments);
			};
			computedStyle.removeProperty = function() {
				return inNode.currentStyle.removeAttribute.apply(inNode.currentStyle, arguments);
			};
			return computedStyle;
		} else {
			return window.getComputedStyle && inNode && window.getComputedStyle(inNode, null);
		}
	},
	getComputedStyleValue: function(inNode, inProperty, inComputedStyle) {
		var s   = inComputedStyle || this.getComputedStyle(inNode),
			nIE = enyo.platform.ie;

		s = s ? s.getPropertyValue(inProperty) : null;

		if (nIE) {
			var oConversion = {
				'thin'   : (nIE > 8 ? 2 : 1) + 'px',
				'medium' : (nIE > 8 ? 4 : 3) + 'px',
				'thick'  : (nIE > 8 ? 6 : 5) + 'px',
				'none'   : '0'
			};
			if (typeof oConversion[s] != 'undefined') {
				s = oConversion[s];
			}

			if (s == 'auto') {
				switch (inProperty) {
				case 'width':
					s = inNode.offsetWidth;
					break;
				case 'height':
					s = inNode.offsetHeight;
					break;
				}
			}
		}

		return s;
	},
	getFirstElementByTagName: function(inTagName) {
		var e = document.getElementsByTagName(inTagName);
		return e && e[0];
	},
	applyBodyFit: function() {
		var h = this.getFirstElementByTagName("html");
		if (h) {
			this.addClass(h, "enyo-document-fit");
		}
		enyo.dom.addBodyClass("enyo-body-fit");
		enyo.bodyIsFitting = true;
	},
	getWindowWidth: function() {
		if (window.innerWidth) {
			return window.innerWidth;
		}
		if (document.body && document.body.offsetWidth) {
			return document.body.offsetWidth;
		}
		if (document.compatMode=='CSS1Compat' &&
			document.documentElement &&
			document.documentElement.offsetWidth ) {
			return document.documentElement.offsetWidth;
		}
		return 320;
	},
	getWindowHeight: function() {
		if (window.innerHeight) {
			return window.innerHeight;
		}
		if (document.body && document.body.offsetHeight) {
			return document.body.offsetHeight;
		}
		if (document.compatMode=='CSS1Compat' &&
			document.documentElement &&
			document.documentElement.offsetHeight ) {
			return document.documentElement.offsetHeight;
		}
		return 480;
	},
	// Workaround for lack of compareDocumentPosition support in IE8
	// Code MIT Licensed, John Resig; source: http://ejohn.org/blog/comparing-document-position/
	compareDocumentPosition: function(a, b) {
		return a.compareDocumentPosition ?
		a.compareDocumentPosition(b) :
		a.contains ?
			(a != b && a.contains(b) && 16) +
			(a != b && b.contains(a) && 8) +
			(a.sourceIndex >= 0 && b.sourceIndex >= 0 ?
				(a.sourceIndex < b.sourceIndex && 4) +
				(a.sourceIndex > b.sourceIndex && 2) :
				1) +
			0 :
			0;
	},
	// moved from FittableLayout.js into common protected code
	_ieCssToPixelValue: function(inNode, inValue) {
		var v = inValue;
		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
		var s = inNode.style;
		// store style and runtime style values
		var l = s.left;
		var rl = inNode.runtimeStyle && inNode.runtimeStyle.left;
		// then put current style in runtime style.
		if (rl) {
			inNode.runtimeStyle.left = inNode.currentStyle.left;
		}
		// apply given value and measure its pixel value
		s.left = v;
		v = s.pixelLeft;
		// finally restore previous state
		s.left = l;
		if (rl) {
			s.runtimeStyle.left = rl;
		}
		return v;
	},
	_pxMatch: /px/i,
	getComputedBoxValue: function(inNode, inProp, inBoundary, inComputedStyle) {
		var s = inComputedStyle || this.getComputedStyle(inNode);
		if (s && (!enyo.platform.ie || enyo.platform.ie >= 9)) {
			var p = s.getPropertyValue(inProp + "-" + inBoundary);
			return p === "auto" ? 0 : parseInt(p, 10);
		} else if (inNode && inNode.currentStyle) {
			var v = inNode.currentStyle[inProp + enyo.cap(inBoundary)];
			if (!v.match(this._pxMatch)) {
				v = this._ieCssToPixelValue(inNode, v);
			}
			return parseInt(v, 0);
		}
		return 0;
	},
	//* @public
	//* Gets the boundaries of a node's margin or padding box.
	calcBoxExtents: function(inNode, inBox) {
		var s = this.getComputedStyle(inNode);
		return {
			top: this.getComputedBoxValue(inNode, inBox, "top", s),
			right: this.getComputedBoxValue(inNode, inBox, "right", s),
			bottom: this.getComputedBoxValue(inNode, inBox, "bottom", s),
			left: this.getComputedBoxValue(inNode, inBox, "left", s)
		};
	},
	//* Gets the calculated padding of a node.
	calcPaddingExtents: function(inNode) {
		return this.calcBoxExtents(inNode, "padding");
	},
	//* Gets the calculated margin of a node.
	calcMarginExtents: function(inNode) {
		return this.calcBoxExtents(inNode, "margin");
	},
	/**
		Returns an object like `{top: 0, left: 0, bottom: 100, right: 100, height: 10, width: 10}`
		that represents the object's position relative to `relativeToNode` (suitable for absolute
		positioning within that parent node). Negative values mean part of the object is not visible.
		If you leave `relativeToNode` undefined (or it is not a parent element), then the position
		will be relative to the viewport and suitable for absolute positioning in a floating layer.
	*/
	calcNodePosition: function(inNode, relativeToNode) {
		// Parse upward and grab our positioning relative to the viewport
		var top = 0,
			left = 0,
			node = inNode,
			width = node.offsetWidth,
			height = node.offsetHeight,
			transformProp = enyo.dom.getStyleTransformProp(),
			xregex = /translateX\((-?\d+)px\)/i,
			yregex = /translateY\((-?\d+)px\)/i,
			borderLeft = 0, borderTop = 0,
			totalHeight = 0, totalWidth = 0,
			offsetAdjustLeft = 0, offsetAdjustTop = 0;

		if (relativeToNode) {
			totalHeight = relativeToNode.offsetHeight;
			totalWidth = relativeToNode.offsetWidth;
		} else {
			totalHeight = (document.body.parentNode.offsetHeight > this.getWindowHeight() ? this.getWindowHeight() - document.body.parentNode.scrollTop : document.body.parentNode.offsetHeight);
			totalWidth = (document.body.parentNode.offsetWidth > this.getWindowWidth() ? this.getWindowWidth() - document.body.parentNode.scrollLeft : document.body.parentNode.offsetWidth);
		}

		if (node.offsetParent) {
			do {
				// Adjust the offset if relativeToNode is a child of the offsetParent
				// For IE 8 compatibility, have to use integer 8 instead of Node.DOCUMENT_POSITION_CONTAINS
				if (relativeToNode && this.compareDocumentPosition(relativeToNode, node.offsetParent) & 8) {
					offsetAdjustLeft = relativeToNode.offsetLeft;
					offsetAdjustTop = relativeToNode.offsetTop;
				}
				// Ajust our top and left properties based on the position relative to the parent
				left += node.offsetLeft - (node.offsetParent ? node.offsetParent.scrollLeft : 0) - offsetAdjustLeft;
				if (transformProp && xregex.test(node.style[transformProp])) {
					left += parseInt(node.style[transformProp].replace(xregex, '$1'), 10);
				}
				top += node.offsetTop - (node.offsetParent ? node.offsetParent.scrollTop : 0) - offsetAdjustTop;
				if (transformProp && yregex.test(node.style[transformProp])) {
					top += parseInt(node.style[transformProp].replace(yregex, '$1'), 10);
				}
				// Need to correct for borders if any exist on parent elements
				if (node !== inNode) {
					if (node.currentStyle) {
						// Oh IE, we do so love working around your incompatibilities
						borderLeft = parseInt(node.currentStyle.borderLeftWidth, 10);
						borderTop = parseInt(node.currentStyle.borderTopWidth, 10);
					} else if (window.getComputedStyle) {
						borderLeft = parseInt(window.getComputedStyle(node, '').getPropertyValue('border-left-width'), 10);
						borderTop = parseInt(window.getComputedStyle(node, '').getPropertyValue('border-top-width'), 10);
					} else {
						// No computed style options, so try the normal style object (much less robust)
						borderLeft = parseInt(node.style.borderLeftWidth, 10);
						borderTop = parseInt(node.style.borderTopWidth, 10);
					}
					if (borderLeft) {
						left += borderLeft;
					}
					if (borderTop) {
						top += borderTop;
					}
				}
				// Continue if we have an additional offsetParent, and either don't have a relativeToNode or the offsetParent is contained by the relativeToNode (if offsetParent contains relativeToNode, then we have already calculated up to the node, and can safely exit)
				// For IE 8 compatibility, have to use integer 16 instead of Node.DOCUMENT_POSITION_CONTAINED_BY
			} while ((node = node.offsetParent) && (!relativeToNode || this.compareDocumentPosition(relativeToNode, node) & 16));
		}
		return {
			'top': top,
			'left': left,
			'bottom': totalHeight - top - height,
			'right': totalWidth - left - width,
			'height': height,
			'width': width
		};
	},
	setInnerHtml: function(node, html) {
		node.innerHTML = html;
	},
	//* check a DOM node for a specific CSS class
	hasClass: function(node, s) {
		if (!node || !node.className) { return; }
		return (' ' + node.className + ' ').indexOf(' ' + s + ' ') >= 0;
	},
	//* uniquely add a CSS class to a DOM node
	addClass: function(node, s) {
		if (node && !this.hasClass(node, s)) {
			var ss = node.className;
			node.className = (ss + (ss ? ' ' : '') + s);
		}
	},
	//* remove a CSS class from a DOM node if it exists
	removeClass: function(node, s) {
		if (node && this.hasClass(node, s)) {
			var ss = node.className;
			node.className = (' ' + ss + ' ').replace(' ' + s + ' ', ' ').slice(1, -1);
		}
	},
	//*@public
	//* add a class to document.body. This defers the actual class change
	//* if nothing has been rendered into body yet.
	addBodyClass: function(s) {
		if (!enyo.exists(enyo.roots)) {
			if (enyo.dom._bodyClasses) {
				enyo.dom._bodyClasses.push(s);
			} else {
				enyo.dom._bodyClasses = [s];
			}
		}
		else {
			enyo.dom.addClass(document.body, s);
		}
	},
	/**
		Returns an object describing the absolute position on the screen, relative to the top
		left point on the screen.  This function takes into account account absolute/relative 
		offsetParent positioning, scroll position, and CSS transforms (currently translateX, 
		translateY, and matrix3d). 

			{left: ..., top: ..., bottom: ..., right: ..., width: ..., height: ...}

		Values returned are only valid if _hasNode()_ is truthy.
		If there's no DOM node for the object, this returns a bounds structure with
		_undefined_ as the value of all fields.
	*/
	getAbsoluteBounds: function(inNode) {
		var node           = inNode,
			left           = 0,
			top            = 0,
			width          = node.offsetWidth,
			height         = node.offsetHeight,
			transformProp  = enyo.dom.getStyleTransformProp(),
			xRegEx         = /translateX\((-?\d+|-?\d*\.\d+)px\)/i,
			yRegEx         = /translateY\((-?\d+|-?\d*\.\d+)px\)/i,
			m3RegEx        = /(?!matrix3d\()(-?\d+|-?\d*\.\d+)(?=[,\)])/g,
			match          = null,
			style          = null,
			offsetParent   = null;

		while (node) {
			// Add offset from any new offset parent encountered
			if (node.offsetParent != offsetParent) {
				// Fix for FF (GF-2036), offsetParent is working differently between FF and chrome
				if (enyo.platform.firefox) {
					left += node.offsetLeft;
					top  += node.offsetTop;
				} else {
					left += node.offsetLeft - (node.offsetParent ? node.offsetParent.scrollLeft : 0);
					top  += node.offsetTop  - (node.offsetParent ? node.offsetParent.scrollTop  : 0);
				}
				offsetParent = node.offsetParent;
			}
			// Add offset from transforms
			if (transformProp && node.style) {
				style = node.style[transformProp];
				// translateX
				match = style.match(xRegEx);
				if (match && typeof match[1] != 'undefined' && match[1]) {
					left += parseInt(match[1], 10);
				}
				// translateY
				match = style.match(yRegEx);
				if (match && typeof match[1] != 'undefined' && match[1]) {
					top += parseInt(match[1], 10);
				}
				// matrix3D 
				// ex) matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -5122.682003906055, 1, 1)
				match = style.match(m3RegEx);
				if (match && match.length === 16) {
					if (typeof match[12] != 'undefined' && match[12] !== "0") {
						left += parseFloat(match[12]);
					}
					if (typeof match[13] != 'undefined' && match[13] !== "0") {
						top += parseFloat(match[13]);
					}
				}
			}
			node = node.parentNode;
		}
		return {
			top     : inNode ? top : undefined,
			left    : inNode ? left : undefined,
			bottom  : inNode ? document.body.offsetHeight - top  - height : undefined,
			right   : inNode ? document.body.offsetWidth  - left - width : undefined,
			height  : height,
			width   : width
		};
	},
	//*@protected
	flushBodyClasses: function() {
		if (enyo.dom._bodyClasses) {
			for (var i = 0, c; (c=enyo.dom._bodyClasses[i]); ++i) {
				enyo.dom.addClass(document.body, c);
			}
			enyo.dom._bodyClasses = null;
		}
	},
	//*@protected
	_bodyClasses: null
};

// override setInnerHtml for Windows 8 HTML applications
if (typeof window.MSApp !== "undefined") {
	enyo.dom.setInnerHtml = function(node, html) {
		window.MSApp.execUnsafeLocalFunction(function() {
			node.innerHTML = html;
		});
	};
}

// use faster classList interface if it exists
if (document.head && document.head.classList) {
	enyo.dom.hasClass = function(node, s) {
		if (node) {
			return node.classList.contains(s);
		}
	};
	enyo.dom.addClass = function(node, s) {
		if (node) {
			return node.classList.add(s);
		}
	};
	enyo.dom.removeClass = function (node, s) {
		if (node) {
			return node.classList.remove(s);
		}
	};
}

// ../source/dom/transform.js
(function() {
    enyo.dom.calcCanAccelerate = function() {
        if (2 >= enyo.platform.android) return !1;
        for (var e, t = [ "perspective", "WebkitPerspective", "MozPerspective", "msPerspective", "OPerspective" ], n = 0; e = t[n]; n++) if (document.body.style[e] !== void 0) return !0;
        return !1;
    };
    var e = [ "transform", "-webkit-transform", "-moz-transform", "-ms-transform", "-o-transform" ], t = [ "transform", "webkitTransform", "MozTransform", "msTransform", "OTransform" ];
    enyo.dom.getCssTransformProp = function() {
        if (this._cssTransformProp) return this._cssTransformProp;
        var n = enyo.indexOf(this.getStyleTransformProp(), t);
        return this._cssTransformProp = e[n], this._cssTransformProp;
    }, enyo.dom.getStyleTransformProp = function() {
        if (this._styleTransformProp || !document.body) return this._styleTransformProp;
        for (var e, n = 0; e = t[n]; n++) if (document.body.style[e] !== void 0) return this._styleTransformProp = e, 
        this._styleTransformProp;
    }, enyo.dom.domTransformsToCss = function(e) {
        var t, n, i = "";
        for (t in e) n = e[t], null !== n && void 0 !== n && "" !== n && (i += t + "(" + n + ") ");
        return i;
    }, enyo.dom.transformsToDom = function(e) {
        var t = this.domTransformsToCss(e.domTransforms), n = e.hasNode() ? e.node.style : null, i = e.domStyles, o = this.getStyleTransformProp(), r = this.getCssTransformProp();
        o && r && (i[r] = t, n ? (n[o] = t, e.invalidateStyles()) : e.domStylesChanged());
    }, enyo.dom.canTransform = function() {
        return Boolean(this.getStyleTransformProp());
    }, enyo.dom.canAccelerate = function() {
        return void 0 !== this.accelerando ? this.accelerando : document.body && (this.accelerando = this.calcCanAccelerate());
    }, enyo.dom.transform = function(e, t) {
        var n = e.domTransforms = e.domTransforms || {};
        enyo.mixin(n, t), this.transformsToDom(e);
    }, enyo.dom.transformValue = function(e, t, n) {
        var i = e.domTransforms = e.domTransforms || {};
        i[t] = n, this.transformsToDom(e);
    }, enyo.dom.accelerate = function(e, t) {
        var n = "auto" == t ? this.canAccelerate() : t;
        this.transformValue(e, "translateZ", n ? 0 : null);
    };
})();

// ../source/dom/Control.js
enyo.kind({
    name: "enyo.Control",
    kind: "enyo.UiComponent",
    published: {
        tag: "div",
        attributes: null,
        classes: "",
        style: "",
        content: "",
        showing: !0,
        allowHtml: !1,
        src: "",
        canGenerate: !0,
        fit: null,
        isContainer: !1
    },
    rtl: !1,
    handlers: {
        ontap: "tap",
        onShowingChanged: "showingChangedHandler"
    },
    _isView: !0,
    _needsRender: !0,
    noDefer: !0,
    defaultKind: "Control",
    controlClasses: "",
    node: null,
    generated: !1,
    kindStyle: "",
    create: enyo.inherit(function(e) {
        return function() {
            null == this.tag && (this._needsRender = !1), this.initStyles(), e.apply(this, arguments), 
            this.showingChanged(), this.kindClasses && this.addClass(this.kindClasses), this.classes && this.addClass(this.classes), 
            this.initProps([ "id", "content", "src" ]);
        };
    }),
    constructor: enyo.inherit(function(e) {
        return function() {
            this.attributes = enyo.clone(this.ctor.prototype.attributes), e.apply(this, arguments);
        };
    }),
    destroy: enyo.inherit(function(e) {
        return function() {
            this.removeFromRoots(), this.removeNodeFromDom(), enyo.Control.unregisterDomEvents(this.id), 
            e.apply(this, arguments);
        };
    }),
    initProps: function(e) {
        for (var t, n, i = 0; t = e[i]; i++) this[t] && (n = t + "Changed", this[n] && this[n]());
    },
    dispatchEvent: enyo.inherit(function(e) {
        return function(t, n) {
            return this.strictlyInternalEvents[t] && this.isInternalEvent(n) ? !0 : e.apply(this, arguments);
        };
    }),
    classesChanged: function(e) {
        this.removeClass(e), this.addClass(this.classes);
    },
    addChild: enyo.inherit(function(e) {
        return function(t) {
            t.addClass(this.controlClasses), e.apply(this, arguments);
        };
    }),
    removeChild: enyo.inherit(function(e) {
        return function(t) {
            e.apply(this, arguments), t.removeClass(this.controlClasses);
        };
    }),
    strictlyInternalEvents: {
        onenter: 1,
        onleave: 1
    },
    isInternalEvent: function(e) {
        var t = enyo.dispatcher.findDispatchTarget(e.relatedTarget);
        return t && t.isDescendantOf(this);
    },
    hasNode: function() {
        return this.generated && (this.node || this.findNodeById());
    },
    addContent: function(e) {
        this.setContent(this.get("content") + e);
    },
    getAttribute: function(e) {
        var t = this.hasNode();
        return t ? t.getAttribute(e) : this.attributes[e];
    },
    setAttribute: function(e, t) {
        this.attributes[e] = t, this.hasNode() && this.attributeToNode(e, t), this.invalidateTags();
    },
    getNodeProperty: function(e, t) {
        var n = this.hasNode();
        return n ? n[e] : t;
    },
    setNodeProperty: function(e, t) {
        var n = this.hasNode();
        n && (n[e] = t);
    },
    setClassAttribute: function(e) {
        this.setAttribute("class", e);
    },
    getClassAttribute: function() {
        return this.attributes["class"] || "";
    },
    hasClass: function(e) {
        return e && (" " + this.getClassAttribute() + " ").indexOf(" " + e + " ") >= 0;
    },
    addClass: function(e) {
        if (e && !this.hasClass(e)) {
            var t = this.getClassAttribute();
            this.setClassAttribute(t + (t ? " " : "") + e);
        }
    },
    removeClass: function(e) {
        if (e && this.hasClass(e)) {
            var t = this.getClassAttribute();
            t = (" " + t + " ").replace(" " + e + " ", " ").slice(1, -1), this.setClassAttribute(t);
        }
    },
    addRemoveClass: function(e, t) {
        this[t ? "addClass" : "removeClass"](e);
    },
    initStyles: function() {
        this.domStyles = this.domStyles ? enyo.clone(this.domStyles) : {}, enyo.Control.cssTextToDomStyles(this.kindStyle + this.style, this.domStyles), 
        "none" == this.domStyles.display && (this.showing = !1, this.domStyles.display = "");
    },
    styleChanged: function() {
        this.domStyles = {}, enyo.Control.cssTextToDomStyles(this.kindStyle + this.style, this.domStyles), 
        this.domStylesChanged();
    },
    applyStyle: function(e, t) {
        this.domStyles[e] = t, this.domStylesChanged();
    },
    addStyles: function(e) {
        if (enyo.isObject(e)) for (var t in e) this.domStyles[t] = e[t]; else enyo.Control.cssTextToDomStyles(e, this.domStyles);
        this.domStylesChanged();
    },
    getComputedStyleValue: function(e, t) {
        return this.hasNode() ? enyo.dom.getComputedStyleValue(this.node, e) : t;
    },
    domStylesChanged: function() {
        this.invalidateStyles(), this.invalidateTags(), this.renderStyles();
    },
    stylesToNode: function() {
        this.node.style.cssText = this.getDomCssText();
    },
    setupBodyFitting: function() {
        enyo.dom.applyBodyFit(), this.addClass("enyo-fit enyo-clip");
    },
    setupOverflowScrolling: function() {
        enyo.platform.android || enyo.platform.androidChrome || enyo.platform.blackberry || enyo.dom.addBodyClass("webkitOverflowScrolling");
    },
    render: function() {
        if (this.parent) {
            if (this.parent.beforeChildRender(this), !this.parent.generated) return this;
            if (null === this.tag) return this.parent.render(), this;
        }
        return this.hasNode() || this.renderNode(), this.hasNode() && (this.renderDom(), 
        this.generated && this.rendered()), this;
    },
    renderInto: function(e) {
        this.teardownRender();
        var t = enyo.dom.byId(e), n = enyo.exists(this.fit) && this.fit === !1;
        return t != document.body || n ? this.fit && this.addClass("enyo-fit enyo-clip") : this.setupBodyFitting(), 
        this.addClass("enyo-no-touch-action"), this.setupOverflowScrolling(), enyo.dom._bodyClasses && enyo.dom.flushBodyClasses(), 
        enyo.dom.setInnerHtml(t, this.generateHtml()), enyo.addToRoots(this), this.generated && this.rendered(), 
        this;
    },
    write: function() {
        return enyo.dom._bodyClasses && enyo.dom.flushBodyClasses(), this.fit && this.setupBodyFitting(), 
        this.addClass("enyo-no-touch-action"), this.setupOverflowScrolling(), document.write(this.generateHtml()), 
        enyo.addToRoots(this), this.generated && this.rendered(), this;
    },
    rendered: function() {
        this.reflow();
        for (var e, t = 0; e = this.children[t]; t++) e.generated && e.rendered();
    },
    show: function() {
        this.setShowing(!0);
    },
    hide: function() {
        this.setShowing(!1);
    },
    focus: function() {
        this.hasNode() && this.node.focus();
    },
    blur: function() {
        this.hasNode() && this.node.blur();
    },
    hasFocus: function() {
        return this.hasNode() ? document.activeElement === this.node : void 0;
    },
    getBounds: function() {
        var e = this.node || this.hasNode(), t = enyo.dom.getBounds(e);
        return t || {
            left: void 0,
            top: void 0,
            width: void 0,
            height: void 0
        };
    },
    setBounds: function(e, t) {
        for (var n, i, o = this.domStyles, r = t || "px", s = [ "width", "height", "left", "top", "right", "bottom" ], a = 0; i = s[a]; a++) n = e[i], 
        (n || 0 === n) && (o[i] = n + (enyo.isString(n) ? "" : r));
        this.domStylesChanged();
    },
    getAbsoluteBounds: function() {
        var e = this.node || this.hasNode(), t = enyo.dom.getAbsoluteBounds(e);
        return t || {
            left: void 0,
            top: void 0,
            width: void 0,
            height: void 0,
            bottom: void 0,
            right: void 0
        };
    },
    getCssText: function() {
        var e = this.node || this.hasNode();
        return e ? e.style.cssText : void 0;
    },
    getCssClasses: function() {
        var e = this.node || this.hasNode();
        return e ? e.className : void 0;
    },
    findNodeById: function() {
        return this.id && (this.node = enyo.dom.byId(this.id));
    },
    idChanged: function(e) {
        e && enyo.Control.unregisterDomEvents(e), this.setAttribute("id", this.id), this.id && enyo.Control.registerDomEvents(this.id, this);
    },
    contentChanged: function() {
        this.hasNode() && this.renderContent(), this._needsRender = !0;
    },
    getSrc: function() {
        return this.getAttribute("src");
    },
    srcChanged: function() {
        this.src ? this.setAttribute("src", enyo.path.rewrite(this.src)) : this.setAttribute("src", "");
    },
    attributesChanged: function() {
        this.invalidateTags(), this.renderAttributes();
    },
    generateHtml: function() {
        if (this.canGenerate === !1) return "";
        var e = this.generateInnerHtml(), t = this.generateOuterHtml(e);
        return this.set("generated", !0), this._needsRender = !1, t;
    },
    generateInnerHtml: function() {
        return this.flow(), this.children.length ? this.generateChildHtml() : this.allowHtml ? this.get("content") : enyo.Control.escapeHtml(this.get("content"));
    },
    generateChildHtml: function() {
        for (var e, t = "", n = 0; e = this.children[n]; n++) {
            var i = e.generateHtml();
            t += i;
        }
        return t;
    },
    generateOuterHtml: function(e) {
        return this.tag ? (this.tagsValid || this.prepareTags(), this._openTag + e + this._closeTag) : e;
    },
    invalidateTags: function() {
        this.tagsValid = !1;
    },
    invalidateStyles: function() {
        this.stylesValid = !1;
    },
    getDomCssText: function() {
        return this.stylesValid || (this.domCssText = enyo.Control.domStylesToCssText(this.domStyles), 
        this.stylesValid = !0), this.domCssText;
    },
    prepareTags: function() {
        var e = this.getDomCssText();
        this._openTag = "<" + this.tag + (e ? ' style="' + e + '"' : "") + enyo.Control.attributesToHtml(this.attributes), 
        enyo.Control.selfClosing[this.tag] ? (this._openTag += "/>", this._closeTag = "") : (this._openTag += ">", 
        this._closeTag = "</" + this.tag + ">"), this.tagsValid = !0;
    },
    attributeToNode: function(e, t) {
        null === t || t === !1 || "" === t ? this.node.removeAttribute(e) : this.node.setAttribute(e, t);
    },
    attributesToNode: function() {
        for (var e in this.attributes) this.attributeToNode(e, this.attributes[e]);
    },
    getParentNode: function() {
        return this.parentNode || this.parent && (this.parent.hasNode() || this.parent.getParentNode());
    },
    addNodeToParent: function() {
        if (this.node) {
            var e = this.getParentNode();
            e && (void 0 !== this.addBefore ? this.insertNodeInParent(e, this.addBefore && this.addBefore.hasNode()) : this.appendNodeToParent(e));
        }
    },
    appendNodeToParent: function(e) {
        e.appendChild(this.node);
    },
    insertNodeInParent: function(e, t) {
        e.insertBefore(this.node, t || e.firstChild);
    },
    removeNodeFromDom: function() {
        this.hasNode() && this.node.parentNode && this.node.parentNode.removeChild(this.node);
    },
    teardownRender: function() {
        this.generated && this.teardownChildren(), this.node = null, this.set("generated", !1);
    },
    teardownChildren: function() {
        for (var e, t = 0; e = this.children[t]; t++) e.teardownRender();
    },
    renderNode: function() {
        this.teardownRender(), this.node = document.createElement(this.tag), this.addNodeToParent(), 
        this.set("generated", !0);
    },
    renderDom: function() {
        this.renderAttributes(), this.renderStyles(), this.renderContent();
    },
    renderContent: function() {
        this.generated && this.teardownChildren(), this.node && enyo.dom.setInnerHtml(this.node, this.generateInnerHtml());
    },
    renderReusingNode: function() {
        if (this.canGenerate) if (null === this.tag || this.generated) if (this.children.length) for (var e, t = 0; e = this.children[t]; ++t) e.renderReusingNode(); else this.generated && this.hasNode() && this._needsRender && (enyo.dom.setInnerHtml(this.node, this.generateInnerHtml()), 
        this._needsRender = !1); else this.render();
    },
    renderStyles: function() {
        this.hasNode() && this.stylesToNode();
    },
    renderAttributes: function() {
        this.hasNode() && this.attributesToNode();
    },
    beforeChildRender: function() {
        this.generated && this.flow();
    },
    syncDisplayToShowing: function() {
        var e = this.domStyles;
        this.showing ? "none" == e.display && this.applyStyle("display", this._displayStyle || "") : (this._displayStyle = "none" == e.display ? "" : e.display, 
        this.applyStyle("display", "none"));
    },
    showingChanged: function(e) {
        this.syncDisplayToShowing();
        var t = e === !0 || e === !1, n = this.parent;
        t && (n ? n.getAbsoluteShowing(!0) : !0) && this.waterfall("onShowingChanged", {
            originator: this,
            showing: this.getShowing()
        });
    },
    getShowing: function() {
        return this.showing;
    },
    getAbsoluteShowing: function(e) {
        var t;
        return e || (t = this.getBounds()), !this.generated || this.destroyed || !this.getShowing() || t && 0 === t.height && 0 === t.width ? !1 : this.parent && this.parent.getAbsoluteShowing ? this.parent.getAbsoluteShowing(e) : !0;
    },
    showingChangedHandler: function(e) {
        return e === this ? !1 : !this.getShowing();
    },
    fitChanged: function() {
        this.parent.reflow();
    },
    isFullscreen: function() {
        return this.hasNode() && this.hasNode() === enyo.fullscreen.getFullscreenElement();
    },
    requestFullscreen: function() {
        return this.hasNode() ? enyo.fullscreen.requestFullscreen(this) ? !0 : !1 : !1;
    },
    cancelFullscreen: function() {
        return this.isFullscreen() ? (enyo.fullscreen.cancelFullscreen(), !0) : !1;
    },
    removeFromRoots: function() {
        this._isRoot && enyo.remove(this, enyo.roots);
    },
    statics: {
        escapeHtml: function(e) {
            return null != e ? (e + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
        },
        registerDomEvents: function(e, t) {
            enyo.$[e] = t;
        },
        unregisterDomEvents: function(e) {
            enyo.$[e] = null;
        },
        selfClosing: {
            img: 1,
            hr: 1,
            br: 1,
            area: 1,
            base: 1,
            basefont: 1,
            input: 1,
            link: 1,
            meta: 1,
            command: 1,
            embed: 1,
            keygen: 1,
            wbr: 1,
            param: 1,
            source: 1,
            track: 1,
            col: 1
        },
        cssTextToDomStyles: function(e, t, n) {
            if (e) for (var i, o, r, s, a = e.replace(/;$/, "").split(/\s*;[\s;]*/), c = 0; s = a[c]; c++) i = s.split(/\s*:\s*/), 
            o = i.shift(), n ? delete t[o] : (r = i.join(":"), t[o] = r);
        },
        domStylesToCssText: function(e) {
            var t, n, i = "";
            for (t in e) n = e[t], null !== n && void 0 !== n && "" !== n && (i += t + ": " + n + "; ");
            return enyo.trim(i);
        },
        stylesToHtml: function(e) {
            var t = enyo.Control.domStylesToCssText(e);
            return t ? ' style="' + t + '"' : "";
        },
        escapeAttribute: function(e) {
            return enyo.isString(e) ? (e + "").replace(/&/g, "&amp;").replace(/\"/g, "&quot;") : e;
        },
        attributesToHtml: function(e) {
            var t, n, i = "";
            for (t in e) n = e[t], null !== n && n !== !1 && "" !== n && (i += " " + t + '="' + enyo.Control.escapeAttribute(n) + '"');
            return i;
        },
        normalizeCssStyleString: function(e) {
            return (e + ";").replace(/^[;\s]+/, "").replace(/\s*(;|:)\1+/g, "$1").replace(/(:|;)\s*(?!$)/g, "$1 ");
        }
    }
}), enyo.defaultCtor = enyo.Control, enyo.Control.concat = function(e, t, n) {
    var i = e.prototype || e;
    t.classes && (n ? i.classes = enyo.trim((i.classes ? i.classes + " " : "") + t.classes) : (i.kindClasses = enyo.trim((i.kindClasses ? i.kindClasses : "") + (i.classes ? " " + i.classes : "")), 
    i.classes = t.classes), delete t.classes), t.style && (n ? i.style = enyo.Control.normalizeCssStyleString((i.style ? i.style + ";" : "") + (" " + (t.style + ";"))) : (i.kindStyle = enyo.Control.normalizeCssStyleString((i.kindStyle ? i.kindStyle + "; " : "") + (i.style ? " " + i.style : "")), 
    i.style = enyo.Control.normalizeCssStyleString(t.style)), delete t.style), t.attributes && (i.attributes = i.attributes ? enyo.mixin(enyo.clone(i.attributes), t.attributes) : t.attributes, 
    delete t.attributes);
}, enyo.View = enyo.Control;

// ../source/dom/platform.js
enyo.platform = {
    touch: Boolean("ontouchstart" in window || window.navigator.msMaxTouchPoints),
    gesture: Boolean("ongesturestart" in window || window.navigator.msMaxTouchPoints)
}, function() {
    for (var e, t, n, i = navigator.userAgent, o = enyo.platform, r = [ {
        platform: "androidChrome",
        regex: /Android .* Chrome\/(\d+)[.\d]+/
    }, {
        platform: "android",
        regex: /Android (\d+)/
    }, {
        platform: "android",
        regex: /Silk\/1./,
        forceVersion: 2,
        extra: {
            silk: 1
        }
    }, {
        platform: "android",
        regex: /Silk\/2./,
        forceVersion: 4,
        extra: {
            silk: 2
        }
    }, {
        platform: "windowsPhone",
        regex: /Windows Phone (?:OS )?(\d+)[.\d]+/
    }, {
        platform: "ie",
        regex: /MSIE (\d+)/
    }, {
        platform: "ie",
        regex: /Trident\/.*; rv:(\d+)/
    }, {
        platform: "ios",
        regex: /iP(?:hone|ad;(?: U;)? CPU) OS (\d+)/
    }, {
        platform: "webos",
        regex: /(?:web|hpw)OS\/(\d+)/
    }, {
        platform: "webos",
        regex: /WebAppManager|Isis/,
        forceVersion: 4
    }, {
        platform: "safari",
        regex: /Version\/(\d+)[.\d]+\s+Safari/
    }, {
        platform: "chrome",
        regex: /Chrome\/(\d+)[.\d]+/
    }, {
        platform: "androidFirefox",
        regex: /Android;.*Firefox\/(\d+)/
    }, {
        platform: "firefoxOS",
        regex: /Mobile;.*Firefox\/(\d+)/
    }, {
        platform: "firefox",
        regex: /Firefox\/(\d+)/
    }, {
        platform: "blackberry",
        regex: /PlayBook/i,
        forceVersion: 2
    }, {
        platform: "blackberry",
        regex: /BB1\d;.*Version\/(\d+\.\d+)/
    }, {
        platform: "tizen",
        regex: /Tizen (\d+)/
    } ], s = 0; e = r[s]; s++) if (t = e.regex.exec(i)) {
        n = e.forceVersion ? e.forceVersion : Number(t[1]), o[e.platform] = n, e.extra && enyo.mixin(o, e.extra), 
        o.platformName = e.platform;
        break;
    }
    enyo.dumbConsole = Boolean(o.android || o.ios || o.webos);
}();

// ../source/dom/animation.js
(function() {
    for (var e, t, n, i = Math.round(1e3 / 60), o = [ "webkit", "moz", "ms", "o", "" ], r = "requestAnimationFrame", s = "cancel" + enyo.cap(r), a = function(e) {
        return window.setTimeout(e, i);
    }, c = function(e) {
        return window.clearTimeout(e);
    }, u = 0, h = o.length; ((e = o[u]) || h > u) && !(enyo.platform.ios >= 6); u++) if (t = e ? e + enyo.cap(s) : s, 
    n = e ? e + enyo.cap(r) : r, window[t]) {
        c = window[t], a = window[n], "webkit" == e && c(a(enyo.nop));
        break;
    }
    enyo.requestAnimationFrame = function(e, t) {
        return a(e, t);
    }, enyo.cancelRequestAnimationFrame = function(e) {
        return c(e);
    };
})(), enyo.easing = {
    cubicIn: function(e) {
        return Math.pow(e, 3);
    },
    cubicOut: function(e) {
        return Math.pow(e - 1, 3) + 1;
    },
    expoOut: function(e) {
        return 1 == e ? 1 : -1 * Math.pow(2, -10 * e) + 1;
    },
    quadInOut: function(e) {
        return e = 2 * e, 1 > e ? Math.pow(e, 2) / 2 : -1 * (--e * (e - 2) - 1) / 2;
    },
    linear: function(e) {
        return e;
    }
}, enyo.easedLerp = function(e, t, n, i) {
    var o = (enyo.perfNow() - e) / t;
    return i ? o >= 1 ? 0 : 1 - n(1 - o) : o >= 1 ? 1 : n(o);
}, enyo.easedComplexLerp = function(e, t, n, i, o, r, s) {
    var a = (enyo.perfNow() - e) / t;
    return i ? n(1 - a, o, r, s, t) : n(a, o, r, s, t);
};

// ../source/dom/cordova.js
enyo.ready(function() {
    (window.cordova || window.PhoneGap) && document.addEventListener("deviceready", function(e) {
        for (var t, n = [ "pause", "resume", "online", "offline", "backbutton", "batterycritical", "batterylow", "batterystatus", "menubutton", "searchbutton", "startcallbutton", "endcallbutton", "volumedownbutton", "volumeupbutton" ], i = 0; t = n[i]; i++) document.addEventListener(t, enyo.bind(enyo.Signals, "send", "on" + t), !1);
        enyo.Signals.send("ondeviceready", e);
    }, !1);
});

// ../source/dom/page_visibility.js
enyo.ready(function() {
    function e(e) {
        e = e || window.event, enyo.hidden = e.type in i ? i[e.type] : document[t], enyo.visibilityState = e.type in i ? i[e.type] ? "hidden" : "visible" : document[n], 
        enyo.Signals.send("onvisibilitychange", enyo.mixin(e, {
            hidden: enyo.hidden
        }));
    }
    var t = "hidden", n = "visibilityState", i = {};
    i.blur = i.focusout = i.pagehide = !0, i.focus = i.focusin = i.pageshow = !1, t in document ? document.addEventListener("visibilitychange", e) : (t = "mozHidden") in document ? (document.addEventListener("mozvisibilitychange", e), 
    n = "mozVisibilityState") : (t = "webkitHidden") in document ? (document.addEventListener("webkitvisibilitychange", e), 
    n = "webkitVisibilityState") : (t = "msHidden") in document ? (document.addEventListener("msvisibilitychange", e), 
    n = "msVisibilityState") : "onfocusin" in document ? document.onfocusin = document.onfocusout = e : window.onpageshow = window.onpagehide = window.onfocus = window.onblur = e, 
    enyo.hidden = document[t] !== void 0 ? document[t] : !1, enyo.visibilityState = document[n] !== void 0 ? document[n] : "visible";
});

// ../source/dom/dispatcher.js
(function(e) {
    e.$ = {}, e.dispatcher = {
        events: [ "mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "mousewheel", "click", "dblclick", "change", "keydown", "keyup", "keypress", "input", "paste", "copy", "cut", "webkitTransitionEnd", "transitionend", "webkitAnimationEnd", "animationEnd" ],
        windowEvents: [ "resize", "load", "unload", "message", "hashchange", "popstate" ],
        features: [],
        connect: function() {
            var t, n, i = e.dispatcher;
            for (t = 0; n = i.events[t]; t++) i.listen(document, n);
            for (t = 0; n = i.windowEvents[t]; t++) "unload" === n && "object" == typeof window.chrome && window.chrome.app || i.listen(window, n);
        },
        listen: function(t, n, i) {
            var o = e.dispatch;
            this.listen = t.addEventListener ? function(e, t, n) {
                e.addEventListener(t, n || o, !1);
            } : function(t, n, i) {
                t.attachEvent("on" + n, function(t) {
                    return t.target = t.srcElement, t.preventDefault || (t.preventDefault = e.iePreventDefault), 
                    (i || o)(t);
                });
            }, this.listen(t, n, i);
        },
        stopListening: function(t, n, i) {
            var o = e.dispatch;
            this.stopListening = t.addEventListener ? function(e, t, n) {
                e.removeEventListener(t, n || o, !1);
            } : function(e, t, n) {
                e.detachEvent("on" + t, n || o);
            }, this.stopListening(t, n, i);
        },
        dispatch: function(e) {
            var t = this.findDispatchTarget(e.target) || this.findDefaultTarget();
            e.dispatchTarget = t;
            for (var n, i = 0; n = this.features[i]; i++) if (n.call(this, e) === !0) return;
            return t && !e.preventDispatch ? this.dispatchBubble(e, t) : void 0;
        },
        findDispatchTarget: function(t) {
            var n, i = t;
            try {
                for (;i; ) {
                    if (n = e.$[i.id]) {
                        n.eventNode = i;
                        break;
                    }
                    i = i.parentNode;
                }
            } catch (o) {
                e.log(o, i);
            }
            return n;
        },
        findDefaultTarget: function() {
            return e.master;
        },
        dispatchBubble: function(e, t) {
            var n = e.type;
            return n = e.customEvent ? n : "on" + n, t.bubble(n, e, t);
        }
    }, e.iePreventDefault = function() {
        try {
            this.returnValue = !1;
        } catch (e) {}
    }, e.dispatch = function(t) {
        return e.dispatcher.dispatch(t);
    }, e.bubble = function(t) {
        var n = t || window.event;
        n && (n.target || (n.target = n.srcElement), e.dispatch(n));
    }, e.bubbler = "enyo.bubble(arguments[0])", function() {
        var t = function() {
            e.bubble(arguments[0]);
        };
        e.makeBubble = function() {
            var n = Array.prototype.slice.call(arguments, 0), i = n.shift();
            "object" == typeof i && "function" == typeof i.hasNode && e.forEach(n, function(n) {
                this.hasNode() && e.dispatcher.listen(this.node, n, t);
            }, i);
        }, e.unmakeBubble = function() {
            var n = Array.prototype.slice.call(arguments, 0), i = n.shift();
            "object" == typeof i && "function" == typeof i.hasNode && e.forEach(n, function(n) {
                this.hasNode() && e.dispatcher.stopListening(this.node, n, t);
            }, i);
        };
    }(), e.requiresWindow(e.dispatcher.connect), e.dispatcher.features.push(function(t) {
        if ("click" === t.type && 0 === t.clientX && 0 === t.clientY) {
            var n = e.clone(t);
            n.type = "tap", n.preventDefault = e.nop, e.dispatch(n);
        }
    });
    var t = {};
    e.dispatcher.features.push(function(e) {
        ("mousemove" == e.type || "tap" == e.type || "click" == e.type || "touchmove" == e.type) && (t.clientX = e.clientX, 
        t.clientY = e.clientY, t.pageX = e.pageX, t.pageY = e.pageY, t.screenX = e.screenX, 
        t.screenY = e.screenY);
    }), e.getPosition = function() {
        var n = e.clone(t);
        if (9 > e.platform.ie) {
            var i = document.documentElement || document.body.parentNode || document.body;
            n.pageX = n.clientX + i.scrollLeft, n.pageY = n.clientY + i.scrollTop;
        }
        return n;
    };
})(enyo);

// ../source/dom/preview.js
(function() {
    var e = "previewDomEvent", t = {
        feature: function(e) {
            t.dispatch(e, e.dispatchTarget);
        },
        dispatch: function(t, n) {
            for (var i, o = this.buildLineage(n), r = 0; i = o[r]; r++) if (i[e] && i[e](t) === !0) return t.preventDispatch = !0, 
            void 0;
        },
        buildLineage: function(e) {
            for (var t = [], n = e; n; ) t.unshift(n), n = n.parent;
            return t;
        }
    };
    enyo.dispatcher.features.push(t.feature);
})();

// ../source/dom/modal.js
enyo.dispatcher.features.push(function(e) {
    if (this.captureTarget) {
        var t = e.dispatchTarget, n = (e.customEvent ? "" : "on") + e.type, i = this.captureEvents[n], o = this.captureHandlerScope || this.captureTarget, r = i && o[i], s = r && !(t && t.isDescendantOf && t.isDescendantOf(this.captureTarget));
        if (s) {
            var a = e.captureTarget = this.captureTarget;
            e.preventDispatch = r && r.apply(o, [ a, e ]) && !this.autoForwardEvents[e.type];
        }
    }
}), enyo.mixin(enyo.dispatcher, {
    autoForwardEvents: {
        leave: 1,
        resize: 1
    },
    captures: [],
    capture: function(e, t, n) {
        var i = {
            target: e,
            events: t,
            scope: n
        };
        this.captures.push(i), this.setCaptureInfo(i);
    },
    release: function(e) {
        for (var t = this.captures.length - 1; t >= 0; t--) if (this.captures[t].target === e) {
            this.captures.splice(t, 1), this.setCaptureInfo(this.captures[this.captures.length - 1]);
            break;
        }
    },
    setCaptureInfo: function(e) {
        this.captureTarget = e && e.target, this.captureEvents = e && e.events, this.captureHandlerScope = e && e.scope;
    }
});

// ../source/dom/gesture.js
enyo.gesture = {
    eventProps: [ "target", "relatedTarget", "clientX", "clientY", "pageX", "pageY", "screenX", "screenY", "altKey", "ctrlKey", "metaKey", "shiftKey", "detail", "identifier", "dispatchTarget", "which", "srcEvent" ],
    makeEvent: function(e, t) {
        var n = {};
        n.type = e;
        for (var i, o = 0; i = this.eventProps[o]; o++) n[i] = t[i];
        if (n.srcEvent = n.srcEvent || t, n.preventDefault = this.preventDefault, n.disablePrevention = this.disablePrevention, 
        10 > enyo.platform.ie) {
            8 == enyo.platform.ie && n.target && (n.pageX = n.clientX + n.target.scrollLeft, 
            n.pageY = n.clientY + n.target.scrollTop);
            var r = window.event && window.event.button;
            r && (n.which = 1 & r ? 1 : 2 & r ? 2 : 4 & r ? 3 : 0);
        } else (enyo.platform.webos || window.PalmSystem) && 0 === n.which && (n.which = 1);
        return n;
    },
    down: function(e) {
        this.drag.holdPulseConfig = enyo.clone(this.drag.holdPulseDefaultConfig);
        var t = this.makeEvent("down", e);
        t.configureHoldPulse = this.configureHoldPulse, enyo.dispatch(t), this.downEvent = t, 
        this.drag.cancelHold(), this.drag.beginHold(t);
    },
    move: function(e) {
        var t = this.makeEvent("move", e);
        t.dx = t.dy = t.horizontal = t.vertical = 0, t.which && this.downEvent && (t.dx = e.clientX - this.downEvent.clientX, 
        t.dy = e.clientY - this.downEvent.clientY, t.horizontal = Math.abs(t.dx) > Math.abs(t.dy), 
        t.vertical = !t.horizontal), enyo.dispatch(t);
    },
    up: function(e) {
        var t = this.makeEvent("up", e), n = !1;
        t.preventTap = function() {
            n = !0;
        }, enyo.dispatch(t), !n && this.downEvent && 1 == this.downEvent.which && this.sendTap(t), 
        this.downEvent = null;
    },
    over: function(e) {
        var t = this.makeEvent("enter", e);
        enyo.dispatch(t);
    },
    out: function(e) {
        var t = this.makeEvent("leave", e);
        enyo.dispatch(t);
    },
    sendTap: function(e) {
        var t = this.findCommonAncestor(this.downEvent.target, e.target);
        if (t) {
            var n = this.makeEvent("tap", e);
            n.target = t, enyo.dispatch(n);
        }
    },
    findCommonAncestor: function(e, t) {
        for (var n = t; n; ) {
            if (this.isTargetDescendantOf(e, n)) return n;
            n = n.parentNode;
        }
    },
    isTargetDescendantOf: function(e, t) {
        for (var n = e; n; ) {
            if (n == t) return !0;
            n = n.parentNode;
        }
    },
    configureHoldPulse: function(e) {
        enyo.mixin(enyo.gesture.drag.holdPulseConfig, e);
    }
}, enyo.gesture.preventDefault = function() {
    this.srcEvent && this.srcEvent.preventDefault();
}, enyo.gesture.disablePrevention = function() {
    this.preventDefault = enyo.nop, this.srcEvent && (this.srcEvent.preventDefault = enyo.nop);
}, enyo.dispatcher.features.push(function(e) {
    return enyo.gesture.events[e.type] ? enyo.gesture.events[e.type](e) : void 0;
}), enyo.gesture.events = {
    mousedown: function(e) {
        enyo.gesture.down(e);
    },
    mouseup: function(e) {
        enyo.gesture.up(e);
    },
    mousemove: function(e) {
        enyo.gesture.move(e);
    },
    mouseover: function(e) {
        enyo.gesture.over(e);
    },
    mouseout: function(e) {
        enyo.gesture.out(e);
    }
}, enyo.requiresWindow(function() {
    document.addEventListener && document.addEventListener("DOMMouseScroll", function(e) {
        var t = enyo.clone(e);
        t.preventDefault = function() {
            e.preventDefault();
        }, t.type = "mousewheel";
        var n = t.VERTICAL_AXIS == t.axis ? "wheelDeltaY" : "wheelDeltaX";
        t[n] = -40 * t.detail, enyo.dispatch(t);
    }, !1);
});

// ../source/dom/drag.js
enyo.dispatcher.features.push(function(e) {
    return enyo.gesture.drag[e.type] ? enyo.gesture.drag[e.type](e) : void 0;
}), enyo.gesture.drag = {
    holdPulseDefaultConfig: {
        delay: 200,
        resume: !1,
        moveTolerance: 16,
        endHold: "onMove"
    },
    holdPulseConfig: {},
    trackCount: 5,
    minFlick: .1,
    minTrack: 8,
    down: function(e) {
        this.stopDragging(e), this.target = e.target, this.startTracking(e);
    },
    move: function(e) {
        if (this.tracking) {
            if (this.track(e), !e.which) return this.stopDragging(e), this.cancelHold(), this.tracking = !1, 
            void 0;
            this.dragEvent ? this.sendDrag(e) : "onMove" === this.holdPulseConfig.endHold && (this.dy * this.dy + this.dx * this.dx >= this.holdPulseConfig.moveTolerance ? this.holdJob && (this.holdPulseConfig.resume ? this.stopHold() : (this.cancelHold(), 
            this.sendDragStart(e))) : this.holdPulseConfig.resume && !this.holdJob && this.beginHold(e));
        }
    },
    up: function(e) {
        this.endTracking(e), this.stopDragging(e), this.cancelHold(), this.target = null;
    },
    enter: function(e) {
        this.holdPulseConfig.resume && "onLeave" === this.holdPulseConfig.endHold && this.target && e.target === this.target && this.beginHold(e);
    },
    leave: function(e) {
        this.dragEvent ? this.sendDragOut(e) : "onLeave" === this.holdPulseConfig.endHold && (this.holdPulseConfig.resume ? this.stopHold() : (this.cancelHold(), 
        this.sendDragStart(e)));
    },
    stopDragging: function(e) {
        if (this.dragEvent) {
            this.sendDrop(e);
            var t = this.sendDragFinish(e);
            return this.dragEvent = null, t;
        }
    },
    makeDragEvent: function(e, t, n, i) {
        var o = Math.abs(this.dx), r = Math.abs(this.dy), s = o > r, a = .414 > (s ? r / o : o / r), c = {};
        return c.type = e, c.dx = this.dx, c.dy = this.dy, c.ddx = this.dx - this.lastDx, 
        c.ddy = this.dy - this.lastDy, c.xDirection = this.xDirection, c.yDirection = this.yDirection, 
        c.pageX = n.pageX, c.pageY = n.pageY, c.clientX = n.clientX, c.clientY = n.clientY, 
        c.horizontal = s, c.vertical = !s, c.lockable = a, c.target = t, c.dragInfo = i, 
        c.ctrlKey = n.ctrlKey, c.altKey = n.altKey, c.metaKey = n.metaKey, c.shiftKey = n.shiftKey, 
        c.srcEvent = n.srcEvent, 8 == enyo.platform.ie && c.target && (c.pageX = c.clientX + c.target.scrollLeft, 
        c.pageY = c.clientY + c.target.scrollTop), c.preventDefault = enyo.gesture.preventDefault, 
        c.disablePrevention = enyo.gesture.disablePrevention, c;
    },
    sendDragStart: function(e) {
        this.dragEvent = this.makeDragEvent("dragstart", this.target, e), enyo.dispatch(this.dragEvent);
    },
    sendDrag: function(e) {
        var t = this.makeDragEvent("dragover", e.target, e, this.dragEvent.dragInfo);
        enyo.dispatch(t), t.type = "drag", t.target = this.dragEvent.target, enyo.dispatch(t);
    },
    sendDragFinish: function(e) {
        var t = this.makeDragEvent("dragfinish", this.dragEvent.target, e, this.dragEvent.dragInfo);
        t.preventTap = function() {
            e.preventTap && e.preventTap();
        }, enyo.dispatch(t);
    },
    sendDragOut: function(e) {
        var t = this.makeDragEvent("dragout", e.target, e, this.dragEvent.dragInfo);
        enyo.dispatch(t);
    },
    sendDrop: function(e) {
        var t = this.makeDragEvent("drop", e.target, e, this.dragEvent.dragInfo);
        t.preventTap = function() {
            e.preventTap && e.preventTap();
        }, enyo.dispatch(t);
    },
    startTracking: function(e) {
        this.tracking = !0, this.px0 = e.clientX, this.py0 = e.clientY, this.flickInfo = {}, 
        this.flickInfo.startEvent = e, this.flickInfo.moves = [], this.track(e);
    },
    track: function(e) {
        this.lastDx = this.dx, this.lastDy = this.dy, this.dx = e.clientX - this.px0, this.dy = e.clientY - this.py0, 
        this.xDirection = this.calcDirection(this.dx - this.lastDx, 0), this.yDirection = this.calcDirection(this.dy - this.lastDy, 0);
        var t = this.flickInfo;
        t.moves.push({
            x: e.clientX,
            y: e.clientY,
            t: enyo.perfNow()
        }), t.moves.length > this.trackCount && t.moves.shift();
    },
    endTracking: function() {
        this.tracking = !1;
        var e = this.flickInfo, t = e && e.moves;
        if (t && t.length > 1) {
            for (var n, i = t[t.length - 1], o = enyo.perfNow(), r = t.length - 2, s = 0, a = 0, c = 0, u = 0, h = 0, d = 0, l = 0; n = t[r]; r--) s = o - n.t, 
            a = (i.x - n.x) / s, c = (i.y - n.y) / s, d = d || (0 > a ? -1 : a > 0 ? 1 : 0), 
            l = l || (0 > c ? -1 : c > 0 ? 1 : 0), (a * d > u * d || c * l > h * l) && (u = a, 
            h = c);
            var f = Math.sqrt(u * u + h * h);
            f > this.minFlick && this.sendFlick(e.startEvent, u, h, f);
        }
        this.flickInfo = null;
    },
    calcDirection: function(e, t) {
        return e > 0 ? 1 : 0 > e ? -1 : t;
    },
    beginHold: function(e) {
        this.holdStart = enyo.perfNow();
        var t = enyo.clone(e);
        t.srcEvent = enyo.clone(e.srcEvent), this._holdJobFunction = enyo.bind(this, "sendHoldPulse", t), 
        this._holdJobFunction.ce = t, this.holdJob = setInterval(this._holdJobFunction, this.holdPulseConfig.delay);
    },
    cancelHold: function() {
        this.stopHold(), this.sentHold && (this.sentHold = !1, this.sendRelease(this.holdEvent));
    },
    stopHold: function() {
        clearInterval(this.holdJob), this.holdJob = null, this._holdJobFunction && (this._holdJobFunction.ce = null, 
        this._holdJobFunction = null);
    },
    sendHoldPulse: function(e) {
        this.sentHold || (this.sentHold = !0, this.sendHold(e));
        var t = enyo.gesture.makeEvent("holdpulse", e);
        t.holdTime = enyo.perfNow() - this.holdStart, enyo.dispatch(t);
    },
    sendHold: function(e) {
        this.holdEvent = e;
        var t = enyo.gesture.makeEvent("hold", e);
        enyo.dispatch(t);
    },
    sendRelease: function(e) {
        var t = enyo.gesture.makeEvent("release", e);
        enyo.dispatch(t);
    },
    sendFlick: function(e, t, n, i) {
        var o = enyo.gesture.makeEvent("flick", e);
        o.xVelocity = t, o.yVelocity = n, o.velocity = i, enyo.dispatch(o);
    }
};

// ../source/dom/transition.js
enyo.dom.transition = enyo.platform.ios || enyo.platform.android || enyo.platform.chrome || enyo.platform.androidChrome || enyo.platform.safari ? "-webkit-transition" : enyo.platform.firefox || enyo.platform.firefoxOS || enyo.platform.androidFirefox ? "-moz-transition" : "transition";

// ../source/dom/keymap.js
enyo.dispatcher.features.push(function(e) {
    if ("keydown" === e.type || "keyup" === e.type || "keypress" === e.type) {
        e.keySymbol = this.keyMap[e.keyCode];
        var t = this.findDefaultTarget();
        e.dispatchTarget !== t && this.dispatchBubble(e, t);
    }
}), enyo.mixin(enyo.dispatcher, {
    keyMap: {},
    registerKeyMap: function(e) {
        enyo.mixin(this.keyMap, e);
    }
});

// ../source/touch/touch.js
enyo.requiresWindow(function() {
    var e = enyo.gesture, t = e.events;
    e.events.touchstart = function(t) {
        e.events = n, e.events.touchstart(t);
    };
    var n = {
        _touchCount: 0,
        touchstart: function(t) {
            this._touchCount += t.changedTouches.length, this.excludedTarget = null;
            var n = this.makeEvent(t);
            e.down(n), n = this.makeEvent(t), this.overEvent = n, e.over(n);
        },
        touchmove: function(t) {
            enyo.job.stop("resetGestureEvents");
            var n = e.drag.dragEvent;
            this.excludedTarget = n && n.dragInfo && n.dragInfo.node;
            var i = this.makeEvent(t);
            e.move(i), enyo.bodyIsFitting && t.preventDefault(), this.overEvent && this.overEvent.target != i.target && (this.overEvent.relatedTarget = i.target, 
            i.relatedTarget = this.overEvent.target, e.out(this.overEvent), e.over(i)), this.overEvent = i;
        },
        touchend: function(t) {
            e.up(this.makeEvent(t)), e.out(this.overEvent), this._touchCount -= t.changedTouches.length;
        },
        mouseup: function() {
            0 === this._touchCount && (this.sawMousedown = !1, e.events = t);
        },
        makeEvent: function(e) {
            var t = enyo.clone(e.changedTouches[0]);
            return t.srcEvent = e, t.target = this.findTarget(t), t.which = 1, t;
        },
        calcNodeOffset: function(e) {
            if (e.getBoundingClientRect) {
                var t = e.getBoundingClientRect();
                return {
                    left: t.left,
                    top: t.top,
                    width: t.width,
                    height: t.height
                };
            }
        },
        findTarget: function(e) {
            return document.elementFromPoint(e.clientX, e.clientY);
        },
        findTargetTraverse: function(e, t, n) {
            var i = e || document.body, o = this.calcNodeOffset(i);
            if (o && i != this.excludedTarget) {
                var r = t - o.left, s = n - o.top;
                if (r > 0 && s > 0 && o.width >= r && o.height >= s) {
                    for (var a, c, u = i.childNodes, h = u.length - 1; c = u[h]; h--) if (a = this.findTargetTraverse(c, t, n)) return a;
                    return i;
                }
            }
        },
        connect: function() {
            enyo.forEach([ "touchstart", "touchmove", "touchend", "gesturestart", "gesturechange", "gestureend" ], function(e) {
                9 > enyo.platform.ie ? document["on" + e] = enyo.dispatch : document.addEventListener(e, enyo.dispatch, !1);
            }), 18 >= enyo.platform.androidChrome || 2 === enyo.platform.silk ? this.findTarget = function(e) {
                return document.elementFromPoint(e.screenX, e.screenY);
            } : document.elementFromPoint || (this.findTarget = function(e) {
                return this.findTargetTraverse(null, e.clientX, e.clientY);
            });
        }
    };
    n.connect();
});

// ../source/touch/msevents.js
(function() {
    var e;
    if (window.navigator.pointerEnabled ? e = [ "pointerdown", "pointerup", "pointermove", "pointerover", "pointerout", "pointercancel" ] : window.navigator.msPointerEnabled && (e = [ "MSPointerDown", "MSPointerUp", "MSPointerMove", "MSPointerOver", "MSPointerOut", "MSPointerCancel" ]), 
    e) {
        var t = function(e) {
            var t = enyo.clone(e);
            return t.srcEvent = e, t.which = e.buttons || 1, t;
        }, n = enyo.gesture;
        enyo.gesture.events = {};
        var i = {
            pointerdown: function(e) {
                var i = t(e);
                n.down(i);
            },
            pointerup: function(e) {
                var i = t(e);
                n.up(i);
            },
            pointermove: function(e) {
                var i = t(e);
                n.move(i);
            },
            pointercancel: function(e) {
                var i = t(e);
                n.up(i);
            },
            pointerover: function(e) {
                var i = t(e);
                n.over(i);
            },
            pointerout: function(e) {
                var i = t(e);
                n.out(i);
            }
        };
        !window.navigator.pointerEnabled && window.navigator.msPointerEnabled && (i.MSPointerDown = i.pointerdown, 
        i.MSPointerUp = i.pointerup, i.MSPointerMove = i.pointermove, i.MSPointerCancel = i.pointercancel, 
        i.MSPointerOver = i.pointerover, i.MSPointerOut = i.pointerout), enyo.forEach(e, function(e) {
            enyo.dispatcher.listen(document, e);
        }), enyo.dispatcher.features.push(function(e) {
            i[e.type] && e.isPrimary && i[e.type](e);
        });
    }
})();

// ../source/touch/gesture.js
(function() {
    !enyo.platform.gesture && enyo.platform.touch && enyo.dispatcher.features.push(function(n) {
        e[n.type] && t[n.type](n);
    });
    var e = {
        touchstart: !0,
        touchmove: !0,
        touchend: !0
    }, t = {
        orderedTouches: [],
        gesture: null,
        touchstart: function(e) {
            if (enyo.forEach(e.changedTouches, function(e) {
                var t = e.identifier;
                0 > enyo.indexOf(t, this.orderedTouches) && this.orderedTouches.push(t);
            }, this), e.touches.length >= 2 && !this.gesture) {
                var t = this.gesturePositions(e);
                this.gesture = this.gestureVector(t), this.gesture.angle = this.gestureAngle(t), 
                this.gesture.scale = 1, this.gesture.rotation = 0;
                var n = this.makeGesture("gesturestart", e, {
                    vector: this.gesture,
                    scale: 1,
                    rotation: 0
                });
                enyo.dispatch(n);
            }
        },
        touchend: function(e) {
            if (enyo.forEach(e.changedTouches, function(e) {
                enyo.remove(e.identifier, this.orderedTouches);
            }, this), 1 >= e.touches.length && this.gesture) {
                var t = e.touches[0] || e.changedTouches[e.changedTouches.length - 1];
                enyo.dispatch(this.makeGesture("gestureend", e, {
                    vector: {
                        xcenter: t.pageX,
                        ycenter: t.pageY
                    },
                    scale: this.gesture.scale,
                    rotation: this.gesture.rotation
                })), this.gesture = null;
            }
        },
        touchmove: function(e) {
            if (this.gesture) {
                var t = this.makeGesture("gesturechange", e);
                this.gesture.scale = t.scale, this.gesture.rotation = t.rotation, enyo.dispatch(t);
            }
        },
        findIdentifiedTouch: function(e, t) {
            for (var n, i = 0; n = e[i]; i++) if (n.identifier === t) return n;
        },
        gesturePositions: function(e) {
            var t = this.findIdentifiedTouch(e.touches, this.orderedTouches[0]), n = this.findIdentifiedTouch(e.touches, this.orderedTouches[this.orderedTouches.length - 1]), i = t.pageX, o = n.pageX, r = t.pageY, s = n.pageY, a = o - i, c = s - r, u = Math.sqrt(a * a + c * c);
            return {
                x: a,
                y: c,
                h: u,
                fx: i,
                lx: o,
                fy: r,
                ly: s
            };
        },
        gestureAngle: function(e) {
            var t = e, n = Math.asin(t.y / t.h) * (180 / Math.PI);
            return 0 > t.x && (n = 180 - n), t.x > 0 && 0 > t.y && (n += 360), n;
        },
        gestureVector: function(e) {
            var t = e;
            return {
                magnitude: t.h,
                xcenter: Math.abs(Math.round(t.fx + t.x / 2)),
                ycenter: Math.abs(Math.round(t.fy + t.y / 2))
            };
        },
        makeGesture: function(e, t, n) {
            var i, o, r;
            if (n) i = n.vector, o = n.scale, r = n.rotation; else {
                var s = this.gesturePositions(t);
                i = this.gestureVector(s), o = i.magnitude / this.gesture.magnitude, r = (360 + this.gestureAngle(s) - this.gesture.angle) % 360;
            }
            var a = enyo.clone(t);
            return enyo.mixin(a, {
                type: e,
                scale: o,
                pageX: i.xcenter,
                pageY: i.ycenter,
                rotation: r
            });
        }
    };
})();

// ../source/touch/ScrollMath.js
enyo.kind({
    name: "enyo.ScrollMath",
    kind: "enyo.Component",
    published: {
        vertical: !0,
        horizontal: !0
    },
    events: {
        onScrollStart: "",
        onScroll: "",
        onScrollStop: ""
    },
    kSpringDamping: .93,
    kDragDamping: .5,
    kFrictionDamping: .97,
    kSnapFriction: .9,
    kFlickScalar: 15,
    kMaxFlick: enyo.platform.android > 2 ? 2 : 1e9,
    kFrictionEpsilon: .01,
    topBoundary: 0,
    rightBoundary: 0,
    bottomBoundary: 0,
    leftBoundary: 0,
    interval: 20,
    fixedTime: !0,
    x0: 0,
    x: 0,
    y0: 0,
    y: 0,
    destroy: enyo.inherit(function(e) {
        return function() {
            this.stop(), e.apply(this, arguments);
        };
    }),
    verlet: function() {
        var e = this.x;
        this.x += e - this.x0, this.x0 = e;
        var t = this.y;
        this.y += t - this.y0, this.y0 = t;
    },
    damping: function(e, t, n, i) {
        var o = .5, r = e - t;
        return o > Math.abs(r) ? t : e * i > t * i ? n * r + t : e;
    },
    boundaryDamping: function(e, t, n, i) {
        return this.damping(this.damping(e, t, i, 1), n, i, -1);
    },
    constrain: function() {
        var e = this.boundaryDamping(this.y, this.topBoundary, this.bottomBoundary, this.kSpringDamping);
        e != this.y && (this.y0 = e - (this.y - this.y0) * this.kSnapFriction, this.y = e);
        var t = this.boundaryDamping(this.x, this.leftBoundary, this.rightBoundary, this.kSpringDamping);
        t != this.x && (this.x0 = t - (this.x - this.x0) * this.kSnapFriction, this.x = t);
    },
    friction: function(e, t, n) {
        var i = this[e] - this[t], o = Math.abs(i) > this.kFrictionEpsilon ? n : 0;
        this[e] = this[t] + o * i;
    },
    frame: 10,
    simulate: function(e) {
        for (;e >= this.frame; ) e -= this.frame, this.dragging || this.constrain(), this.verlet(), 
        this.friction("y", "y0", this.kFrictionDamping), this.friction("x", "x0", this.kFrictionDamping);
        return e;
    },
    animate: function() {
        this.stop();
        var e, t, n = enyo.perfNow(), i = 0, o = this.bindSafely(function() {
            var r = enyo.perfNow();
            this.job = enyo.requestAnimationFrame(o);
            var s = r - n;
            n = r, this.dragging && (this.y0 = this.y = this.uy, this.x0 = this.x = this.ux), 
            i += Math.max(16, s), this.fixedTime && !this.isInOverScroll() && (i = this.interval), 
            i = this.simulate(i), t != this.y || e != this.x ? this.scroll() : this.dragging || (this.stop(!0), 
            this.scroll()), t = this.y, e = this.x;
        });
        this.job = enyo.requestAnimationFrame(o);
    },
    start: function() {
        this.job || (this.animate(), this.doScrollStart());
    },
    stop: function(e) {
        var t = this.job;
        t && (this.job = enyo.cancelRequestAnimationFrame(t)), e && this.doScrollStop();
    },
    stabilize: function() {
        this.start();
        var e = Math.min(this.topBoundary, Math.max(this.bottomBoundary, this.y)), t = Math.min(this.leftBoundary, Math.max(this.rightBoundary, this.x));
        this.y = this.y0 = e, this.x = this.x0 = t, this.scroll(), this.stop(!0);
    },
    startDrag: function(e) {
        this.dragging = !0, this.my = e.pageY, this.py = this.uy = this.y, this.mx = e.pageX, 
        this.px = this.ux = this.x;
    },
    drag: function(e) {
        if (this.dragging) {
            var t = this.vertical ? e.pageY - this.my : 0;
            this.uy = t + this.py, this.uy = this.boundaryDamping(this.uy, this.topBoundary, this.bottomBoundary, this.kDragDamping);
            var n = this.horizontal ? e.pageX - this.mx : 0;
            return this.ux = n + this.px, this.ux = this.boundaryDamping(this.ux, this.leftBoundary, this.rightBoundary, this.kDragDamping), 
            this.start(), !0;
        }
    },
    dragDrop: function() {
        if (this.dragging && !window.PalmSystem) {
            var e = .5;
            this.y = this.uy, this.y0 = this.y - (this.y - this.y0) * e, this.x = this.ux, this.x0 = this.x - (this.x - this.x0) * e;
        }
        this.dragFinish();
    },
    dragFinish: function() {
        this.dragging = !1;
    },
    flick: function(e) {
        var t;
        this.vertical && (t = e.yVelocity > 0 ? Math.min(this.kMaxFlick, e.yVelocity) : Math.max(-this.kMaxFlick, e.yVelocity), 
        this.y = this.y0 + t * this.kFlickScalar), this.horizontal && (t = e.xVelocity > 0 ? Math.min(this.kMaxFlick, e.xVelocity) : Math.max(-this.kMaxFlick, e.xVelocity), 
        this.x = this.x0 + t * this.kFlickScalar), this.start();
    },
    mousewheel: function(e) {
        var t = this.vertical ? e.wheelDeltaY || e.wheelDelta : 0;
        return t > 0 && this.y < this.topBoundary || 0 > t && this.y > this.bottomBoundary ? (this.stop(!0), 
        this.y = this.y0 = this.y0 + t, this.start(), !0) : void 0;
    },
    scroll: function() {
        this.doScroll();
    },
    scrollTo: function(e, t) {
        null !== t && (this.y = this.y0 - (t + this.y0) * (1 - this.kFrictionDamping)), 
        null !== e && (this.x = this.x0 - (e + this.x0) * (1 - this.kFrictionDamping)), 
        this.start();
    },
    setScrollX: function(e) {
        this.x = this.x0 = e;
    },
    setScrollY: function(e) {
        this.y = this.y0 = e;
    },
    setScrollPosition: function(e) {
        this.setScrollY(e);
    },
    isScrolling: function() {
        return Boolean(this.job);
    },
    isInOverScroll: function() {
        return this.job && (this.x > this.leftBoundary || this.x < this.rightBoundary || this.y > this.topBoundary || this.y < this.bottomBoundary);
    }
});

// ../source/touch/ScrollStrategy.js
enyo.kind({
    name: "enyo.ScrollStrategy",
    tag: null,
    published: {
        vertical: "default",
        horizontal: "default",
        scrollLeft: 0,
        scrollTop: 0,
        maxHeight: null,
        useMouseWheel: !0
    },
    handlers: {
        ondragstart: "dragstart",
        ondragfinish: "dragfinish",
        ondown: "down",
        onmove: "move",
        onmousewheel: "mousewheel"
    },
    create: enyo.inherit(function(e) {
        return function() {
            e.apply(this, arguments), this.horizontalChanged(), this.verticalChanged(), this.maxHeightChanged();
        };
    }),
    rendered: enyo.inherit(function(e) {
        return function() {
            e.apply(this, arguments), enyo.makeBubble(this.container, "scroll"), this.scrollNode = this.calcScrollNode();
        };
    }),
    teardownRender: enyo.inherit(function(e) {
        return function() {
            e.apply(this, arguments), this.scrollNode = null;
        };
    }),
    calcScrollNode: function() {
        return this.container.hasNode();
    },
    horizontalChanged: function() {
        this.container.applyStyle("overflow-x", "default" == this.horizontal ? "auto" : this.horizontal);
    },
    verticalChanged: function() {
        this.container.applyStyle("overflow-y", "default" == this.vertical ? "auto" : this.vertical);
    },
    maxHeightChanged: function() {
        this.container.applyStyle("max-height", this.maxHeight);
    },
    scrollTo: function(e, t) {
        this.scrollNode && (this.setScrollLeft(e), this.setScrollTop(t));
    },
    scrollToNode: function(e, t) {
        if (this.scrollNode) {
            for (var n = this.getScrollBounds(), i = e, o = {
                height: i.offsetHeight,
                width: i.offsetWidth,
                top: 0,
                left: 0
            }; i && i.parentNode && i.id != this.scrollNode.id; ) o.top += i.offsetTop, o.left += i.offsetLeft, 
            i = i.parentNode;
            this.setScrollTop(Math.min(n.maxTop, t === !1 ? o.top - n.clientHeight + o.height : o.top)), 
            this.setScrollLeft(Math.min(n.maxLeft, t === !1 ? o.left - n.clientWidth + o.width : o.left));
        }
    },
    scrollIntoView: function(e, t) {
        e.hasNode() && e.node.scrollIntoView(t);
    },
    isInView: function(e) {
        var t = this.getScrollBounds(), n = e.offsetTop, i = e.offsetHeight, o = e.offsetLeft, r = e.offsetWidth;
        return n >= t.top && t.top + t.clientHeight >= n + i && o >= t.left && t.left + t.clientWidth >= o + r;
    },
    setScrollTop: function(e) {
        this.scrollTop = e, this.scrollNode && (this.scrollNode.scrollTop = this.scrollTop);
    },
    setScrollLeft: function(e) {
        this.scrollLeft = e, this.scrollNode && (this.scrollNode.scrollLeft = this.scrollLeft);
    },
    getScrollLeft: function() {
        return this.scrollNode ? this.scrollNode.scrollLeft : this.scrollLeft;
    },
    getScrollTop: function() {
        return this.scrollNode ? this.scrollNode.scrollTop : this.scrollTop;
    },
    _getScrollBounds: function() {
        var e = this.getScrollSize(), t = this.container.hasNode(), n = {
            left: this.getScrollLeft(),
            top: this.getScrollTop(),
            clientHeight: t ? t.clientHeight : 0,
            clientWidth: t ? t.clientWidth : 0,
            height: e.height,
            width: e.width
        };
        return n.maxLeft = Math.max(0, n.width - n.clientWidth), n.maxTop = Math.max(0, n.height - n.clientHeight), 
        n;
    },
    getScrollSize: function() {
        var e = this.scrollNode;
        return {
            width: e ? e.scrollWidth : 0,
            height: e ? e.scrollHeight : 0
        };
    },
    getScrollBounds: function() {
        return this._getScrollBounds();
    },
    calcStartInfo: function() {
        var e = this.getScrollBounds(), t = this.getScrollTop(), n = this.getScrollLeft();
        this.canVertical = e.maxTop > 0 && "hidden" != this.vertical, this.canHorizontal = e.maxLeft > 0 && "hidden" != this.horizontal, 
        this.startEdges = {
            top: 0 === t,
            bottom: t === e.maxTop,
            left: 0 === n,
            right: n === e.maxLeft
        };
    },
    shouldDrag: function(e) {
        var t = e.vertical;
        return t && this.canVertical || !t && this.canHorizontal;
    },
    dragstart: function(e, t) {
        return this.dragging = this.shouldDrag(t), this.dragging ? this.preventDragPropagation : void 0;
    },
    dragfinish: function(e, t) {
        this.dragging && (this.dragging = !1, t.preventTap());
    },
    down: function() {
        this.calcStartInfo();
    },
    move: function(e, t) {
        t.which && (this.canVertical && t.vertical || this.canHorizontal && t.horizontal) && t.disablePrevention();
    },
    mousewheel: function(e, t) {
        this.useMouseWheel || t.preventDefault();
    }
});

// ../source/touch/Thumb.js
enyo.kind({
    name: "enyo.ScrollThumb",
    axis: "v",
    minSize: 4,
    cornerSize: 6,
    classes: "enyo-thumb",
    create: enyo.inherit(function(e) {
        return function() {
            e.apply(this, arguments);
            var t = "v" == this.axis;
            this.dimension = t ? "height" : "width", this.offset = t ? "top" : "left", this.translation = t ? "translateY" : "translateX", 
            this.positionMethod = t ? "getScrollTop" : "getScrollLeft", this.sizeDimension = t ? "clientHeight" : "clientWidth", 
            this.addClass("enyo-" + this.axis + "thumb"), this.transform = enyo.dom.canTransform(), 
            enyo.dom.canAccelerate() && enyo.dom.transformValue(this, "translateZ", 0);
        };
    }),
    sync: function(e) {
        this.scrollBounds = e._getScrollBounds(), this.update(e);
    },
    update: function(e) {
        if (this.showing) {
            var t = this.dimension, n = this.offset, i = this.scrollBounds[this.sizeDimension], o = this.scrollBounds[t], r = 0, s = 0, a = 0;
            if (i >= o) return this.hide(), void 0;
            e.isOverscrolling() && (a = e.getOverScrollBounds()["over" + n], r = Math.abs(a), 
            s = Math.max(a, 0));
            var h = e[this.positionMethod]() - a, c = i - this.cornerSize, u = Math.floor(i * i / o - r);
            u = Math.max(this.minSize, u);
            var l = Math.floor(c * h / o + s);
            l = Math.max(0, Math.min(c - this.minSize, l)), this.needed = i > u, this.needed && this.hasNode() ? (this._pos !== l && (this._pos = l, 
            this.transform ? enyo.dom.transformValue(this, this.translation, l + "px") : "v" == this.axis ? this.setBounds({
                top: l + "px"
            }) : this.setBounds({
                left: l + "px"
            })), this._size !== u && (this._size = u, this.node.style[t] = this.domStyles[t] = u + "px")) : this.hide();
        }
    },
    setShowing: function(e) {
        if (!(e && e != this.showing && this.scrollBounds[this.sizeDimension] >= this.scrollBounds[this.dimension]) && (this.hasNode() && this.cancelDelayHide(), 
        e != this.showing)) {
            var t = this.showing;
            this.showing = e, this.showingChanged(t);
        }
    },
    delayHide: function(e) {
        this.showing && enyo.job(this.id + "hide", this.bindSafely("hide"), e || 0);
    },
    cancelDelayHide: function() {
        enyo.job.stop(this.id + "hide");
    }
});

// ../source/touch/TouchScrollStrategy.js
enyo.kind({
    name: "enyo.TouchScrollStrategy",
    kind: "ScrollStrategy",
    overscroll: !0,
    preventDragPropagation: !0,
    published: {
        vertical: "default",
        horizontal: "default",
        thumb: !0,
        scrim: !1,
        dragDuringGesture: !0,
        interval: 20,
        fixedTime: !0,
        frame: 10
    },
    events: {
        onShouldDrag: ""
    },
    handlers: {
        onscroll: "domScroll",
        onflick: "flick",
        onhold: "hold",
        ondragstart: "dragstart",
        onShouldDrag: "shouldDrag",
        ondrag: "drag",
        ondragfinish: "dragfinish",
        onmousewheel: "mousewheel"
    },
    tools: [ {
        kind: "ScrollMath",
        onScrollStart: "scrollMathStart",
        onScroll: "scrollMathScroll",
        onScrollStop: "scrollMathStop"
    }, {
        name: "vthumb",
        kind: "ScrollThumb",
        axis: "v",
        showing: !1
    }, {
        name: "hthumb",
        kind: "ScrollThumb",
        axis: "h",
        showing: !1
    } ],
    scrimTools: [ {
        name: "scrim",
        classes: "enyo-fit",
        style: "z-index: 1;",
        showing: !1
    } ],
    components: [ {
        name: "client",
        classes: "enyo-touch-scroller"
    } ],
    listReordering: !1,
    create: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.transform = enyo.dom.canTransform(), this.transform || this.overscroll && this.$.client.applyStyle("position", "relative"), 
            this.accel = enyo.dom.canAccelerate();
            var e = "enyo-touch-strategy-container";
            enyo.platform.ios && this.accel && (e += " enyo-composite"), this.scrimChanged(), 
            this.intervalChanged(), this.fixedTimeChanged(), this.frameChanged(), this.container.addClass(e), 
            this.translation = this.accel ? "translate3d" : "translate";
        };
    }),
    initComponents: enyo.inherit(function(t) {
        return function() {
            this.createChrome(this.tools), t.apply(this, arguments);
        };
    }),
    destroy: enyo.inherit(function(t) {
        return function() {
            this.container.removeClass("enyo-touch-strategy-container"), t.apply(this, arguments);
        };
    }),
    rendered: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), enyo.makeBubble(this.$.client, "scroll"), this.calcBoundaries(), 
            this.syncScrollMath(), this.thumb && this.alertThumbs();
        };
    }),
    scrimChanged: function() {
        this.scrim && !this.$.scrim && this.makeScrim(), !this.scrim && this.$.scrim && this.$.scrim.destroy();
    },
    makeScrim: function() {
        var t = this.controlParent;
        this.controlParent = null, this.createChrome(this.scrimTools), this.controlParent = t;
        var e = this.container.hasNode();
        e && (this.$.scrim.parentNode = e, this.$.scrim.render());
    },
    isScrolling: function() {
        var t = this.$.scrollMath;
        return t ? t.isScrolling() : this.scrolling;
    },
    isOverscrolling: function() {
        var t = this.$.scrollMath || this;
        return this.overscroll ? t.isInOverScroll() : !1;
    },
    domScroll: function() {
        this.isScrolling() || (this.calcBoundaries(), this.syncScrollMath(), this.thumb && this.alertThumbs());
    },
    horizontalChanged: function() {
        this.$.scrollMath.horizontal = "hidden" != this.horizontal;
    },
    verticalChanged: function() {
        this.$.scrollMath.vertical = "hidden" != this.vertical;
    },
    maxHeightChanged: function() {
        this.$.client.applyStyle("max-height", this.maxHeight), this.$.client.addRemoveClass("enyo-scrollee-fit", !this.maxHeight);
    },
    thumbChanged: function() {
        this.hideThumbs();
    },
    intervalChanged: function() {
        this.$.scrollMath && (this.$.scrollMath.interval = this.interval);
    },
    fixedTimeChanged: function() {
        this.$.scrollMath && (this.$.scrollMath.fixedTime = this.fixedTime);
    },
    frameChanged: function() {
        this.$.scrollMath && (this.$.scrollMath.frame = this.frame);
    },
    stop: function() {
        this.isScrolling() && this.$.scrollMath.stop(!0);
    },
    stabilize: function() {
        this.$.scrollMath && this.$.scrollMath.stabilize();
    },
    scrollTo: function(t, e) {
        this.stop(), this.$.scrollMath.scrollTo(t, e || 0 === e ? e : null);
    },
    scrollIntoView: enyo.inherit(function(t) {
        return function() {
            this.stop(), t.apply(this, arguments);
        };
    }),
    setScrollLeft: enyo.inherit(function(t) {
        return function() {
            this.stop(), t.apply(this, arguments);
        };
    }),
    setScrollTop: enyo.inherit(function(t) {
        return function() {
            this.stop(), t.apply(this, arguments);
        };
    }),
    getScrollLeft: enyo.inherit(function(t) {
        return function() {
            return this.isScrolling() ? this.scrollLeft : t.apply(this, arguments);
        };
    }),
    getScrollTop: enyo.inherit(function(t) {
        return function() {
            return this.isScrolling() ? this.scrollTop : t.apply(this, arguments);
        };
    }),
    calcScrollNode: function() {
        return this.$.client.hasNode();
    },
    calcAutoScrolling: function() {
        var t = "auto" == this.vertical, e = "auto" == this.horizontal || "default" == this.horizontal;
        if ((t || e) && this.scrollNode) {
            var n = this.getScrollBounds();
            t && (this.$.scrollMath.vertical = n.height > n.clientHeight), e && (this.$.scrollMath.horizontal = n.width > n.clientWidth);
        }
    },
    shouldDrag: function(t, e) {
        this.calcAutoScrolling();
        var n = e.vertical, i = this.$.scrollMath.horizontal && !n, o = this.$.scrollMath.vertical && n, r = 0 > e.dy, s = 0 > e.dx, a = !r && this.startEdges.top || r && this.startEdges.bottom, h = !s && this.startEdges.left || s && this.startEdges.right;
        return e.boundaryDragger || !i && !o || (e.boundaryDragger = this), !a && o || !h && i ? (e.dragger = this, 
        !0) : void 0;
    },
    flick: function(t, e) {
        var n = Math.abs(e.xVelocity) > Math.abs(e.yVelocity) ? this.$.scrollMath.horizontal : this.$.scrollMath.vertical;
        return n && this.dragging ? (this.$.scrollMath.flick(e), this.preventDragPropagation) : void 0;
    },
    hold: function(t, e) {
        if (this.isScrolling() && !this.isOverscrolling()) {
            var n = this.$.scrollMath || this;
            return n.stop(e), !0;
        }
    },
    move: function() {},
    dragstart: function(t, e) {
        return !this.dragDuringGesture && e.srcEvent.touches && e.srcEvent.touches.length > 1 ? !0 : (this.doShouldDrag(e), 
        this.dragging = e.dragger == this || !e.dragger && e.boundaryDragger == this, this.dragging && (e.preventDefault(), 
        this.syncScrollMath(), this.$.scrollMath.startDrag(e), this.preventDragPropagation) ? !0 : void 0);
    },
    drag: function(t, e) {
        return this.listReordering ? !1 : (this.dragging && (e.preventDefault(), this.$.scrollMath.drag(e), 
        this.scrim && this.$.scrim.show()), void 0);
    },
    dragfinish: function(t, e) {
        this.dragging && (e.preventTap(), this.$.scrollMath.dragFinish(), this.dragging = !1, 
        this.scrim && this.$.scrim.hide());
    },
    mousewheel: function(t, e) {
        return !this.dragging && this.useMouseWheel && (this.calcBoundaries(), this.syncScrollMath(), 
        this.stabilize(), this.$.scrollMath.mousewheel(e)) ? (e.preventDefault(), !0) : void 0;
    },
    scrollMathStart: function() {
        this.scrollNode && (this.calcBoundaries(), this.thumb && this.showThumbs());
    },
    scrollMathScroll: function(t) {
        this.overscroll ? this.effectScroll(-t.x, -t.y) : this.effectScroll(-Math.min(t.leftBoundary, Math.max(t.rightBoundary, t.x)), -Math.min(t.topBoundary, Math.max(t.bottomBoundary, t.y))), 
        this.thumb && this.updateThumbs();
    },
    scrollMathStop: function() {
        this.effectScrollStop(), this.thumb && this.delayHideThumbs(100);
    },
    calcBoundaries: function() {
        var t = this.$.scrollMath || this, e = this._getScrollBounds();
        t.bottomBoundary = e.clientHeight - e.height, t.rightBoundary = e.clientWidth - e.width;
    },
    syncScrollMath: function() {
        var t = this.$.scrollMath;
        t && (t.setScrollX(-this.getScrollLeft()), t.setScrollY(-this.getScrollTop()));
    },
    effectScroll: function(t, e) {
        this.scrollNode && (this.scrollLeft = this.scrollNode.scrollLeft = t, this.scrollTop = this.scrollNode.scrollTop = e, 
        this.effectOverscroll(Math.round(t), Math.round(e)));
    },
    effectScrollStop: function() {
        this.effectOverscroll(null, null);
    },
    effectOverscroll: function(t, e) {
        var n = this.scrollNode, i = "0", o = "0", r = this.accel ? ",0" : "";
        null !== e && Math.abs(e - n.scrollTop) > 1 && (o = n.scrollTop - e), null !== t && Math.abs(t - n.scrollLeft) > 1 && (i = n.scrollLeft - t), 
        this.transform ? enyo.dom.transformValue(this.$.client, this.translation, i + "px, " + o + "px" + r) : this.$.client.setBounds({
            left: i + "px",
            top: o + "px"
        });
    },
    getOverScrollBounds: function() {
        var t = this.$.scrollMath || this;
        return {
            overleft: Math.min(t.leftBoundary - t.x, 0) || Math.max(t.rightBoundary - t.x, 0),
            overtop: Math.min(t.topBoundary - t.y, 0) || Math.max(t.bottomBoundary - t.y, 0)
        };
    },
    _getScrollBounds: enyo.inherit(function(t) {
        return function() {
            var e = t.apply(this, arguments);
            return enyo.mixin(e, this.getOverScrollBounds()), e;
        };
    }),
    getScrollBounds: enyo.inherit(function(t) {
        return function() {
            return this.stop(), t.apply(this, arguments);
        };
    }),
    alertThumbs: function() {
        this.showThumbs(), this.delayHideThumbs(500);
    },
    syncThumbs: function() {
        this.$.vthumb.sync(this), this.$.hthumb.sync(this);
    },
    updateThumbs: function() {
        this.$.vthumb.update(this), this.$.hthumb.update(this);
    },
    showThumbs: function() {
        this.syncThumbs(), "hidden" != this.horizontal && this.$.hthumb.show(), "hidden" != this.vertical && this.$.vthumb.show();
    },
    hideThumbs: function() {
        this.$.vthumb.hide(), this.$.hthumb.hide();
    },
    delayHideThumbs: function(t) {
        this.$.vthumb.delayHide(t), this.$.hthumb.delayHide(t);
    }
});

// ../source/touch/TranslateScrollStrategy.js
enyo.kind({
    name: "enyo.TranslateScrollStrategy",
    kind: "TouchScrollStrategy",
    translateOptimized: !1,
    components: [ {
        name: "clientContainer",
        classes: "enyo-touch-scroller",
        components: [ {
            name: "client"
        } ]
    } ],
    rendered: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), enyo.makeBubble(this.$.clientContainer, "scroll");
        };
    }),
    getScrollSize: function() {
        var t = this.$.client.hasNode();
        return {
            width: t ? t.scrollWidth : 0,
            height: t ? t.scrollHeight : 0
        };
    },
    create: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), enyo.dom.transformValue(this.$.client, this.translation, "0,0,0");
        };
    }),
    calcScrollNode: function() {
        return this.$.clientContainer.hasNode();
    },
    maxHeightChanged: function() {
        this.$.client.applyStyle("min-height", this.maxHeight ? null : "100%"), this.$.client.applyStyle("max-height", this.maxHeight), 
        this.$.clientContainer.addRemoveClass("enyo-scrollee-fit", !this.maxHeight);
    },
    shouldDrag: enyo.inherit(function(t) {
        return function() {
            return this.stop(), this.calcStartInfo(), t.apply(this, arguments);
        };
    }),
    syncScrollMath: enyo.inherit(function(t) {
        return function() {
            this.translateOptimized || t.apply(this, arguments);
        };
    }),
    setScrollLeft: enyo.inherit(function(t) {
        return function(e) {
            if (this.stop(), this.translateOptimized) {
                var n = this.$.scrollMath;
                n.setScrollX(-e), n.stabilize();
            } else t.apply(this, arguments);
        };
    }),
    setScrollTop: enyo.inherit(function(t) {
        return function(e) {
            if (this.stop(), this.translateOptimized) {
                var n = this.$.scrollMath;
                n.setScrollY(-e), n.stabilize();
            } else t.apply(this, arguments);
        };
    }),
    getScrollLeft: enyo.inherit(function(t) {
        return function() {
            return this.translateOptimized ? this.scrollLeft : t.apply(this, arguments);
        };
    }),
    getScrollTop: enyo.inherit(function(t) {
        return function() {
            return this.translateOptimized ? this.scrollTop : t.apply(this, arguments);
        };
    }),
    scrollMathStart: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.scrollStarting = !0, this.startX = 0, this.startY = 0, 
            !this.translateOptimized && this.scrollNode && (this.startX = this.getScrollLeft(), 
            this.startY = this.getScrollTop());
        };
    }),
    scrollMathScroll: function(t) {
        this.overscroll ? (this.scrollLeft = -t.x, this.scrollTop = -t.y) : (this.scrollLeft = -Math.min(t.leftBoundary, Math.max(t.rightBoundary, t.x)), 
        this.scrollTop = -Math.min(t.topBoundary, Math.max(t.bottomBoundary, t.y))), this.isScrolling() && (this.$.scrollMath.isScrolling() && this.effectScroll(this.startX - this.scrollLeft, this.startY - this.scrollTop), 
        this.thumb && this.updateThumbs());
    },
    effectScroll: function(t, e) {
        var n = t + "px, " + e + "px" + (this.accel ? ",0" : "");
        enyo.dom.transformValue(this.$.client, this.translation, n);
    },
    effectScrollStop: function() {
        if (!this.translateOptimized) {
            var t = "0,0" + (this.accel ? ",0" : ""), e = this.$.scrollMath, n = this._getScrollBounds(), i = Boolean(n.maxTop + e.bottomBoundary || n.maxLeft + e.rightBoundary);
            enyo.dom.transformValue(this.$.client, this.translation, i ? null : t), this.setScrollLeft(this.scrollLeft), 
            this.setScrollTop(this.scrollTop), i && enyo.dom.transformValue(this.$.client, this.translation, t);
        }
    },
    twiddle: function() {
        this.translateOptimized && this.scrollNode && (this.scrollNode.scrollTop = 1, this.scrollNode.scrollTop = 0);
    },
    down: enyo.nop
});

// ../source/touch/TransitionScrollStrategy.js
enyo.kind({
    name: "enyo.TransitionScrollStrategy",
    kind: "enyo.TouchScrollStrategy",
    components: [ {
        name: "clientContainer",
        classes: "enyo-touch-scroller",
        components: [ {
            name: "client"
        } ]
    } ],
    events: {
        onScrollStart: "",
        onScroll: "",
        onScrollStop: ""
    },
    handlers: {
        ondown: "down",
        ondragfinish: "dragfinish",
        onwebkitTransitionEnd: "transitionComplete"
    },
    tools: [ {
        name: "vthumb",
        kind: "ScrollThumb",
        axis: "v",
        showing: !0
    }, {
        name: "hthumb",
        kind: "ScrollThumb",
        axis: "h",
        showing: !1
    } ],
    kFlickScalar: 600,
    topBoundary: 0,
    rightBoundary: 0,
    bottomBoundary: 0,
    leftBoundary: 0,
    scrolling: !1,
    listener: null,
    boundaryX: 0,
    boundaryY: 0,
    stopTimeout: null,
    stopTimeoutMS: 80,
    scrollInterval: null,
    scrollIntervalMS: 50,
    transitions: {
        none: "",
        scroll: "3.8s cubic-bezier(.19,1,.28,1.0) 0s",
        bounce: "0.5s cubic-bezier(0.06,.5,.5,.94) 0s"
    },
    setScrollLeft: function(t) {
        var e = this.scrollLeft;
        this.stop(), this.scrollLeft = t, (this.isInLeftOverScroll() || this.isInRightOverScroll()) && (this.scrollLeft = e), 
        this.effectScroll();
    },
    setScrollTop: function(t) {
        var e = this.scrollTop;
        this.stop(), this.scrollTop = t, (this.isInTopOverScroll() || this.isInBottomOverScroll()) && (this.scrollTop = e), 
        this.effectScroll();
    },
    setScrollX: function(t) {
        this.scrollLeft = -1 * t;
    },
    setScrollY: function(t) {
        this.scrollTop = -1 * t;
    },
    getScrollLeft: function() {
        return this.scrollLeft;
    },
    getScrollTop: function() {
        return this.scrollTop;
    },
    create: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), enyo.dom.transformValue(this.$.client, this.translation, "0,0,0");
        };
    }),
    destroy: enyo.inherit(function(t) {
        return function() {
            this.clearCSSTransitionInterval(), t.apply(this, arguments);
        };
    }),
    getScrollSize: function() {
        var t = this.$.client.hasNode();
        return {
            width: t ? t.scrollWidth : 0,
            height: t ? t.scrollHeight : 0
        };
    },
    horizontalChanged: function() {
        "hidden" == this.horizontal && (this.scrollHorizontal = !1);
    },
    verticalChanged: function() {
        "hidden" == this.vertical && (this.scrollVertical = !1);
    },
    intervalChanged: function() {
        this.interval != enyo.TransitionScrollStrategy.prototype.interval && this.warn("'interval' not implemented in TransitionScrollStrategy");
    },
    calcScrollNode: function() {
        return this.$.clientContainer.hasNode();
    },
    calcBoundaries: function() {
        var t = this._getScrollBounds();
        this.bottomBoundary = t.clientHeight - t.height, this.rightBoundary = t.clientWidth - t.width;
    },
    maxHeightChanged: function() {
        this.$.client.applyStyle("min-height", this.maxHeight ? null : "100%"), this.$.client.applyStyle("max-height", this.maxHeight), 
        this.$.clientContainer.addRemoveClass("enyo-scrollee-fit", !this.maxHeight);
    },
    calcAutoScrolling: function() {
        var t = this.getScrollBounds();
        this.vertical && (this.scrollVertical = t.height > t.clientHeight), this.horizontal && (this.scrollHorizontal = t.width > t.clientWidth);
    },
    isInOverScroll: function() {
        return this.isInTopOverScroll() || this.isInBottomOverScroll() || this.isInLeftOverScroll() || this.isInRightOverScroll();
    },
    isInLeftOverScroll: function() {
        return this.getScrollLeft() < this.leftBoundary;
    },
    isInRightOverScroll: function() {
        return 0 >= this.getScrollLeft ? !1 : -1 * this.getScrollLeft() < this.rightBoundary;
    },
    isInTopOverScroll: function() {
        return this.getScrollTop() < this.topBoundary;
    },
    isInBottomOverScroll: function() {
        return 0 >= this.getScrollTop() ? !1 : -1 * this.getScrollTop() < this.bottomBoundary;
    },
    calcStartInfo: function() {
        var t = this.getScrollBounds(), e = this.getScrollTop(), n = this.getScrollLeft();
        this.startEdges = {
            top: 0 === e,
            bottom: e === t.maxTop,
            left: 0 === n,
            right: n === t.maxLeft
        };
    },
    mousewheel: function(t, e) {
        if (!this.dragging && this.useMouseWheel) {
            this.calcBoundaries(), this.syncScrollMath(), this.stabilize();
            var n = this.vertical ? e.wheelDeltaY || e.wheelDelta : 0, i = parseFloat(this.getScrollTop()) + -1 * parseFloat(n);
            return i = this.bottomBoundary > -1 * i ? -1 * this.bottomBoundary : this.topBoundary > i ? this.topBoundary : i, 
            this.setScrollTop(i), this.doScroll(), e.preventDefault(), !0;
        }
    },
    scroll: function() {
        this.thumb && this.updateThumbs(), this.calcBoundaries(), this.doScroll();
    },
    start: function() {
        this.startScrolling(), this.doScrollStart();
    },
    stop: function() {
        this.isScrolling() && this.stopScrolling(), this.thumb && this.delayHideThumbs(100), 
        this.doScrollStop();
    },
    updateX: function() {
        var t = window.getComputedStyle(this.$.client.node, null).getPropertyValue(enyo.dom.getCssTransformProp()).split("(")[1];
        return t = void 0 === t ? 0 : t.split(")")[0].split(",")[4], -1 * parseFloat(t) === this.scrollLeft ? !1 : (this.scrollLeft = -1 * parseFloat(t), 
        !0);
    },
    updateY: function() {
        var t = window.getComputedStyle(this.$.client.node, null).getPropertyValue(enyo.dom.getCssTransformProp()).split("(")[1];
        return t = void 0 === t ? 0 : t.split(")")[0].split(",")[5], -1 * parseFloat(t) === this.scrollTop ? !1 : (this.scrollTop = -1 * parseFloat(t), 
        !0);
    },
    effectScroll: function() {
        var t = -1 * this.scrollLeft + "px, " + -1 * this.scrollTop + "px" + (this.accel ? ", 0" : "");
        enyo.dom.transformValue(this.$.client, this.translation, t);
    },
    down: function() {
        var t = this;
        return this.isScrolling() && !this.isOverscrolling() ? (this.stopTimeout = setTimeout(function() {
            t.stop();
        }, this.stopTimeoutMS), !0) : void 0;
    },
    dragstart: function(t, e) {
        return this.stopTimeout && clearTimeout(this.stopTimeout), !this.dragDuringGesture && e.srcEvent.touches && e.srcEvent.touches.length > 1 ? !0 : (this.shouldDrag(e), 
        this.dragging = e.dragger == this || !e.dragger && e.boundaryDragger == this, this.dragging && (this.isScrolling() && this.stopScrolling(), 
        this.thumb && this.showThumbs(), e.preventDefault(), this.prevY = e.pageY, this.prevX = e.pageX, 
        this.preventDragPropagation) ? !0 : void 0);
    },
    shouldDrag: function(t) {
        return this.calcStartInfo(), this.calcBoundaries(), this.calcAutoScrolling(), this.scrollHorizontal ? this.scrollVertical ? this.shouldDragVertical(t) || this.shouldDragHorizontal(t) : this.shouldDragHorizontal(t) : this.shouldDragVertical(t);
    },
    shouldDragVertical: function(t) {
        var e = this.canDragVertical(t), n = this.oobVertical(t);
        return !t.boundaryDragger && e && (t.boundaryDragger = this), !n && e ? (t.dragger = this, 
        !0) : void 0;
    },
    shouldDragHorizontal: function(t) {
        var e = this.canDragHorizontal(t), n = this.oobHorizontal(t);
        return !t.boundaryDragger && e && (t.boundaryDragger = this), !n && e ? (t.dragger = this, 
        !0) : void 0;
    },
    canDragVertical: function(t) {
        return this.scrollVertical && t.vertical;
    },
    canDragHorizontal: function(t) {
        return this.scrollHorizontal && !t.vertical;
    },
    oobVertical: function(t) {
        var e = 0 > t.dy;
        return !e && this.startEdges.top || e && this.startEdges.bottom;
    },
    oobHorizontal: function(t) {
        var e = 0 > t.dx;
        return !e && this.startEdges.left || e && this.startEdges.right;
    },
    drag: function(t, e) {
        return this.listReordering ? !1 : (this.dragging && (e.preventDefault(), this.scrollLeft = this.scrollHorizontal ? this.calculateDragDistance(parseInt(this.getScrollLeft(), 10), -1 * (e.pageX - this.prevX), this.leftBoundary, this.rightBoundary) : this.getScrollLeft(), 
        this.scrollTop = this.scrollVertical ? this.calculateDragDistance(this.getScrollTop(), -1 * (e.pageY - this.prevY), this.topBoundary, this.bottomBoundary) : this.getScrollTop(), 
        this.effectScroll(), this.scroll(), this.prevY = e.pageY, this.prevX = e.pageX, 
        this.resetBoundaryX(), this.resetBoundaryY()), void 0);
    },
    calculateDragDistance: function(t, e, n, i) {
        var o = t + e;
        return this.overscrollDragDamping(t, o, e, n, i);
    },
    overscrollDragDamping: function(t, e, n, i, o) {
        return (i > e || o > -1 * e) && (n /= 2, e = t + n), e;
    },
    resetBoundaryX: function() {
        this.boundaryX = 0;
    },
    resetBoundaryY: function() {
        this.boundaryY = 0;
    },
    dragfinish: function(t, e) {
        this.dragging && (e.preventTap(), this.dragging = !1, this.isScrolling() || this.correctOverflow(), 
        this.scrim && this.$.scrim.hide());
    },
    correctOverflow: function() {
        if (this.isInOverScroll()) {
            var t = this.scrollHorizontal ? this.correctOverflowX() : !1, e = this.scrollVertical ? this.correctOverflowY() : !1;
            t !== !1 && e !== !1 ? (this.scrollLeft = t !== !1 ? t : this.getScrollLeft(), this.scrollTop = e !== !1 ? e : this.getScrollTop(), 
            this.startOverflowScrolling()) : t !== !1 ? (this.scrollLeft = t, this.scrollTop = this.targetScrollTop || this.scrollTop, 
            this.targetScrollLeft = this.getScrollLeft(), this.vertical ? this.startScrolling() : this.startOverflowScrolling()) : e !== !1 && (this.scrollTop = e, 
            this.scrollLeft = this.targetScrollLeft || this.scrollLeft, this.targetScrollTop = this.getScrollTop(), 
            this.scrollHorizontal ? this.startScrolling() : this.startOverflowScrolling());
        }
    },
    correctOverflowX: function() {
        if (this.isInLeftOverScroll()) {
            if (this.beyondBoundary(this.getScrollLeft(), this.leftBoundary, this.boundaryX)) return this.leftBoundary;
        } else if (this.isInRightOverScroll() && this.beyondBoundary(this.getScrollLeft(), this.rightBoundary, this.boundaryX)) return -1 * this.rightBoundary;
        return !1;
    },
    correctOverflowY: function() {
        if (this.isInTopOverScroll()) {
            if (this.beyondBoundary(this.getScrollTop(), this.topBoundary, this.boundaryY)) return this.topBoundary;
        } else if (this.isInBottomOverScroll() && this.beyondBoundary(this.getScrollTop(), this.bottomBoundary, this.boundaryY)) return -1 * this.bottomBoundary;
        return !1;
    },
    beyondBoundary: function(t, e, n) {
        return Math.abs(Math.abs(e) - Math.abs(t)) > Math.abs(n);
    },
    flick: function(t, e) {
        return this.dragging && this.flickOnEnabledAxis(e) ? (this.scrollLeft = this.scrollHorizontal ? this.calculateFlickDistance(this.scrollLeft, -1 * e.xVelocity) : this.getScrollLeft(), 
        this.scrollTop = this.scrollVertical ? this.calculateFlickDistance(this.scrollTop, -1 * e.yVelocity) : this.getScrollTop(), 
        this.targetScrollLeft = this.scrollLeft, this.targetScrollTop = this.scrollTop, 
        this.boundaryX = null, this.boundaryY = null, this.isInLeftOverScroll() ? this.boundaryX = this.figureBoundary(this.getScrollLeft()) : this.isInRightOverScroll() && (this.boundaryX = this.figureBoundary(-1 * this.bottomBoundary - this.getScrollLeft())), 
        this.isInTopOverScroll() ? this.boundaryY = this.figureBoundary(this.getScrollTop()) : this.isInBottomOverScroll() && (this.boundaryY = this.figureBoundary(-1 * this.bottomBoundary - this.getScrollTop())), 
        this.startScrolling(), this.preventDragPropagation) : void 0;
    },
    flickOnEnabledAxis: function(t) {
        return Math.abs(t.xVelocity) > Math.abs(t.yVelocity) ? this.scrollHorizontal : this.scrollVertical;
    },
    calculateFlickDistance: function(t, e) {
        return t + e * this.kFlickScalar;
    },
    startScrolling: function() {
        this.applyTransition("scroll"), this.effectScroll(), this.setCSSTransitionInterval(), 
        this.scrolling = !0;
    },
    startOverflowScrolling: function() {
        this.applyTransition("bounce"), this.effectScroll(), this.setOverflowTransitionInterval(), 
        this.scrolling = !0;
    },
    applyTransition: function(t) {
        this.$.client.applyStyle("-webkit-transition", this.transitions[t]);
    },
    stopScrolling: function() {
        this.resetCSSTranslationVals(), this.clearCSSTransitionInterval(), this.scrolling = !1;
    },
    setCSSTransitionInterval: function() {
        this.clearCSSTransitionInterval(), this.scrollInterval = setInterval(this.bindSafely(function() {
            this.updateScrollPosition(), this.correctOverflow();
        }), this.scrollIntervalMS);
    },
    setOverflowTransitionInterval: function() {
        this.clearCSSTransitionInterval(), this.scrollInterval = setInterval(this.bindSafely(function() {
            this.updateScrollPosition();
        }), this.scrollIntervalMS);
    },
    updateScrollPosition: function() {
        var t = this.updateY(), e = this.updateX();
        this.scroll(), t || e || this.stop();
    },
    clearCSSTransitionInterval: function() {
        this.scrollInterval && (clearInterval(this.scrollInterval), this.scrollInterval = null);
    },
    resetCSSTranslationVals: function() {
        var t = enyo.dom.getCssTransformProp(), e = window.getComputedStyle(this.$.client.node, null).getPropertyValue(t).split("(")[1].split(")")[0].split(",");
        this.applyTransition("none"), this.scrollLeft = -1 * e[4], this.scrollTop = -1 * e[5], 
        this.effectScroll();
    },
    figureBoundary: function(t) {
        var e = Math.abs(t), n = e - e / Math.pow(e, .02);
        return n = 0 > t ? -1 * n : n;
    },
    transitionComplete: function(t, e) {
        if (e.originator === this.$.client) {
            var n = !1;
            this.isInTopOverScroll() ? (n = !0, this.scrollTop = this.topBoundary) : this.isInBottomOverScroll() && (n = !0, 
            this.scrollTop = -1 * this.bottomBoundary), this.isInLeftOverScroll() ? (n = !0, 
            this.scrollLeft = this.leftBoundary) : this.isInRightOverScroll() && (n = !0, this.scrollLeft = -1 * this.rightBoundary), 
            n ? this.startOverflowScrolling() : this.stop();
        }
    },
    scrollTo: function(t, e) {
        this.setScrollTop(e), this.setScrollLeft(t), this.start();
    },
    getOverScrollBounds: function() {
        return {
            overleft: Math.min(this.leftBoundary + this.scrollLeft, 0) || Math.max(this.rightBoundary + this.scrollLeft, 0),
            overtop: Math.min(this.topBoundary + this.scrollTop, 0) || Math.max(this.bottomBoundary + this.scrollTop, 0)
        };
    }
});

// ../source/touch/Scroller.js
enyo.kind({
    name: "enyo.Scroller",
    published: {
        horizontal: "default",
        vertical: "default",
        scrollTop: 0,
        scrollLeft: 0,
        maxHeight: null,
        touch: !1,
        strategyKind: "ScrollStrategy",
        thumb: !0,
        useMouseWheel: !0
    },
    events: {
        onScrollStart: "",
        onScroll: "",
        onScrollStop: ""
    },
    touchOverscroll: !0,
    preventDragPropagation: !0,
    preventScrollPropagation: !0,
    noDefer: !0,
    handlers: {
        onscroll: "domScroll",
        onScrollStart: "scrollStart",
        onScroll: "scroll",
        onScrollStop: "scrollStop"
    },
    classes: "enyo-scroller",
    statics: {
        osInfo: [ {
            os: "android",
            version: 3
        }, {
            os: "androidChrome",
            version: 18
        }, {
            os: "androidFirefox",
            version: 16
        }, {
            os: "firefoxOS",
            version: 16
        }, {
            os: "ios",
            version: 5
        }, {
            os: "webos",
            version: 1e9
        }, {
            os: "blackberry",
            version: 1e9
        }, {
            os: "tizen",
            version: 2
        } ],
        hasTouchScrolling: function() {
            for (var t, e = 0; t = this.osInfo[e]; e++) if (enyo.platform[t.os]) return !0;
            return (enyo.platform.ie >= 10 || enyo.platform.windowsPhone >= 8) && enyo.platform.touch ? !0 : void 0;
        },
        hasNativeScrolling: function() {
            for (var t, e = 0; t = this.osInfo[e]; e++) if (enyo.platform[t.os] < t.version) return !1;
            return !0;
        },
        getTouchStrategy: function() {
            return enyo.platform.android >= 3 || 8 === enyo.platform.windowsPhone || enyo.platform.webos >= 4 ? "TranslateScrollStrategy" : "TouchScrollStrategy";
        }
    },
    controlParentName: "strategy",
    create: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.horizontalChanged(), this.verticalChanged(), this.useMouseWheelChanged();
        };
    }),
    importProps: enyo.inherit(function(t) {
        return function(e) {
            t.apply(this, arguments), e && void 0 === e.strategyKind && (enyo.Scroller.touchScrolling || this.touch) && (this.strategyKind = enyo.Scroller.getTouchStrategy());
        };
    }),
    initComponents: enyo.inherit(function(t) {
        return function() {
            this.strategyKindChanged(), t.apply(this, arguments);
        };
    }),
    teardownChildren: enyo.inherit(function(t) {
        return function() {
            this.cacheScrollPosition(), t.apply(this, arguments);
        };
    }),
    rendered: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.restoreScrollPosition();
        };
    }),
    strategyKindChanged: function() {
        this.$.strategy && (this.$.strategy.destroy(), this.controlParent = null), this.createStrategy(), 
        this.hasNode() && this.render();
    },
    createStrategy: function() {
        this.createComponents([ {
            name: "strategy",
            maxHeight: this.maxHeight,
            kind: this.strategyKind,
            thumb: this.thumb,
            preventDragPropagation: this.preventDragPropagation,
            overscroll: this.touchOverscroll,
            isChrome: !0
        } ]);
    },
    getStrategy: function() {
        return this.$.strategy;
    },
    maxHeightChanged: function() {
        this.$.strategy.setMaxHeight(this.maxHeight);
    },
    showingChanged: enyo.inherit(function(t) {
        return function() {
            this.showing || this.cacheScrollPosition(!0), t.apply(this, arguments), this.showing && this.restoreScrollPosition();
        };
    }),
    thumbChanged: function() {
        this.$.strategy.setThumb(this.thumb);
    },
    cacheScrollPosition: function(t) {
        var e = {
            left: this.getScrollLeft(),
            top: this.getScrollTop()
        };
        t && (this.setScrollLeft(0), this.setScrollTop(0)), this.cachedPosition = e;
    },
    restoreScrollPosition: function() {
        if (this.cachedPosition) {
            var t = this.cachedPosition;
            (t.top || t.left) && (this.cachedPosition = null, this.setScrollLeft(t.left), this.setScrollTop(t.top));
        }
    },
    horizontalChanged: function() {
        this.$.strategy.setHorizontal(this.horizontal);
    },
    verticalChanged: function() {
        this.$.strategy.setVertical(this.vertical);
    },
    setScrollLeft: function(t) {
        this.scrollLeft = t, this.cachedPosition && (this.cachedPosition.left = t), this.$.strategy.setScrollLeft(this.scrollLeft);
    },
    setScrollTop: function(t) {
        this.scrollTop = t, this.cachedPosition && (this.cachedPosition.top = t), this.$.strategy.setScrollTop(t);
    },
    getScrollLeft: function() {
        return this.scrollLeft = this.$.strategy.getScrollLeft(), this.scrollLeft;
    },
    getScrollTop: function() {
        return this.scrollTop = this.$.strategy.getScrollTop(), this.scrollTop;
    },
    getScrollBounds: function() {
        var t = this.$.strategy.getScrollBounds();
        return (-1 !== t.xDir && 0 !== t.xDir && 1 !== t.xDir || -1 !== t.yDir && 0 !== t.yDir && 1 !== t.yDir) && this.decorateBounds(t), 
        this.scrollTop = t.top, this.scrollLeft = t.left, t;
    },
    scrollIntoView: function(t, e) {
        this.$.strategy.scrollIntoView(t, e);
    },
    scrollTo: function(t, e) {
        this.$.strategy.scrollTo(t, e);
    },
    scrollToControl: function(t, e) {
        this.scrollToNode(t.hasNode(), e);
    },
    scrollToNode: function(t, e) {
        this.$.strategy.scrollToNode(t, e);
    },
    decorateScrollEvent: function(t) {
        var e = t.scrollBounds = t.scrollBounds || this.$.strategy._getScrollBounds();
        (-1 !== e.xDir && 0 !== e.xDir && 1 !== e.xDir || -1 !== e.yDir && 0 !== e.yDir && 1 !== e.yDir) && this.decorateBounds(e), 
        this.scrollTop = e.top, this.scrollLeft = e.left;
    },
    decorateBounds: function(t) {
        var e = this.scrollLeft - t.left, n = this.scrollTop - t.top;
        t.xDir = 0 > e ? 1 : e > 0 ? -1 : 0, t.yDir = 0 > n ? 1 : n > 0 ? -1 : 0, this.scrollLeft = t.left, 
        this.scrollTop = t.top;
    },
    domScroll: function(t, e) {
        return this.$.strategy.domScroll && e.originator == this && this.$.strategy.domScroll(t, e), 
        this.decorateScrollEvent(e), this.doScroll(e), !0;
    },
    shouldStopScrollEvent: function(t) {
        return this.preventScrollPropagation && t.originator.owner != this.$.strategy;
    },
    scrollStart: function(t, e) {
        return this.shouldStopScrollEvent(e) ? !0 : (this.decorateScrollEvent(e), !1);
    },
    scroll: function(t, e) {
        var n;
        return n = e.dispatchTarget ? this.preventScrollPropagation && !(e.originator == this || e.originator.owner == this.$.strategy) : this.shouldStopScrollEvent(e), 
        n ? !0 : (this.decorateScrollEvent(e), !1);
    },
    scrollStop: function(t, e) {
        return this.shouldStopScrollEvent(e) ? !0 : (this.decorateScrollEvent(e), !1);
    },
    scrollToTop: function() {
        this.setScrollTop(0);
    },
    scrollToBottom: function() {
        this.setScrollTop(this.getScrollBounds().maxTop);
    },
    scrollToRight: function() {
        this.setScrollLeft(this.getScrollBounds().maxLeft);
    },
    scrollToLeft: function() {
        this.setScrollLeft(0);
    },
    stabilize: function() {
        var t = this.getStrategy();
        t.stabilize && t.stabilize();
    },
    useMouseWheelChanged: function() {
        this.$.strategy.setUseMouseWheel(this.useMouseWheel);
    },
    resized: enyo.inherit(function(t) {
        return function() {
            this.getAbsoluteShowing(!0) && t.apply(this, arguments);
        };
    })
}), enyo.Scroller.hasTouchScrolling() && (enyo.Scroller.prototype.strategyKind = enyo.Scroller.getTouchStrategy());

// ../source/ui/Anchor.js
enyo.kind({
    name: "enyo.Anchor",
    kind: "enyo.Control",
    tag: "a",
    published: {
        href: "",
        title: ""
    },
    create: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.hrefChanged(), this.titleChanged();
        };
    }),
    hrefChanged: function() {
        this.setAttribute("href", this.href);
    },
    titleChanged: function() {
        this.setAttribute("title", this.title);
    }
});

// ../source/ui/Animator.js
enyo.kind({
    name: "enyo.Animator",
    kind: "Component",
    published: {
        duration: 350,
        startValue: 0,
        endValue: 1,
        node: null,
        easingFunction: enyo.easing.cubicOut
    },
    events: {
        onStep: "",
        onEnd: "",
        onStop: ""
    },
    constructed: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this._next = this.bindSafely("next");
        };
    }),
    destroy: enyo.inherit(function(t) {
        return function() {
            this.stop(), t.apply(this, arguments);
        };
    }),
    play: function(t) {
        return this.stop(), this.reversed = !1, t && enyo.mixin(this, t), this.t0 = this.t1 = enyo.perfNow(), 
        this.value = this.startValue, enyo.jobs.registerPriority(5, this.id), this.job = !0, 
        this.next(), this;
    },
    stop: function() {
        return this.isAnimating() ? (this.cancel(), this.fire("onStop"), this) : void 0;
    },
    reverse: function() {
        if (this.isAnimating()) {
            this.reversed = !this.reversed;
            var t = this.t1 = enyo.perfNow(), e = t - this.t0;
            this.t0 = t + e - this.duration;
            var n = this.startValue;
            return this.startValue = this.endValue, this.endValue = n, this;
        }
    },
    isAnimating: function() {
        return Boolean(this.job);
    },
    requestNext: function() {
        this.job = enyo.requestAnimationFrame(this._next, this.node);
    },
    cancel: function() {
        enyo.cancelRequestAnimationFrame(this.job), this.node = null, this.job = null, enyo.jobs.unregisterPriority(this.id);
    },
    shouldEnd: function() {
        return this.dt >= this.duration;
    },
    next: function() {
        this.t1 = enyo.perfNow(), this.dt = this.t1 - this.t0;
        var t, e = this.easingFunction.length;
        1 === e ? (t = this.fraction = enyo.easedLerp(this.t0, this.duration, this.easingFunction, this.reversed), 
        this.value = this.startValue + t * (this.endValue - this.startValue)) : this.value = enyo.easedComplexLerp(this.t0, this.duration, this.easingFunction, this.reversed, this.dt, this.startValue, this.endValue - this.startValue), 
        t >= 1 && 1 === e || this.shouldEnd() ? (this.value = this.endValue, this.fraction = 1, 
        this.fire("onStep"), this.cancel(), this.fire("onEnd")) : (this.fire("onStep"), 
        this.requestNext());
    },
    fire: function(t) {
        var e = this[t];
        enyo.isString(e) ? this.bubble(t) : e && e.call(this.context || window, this);
    }
});

// ../source/ui/BaseLayout.js
enyo.kind({
    name: "enyo.BaseLayout",
    kind: "enyo.Layout",
    layoutClass: "enyo-positioned",
    reflow: function() {
        enyo.forEach(this.container.children, function(t) {
            null !== t.fit && t.addRemoveClass("enyo-fit", t.fit);
        }, this);
    }
});

// ../source/ui/Image.js
enyo.kind({
    name: "enyo.Image",
    noEvents: !1,
    published: {
        alt: "",
        sizing: "",
        position: "center"
    },
    tag: "img",
    classes: "enyo-image",
    attributes: {
        draggable: "false"
    },
    create: enyo.inherit(function(t) {
        return function() {
            this.noEvents && (delete this.attributes.onload, delete this.attributes.onerror), 
            t.apply(this, arguments), this.altChanged(), this.sizingChanged();
        };
    }),
    srcChanged: enyo.inherit(function(t) {
        return function() {
            this.sizing ? this.applyStyle("background-image", "url(" + enyo.path.rewrite(this.src) + ")") : t.apply(this, arguments);
        };
    }),
    altChanged: function() {
        this.setAttribute("alt", this.alt);
    },
    sizingChanged: function(t) {
        this.tag = this.sizing ? "div" : "img", this.addRemoveClass("sized", !!this.sizing), 
        this.inOld && this.removeClass(t), this.sizing && this.addClass(this.sizing), this.generated && (this.srcChanged(), 
        this.render());
    },
    positionChanged: function() {
        this.sizing && this.applyStyle("background-position", this.containPosition);
    },
    rendered: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), enyo.makeBubble(this, "load", "error");
        };
    }),
    statics: {
        placeholder: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect width="100%" height="100%" style="stroke: #444; stroke-width: 1; fill: #aaa;" /><line x1="0" y1="0" x2="100%" y2="100%" style="stroke: #444; stroke-width: 1;" /><line x1="100%" y1="0" x2="0" y2="100%" style="stroke: #444; stroke-width: 1;" /></svg>'
    }
});

// ../source/ui/Input.js
enyo.kind({
    name: "enyo.Input",
    published: {
        value: "",
        placeholder: "",
        type: "",
        disabled: !1,
        selectOnFocus: !1
    },
    events: {
        onDisabledChange: ""
    },
    defaultFocus: !1,
    tag: "input",
    classes: "enyo-input",
    handlers: {
        onfocus: "focused",
        oninput: "input",
        onclear: "clear",
        ondragstart: "dragstart"
    },
    create: enyo.inherit(function(t) {
        return function() {
            enyo.platform.ie && (this.handlers.onkeyup = "iekeyup"), enyo.platform.windowsPhone && (this.handlers.onkeydown = "iekeydown"), 
            t.apply(this, arguments), this.placeholderChanged(), this.type && this.typeChanged(), 
            this.valueChanged();
        };
    }),
    rendered: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), enyo.makeBubble(this, "focus", "blur"), 8 == enyo.platform.ie && this.setAttribute("onchange", enyo.bubbler), 
            this.disabledChanged(), this.defaultFocus && this.focus();
        };
    }),
    typeChanged: function() {
        this.setAttribute("type", this.type);
    },
    placeholderChanged: function() {
        this.setAttribute("placeholder", this.placeholder);
    },
    disabledChanged: function() {
        this.setAttribute("disabled", this.disabled), this.bubble("onDisabledChange");
    },
    valueChanged: function() {
        var t = this.hasNode(), e = this.attributes;
        t ? (t.value !== this.value && (t.value = this.value), e.value = this.value) : this.setAttribute("value", this.value);
    },
    iekeyup: function(t, e) {
        var n = enyo.platform.ie, i = e.keyCode;
        (8 >= n || 9 == n && (8 == i || 46 == i)) && this.bubble("oninput", e);
    },
    iekeydown: function(t, e) {
        var n = enyo.platform.windowsPhone, i = e.keyCode, o = e.dispatchTarget;
        8 >= n && 13 == i && "input" == this.tag && o.hasNode() && o.node.blur();
    },
    clear: function() {
        this.setValue("");
    },
    dragstart: function() {
        return this.hasFocus();
    },
    focused: function() {
        this.selectOnFocus && enyo.asyncMethod(this, "selectContents");
    },
    selectContents: function() {
        var t = this.hasNode();
        if (t && t.setSelectionRange) t.setSelectionRange(0, t.value.length); else if (t && t.createTextRange) {
            var e = t.createTextRange();
            e.expand("textedit"), e.select();
        }
    },
    input: function() {
        var t = this.getNodeProperty("value");
        this.setValue(t);
    }
});

// ../source/ui/RichText.js
enyo.kind({
    name: "enyo.RichText",
    classes: "enyo-richtext enyo-selectable",
    published: {
        allowHtml: !0,
        disabled: !1,
        value: ""
    },
    defaultFocus: !1,
    protectedStatics: {
        osInfo: [ {
            os: "android",
            version: 3
        }, {
            os: "ios",
            version: 5
        } ],
        hasContentEditable: function() {
            for (var t, e = 0; t = enyo.RichText.osInfo[e]; e++) if (enyo.platform[t.os] < t.version) return !1;
            return !0;
        }
    },
    kind: "enyo.Input",
    attributes: {
        contenteditable: !0
    },
    handlers: {
        onfocus: "focusHandler",
        onblur: "blurHandler",
        onkeyup: "updateValue",
        oncut: "updateValueAsync",
        onpaste: "updateValueAsync",
        oninput: null
    },
    create: enyo.inherit(function(t) {
        return function() {
            this.setTag(enyo.RichText.hasContentEditable() ? "div" : "textarea"), t.apply(this, arguments), 
            this.disabledChanged();
        };
    }),
    focusHandler: function() {
        this._value = this.get("value");
    },
    blurHandler: function() {
        this._value !== this.get("value") && this.bubble("onchange");
    },
    valueChanged: function() {
        var t = this.get("value");
        this.hasFocus() && t !== this.node.innerHTML ? (this.selectAll(), this.insertAtCursor(t)) : this.hasFocus() || this.set("content", t);
    },
    disabledChanged: function() {
        "div" === this.tag ? this.setAttribute("contenteditable", this.disabled ? null : "true") : this.setAttribute("disabled", this.disabled), 
        this.bubble("onDisabledChange");
    },
    updateValue: function() {
        var t = this.node.innerHTML;
        this.set("value", t);
    },
    updateValueAsync: function() {
        enyo.asyncMethod(this.bindSafely("updateValue"));
    },
    hasFocus: function() {
        return this.hasNode() ? document.activeElement === this.node : void 0;
    },
    getSelection: function() {
        return this.hasFocus() ? window.getSelection() : void 0;
    },
    removeSelection: function(t) {
        var e = this.getSelection();
        e && e[t ? "collapseToStart" : "collapseToEnd"]();
    },
    modifySelection: function(t, e, n) {
        var i = this.getSelection();
        i && i.modify(t || "move", e, n);
    },
    moveCursor: function(t, e) {
        this.modifySelection("move", t, e);
    },
    moveCursorToEnd: function() {
        this.moveCursor("forward", "documentboundary");
    },
    moveCursorToStart: function() {
        this.moveCursor("backward", "documentboundary");
    },
    selectAll: function() {
        this.hasFocus() && document.execCommand("selectAll");
    },
    insertAtCursor: function(t) {
        if (this.hasFocus()) {
            var e = this.allowHtml ? t : enyo.Control.escapeHtml(t).replace(/\n/g, "<br/>");
            document.execCommand("insertHTML", !1, e);
        }
    }
});

// ../source/ui/TextArea.js
enyo.kind({
    name: "enyo.TextArea",
    kind: "enyo.Input",
    tag: "textarea",
    classes: "enyo-textarea",
    rendered: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.valueChanged();
        };
    })
});

// ../source/ui/Select.js
enyo.kind({
    name: "enyo.Select",
    published: {
        selected: 0
    },
    handlers: {
        onchange: "change"
    },
    tag: "select",
    defaultKind: "enyo.Option",
    rendered: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), 8 == enyo.platform.ie && this.setAttribute("onchange", enyo.bubbler), 
            this.selectedChanged();
        };
    }),
    getSelected: function() {
        return Number(this.getNodeProperty("selectedIndex", this.selected));
    },
    selectedChanged: function() {
        this.setNodeProperty("selectedIndex", this.selected);
    },
    change: function() {
        this.selected = this.getSelected();
    },
    render: enyo.inherit(function(t) {
        return function() {
            enyo.platform.ie ? this.parent.render() : t.apply(this, arguments);
        };
    }),
    getValue: function() {
        return this.hasNode() ? this.node.value : void 0;
    }
}), enyo.kind({
    name: "enyo.Option",
    published: {
        value: ""
    },
    tag: "option",
    create: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.valueChanged();
        };
    }),
    valueChanged: function() {
        this.setAttribute("value", this.value);
    }
}), enyo.kind({
    name: "enyo.OptionGroup",
    published: {
        label: ""
    },
    tag: "optgroup",
    defaultKind: "enyo.Option",
    create: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.labelChanged();
        };
    }),
    labelChanged: function() {
        this.setAttribute("label", this.label);
    }
});

// ../source/ui/Group.js
enyo.kind({
    name: "enyo.Group",
    published: {
        highlander: !0,
        allowHighlanderDeactivate: !1,
        active: null,
        groupName: null
    },
    handlers: {
        onActivate: "activate"
    },
    activate: function(t, e) {
        (!this.groupName && !e.originator.groupName || e.originator.groupName == this.groupName) && this.highlander && (void 0 !== e.allowHighlanderDeactivate && e.allowHighlanderDeactivate !== this.allowHighlanderDeactivate && this.setAllowHighlanderDeactivate(e.allowHighlanderDeactivate), 
        e.originator.active ? this.setActive(e.originator) : e.originator == this.active && (this.allowHighlanderDeactivate ? this.setActive(null) : this.active.setActive(!0)));
    },
    activeChanged: function(t) {
        t && (t.setActive(!1), t.removeClass("active")), this.active && this.active.addClass("active");
    }
});

// ../source/ui/GroupItem.js
enyo.kind({
    name: "enyo.GroupItem",
    published: {
        active: !1
    },
    rendered: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.activeChanged();
        };
    }),
    activeChanged: function() {
        this.bubble("onActivate");
    }
});

// ../source/ui/ToolDecorator.js
enyo.kind({
    name: "enyo.ToolDecorator",
    kind: "enyo.GroupItem",
    classes: "enyo-tool-decorator"
});

// ../source/ui/Button.js
enyo.kind({
    name: "enyo.Button",
    kind: "enyo.ToolDecorator",
    tag: "button",
    attributes: {
        type: "button"
    },
    published: {
        disabled: !1
    },
    create: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.disabledChanged();
        };
    }),
    disabledChanged: function() {
        this.setAttribute("disabled", this.disabled);
    },
    tap: function() {
        return this.disabled ? !0 : (this.setActive(!0), void 0);
    }
});

// ../source/ui/Checkbox.js
enyo.kind({
    name: "enyo.Checkbox",
    kind: "enyo.Input",
    classes: "enyo-checkbox",
    events: {
        onActivate: ""
    },
    published: {
        checked: !1,
        active: !1,
        type: "checkbox"
    },
    kindClasses: "",
    handlers: {
        onchange: "change",
        onclick: "click"
    },
    rendered: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.active && this.activeChanged(), this.checkedChanged();
        };
    }),
    checkedChanged: function() {
        this.setNodeProperty("checked", this.checked), this.setAttribute("checked", this.checked ? "checked" : ""), 
        this.setActive(this.checked);
    },
    activeChanged: function() {
        this.active = enyo.isTrue(this.active), this.setChecked(this.active), this.bubble("onActivate");
    },
    setValue: function(t) {
        this.setChecked(enyo.isTrue(t));
    },
    getValue: function() {
        return this.getChecked();
    },
    valueChanged: function() {},
    change: function() {
        var t = enyo.isTrue(this.getNodeProperty("checked"));
        this.setActive(t);
    },
    click: function(t, e) {
        8 >= enyo.platform.ie && this.bubble("onchange", e);
    }
});

// ../source/ui/Repeater.js
enyo.kind({
    name: "enyo.Repeater",
    published: {
        count: 0
    },
    events: {
        onSetupItem: ""
    },
    create: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.countChanged();
        };
    }),
    initComponents: enyo.inherit(function(t) {
        return function() {
            this.itemComponents = this.components || this.kindComponents, this.components = this.kindComponents = null, 
            t.apply(this, arguments);
        };
    }),
    countChanged: function() {
        this.build();
    },
    itemAtIndex: function(t) {
        return this.controlAtIndex(t);
    },
    build: function() {
        this.destroyClientControls();
        for (var t, e = 0; this.count > e; e++) t = this.createComponent({
            kind: "enyo.OwnerProxy",
            index: e
        }), t.createComponents(this.itemComponents), this.doSetupItem({
            index: e,
            item: t
        });
        this.render();
    },
    renderRow: function(t) {
        var e = this.itemAtIndex(t);
        this.doSetupItem({
            index: t,
            item: e
        });
    }
}), enyo.kind({
    name: "enyo.OwnerProxy",
    tag: null,
    decorateEvent: enyo.inherit(function(t) {
        return function(e, n) {
            n && (enyo.exists(n.index) ? (n.indices = n.indices || [ n.index ], n.indices.push(this.index)) : n.index = this.index, 
            n.delegate && n.delegate.owner === this && (n.delegate = this.owner)), t.apply(this, arguments);
        };
    })
});

// ../source/ui/DragAvatar.js
enyo.kind({
    name: "enyo._DragAvatar",
    style: "position: absolute; z-index: 10; pointer-events: none; cursor: move;",
    showing: !1,
    showingChanged: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), document.body.style.cursor = this.showing ? "move" : null;
        };
    })
}), enyo.kind({
    name: "enyo.DragAvatar",
    kind: "enyo.Component",
    published: {
        showing: !1,
        offsetX: 20,
        offsetY: 30
    },
    initComponents: enyo.inherit(function(t) {
        return function() {
            this.avatarComponents = this.components, this.components = null, t.apply(this, arguments);
        };
    }),
    requireAvatar: function() {
        this.avatar || (this.avatar = this.createComponent({
            kind: enyo._DragAvatar,
            parentNode: document.body,
            showing: !1,
            components: this.avatarComponents
        }).render());
    },
    showingChanged: function() {
        this.avatar.setShowing(this.showing), document.body.style.cursor = this.showing ? "move" : null;
    },
    drag: function(t) {
        this.requireAvatar(), this.avatar.setBounds({
            top: t.pageY - this.offsetY,
            left: t.pageX + this.offsetX
        }), this.show();
    },
    show: function() {
        this.setShowing(!0);
    },
    hide: function() {
        this.setShowing(!1);
    }
});

// ../source/ui/FloatingLayer.js
enyo.kind({
    name: "enyo.FloatingLayer",
    create: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.setParent(null);
        };
    }),
    hasNode: enyo.inherit(function(t) {
        return function() {
            return t.apply(this, arguments), this.node && !this.node.parentNode && this.teardownRender(), 
            this.node;
        };
    }),
    render: enyo.inherit(function(t) {
        return function() {
            return this.parentNode = document.body, t.apply(this, arguments);
        };
    }),
    generateInnerHtml: function() {
        return "";
    },
    beforeChildRender: function() {
        this.hasNode() || this.render();
    },
    teardownChildren: function() {}
}), enyo.floatingLayer = new enyo.FloatingLayer();

// ../source/ui/Popup.js
enyo.kind({
    name: "enyo.Popup",
    classes: "enyo-popup enyo-no-touch-action",
    published: {
        modal: !1,
        autoDismiss: !0,
        floating: !1,
        centered: !1,
        showTransitions: !1,
        allowDefault: !1
    },
    showing: !1,
    handlers: {
        onkeydown: "keydown",
        ondragstart: "dragstart",
        onfocus: "focus",
        onblur: "blur",
        onRequestShow: "requestShow",
        onRequestHide: "requestHide"
    },
    captureEvents: !0,
    eventsToCapture: {
        ondown: "capturedDown",
        ontap: "capturedTap"
    },
    events: {
        onShow: "",
        onHide: ""
    },
    tools: [ {
        kind: "Signals",
        onKeydown: "keydown"
    } ],
    create: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.canGenerate = !this.floating;
        };
    }),
    render: enyo.inherit(function(t) {
        return function() {
            this.floating && (enyo.floatingLayer.hasNode() || enyo.floatingLayer.render(), this.parentNode = enyo.floatingLayer.hasNode()), 
            t.apply(this, arguments);
        };
    }),
    destroy: enyo.inherit(function(t) {
        return function() {
            this.release(), t.apply(this, arguments);
        };
    }),
    reflow: enyo.inherit(function(t) {
        return function() {
            this.updatePosition(), t.apply(this, arguments);
        };
    }),
    calcViewportSize: function() {
        if (window.innerWidth) return {
            width: window.innerWidth,
            height: window.innerHeight
        };
        var t = document.documentElement;
        return {
            width: t.offsetWidth,
            height: t.offsetHeight
        };
    },
    updatePosition: function() {
        var t = this.calcViewportSize(), e = this.getBounds();
        if (this.targetPosition) {
            var n = this.targetPosition;
            "number" == typeof n.left ? n.left + e.width > t.width ? (n.right = n.left - e.width >= 0 ? t.width - n.left : 0, 
            n.left = null) : n.right = null : "number" == typeof n.right && (n.right + e.width > t.width ? (n.left = n.right - e.width >= 0 ? t.width - n.right : 0, 
            n.right = null) : n.left = null), "number" == typeof n.top ? n.top + e.height > t.height ? (n.bottom = n.top - e.height >= 0 ? t.height - n.top : 0, 
            n.top = null) : n.bottom = null : "number" == typeof n.bottom && (n.bottom + e.height > t.height ? (n.top = n.bottom - e.height >= 0 ? t.height - n.bottom : 0, 
            n.bottom = null) : n.top = null), this.addStyles("left: " + (null !== n.left ? n.left + "px" : "initial") + "; right: " + (null !== n.right ? n.right + "px" : "initial") + "; top: " + (null !== n.top ? n.top + "px" : "initial") + "; bottom: " + (null !== n.bottom ? n.bottom + "px" : "initial") + ";");
        } else this.centered && this.addStyles("top: " + Math.max((t.height - e.height) / 2, 0) + "px; left: " + Math.max((t.width - e.width) / 2, 0) + "px;");
    },
    showingChanged: enyo.inherit(function(t) {
        return function() {
            this.floating && this.showing && !this.hasNode() && this.render(), (this.centered || this.targetPosition) && (this.showTransitions || this.applyStyle("visibility", "hidden"), 
            this.addStyles("top: 0px; left: 0px; right: initial; bottom: initial;")), t.apply(this, arguments), 
            this.showing ? (this.resized(), this.captureEvents && this.capture()) : this.captureEvents && this.release(), 
            (this.centered || this.targetPosition && !this.showTransitions) && this.applyStyle("visibility", null), 
            this.hasNode() && this[this.showing ? "doShow" : "doHide"]();
        };
    }),
    capture: function() {
        enyo.dispatcher.capture(this, this.eventsToCapture);
    },
    release: function() {
        enyo.dispatcher.release(this);
    },
    capturedDown: function(t, e) {
        return this.downEvent = e, this.modal && !this.allowDefault && e.preventDefault(), 
        this.modal;
    },
    capturedTap: function(t, e) {
        return this.autoDismiss && !e.dispatchTarget.isDescendantOf(this) && this.downEvent && !this.downEvent.dispatchTarget.isDescendantOf(this) && (this.downEvent = null, 
        this.hide()), this.modal;
    },
    dragstart: function(t, e) {
        var n = e.dispatchTarget === this || e.dispatchTarget.isDescendantOf(this);
        return t.autoDismiss && !n && t.setShowing(!1), !0;
    },
    keydown: function(t, e) {
        this.showing && this.autoDismiss && 27 == e.keyCode && this.hide();
    },
    blur: function(t, e) {
        e.dispatchTarget.isDescendantOf(this) && (this.lastFocus = e.originator);
    },
    focus: function(t, e) {
        var n = e.dispatchTarget;
        if (this.modal && !n.isDescendantOf(this)) {
            n.hasNode() && n.node.blur();
            var i = this.lastFocus && this.lastFocus.hasNode() || this.hasNode();
            i && i.focus();
        }
    },
    requestShow: function() {
        return this.show(), !0;
    },
    requestHide: function() {
        return this.hide(), !0;
    },
    showAtEvent: function(t, e) {
        var n = {
            left: t.centerX || t.clientX || t.pageX,
            top: t.centerY || t.clientY || t.pageY
        };
        e && (n.left += e.left || 0, n.top += e.top || 0), this.showAtPosition(n);
    },
    showAtPosition: function(t) {
        this.targetPosition = t, this.show();
    }
});

// ../source/ui/Selection.js
enyo.kind({
    name: "enyo.Selection",
    kind: "enyo.Component",
    published: {
        multi: !1
    },
    events: {
        onSelect: "",
        onDeselect: "",
        onChange: ""
    },
    create: enyo.inherit(function(t) {
        return function() {
            this.clear(), t.apply(this, arguments);
        };
    }),
    multiChanged: function() {
        this.multi || this.clear(), this.doChange();
    },
    highlander: function() {
        this.multi || this.deselect(this.lastSelected);
    },
    clear: function() {
        this.selected = {};
    },
    isSelected: function(t) {
        return this.selected[t];
    },
    setByKey: function(t, e, n) {
        if (e) this.selected[t] = n || !0, this.lastSelected = t, this.doSelect({
            key: t,
            data: this.selected[t]
        }); else {
            var i = this.isSelected(t);
            delete this.selected[t], this.doDeselect({
                key: t,
                data: i
            });
        }
        this.doChange();
    },
    deselect: function(t) {
        this.isSelected(t) && this.setByKey(t, !1);
    },
    select: function(t, e) {
        this.multi ? this.setByKey(t, !this.isSelected(t), e) : this.isSelected(t) || (this.highlander(), 
        this.setByKey(t, !0, e));
    },
    toggle: function(t, e) {
        this.multi || this.lastSelected == t || this.deselect(this.lastSelected), this.setByKey(t, !this.isSelected(t), e);
    },
    getSelected: function() {
        return this.selected;
    },
    remove: function(t) {
        var e = {};
        for (var n in this.selected) t > n ? e[n] = this.selected[n] : n > t && (e[n - 1] = this.selected[n]);
        this.selected = e;
    }
});

// ../source/ui/Drawer.js
enyo.kind({
    name: "enyo.Drawer",
    published: {
        open: !0,
        orient: "v",
        animated: !0,
        resizeContainer: !0
    },
    events: {
        onDrawerAnimationStep: "",
        onDrawerAnimationEnd: ""
    },
    style: "overflow: hidden; position: relative;",
    tools: [ {
        kind: "Animator",
        onStep: "animatorStep",
        onEnd: "animatorEnd"
    }, {
        name: "client",
        style: "position: relative;",
        classes: "enyo-border-box"
    } ],
    create: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.animatedChanged(), this.openChanged();
        };
    }),
    initComponents: enyo.inherit(function(t) {
        return function() {
            this.createChrome(this.tools), t.apply(this, arguments);
        };
    }),
    animatedChanged: function() {
        !this.animated && this.hasNode() && this.$.animator.isAnimating() && (this.$.animator.stop(), 
        this.animatorEnd());
    },
    openChanged: function() {
        if (this.$.client.show(), this.hasNode()) if (this.$.animator.isAnimating()) this.$.animator.reverse(); else {
            var t = "v" == this.orient, e = t ? "height" : "width", n = t ? "top" : "left";
            this.applyStyle(e, null);
            var i = this.hasNode()[t ? "scrollHeight" : "scrollWidth"];
            this.animated ? this.$.animator.play({
                startValue: this.open ? 0 : i,
                endValue: this.open ? i : 0,
                dimension: e,
                position: n
            }) : this.animatorEnd();
        } else this.$.client.setShowing(this.open);
    },
    animatorStep: function(t) {
        if (this.hasNode()) {
            var e = t.dimension;
            this.node.style[e] = this.domStyles[e] = t.value + "px";
        }
        var n = this.$.client.hasNode();
        if (n) {
            var i = t.position, o = this.open ? t.endValue : t.startValue;
            n.style[i] = this.$.client.domStyles[i] = t.value - o + "px";
        }
        return this.container && this.resizeContainer && this.container.resized(), this.doDrawerAnimationStep(), 
        !0;
    },
    animatorEnd: function() {
        if (this.open) {
            this.$.client.domCssText = enyo.Control.domStylesToCssText(this.$.client.domStyles);
            var t = "v" == this.orient, e = t ? "height" : "width", n = t ? "top" : "left", i = this.$.client.hasNode();
            i && (i.style[n] = this.$.client.domStyles[n] = null), this.node && (this.node.style[e] = this.domStyles[e] = null);
        } else this.$.client.hide();
        return this.container && this.resizeContainer && this.container.resized(), this.doDrawerAnimationEnd(), 
        !0;
    }
});

// ../source/ui/Table.js
enyo.kind({
    name: "enyo.Table",
    tag: "table",
    attributes: {
        cellpadding: "0",
        cellspacing: "0"
    },
    defaultKind: "enyo.TableRow"
}), enyo.kind({
    name: "enyo.TableRow",
    tag: "tr",
    defaultKind: "enyo.TableCell"
}), enyo.kind({
    name: "enyo.TableCell",
    tag: "td"
});

// ../source/ui/fullscreen.js
enyo.fullscreen = {
    fullscreenControl: null,
    fullscreenElement: null,
    requestor: null,
    elementAccessor: "fullscreenElement" in document ? "fullscreenElement" : "mozFullScreenElement" in document ? "mozFullScreenElement" : "webkitFullscreenElement" in document ? "webkitFullscreenElement" : null,
    requestAccessor: "requestFullscreen" in document.documentElement ? "requestFullscreen" : "mozRequestFullScreen" in document.documentElement ? "mozRequestFullScreen" : "webkitRequestFullscreen" in document.documentElement ? "webkitRequestFullscreen" : null,
    cancelAccessor: "cancelFullScreen" in document ? "cancelFullScreen" : "mozCancelFullScreen" in document ? "mozCancelFullScreen" : "webkitCancelFullScreen" in document ? "webkitCancelFullScreen" : null,
    nativeSupport: function() {
        return null !== this.elementAccessor && null !== this.requestAccessor && null !== this.cancelAccessor;
    },
    getFullscreenElement: function() {
        return this.nativeSupport() ? document[this.elementAccessor] : this.fullscreenElement;
    },
    getFullscreenControl: function() {
        return this.fullscreenControl;
    },
    requestFullscreen: function(t) {
        return this.getFullscreenControl() || !t.hasNode() ? !1 : (this.requestor = t, this.nativeSupport() ? t.hasNode()[this.requestAccessor]() : this.fallbackRequestFullscreen(), 
        !0);
    },
    cancelFullscreen: function() {
        this.nativeSupport() ? document[this.cancelAccessor]() : this.fallbackCancelFullscreen();
    },
    setFullscreenElement: function(t) {
        this.fullscreenElement = t;
    },
    setFullscreenControl: function(t) {
        this.fullscreenControl = t;
    },
    fallbackRequestFullscreen: function() {
        var t = this.requestor;
        t && (t.prevAddBefore = t.parent.controlAtIndex(t.indexInContainer() + 1), enyo.floatingLayer.hasNode() || enyo.floatingLayer.render(), 
        t.addClass("enyo-fullscreen"), t.appendNodeToParent(enyo.floatingLayer.hasNode()), 
        t.resized(), this.setFullscreenControl(t), this.setFullscreenElement(t.hasNode()));
    },
    fallbackCancelFullscreen: function() {
        var t, e, n = this.fullscreenControl;
        n && (t = n.prevAddBefore ? n.prevAddBefore.hasNode() : null, e = n.parent.hasNode(), 
        n.prevAddBefore = null, n.removeClass("enyo-fullscreen"), t ? n.insertNodeInParent(e, t) : n.appendNodeToParent(e), 
        n.resized(), this.setFullscreenControl(null), this.setFullscreenElement(null));
    },
    detectFullscreenChangeEvent: function() {
        this.setFullscreenControl(this.requestor), this.requestor = null, enyo.Signals.send("onFullscreenChange");
    }
}, enyo.ready(function() {
    document.addEventListener && (document.addEventListener("webkitfullscreenchange", enyo.bind(enyo.fullscreen, "detectFullscreenChangeEvent"), !1), 
    document.addEventListener("mozfullscreenchange", enyo.bind(enyo.fullscreen, "detectFullscreenChangeEvent"), !1), 
    document.addEventListener("fullscreenchange", enyo.bind(enyo.fullscreen, "detectFullscreenChangeEvent"), !1));
}), enyo.fullscreen.nativeSupport() || enyo.dispatcher.features.push(function(t) {
    "keydown" === t.type && 27 === t.keyCode && enyo.fullscreen.cancelFullscreen();
});

// ../source/ui/Media.js
enyo.kind({
    name: "enyo.Media",
    published: {
        src: "",
        autoplay: !1,
        defaultPlaybackRate: 1,
        jumpSec: 30,
        playbackRate: 1,
        playbackRateHash: {
            fastForward: [ "2", "4", "8", "16" ],
            rewind: [ "-2", "-4", "-8", "-16" ],
            slowForward: [ "1/4", "1/2", "1" ],
            slowRewind: [ "-1/2", "-1" ]
        },
        preload: "none",
        loop: !1,
        muted: !1,
        showControls: !1,
        volume: 1
    },
    events: {
        onAbort: "",
        onCanPlay: "",
        onCanPlayThrough: "",
        onDurationChange: "",
        onEmptied: "",
        onEnded: "",
        onError: "",
        onLoadedData: "",
        onLoadedMetaData: "",
        onLoadStart: "",
        onPause: "",
        onPlay: "",
        onPlaying: "",
        onProgress: "",
        onRateChange: "",
        onSeeked: "",
        onSeeking: "",
        onStalled: "",
        onTimeUpdate: "",
        onWaiting: "",
        onFastforward: "",
        onSlowforward: "",
        onRewind: "",
        onSlowrewind: "",
        onJumpForward: "",
        onJumpBackward: "",
        onStart: ""
    },
    handlers: {
        onabort: "_abort",
        oncanplay: "_canPlay",
        oncanplaythrough: "_canPlayThrough",
        ondurationchange: "_durationChange",
        onemptied: "_emptied",
        onended: "_ended",
        onerror: "_error",
        onloadeddata: "_loadedData",
        onloadedmetadata: "_loadedMetaData",
        onloadstart: "_loadStart",
        onpause: "_pause",
        onplay: "_play",
        onplaying: "_playing",
        onprogress: "_progress",
        onratechange: "_rateChange",
        onseeked: "_seeked",
        onseeking: "_seeking",
        onstalled: "_stalled",
        ontimeupdate: "_timeUpdate",
        onvolumechange: "_volumeChange",
        onwaiting: "_waiting"
    },
    _playbackRateArray: null,
    _speedIndex: 0,
    create: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.autoplayChanged(), this.loopChanged(), this.preloadChanged(), 
            this.showControlsChanged(), this.srcChanged();
        };
    }),
    rendered: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), enyo.makeBubble(this, "abort"), enyo.makeBubble(this, "canplay"), 
            enyo.makeBubble(this, "canplaythrough"), enyo.makeBubble(this, "durationchange"), 
            enyo.makeBubble(this, "emptied"), enyo.makeBubble(this, "ended"), enyo.makeBubble(this, "error"), 
            enyo.makeBubble(this, "loadeddata"), enyo.makeBubble(this, "loadedmetadata"), enyo.makeBubble(this, "loadstart"), 
            enyo.makeBubble(this, "pause"), enyo.makeBubble(this, "play"), enyo.makeBubble(this, "playing"), 
            enyo.makeBubble(this, "progress"), enyo.makeBubble(this, "ratechange"), enyo.makeBubble(this, "seeked"), 
            enyo.makeBubble(this, "seeking"), enyo.makeBubble(this, "stalled"), enyo.makeBubble(this, "timeupdate"), 
            enyo.makeBubble(this, "volumechange"), enyo.makeBubble(this, "waiting"), this.defaultPlaybackRateChanged(), 
            this.mutedChanged(), this.playbackRateChanged(), this.volumeChanged();
        };
    }),
    srcChanged: function() {
        var t = enyo.path.rewrite(this.src);
        this.setAttribute("src", t), this.hasNode() && this.node.load();
    },
    autoplayChanged: function() {
        this.setAttribute("autoplay", this.autoplay ? "autoplay" : null);
    },
    loopChanged: function() {
        this.setAttribute("loop", this.loop ? "loop" : null);
    },
    mutedChanged: function() {
        this.setAttribute("muted", this.muted ? "muted" : null);
    },
    preloadChanged: function() {
        this.setAttribute("preload", this.preload);
    },
    defaultPlaybackRateChanged: function() {
        this.hasNode() && (this.node.defaultPlaybackRate = this.defaultPlaybackRate);
    },
    selectPlaybackRateArray: function(t) {
        this._playbackRateArray = this.playbackRateHash[t];
    },
    selectPlaybackRate: function(t) {
        return this._playbackRateArray[t];
    },
    clampPlaybackRate: function(t) {
        return this._playbackRateArray ? t % this._playbackRateArray.length : void 0;
    },
    playbackRateChanged: function() {
        this.hasNode() && (this.node.playbackRate = this.playbackRate);
    },
    showControlsChanged: function() {
        this.setAttribute("controls", this.showControls ? "controls" : null);
    },
    volumeChanged: function() {
        this.hasNode() && (this.node.volume = this.volume);
    },
    _abort: function() {
        this.doEnded();
    },
    _canPlay: function() {
        this.doCanPlay();
    },
    _canPlayThrough: function() {
        this.doCanPlayThrough();
    },
    _durationChange: function() {
        this.doDurationChange();
    },
    _emptied: function() {
        this.doEmptied();
    },
    _ended: function() {
        this.doEnded();
    },
    _error: function() {
        this.doError();
    },
    _loadedData: function() {
        this.doLoadedData();
    },
    _loadedMetaData: function() {
        this.doLoadedMetaData();
    },
    _loadStart: function() {
        this.doLoadStart();
    },
    _pause: function() {
        this.doPause();
    },
    _play: function() {
        this.doPlay();
    },
    _playing: function() {
        this.doPlaying();
    },
    _progress: function() {
        this.doProgress();
    },
    createEventData: function() {
        var t = this.hasNode();
        return t ? (0 === t.currentTime && this.doStart(), {
            srcElement: t,
            duration: t.duration,
            currentTime: t.currentTime,
            playbackRate: this.getPlaybackRate()
        }) : {};
    },
    calcNumberValueOfPlaybackRate: function(t) {
        var e = (t + "").split("/");
        return e.length > 1 ? parseInt(e[0], 10) / parseInt(e[1], 10) : parseInt(t, 10);
    },
    _rateChange: function(t, e) {
        var n, i = this.hasNode();
        i && (e = enyo.mixin(e, this.createEventData()), n = this.calcNumberValueOfPlaybackRate(e.playbackRate), 
        n > 0 && 1 > n ? this.doSlowforward(e) : n > 1 ? this.doFastforward(e) : 0 > n && n >= -1 ? this.doSlowrewind(e) : -1 > n ? this.doRewind(e) : 1 == n && this.doPlay(e));
    },
    _stalled: function() {
        this.doStalled();
    },
    _seeked: function() {
        this.doSeeked();
    },
    _seeking: function() {
        this.doSeeking();
    },
    _timeUpdate: function(t, e) {
        var n = this.hasNode();
        n && (e = enyo.mixin(e, this.createEventData()));
    },
    _volumeChange: function() {
        this.doVolumeChange();
    },
    _waiting: function() {
        this.doWaiting();
    },
    play: function() {
        this.hasNode() && (this.setPlaybackRate(1), this._prevCommand = "play", this.node.play());
    },
    pause: function() {
        this.hasNode() && (this.setPlaybackRate(1), this._prevCommand = "pause", this.node.pause());
    },
    seekTo: function(t) {
        this.hasNode() && (this.node.currentTime = t);
    },
    getBuffered: function() {
        return this.hasNode() ? this.node.buffered : 0;
    },
    getCurrentTime: function() {
        return this.hasNode() ? this.node.currentTime : 0;
    },
    getDuration: function() {
        return this.hasNode() ? this.node.duration : 0;
    },
    getPaused: function() {
        return this.hasNode() ? this.node.paused : void 0;
    },
    getPlayed: function() {
        return this.hasNode() ? this.node.played : void 0;
    },
    getReadyState: function() {
        return this.hasNode() ? this.node.readyState : void 0;
    },
    getSeekable: function() {
        return this.hasNode() ? this.node.seekable : void 0;
    },
    setCurrentTime: function(t) {
        "number" == typeof t && this.hasNode() && (this.node.currentTime = t);
    },
    beginRewind: function() {
        this.node.pause(), this.startRewindJob();
    },
    _rewind: function() {
        var t = enyo.perfNow(), e = t - this.rewindBeginTime, n = this.calcNumberValueOfPlaybackRate(this.playbackRate), i = Math.abs(e * n) / 1e3, o = this.getCurrentTime() - i;
        this.setCurrentTime(o), this.startRewindJob();
    },
    startRewindJob: function() {
        this.rewindBeginTime = enyo.perfNow(), enyo.job(this.id + "rewind", this.bindSafely("_rewind"), 100);
    },
    stopRewindJob: function() {
        enyo.job.stop(this.id + "rewind");
    },
    getSeeking: function() {
        return this.hasNode() ? this.node.seeking : void 0;
    },
    isPaused: function() {
        return this.hasNode() ? this.hasNode().paused : !0;
    },
    fastForward: function() {
        var t = this.hasNode();
        if (t) {
            switch (this._prevCommand) {
              case "slowForward":
                this._speedIndex == this._playbackRateArray.length - 1 ? (this.selectPlaybackRateArray("fastForward"), 
                this._speedIndex = 0, this._prevCommand = "fastForward") : (this._speedIndex = this.clampPlaybackRate(this._speedIndex + 1), 
                this._prevCommand = "slowForward");
                break;

              case "pause":
                this.selectPlaybackRateArray("slowForward"), this._speedIndex = 0, this.isPaused() && t.play(), 
                this._prevCommand = "slowForward";
                break;

              case "rewind":
                var e = this.calcNumberValueOfPlaybackRate(this.playbackRate);
                0 > e ? (this.selectPlaybackRateArray("slowForward"), this._prevCommand = "slowForward") : (this.selectPlaybackRateArray("fastForward"), 
                this._prevCommand = "fastForward"), this._speedIndex = 0;
                break;

              case "fastForward":
                this._speedIndex = this.clampPlaybackRate(this._speedIndex + 1), this._prevCommand = "fastForward";
                break;

              default:
                this.selectPlaybackRateArray("fastForward"), this._speedIndex = 0, this._prevCommand = "fastForward";
            }
            this.setPlaybackRate(this.selectPlaybackRate(this._speedIndex));
        }
    },
    rewind: function() {
        var t = this.hasNode();
        if (t) {
            switch (this._prevCommand) {
              case "slowRewind":
                this._speedIndex == this._playbackRateArray.length - 1 ? (this.selectPlaybackRateArray("rewind"), 
                this._speedIndex = 0, this._prevCommand = "rewind") : (this._speedIndex = this.clampPlaybackRate(this._speedIndex + 1), 
                this._prevCommand = "slowRewind");
                break;

              case "pause":
                this.selectPlaybackRateArray("slowRewind"), this._speedIndex = 0, this.isPaused() && this.node.duration > this.node.currentTime && t.play(), 
                this._prevCommand = "slowRewind";
                break;

              case "rewind":
                this._speedIndex = this.clampPlaybackRate(this._speedIndex + 1), this._prevCommand = "rewind";
                break;

              default:
                this.selectPlaybackRateArray("rewind"), this._speedIndex = 0, this._prevCommand = "rewind";
            }
            this.setPlaybackRate(this.selectPlaybackRate(this._speedIndex));
        }
    },
    setPlaybackRate: function(t) {
        var e, n = this.hasNode();
        n && (this.stopRewindJob(), this.playbackRate = t += "", e = this.calcNumberValueOfPlaybackRate(t), 
        n.playbackRate = e, enyo.platform.webos || window.PalmSystem || 0 > e && this.beginRewind());
    },
    jumpBackward: function() {
        var t = this.hasNode();
        t && (this.setPlaybackRate(1), t.currentTime -= this.jumpSec, this._prevCommand = "jumpBackward", 
        this.doJumpBackward(enyo.mixin(this.createEventData(), {
            jumpSize: this.jumpSec
        })));
    },
    jumpForward: function() {
        var t = this.hasNode();
        t && (this.setPlaybackRate(1), t.currentTime += this.jumpSec, this._prevCommand = "jumpForward", 
        this.doJumpForward(enyo.mixin(this.createEventData(), {
            jumpSize: this.jumpSec
        })));
    },
    jumpToStart: function() {
        var t = this.hasNode();
        t && (this.setPlaybackRate(1), t.pause(), t.currentTime = 0, this._prevCommand = "jumpToStart");
    },
    jumpToEnd: function() {
        var t = this.hasNode();
        t && (this.setPlaybackRate(1), t.pause(), t.currentTime = this.node.duration, this._prevCommand = "jumpToEnd");
    }
});

// ../source/ui/Audio.js
enyo.kind({
    name: "enyo.Audio",
    kind: "enyo.Media",
    tag: "audio",
    published: {
        preload: "auto"
    }
});

// ../source/ui/Video.js
enyo.kind({
    name: "enyo.Video",
    kind: enyo.Control,
    published: {
        src: "",
        sourceComponents: null,
        poster: "",
        showControls: !1,
        preload: "metadata",
        autoplay: !1,
        loop: !1,
        fitToWindow: !1,
        aspectRatio: null,
        jumpSec: 30,
        playbackRate: 1,
        playbackRateHash: {
            fastForward: [ "2", "4", "8", "16" ],
            rewind: [ "-2", "-4", "-8", "-16" ],
            slowForward: [ "1/4", "1/2", "1" ],
            slowRewind: [ "-1/2", "-1" ]
        }
    },
    events: {
        onFastforward: "",
        onSlowforward: "",
        onRewind: "",
        onSlowrewind: "",
        onJumpForward: "",
        onJumpBackward: "",
        onPlay: "",
        onStart: ""
    },
    handlers: {
        onloadedmetadata: "metadataLoaded",
        ontimeupdate: "timeupdate",
        onratechange: "ratechange",
        onplay: "_play"
    },
    tag: "video",
    _playbackRateArray: null,
    _speedIndex: 0,
    create: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.posterChanged(), this.showControlsChanged(), this.preloadChanged(), 
            this.autoplayChanged(), this.loopChanged();
        };
    }),
    rendered: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.hookupVideoEvents();
        };
    }),
    posterChanged: function() {
        if (this.poster) {
            var t = enyo.path.rewrite(this.poster);
            this.setAttribute("poster", t);
        } else this.setAttribute("poster", null);
    },
    showControlsChanged: function() {
        this.setAttribute("controls", this.showControls ? "controls" : null);
    },
    preloadChanged: function() {
        this.setAttribute("preload", this.preload ? this.preload : null);
    },
    autoplayChanged: function() {
        this.setAttribute("autoplay", this.autoplay ? "autoplay" : null), this._prevCommand = this.autoplay ? "play" : "pause";
    },
    loopChanged: function() {
        this.setAttribute("loop", this.loop ? "loop" : null);
    },
    fitToWindowChanged: function() {
        !this.hasNode();
    },
    srcChanged: function() {
        this.setAttribute("src", enyo.path.rewrite(this.src));
    },
    load: function() {
        this.hasNode() && this.hasNode().load();
    },
    unload: function() {
        this.set("src", ""), this.load();
    },
    play: function() {
        this.hasNode() && (this._speedIndex = 0, this.setPlaybackRate(1), this.node.play(), 
        this._prevCommand = "play");
    },
    pause: function() {
        this.hasNode() && (this._speedIndex = 0, this.setPlaybackRate(1), this.node.pause(), 
        this._prevCommand = "pause");
    },
    fastForward: function() {
        var t = this.hasNode();
        if (t) {
            switch (this._prevCommand) {
              case "slowForward":
                this._speedIndex == this._playbackRateArray.length - 1 ? (this.selectPlaybackRateArray("fastForward"), 
                this._speedIndex = 0, this._prevCommand = "fastForward") : (this._speedIndex = this.clampPlaybackRate(this._speedIndex + 1), 
                this._prevCommand = "slowForward");
                break;

              case "pause":
                this.selectPlaybackRateArray("slowForward"), this._speedIndex = 0, this.isPaused() && t.play(), 
                this._prevCommand = "slowForward";
                break;

              case "rewind":
                var e = this.calcNumberValueOfPlaybackRate(this.playbackRate);
                0 > e ? (this.selectPlaybackRateArray("slowForward"), this._prevCommand = "slowForward") : (this.selectPlaybackRateArray("fastForward"), 
                this._prevCommand = "fastForward"), this._speedIndex = 0;
                break;

              case "fastForward":
                this._speedIndex = this.clampPlaybackRate(this._speedIndex + 1), this._prevCommand = "fastForward";
                break;

              default:
                this.selectPlaybackRateArray("fastForward"), this._speedIndex = 0, this._prevCommand = "fastForward";
            }
            this.setPlaybackRate(this.selectPlaybackRate(this._speedIndex));
        }
    },
    rewind: function() {
        var t = this.hasNode();
        if (t) {
            switch (this._prevCommand) {
              case "slowRewind":
                this._speedIndex == this._playbackRateArray.length - 1 ? (this.selectPlaybackRateArray("rewind"), 
                this._speedIndex = 0, this._prevCommand = "rewind") : (this._speedIndex = this.clampPlaybackRate(this._speedIndex + 1), 
                this._prevCommand = "slowRewind");
                break;

              case "pause":
                this.selectPlaybackRateArray("slowRewind"), this._speedIndex = 0, this.isPaused() && this.node.duration > this.node.currentTime && t.play(), 
                this._prevCommand = "slowRewind";
                break;

              case "rewind":
                this._speedIndex = this.clampPlaybackRate(this._speedIndex + 1), this._prevCommand = "rewind";
                break;

              default:
                this.selectPlaybackRateArray("rewind"), this._speedIndex = 0, this._prevCommand = "rewind";
            }
            this.setPlaybackRate(this.selectPlaybackRate(this._speedIndex));
        }
    },
    jumpBackward: function() {
        var t = this.hasNode();
        t && (this.setPlaybackRate(1), t.currentTime -= this.jumpSec, this._prevCommand = "jumpBackward", 
        this.doJumpBackward(enyo.mixin(this.createEventData(), {
            jumpSize: this.jumpSec
        })));
    },
    jumpForward: function() {
        var t = this.hasNode();
        t && (this.setPlaybackRate(1), t.currentTime += parseInt(this.jumpSec, 10), this._prevCommand = "jumpForward", 
        this.doJumpForward(enyo.mixin(this.createEventData(), {
            jumpSize: this.jumpSec
        })));
    },
    jumpToStart: function() {
        var t = this.hasNode();
        t && (this.setPlaybackRate(1), t.pause(), t.currentTime = 0, this._prevCommand = "jumpToStart");
    },
    jumpToEnd: function() {
        var t = this.hasNode();
        t && (this.setPlaybackRate(1), t.pause(), t.currentTime = this.node.duration, this._prevCommand = "jumpToEnd");
    },
    selectPlaybackRateArray: function(t) {
        this._playbackRateArray = this.playbackRateHash[t];
    },
    clampPlaybackRate: function(t) {
        return this._playbackRateArray ? t % this._playbackRateArray.length : void 0;
    },
    selectPlaybackRate: function(t) {
        return this._playbackRateArray[t];
    },
    setPlaybackRate: function(t) {
        var e, n = this.hasNode();
        n && (this.stopRewindJob(), this.playbackRate = t += "", e = this.calcNumberValueOfPlaybackRate(t), 
        n.playbackRate = e, enyo.platform.webos || window.PalmSystem || 0 > e && this.beginRewind());
    },
    isPaused: function() {
        return this.hasNode() ? this.hasNode().paused : !0;
    },
    getCurrentTime: function() {
        return this.hasNode() ? this.hasNode().currentTime : 0;
    },
    getBufferedTimeRange: function() {
        return this.hasNode() ? this.hasNode().buffered : 0;
    },
    setCurrentTime: function(t) {
        "number" == typeof t && this.hasNode() && (this.node.currentTime = t);
    },
    getDuration: function() {
        return this.hasNode() ? this.hasNode().duration : 0;
    },
    getReadyState: function() {
        return this.hasNode() ? this.hasNode().readyState : -1;
    },
    getSeeking: function() {
        return this.hasNode() ? this.hasNode().seeking : -1;
    },
    beginRewind: function() {
        this.node.pause(), this.startRewindJob();
    },
    _rewind: function() {
        var t = enyo.perfNow(), e = t - this.rewindBeginTime, n = this.calcNumberValueOfPlaybackRate(this.playbackRate), i = Math.abs(e * n) / 1e3, o = this.getCurrentTime() - i;
        this.setCurrentTime(o), this.startRewindJob();
    },
    startRewindJob: function() {
        this.rewindBeginTime = enyo.perfNow(), enyo.job(this.id + "rewind", this.bindSafely("_rewind"), 100);
    },
    stopRewindJob: function() {
        enyo.job.stop(this.id + "rewind");
    },
    calcNumberValueOfPlaybackRate: function(t) {
        var e = (t + "").split("/");
        return e.length > 1 ? parseInt(e[0], 10) / parseInt(e[1], 10) : parseInt(t, 10);
    },
    metadataLoaded: function(t, e) {
        var n = this.hasNode();
        this.setAspectRatio("none"), n && n.videoWidth && n.videoHeight && (this.setAspectRatio(n.videoWidth / n.videoHeight + ":1"), 
        e = enyo.mixin(e, this.createEventData()));
    },
    timeupdate: function(t, e) {
        var n = this.hasNode();
        n && (e = enyo.mixin(e, this.createEventData()));
    },
    ratechange: function(t, e) {
        var n, i = this.hasNode();
        i && (e = enyo.mixin(e, this.createEventData()), n = this.calcNumberValueOfPlaybackRate(e.playbackRate), 
        n > 0 && 1 > n ? this.doSlowforward(e) : n > 1 ? this.doFastforward(e) : 0 > n && n >= -1 ? this.doSlowrewind(e) : -1 > n ? this.doRewind(e) : 1 == n && this.doPlay(e));
    },
    createEventData: function() {
        var t = this.hasNode();
        return t ? (0 === t.currentTime && this.doStart(), {
            srcElement: t,
            duration: t.duration,
            currentTime: t.currentTime,
            playbackRate: this.getPlaybackRate()
        }) : {};
    },
    _play: function(t, e) {
        var n = this.hasNode();
        n && (e = enyo.mixin(e, this.createEventData()), this.doPlay(e));
    },
    hookupVideoEvents: function() {
        enyo.makeBubble(this, "loadstart", "emptied", "canplaythrough", "ended", "ratechange", "progress", "stalled", "playing", "durationchange", "volumechange", "suspend", "loadedmetadata", "waiting", "timeupdate", "abort", "loadeddata", "seeking", "play", "error", "canplay", "seeked", "pause");
    }
});

// ../source/ui/data/RepeaterChildSupport.js
(function(t) {
    t.RepeaterChildSupport = {
        name: "RepeaterChildSupport",
        selected: !1,
        selectedChanged: t.inherit(function(t) {
            return function() {
                if (this.repeater.selection) {
                    this.addRemoveClass(this.selectedClass || "selected", this.selected);
                    var e = this.repeater.collection.indexOf(this.model);
                    this.selected && !this.repeater.isSelected(this.model) ? this.repeater.select(e) : !this.selected && this.repeater.isSelected(this.model) && this.repeater.deselect(e);
                }
                t.apply(this, arguments);
            };
        }),
        decorateEvent: t.inherit(function(t) {
            return function(e, n) {
                n.model = this.model, n.child = this, n.index = this.repeater.collection.indexOf(this.model), 
                t.apply(this, arguments);
            };
        }),
        _selectionHandler: function() {
            this.repeater.selection && !this.get("disabled") && this.set("selected", !this.selected);
        },
        createClientComponents: t.inherit(function() {
            return function(t) {
                this.createComponents(t, {
                    owner: this
                });
            };
        }),
        dispatchEvent: t.inherit(function(e) {
            return function(n, i) {
                return i._fromRepeaterChild || ~t.indexOf(n, this.repeater.selectionEvents) && (this._selectionHandler(), 
                i._fromRepeaterChild = !0), e.apply(this, arguments);
            };
        }),
        constructed: t.inherit(function(e) {
            return function() {
                e.apply(this, arguments);
                var n = this.repeater, i = n.selectionProperty;
                if (i) {
                    var o = this.binding({
                        from: ".model." + i,
                        to: ".selected",
                        oneWay: !1,
                        kind: t.BooleanBinding
                    });
                    this._selectionBindingId = o.id;
                }
            };
        }),
        destroy: t.inherit(function(e) {
            return function() {
                if (this._selectionBindingId) {
                    var n = t.Binding.find(this._selectionBindingId);
                    n && n.destroy();
                }
                e.apply(this, arguments);
            };
        }),
        _selectionBindingId: null
    };
})(enyo);

// ../source/ui/data/DataRepeater.js
enyo.kind({
    name: "enyo.DataRepeater",
    selection: !0,
    multipleSelection: !1,
    selectionClass: "selection-enabled",
    multipleSelectionClass: "multiple-selection-enabled",
    selectionProperty: "",
    selectionEvents: "ontap",
    childBindingDefaults: null,
    initComponents: function() {
        this.initContainer();
        var t = this.kindComponents || this.components || [], e = this.getInstanceOwner(), n = this.defaultProps ? enyo.clone(this.defaultProps) : this.defaultProps = {};
        n.bindingTransformOwner = this, n.bindingDefaults = this.childBindingDefaults, t && (t.length > 1 ? n.components = t : enyo.mixin(n, t[0]), 
        n.repeater = this, n.owner = e, n.mixins = n.mixins ? n.mixins.concat(this.childMixins) : this.childMixins);
    },
    constructor: enyo.inherit(function(t) {
        return function() {
            this._selection = [];
            var e = this.selectionEvents;
            this.selectionEvents = "string" == typeof e ? e.split(" ") : e;
            var n = this._handlers = enyo.clone(this._handlers);
            for (var i in n) n[i] = this.bindSafely(n[i]);
            t.apply(this, arguments);
        };
    }),
    create: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.collectionChanged(), this.selectionChanged();
        };
    }),
    observers: {
        selectionChanged: [ "multipleSelection" ]
    },
    selectionChanged: function() {
        this.addRemoveClass(this.selectionClass, this.selection), this.addRemoveClass(this.multipleSelectionClass, this.multipleSelection && this.selection);
    },
    reset: function() {
        var t = this.get("data");
        this.destroyClientControls();
        for (var e, n = 0; e = t.at(n); ++n) this.add(e, n);
        this.hasReset = !0;
    },
    refresh: function() {
        return this.hasReset ? (this.startJob("refreshing", function() {
            for (var t, e, n = this.get("data"), i = this.getClientControls(), o = 0; e = n.at(o); ++o) t = i[o], 
            t ? t.set("model", e) : this.add(e, o);
            this.prune();
        }, 16), void 0) : this.reset();
    },
    rendered: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.collection && this.length && this.reset(), this.hasRendered = !0;
        };
    }),
    add: function(t, e) {
        var n = this.createComponent({
            model: t,
            index: e
        });
        this.generated && !this.batching && n.render();
    },
    remove: function(t) {
        var e = this.getClientControls(), n = e[t || Math.abs(e.length - 1)];
        n && n.destroy();
    },
    prune: function() {
        var t, e = this.getClientControls();
        if (e.length > this.length) {
            t = e.slice(this.length);
            for (var n, i = 0; n = t[i]; ++i) n.destroy();
        }
    },
    initContainer: function() {
        var t = this.get("containerOptions"), e = t.name || (t.name = this.containerName);
        this.createChrome([ t ]), this.discoverControlParent(), e != this.containerName && (this.$[this.containerName] = this.$[e]);
    },
    handlers: {
        onSelected: "childSelected",
        onDeselected: "childDeselected"
    },
    _handlers: {
        add: "modelsAdded",
        remove: "modelsRemoved",
        reset: "refresh"
    },
    controllerChanged: function() {
        var t = this.controller;
        this.controller = void 0, !t || this.collection && this.collection === t || this.warn("the `controller` property has been deprecated, please update and use `collection` instead - including any bindings currently mapped directly to `controller`"), 
        this.set("collection", t);
    },
    collectionChanged: function(t) {
        if (this.controller && this.controller !== t) return this.controllerChanged();
        var e = this.collection;
        "string" == typeof e && (e = this.collection = enyo.getPath(e)), e && (this.initCollection(e, t), 
        this.controller = e);
    },
    initCollection: function(t, e) {
        var n;
        if (t && t.addListener) for (n in this._handlers) t.addListener(n, this._handlers[n]);
        if (e && e.removeListener) for (n in this._handlers) e.removeListener(n, this._handlers[n]);
    },
    modelsAdded: function(t, e, n) {
        if (t == this.collection) {
            this.set("batching", !0);
            for (var i, o = 0; !isNaN(i = n.records[o]); ++o) this.add(t.at(i), i);
            this.set("batching", !1);
        }
    },
    modelsRemoved: function(t, e, n) {
        if (t == this.collection) for (var i, o = enyo.keys(n.records), s = o.length - 1; i = o[s]; --s) this.remove(i), 
        this.deselect(i);
    },
    batchingChanged: function(t, e) {
        this.generated && !1 === e && this.$[this.containerName].render();
    },
    getChildForIndex: function(t) {
        return this.childForIndex(t);
    },
    childForIndex: function(t) {
        return this.$.container.children[t];
    },
    data: function() {
        return this.collection;
    },
    select: function(t) {
        var e, n = this.childForIndex(t), i = this.collection.at(t), o = this._selection;
        if (this.selection) {
            if (this.multipleSelection && !~enyo.indexOf(i, o)) o.push(i); else if (!~enyo.indexOf(i, o)) {
                for (;o.length; ) e = this.collection.indexOf(o.pop()), this.deselect(e);
                o.push(i);
            }
            n && n.set("selected", !0), this.selectionProperty && (o = this.selectionProperty) && i.set(o, !0), 
            this.notifyObservers("selected");
        }
    },
    deselect: function(t) {
        var e, n = this.getChildForIndex(t), i = this.collection.at(t), o = this._selection;
        e = enyo.indexOf(i, o), ~e && o.splice(e, 1), n && n.set("selected", !1), this.selectionProperty && i && (o = this.selectionProperty) && i.set(o, !1), 
        this.notifyObservers("selected");
    },
    isSelected: function(t) {
        return !!~enyo.indexOf(t, this._selection);
    },
    selectAll: function() {
        if (this.multipleSelection) {
            this.stopNotifications();
            var t = this._selection;
            t.length = 0;
            for (var e = 0; this.length > e; ++e) this.select(e);
            this.startNotifications();
        }
    },
    deselectAll: function() {
        if (this.selection) {
            this.stopNotifications();
            for (var t, e, n = this._selection; n.length; ) t = n.pop(), e = this.collection.indexOf(t), 
            this.deselect(e);
            this.startNotifications();
        }
    },
    selected: function() {
        return (this.multipleSelection ? this._selection : this._selection[0]) || null;
    },
    dataChanged: function() {
        this.collection && this.hasRendered && this.reset();
    },
    computed: {
        selected: [],
        data: [ "controller", "collection" ]
    },
    noDefer: !0,
    childMixins: [ enyo.RepeaterChildSupport ],
    controlParentName: "container",
    containerName: "container",
    containerOptions: {
        name: "container",
        classes: "enyo-fill enyo-data-repeater-container"
    },
    bindings: [ {
        from: ".collection.length",
        to: ".length"
    } ],
    batching: !1,
    _selection: null
}), enyo.DataRepeater.concat = function(t, e) {
    var n = t.prototype || t;
    if (e.childMixins && (n.childMixins = n.childMixins ? enyo.merge(n.childMixins, e.childMixins) : e.childMixins.slice(), 
    delete e.childMixins), e.bindings) for (var i, o = /controller/g, s = 0; i = e.bindings[s]; ++s) ("string" == typeof i.source && o.test(i.source) || o.test(i.from) || "string" == typeof i.target && o.test(i.target) || o.test(i.to)) && (enyo.warn(n.kindName + ".concat: the `controller` property has been deprecated, please use `collection` " + "including any bindings that use `controller`, this is automatically updated for you but will be removed " + "in a future release"), 
    "string" == typeof i.source && (i.source = i.source.replace(o, "collection")), i.from = i.from.replace(o, "collection"), 
    "string" == typeof i.target && (i.target = i.target.replace(o, "collection")), i.to = i.to.replace(o, "collection"));
};

// ../source/ui/data/DataList.js
enyo.kind({
    name: "enyo.DataList",
    kind: enyo.DataRepeater,
    scrollerOptions: null,
    orientation: "vertical",
    pageSizeMultiplier: null,
    fixedChildSize: null,
    allowTransitions: !0,
    renderDelay: 250,
    reset: function() {
        this.get("absoluteShowing") ? this.generated && this.$.scroller.generated && this.delegate.reset(this) : this._addToShowingQueue("reset", this.reset);
    },
    refresh: function() {
        this.get("absoluteShowing") ? this.hasRendered && this.delegate.refresh(this) : this._addToShowingQueue("refresh", this.refresh);
    },
    scrollToIndex: function(t) {
        t >= 0 && this.length > t && (this.get("absoluteShowing") ? this.delegate.scrollToIndex(this, t) : this._addToShowingQueue("scrollToIndex", function() {
            this.delegate.scrollToIndex(this, t);
        }));
    },
    constructor: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.metrics = {}, this.metrics.pages = {}, null === this.pageSizeMultiplier || isNaN(this.pageSizeMultiplier) || (this.pageSizeMultiplier = Math.max(1.2, this.pageSizeMultiplier));
        };
    }),
    create: enyo.inherit(function(t) {
        return function() {
            this.allowTransitionsChanged(), this.delegate = this.ctor.delegates[this.orientation] || this.base.delegates.vertical, 
            this.delegate.initList && this.delegate.initList(this), t.apply(this, arguments), 
            this.pages = [ this.$.page1, this.$.page2 ];
        };
    }),
    render: enyo.inherit(function(t) {
        return function() {
            this.$.scroller.canGenerate = !1, this.$.scroller.teardownRender(), t.apply(this, arguments);
        };
    }),
    rendered: function() {
        if (this.get("absoluteShowing")) {
            var t = function() {
                this.$.scroller.canGenerate = !0, this.$.scroller.render(), this.delegate.rendered(this), 
                this.hasRendered = !0, this.addClass("rendered"), this.didRender && this.didRender();
            };
            null === this.renderDelay ? t.call(this) : this.startJob("rendering", t, this.renderDelay);
        } else this._addToShowingQueue("rendered", this.rendered);
    },
    _absoluteShowingChanged: function() {
        if (this.get("absoluteShowing") && this._showingQueue && this._showingQueue.length) {
            var t, e, n = this._showingQueue, i = this._showingQueueMethods;
            this._showingQueue = null, this._showingQueueMethods = null;
            do e = n.shift(), t = i[e], t.call(this); while (n.length);
        }
    },
    _addToShowingQueue: function(t, e) {
        var n = this._showingQueue || (this._showingQueue = []), i = this._showingQueueMethods || (this._showingQueueMethods = {}), o = enyo.indexOf(t, n);
        o >= 0 && n.splice(o, 1), n.push(t), i[t] = e;
    },
    modelsAdded: function(t, e, n) {
        t === this.collection && this.$.scroller.canGenerate && (this.get("absoluteShowing") ? this.delegate.modelsAdded(this, n) : this._addToShowingQueue("refresh", function() {
            this.refresh();
        }));
    },
    modelsRemoved: function(t, e, n) {
        t === this.collection && this.$.scroller.canGenerate && (this.get("absoluteShowing") ? this.delegate.modelsRemoved(this, n) : this._addToShowingQueue("refresh", function() {
            this.refresh();
        }));
    },
    destroy: enyo.inherit(function(t) {
        return function() {
            this.delegate && this.delegate.destroyList && this.delegate.destroyList(this), this._showingQueue = null, 
            this._showingQueueMethods = null, t.apply(this, arguments);
        };
    }),
    initContainer: enyo.inherit(function(t) {
        return function() {
            var e = enyo.clone(this.get("containerOptions")), n = this.get("scrollerOptions");
            n && enyo.mixin(e, n, {
                exists: !0
            }), this.set("containerOptions", e), t.apply(this, arguments);
        };
    }),
    didScroll: function(t, e) {
        return this.hasRendered && this.collection && ((this.heightNeedsUpdate || this.widthNeedsUpdate) && (this.heightNeedsUpdate = this.widthNeedsUpdate = !1, 
        this.refresh()), this.delegate.didScroll(this, e)), !0;
    },
    didResize: function(t, e) {
        this.get("absoluteShowing") ? this.hasRendered && this.collection && ((this.heightNeedsUpdate || this.widthNeedsUpdate) && (this.heightNeedsUpdate = this.widthNeedsUpdate = !1, 
        this.refresh()), this.delegate.didResize(this, e)) : this._addToShowingQueue("didResize", this.didResize);
    },
    showingChangedHandler: enyo.inherit(function(t) {
        return function() {
            return this.set("absoluteShowing", this.getAbsoluteShowing(!0)), t.apply(this, arguments);
        };
    }),
    childForIndex: function(t) {
        return this.delegate.childForIndex(this, t);
    },
    allowTransitionsChanged: function() {
        this.addRemoveClass("transitions", this.allowTransitions);
    },
    containerOptions: {
        name: "scroller",
        kind: "enyo.Scroller",
        components: [ {
            name: "active",
            classes: "active",
            components: [ {
                name: "page1",
                classes: "page page1"
            }, {
                name: "page2",
                classes: "page page2"
            }, {
                name: "buffer",
                classes: "buffer"
            } ]
        } ],
        canGenerate: !1,
        classes: "enyo-fit enyo-data-list-scroller"
    },
    noDefer: !0,
    absoluteShowing: !0,
    classes: "enyo-data-list",
    controlParentName: "",
    containerName: "scroller",
    handlers: {
        onScroll: "didScroll",
        onresize: "didResize"
    },
    observers: {
        _absoluteShowingChanged: [ "absoluteShowing" ]
    },
    mixins: [ enyo.RegisteredEventSupport ],
    statics: {
        delegates: {}
    },
    pages: null
}), enyo.DataList.subclass = function(t) {
    t.delegates = enyo.clone(t.prototype.base.delegates || this.delegates);
};

// ../source/ui/data/VerticalDelegate.js
enyo.DataList.delegates.vertical = {
    pageSizeMultiplier: 2,
    initList: function(t) {
        t.posProp = "top", t.upperProp = "top", t.lowerProp = "bottom", t.psizeProp = "height", 
        t.ssizeProp = "width";
        var e = t.scrollerOptions = t.scrollerOptions ? enyo.clone(t.scrollerOptions) : {};
        e.vertical = "scroll" == e.vertical ? "scroll" : "auto", e.horizontal = e.horizontal || "hidden";
    },
    reset: function(t) {
        for (var e, n = 0; e = t.pages[n]; ++n) this.generatePage(t, e, n);
        this.adjustPagePositions(t), this.adjustBuffer(t), t.hasReset = !0, t.$.scroller.scrollTo(0, 0);
    },
    pagesByPosition: function(t) {
        var e = t.metrics.pages, n = t.pagePositions || (t.pagePositions = {}), i = t.upperProp, o = t.$.page1.index, s = t.$.page2.index;
        return n.firstPage = e[o][i] < e[s][i] ? t.$.page1 : t.$.page2, n.lastPage = n.firstPage === t.$.page1 ? t.$.page2 : t.$.page1, 
        n;
    },
    refresh: function(t) {
        if (!t.hasReset) return this.reset(t);
        var e = Math.max(this.pageCount(t) - 1, 0), n = t.$.page1.index, i = t.$.page2.index;
        n > e && (n = e), i > e && (i = n + 1 > e && n - 1 >= 0 ? n - 1 : n + 1), t.$.page1.index = n, 
        t.$.page2.index = i;
        for (var o, s = 0; o = t.pages[s]; ++s) this.generatePage(t, o, o.index);
        this.adjustPagePositions(t), this.adjustBuffer(t);
    },
    rendered: function(t) {
        t.$.scroller.addScrollListener && (t.usingScrollListener = !0, t.$.scroller.addScrollListener(enyo.bindSafely(this, "scrollHandler", t))), 
        this.updateBounds(t), t.length && this.reset(t);
    },
    generatePage: function(t, e, n) {
        e.index = n;
        var i, o = t.collection, s = t.metrics, r = this.controlsPerPage(t);
        e.start = r * n, e.end = Math.min(o.length - 1, e.start + r - 1), t.controlParent = e;
        for (var a = e.start; e.end >= a && o.length > a; ++a) i = e.children[a - e.start] || t.createComponent({}), 
        i.teardownRender(), i.stopNotifications(), i.set("model", o.at(a)), i.set("index", a), 
        i.set("selected", t.isSelected(i.model)), i.startNotifications(), i.canGenerate = !0;
        for (a -= e.start; e.children.length > a; ++a) i = e.children[a], i.teardownRender(), 
        i.canGenerate = !1;
        e.render(), s = s.pages[n] || (s.pages[n] = {}), s.height = this.pageHeight(t, e), 
        s.width = this.pageWidth(t, e), this.childSize(t);
    },
    childSize: function(t) {
        if (!t.fixedChildSize) {
            var e, n, i = t.$.page1.index, o = t.psizeProp, s = t.$.page1.node || t.$.page1.hasNode();
            i >= 0 && s && (n = t.metrics.pages[i], e = n ? n[o] : 0, t.childSize = Math.floor(e / (s.children.length || 1)));
        }
        return t.fixedChildSize || t.childSize || (t.childSize = 100);
    },
    controlsPerPage: function(t) {
        var e = t._updatedControlsPerPage, n = t._updatedBounds, i = t.childSize, o = t.controlsPerPage, s = t.psizeProp, r = t.pageSizeMultiplier || this.pageSizeMultiplier, a = this[s];
        return (!e || n > e) && (i = this.childSize(t), o = t.controlsPerPage = Math.ceil(a(t) * r / i + 1), 
        t._updatedControlsPerPage = enyo.perfNow()), t.controlsPerPage = o;
    },
    pageForIndex: function(t, e) {
        var n = t.controlsPerPage || this.controlsPerPage(t);
        return Math.floor(e / (n || 1));
    },
    scrollToIndex: function(t, e) {
        var n = this.childForIndex(t, e), i = this.pageForIndex(t, e);
        0 > i || i > this.pageCount(t) || (n ? t.$.scroller.scrollIntoView(n, this.pagePosition(t, i)) : (this.resetToPosition(t, this.pagePosition(t, i)), 
        enyo.asyncMethod(function() {
            t.scrollToIndex(e);
        })));
    },
    pageHeight: function(t, e) {
        var n = e.node.offsetHeight, i = t.metrics.pages[e.index];
        return 0 === n && t.length && e.node.children.length && (t.heightNeedsUpdate = !0, 
        n = i ? i.height : 0), n;
    },
    pageWidth: function(t, e) {
        var n = e.node.offsetWidth, i = t.metrics.pages[e.index];
        return 0 === n && t.length && e.node.children.length && (t.widthNeedsUpdate = !0, 
        n = i ? i.width : 0), n;
    },
    modelsAdded: function(t, e) {
        if (!t.hasReset) return this.reset(t);
        for (var n, i, o, s, r = t.$.page1.index || (t.$.page1.index = 0), a = t.$.page2.index || (t.$.page2.index = 1), h = 0; (s = e.records[h]) >= 0; ++h) if (o = this.pageForIndex(t, s), 
        o == r) n = !0; else if (o == a) i = !0; else if (o > a) break;
        n && this.generatePage(t, t.$.page1, r), i && this.generatePage(t, t.$.page2, a), 
        (n || i) && this.adjustPagePositions(t), this.adjustBuffer(t);
    },
    childForIndex: function(t, e) {
        var n = this.pageForIndex(t, e), i = t.$.page1, o = t.$.page2;
        if (n = n == i.index && i || n == o.index && o) for (var s, r = 0; s = n.children[r]; ++r) if (s.index == e) return s;
    },
    modelsRemoved: function(t, e) {
        for (var n, i, o = enyo.keys(e.records), s = t.$.page1.index, r = t.$.page2.index, a = o.length - 1; (i = o[a]) >= 0; --a) if (n = this.pageForIndex(t, i), 
        n == s || n == r) {
            this.refresh(t);
            var h = this.pagesByPosition(t);
            this.scrollToIndex(t, h.firstPage.start);
            break;
        }
    },
    adjustBuffer: function(t) {
        var e, n = this.pageCount(t), i = this.defaultPageSize(t), o = 0, s = t.psizeProp, r = t.ssizeProp, a = t.$.buffer.node || t.$.buffer.hasNode();
        if (a) {
            if (0 !== n) for (var h = 0; n > h; ++h) e = t.metrics.pages[h], o += e && e[s] || i;
            t.bufferSize = o, a.style[s] = o + "px", a.style[r] = this[r](t) + "px";
        }
    },
    adjustPagePositions: function(t) {
        for (var e, n = 0; e = t.pages[n]; ++n) {
            var i = e.index, o = this.pagePosition(t, e.index), s = t.metrics.pages[i] || (t.metrics.pages[i] = {}), r = t.posProp, a = t.upperProp, h = t.lowerProp, l = t.psizeProp;
            e.node.style[r] = o + "px", e[a] = s[a] = o, e[h] = s[h] = s[l] + o;
        }
        this.setScrollThreshold(t);
    },
    pagePosition: function(t, e) {
        for (var n, i = t.metrics.pages, o = this.defaultPageSize(t), s = 0, r = t.psizeProp; e > 0; ) n = i[--e], 
        s += n && n[r] ? n[r] : o;
        return s;
    },
    defaultPageSize: function(t) {
        var e = t.controlsPerPage || this.controlsPerPage(t);
        return e * (t.fixedChildSize || t.childSize || 100);
    },
    pageCount: function(t) {
        var e = t.controlsPerPage || this.controlsPerPage(t);
        return Math.ceil(t.length / (e || 1));
    },
    getScrollPosition: function(t) {
        return t.$.scroller.getScrollTop();
    },
    scrollHandler: function(t, e) {
        var n = this.pageCount(t) - 1, i = this.pagesByPosition(t);
        1 !== e.xDir && 1 !== e.yDir || i.lastPage.index === n ? -1 !== e.xDir && -1 !== e.yDir || 0 === i.firstPage.index || (this.generatePage(t, i.lastPage, i.firstPage.index - 1), 
        this.adjustPagePositions(t), t.triggerEvent("paging", {
            start: i.firstPage.start,
            end: i.lastPage.end,
            action: "scroll"
        })) : (this.generatePage(t, i.firstPage, i.lastPage.index + 1), this.adjustPagePositions(t), 
        this.adjustBuffer(t), t.triggerEvent("paging", {
            start: i.firstPage.start,
            end: i.lastPage.end,
            action: "scroll"
        }));
    },
    setScrollThreshold: function(t) {
        var e = t.scrollThreshold || (t.scrollThreshold = {}), n = t.metrics.pages, i = this.pagesByPosition(t), o = i.firstPage.index, s = i.lastPage.index, r = this.pageCount(t) - 1, a = t.lowerProp, h = t.upperProp, l = "top" == h ? this.height : this.width;
        e[h] = 0 === o ? void 0 : n[o][h] + this.childSize(t), e[a] = s >= r ? void 0 : n[s][a] - l(t) - this.childSize(t), 
        t.usingScrollListener && t.$.scroller.setScrollThreshold(e);
    },
    resetToPosition: function(t, e) {
        if (e >= 0 && t.bufferSize >= e) {
            var n = Math.ceil(e / this.defaultPageSize(t)), i = this.pageCount(t) - 1, o = this.pagesByPosition(t);
            (o.firstPage[t.upperProp] >= e || e >= o.lastPage[t.lowerProp]) && (t.$.page1.index = n = Math.min(n, i), 
            t.$.page2.index = n === i ? n - 1 : n + 1, this.refresh(t), t.triggerEvent("paging", {
                start: t.$.page1.start,
                end: t.$.page2.end,
                action: "reset"
            }));
        }
    },
    didScroll: function(t, e) {
        if (!t.usingScrollListener) {
            var n = t.scrollThreshold, i = e.scrollBounds, o = t.lowerProp, s = t.upperProp;
            i[s] = this.getScrollPosition(t), 1 === i.xDir || 1 === i.yDir ? i[s] >= n[o] && this.scrollHandler(t, i) : (-1 === i.yDir || -1 === i.xDir) && i[s] <= n[s] && this.scrollHandler(t, i);
        }
    },
    didResize: function(t) {
        t._updateBounds = !0, this.updateBounds(t), this.refresh(t);
    },
    height: function(t) {
        return t._updateBounds && this.updateBounds(t), t.boundsCache.height;
    },
    width: function(t) {
        return t._updateBounds && this.updateBounds(t), t.boundsCache.width;
    },
    updateBounds: function(t) {
        t.boundsCache = t.getBounds(), t._updatedBounds = enyo.perfNow(), t._updateBounds = !1;
    }
};

// ../source/ui/data/HorizontalDelegate.js
(function(t) {
    var e = t.clone(t.DataList.delegates.vertical);
    t.kind.extendMethods(e, {
        initList: t.inherit(function(e) {
            return function(n) {
                e.apply(this, arguments), n.addClass("horizontal"), n.posProp = n.rtl ? "right" : "left", 
                n.upperProp = "left", n.lowerProp = "right", n.psizeProp = "width", n.ssizeProp = "height";
                var i = n.scrollerOptions = n.scrollerOptions ? t.clone(n.scrollerOptions) : {};
                i.vertical = "hidden", i.horizontal = "scroll" == i.horizontal ? "scroll" : "auto";
            };
        }),
        destroyList: function(t) {
            t && t.removeClass("horizontal");
        },
        getScrollPosition: function(t) {
            return t.$.scroller.getScrollLeft();
        },
        adjustBuffer: t.inherit(function(t) {
            return function(e) {
                t.apply(this, arguments);
                var n = e.$.active.node || e.$.active.hasNode(), i = e.bufferSize;
                n && (n.style.width = i + "px");
            };
        })
    }, !0), t.DataList.delegates.horizontal = e;
})(enyo);

// ../source/ui/data/DataGridList.js
enyo.kind({
    name: "enyo.DataGridList",
    kind: enyo.DataList,
    spacing: 10,
    minWidth: 100,
    minHeight: 100,
    constructor: enyo.inherit(function(t) {
        return function() {
            var e = this.orientation;
            this.orientation = "vertical" == e ? "verticalGrid" : "horizontal" == e ? "horizontalGrid" : e;
            var n = this.spacing;
            return this.spacing = 0 === n % 2 ? n : Math.max(n - 1, 0), t.apply(this, arguments);
        };
    }),
    initComponents: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments);
            var e = this.defaultProps, n = " item";
            e.classes = (e.classes || "") + n;
        };
    }),
    showingChanged: enyo.inherit(function(t) {
        return function() {
            t.apply(this, arguments), this.$.scroller.generated && this.length && this.showing && this.didResize();
        };
    }),
    noDefer: !0,
    classes: "enyo-data-grid-list"
});

// ../source/ui/data/DataTable.js
enyo.kind({
    name: "enyo.DataTable",
    kind: "enyo.DataRepeater",
    defaultKind: "enyo.TableRow",
    style: "display: table;",
    containerOptions: {
        kind: "enyo.Table",
        name: "container",
        style: "width: 100%;"
    }
});

// ../source/ui/data/VerticalGridDelegate.js
(function(t) {
    var e = t.clone(t.DataGridList.delegates.vertical);
    t.kind.extendMethods(e, {
        rendered: function(t) {
            this.updateMetrics(t), t.length && this.reset(t);
        },
        reset: t.inherit(function(t) {
            return function(e) {
                t.apply(this, arguments), e.hasReset && !e.hasClass("reset") && (e.canAddResetClass = !0);
            };
        }),
        pageHeight: function(t, e) {
            var n, i = e.node || e.hasNode(), o = i.children.length, s = t.metrics.pages[e.index];
            return n = (Math.floor(o / t.columns) + (o % t.columns ? 1 : 0)) * (t.tileHeight + t.spacing), 
            i.style.height = n + "px", s.height = n, n;
        },
        generatePage: t.inherit(function(t) {
            return function(e, n) {
                t.apply(this, arguments), this.layout(e, n);
            };
        }),
        pageWidth: function(t, e) {
            var n = t.boundsCache.width, i = e.node || e.hasNode(), o = t.metrics.pages[e.index];
            return i.style.width = n + "px", o.width = n, n;
        },
        defaultPageSize: function(t) {
            return Math.ceil(this.controlsPerPage(t) / t.columns) * (t.tileHeight + t.spacing);
        },
        updateMetrics: function(t) {
            this.updateBounds(t);
            var e = t.boundsCache, n = e.width, i = t.spacing, o = t.minWidth, s = t.minHeight;
            t.columns = Math.max(Math.floor((n - i) / (o + i)), 1), t.tileWidth = (n - i * (t.columns + 1)) / t.columns, 
            t.tileHeight = s * (t.tileWidth / o), this.controlsPerPage(t);
        },
        controlsPerPage: t.inherit(function(t) {
            return function(e) {
                var n = e._updatedControlsPerPage, i = t.apply(this, arguments);
                return n != e._updatedControlsPerPage && (i = e.controlsPerPage = i * e.columns), 
                i;
            };
        }),
        childSize: function(t) {
            return t.childSize = t.tileHeight + t.spacing;
        },
        layout: function(t, e) {
            t.canAddResetClass && (t.addClass("reset"), delete t.canAddResetClass);
            var n, i = t.columns, o = t.spacing, s = t.tileWidth, r = t.tileHeight, a = 0, h = e, l = h.children;
            if (l.length) for (var c, d = 0; c = l[d]; ++d) n = d % i, c.addStyles("top: " + Math.round(o + a * (r + o)) + "px; " + (t.rtl ? "right: " : "left: ") + Math.round(o + n * (s + o)) + "px; " + "width: " + Math.round(s) + "px; " + "height: " + Math.round(r) + "px"), 
            0 === (d + 1) % i && ++a;
        },
        adjustBuffer: function(t) {
            var e, n = this.pageCount(t), i = this.defaultPageSize(t), o = 0, s = t.psizeProp, r = t.ssizeProp, a = t.$.buffer.node || t.$.buffer.hasNode();
            if (a) {
                for (var h = 0; n > h; ++h) e = t.metrics.pages[h], o += e && e[s] || i;
                o += t.spacing, t.bufferSize = o, a.style[s] = o + "px", a.style[r] = this[r](t) + "px";
            }
        },
        didResize: function(t) {
            var e = t.boundsCache;
            t._updateBounds = !0, this.updateMetrics(t), (e.left !== t.boundsCache.left || e.top !== t.boundsCache.top || e.width !== t.boundsCache.width || e.height !== t.boundsCache.height) && this.refresh(t);
        }
    }, !0), t.DataGridList.delegates.verticalGrid = e;
})(enyo);
