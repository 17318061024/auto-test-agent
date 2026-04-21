var lr = Object.defineProperty;
var fr = (r, e, t) => e in r ? lr(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var I = (r, e, t) => fr(r, typeof e != "symbol" ? e + "" : e, t);
import { protocol as ur, app as P, BrowserWindow as dr, ipcMain as Z } from "electron";
import Wt from "path";
import ks, { URL as it } from "url";
import pr from "fs";
import gr from "child_process";
import Os from "http";
import Ts from "https";
import Rs from "tty";
import _r from "util";
import mr from "os";
import yr, { EventEmitter as Er } from "events";
import vr from "net";
import wr from "tls";
import Bt from "crypto";
import Re from "stream";
import br from "zlib";
import Sr from "buffer";
function Cr(r, e) {
  for (var t = 0; t < e.length; t++) {
    const s = e[t];
    if (typeof s != "string" && !Array.isArray(s)) {
      for (const n in s)
        if (n !== "default" && !(n in r)) {
          const i = Object.getOwnPropertyDescriptor(s, n);
          i && Object.defineProperty(r, n, i.get ? i : {
            enumerable: !0,
            get: () => s[n]
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(r, Symbol.toStringTag, { value: "Module" }));
}
var ke = /* @__PURE__ */ ((r) => (r.RUN = "run", r.VIEW = "view", r.CONFIG = "config", r.HEALTH = "health", r))(ke || {});
const ce = class ce {
  constructor() {
    I(this, "PROTOCOL_SCHEME", "midscene");
    I(this, "isRegistered", !1);
    I(this, "callback", null);
  }
  /**
   * 获取协议处理器实例（单例模式）
   */
  static getInstance() {
    return ce.instance || (ce.instance = new ce()), ce.instance;
  }
  /**
   * 注册自定义协议
   * 必须在 app.ready() 之前调用
   */
  register() {
    if (this.isRegistered) {
      console.log("协议已注册，跳过重复注册");
      return;
    }
    try {
      ur.registerSchemesAsPrivileged([
        {
          scheme: this.PROTOCOL_SCHEME,
          privileges: {
            standard: !0,
            secure: !0,
            supportFetchAPI: !0,
            corsEnabled: !0
          }
        }
      ]), this.isRegistered = !0, console.log(`✅ 协议 ${this.PROTOCOL_SCHEME}:// 注册成功`);
    } catch (e) {
      console.error("❌ 协议注册失败:", e);
    }
  }
  /**
   * 启动协议监听
   * 必须在 app.ready() 之后调用
   */
  startListening(e) {
    this.callback = e, P.on("second-instance", (s, n, i) => {
      const o = n.find((h) => h.startsWith(`${this.PROTOCOL_SCHEME}://`));
      o && this.handleProtocolCall(o);
    });
    const t = process.argv.find((s) => s.startsWith(`${this.PROTOCOL_SCHEME}://`));
    t && this.handleProtocolCall(t), console.log(`🎧 开始监听 ${this.PROTOCOL_SCHEME}:// 协议调用`);
  }
  /**
   * 处理协议调用
   * @param protocolUrl 协议URL
   */
  handleProtocolCall(e) {
    try {
      console.log(`📞 收到协议调用: ${e}`);
      const t = this.parseProtocolUrl(e);
      this.callback ? this.callback(t) : console.warn("⚠️ 未设置协议处理回调"), this.showMainWindow();
    } catch (t) {
      console.error("❌ 处理协议调用失败:", t);
    }
  }
  /**
   * 解析协议URL
   * @param protocolUrl 协议URL
   * @returns 解析后的参数
   */
  parseProtocolUrl(e) {
    try {
      const t = new it(e), n = {
        action: t.hostname
      }, i = t.pathname.split("/").filter(Boolean);
      return i.length > 0 && (n.taskId = i[0]), t.searchParams.forEach((o, h) => {
        n[h] = o;
      }), n;
    } catch (t) {
      throw new Error(`协议URL解析失败: ${t}`);
    }
  }
  /**
   * 显示主窗口
   */
  showMainWindow() {
    const e = this.getMainWindow();
    e ? (e.isMinimized() && e.restore(), e.focus(), e.show(), console.log("🪟 主窗口已显示")) : console.warn("⚠️ 未找到主窗口");
  }
  /**
   * 获取主窗口
   */
  getMainWindow() {
    const { BrowserWindow: e } = require("electron"), t = e.getAllWindows();
    return t.length > 0 ? t[0] : null;
  }
  /**
   * 生成协议URL
   * @param action 操作类型
   * @param params 参数
   * @returns 协议URL
   */
  generateUrl(e, t = {}) {
    const s = new it(`${this.PROTOCOL_SCHEME}://${e}`);
    return Object.entries(t).forEach(([n, i]) => {
      s.searchParams.set(n, i);
    }), s.toString();
  }
  /**
   * 验证协议URL格式
   * @param protocolUrl 协议URL
   * @returns 是否有效
   */
  validateUrl(e) {
    try {
      return new it(e).protocol === `${this.PROTOCOL_SCHEME}:`;
    } catch {
      return !1;
    }
  }
  /**
   * 停止监听
   */
  stopListening() {
    this.callback = null, console.log(`🛑 停止监听 ${this.PROTOCOL_SCHEME}:// 协议调用`);
  }
};
I(ce, "instance");
let Ge = ce;
function kr() {
  Ge.getInstance().register();
}
function Or(r) {
  Ge.getInstance().startListening(r);
}
function Dt(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
function xs(r) {
  if (r.__esModule) return r;
  var e = r.default;
  if (typeof e == "function") {
    var t = function s() {
      return this instanceof s ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    t.prototype = e.prototype;
  } else t = {};
  return Object.defineProperty(t, "__esModule", { value: !0 }), Object.keys(r).forEach(function(s) {
    var n = Object.getOwnPropertyDescriptor(r, s);
    Object.defineProperty(t, s, n.get ? n : {
      enumerable: !0,
      get: function() {
        return r[s];
      }
    });
  }), t;
}
/**
 * Wrapper for built-in http.js to emulate the browser XMLHttpRequest object.
 *
 * This can be used with JS designed for browsers to improve reuse of code and
 * allow the use of existing libraries.
 *
 * Usage: include("XMLHttpRequest.js") and use XMLHttpRequest per W3C specs.
 *
 * @author Dan DeFelippi <dan@driverdan.com>
 * @contributor David Ellis <d.f.ellis@ieee.org>
 * @license MIT
 */
var he = pr, Gt = ks, Tr = gr.spawn, Ls = wt;
wt.XMLHttpRequest = wt;
function wt(r) {
  r = r || {};
  var e = this, t = Os, s = Ts, n, i, o = {}, h = !1, a = {
    "User-Agent": "node-XMLHttpRequest",
    Accept: "*/*"
  }, f = Object.assign({}, a), u = [
    "accept-charset",
    "accept-encoding",
    "access-control-request-headers",
    "access-control-request-method",
    "connection",
    "content-length",
    "content-transfer-encoding",
    "cookie",
    "cookie2",
    "date",
    "expect",
    "host",
    "keep-alive",
    "origin",
    "referer",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "via"
  ], c = [
    "TRACE",
    "TRACK",
    "CONNECT"
  ], l = !1, g = !1, _ = !1, p = {};
  this.UNSENT = 0, this.OPENED = 1, this.HEADERS_RECEIVED = 2, this.LOADING = 3, this.DONE = 4, this.readyState = this.UNSENT, this.onreadystatechange = null, this.responseText = "", this.responseXML = "", this.response = Buffer.alloc(0), this.status = null, this.statusText = null;
  var v = function(d) {
    return h || d && u.indexOf(d.toLowerCase()) === -1;
  }, S = function(d) {
    return d && c.indexOf(d) === -1;
  };
  this.open = function(d, y, k, L, N) {
    if (this.abort(), g = !1, _ = !1, !S(d))
      throw new Error("SecurityError: Request method not allowed");
    o = {
      method: d,
      url: y.toString(),
      async: typeof k != "boolean" ? !0 : k,
      user: L || null,
      password: N || null
    }, C(this.OPENED);
  }, this.setDisableHeaderCheck = function(d) {
    h = d;
  }, this.setRequestHeader = function(d, y) {
    if (this.readyState != this.OPENED)
      throw new Error("INVALID_STATE_ERR: setRequestHeader can only be called when state is OPEN");
    if (!v(d))
      return console.warn('Refused to set unsafe header "' + d + '"'), !1;
    if (l)
      throw new Error("INVALID_STATE_ERR: send flag is true");
    return f[d] = y, !0;
  }, this.getResponseHeader = function(d) {
    return typeof d == "string" && this.readyState > this.OPENED && i.headers[d.toLowerCase()] && !g ? i.headers[d.toLowerCase()] : null;
  }, this.getAllResponseHeaders = function() {
    if (this.readyState < this.HEADERS_RECEIVED || g)
      return "";
    var d = "";
    for (var y in i.headers)
      y !== "set-cookie" && y !== "set-cookie2" && (d += y + ": " + i.headers[y] + `\r
`);
    return d.substr(0, d.length - 2);
  }, this.getRequestHeader = function(d) {
    return typeof d == "string" && f[d] ? f[d] : "";
  }, this.send = function(d) {
    if (this.readyState != this.OPENED)
      throw new Error("INVALID_STATE_ERR: connection must be opened before send() is called");
    if (l)
      throw new Error("INVALID_STATE_ERR: send has already been called");
    var y = !1, k = !1, L = Gt.parse(o.url), N;
    switch (L.protocol) {
      case "https:":
        y = !0;
      case "http:":
        N = L.hostname;
        break;
      case "file:":
        k = !0;
        break;
      case void 0:
      case "":
        N = "localhost";
        break;
      default:
        throw new Error("Protocol not supported.");
    }
    if (k) {
      if (o.method !== "GET")
        throw new Error("XMLHttpRequest: Only GET method is supported");
      if (o.async)
        he.readFile(unescape(L.pathname), function(A, ne) {
          A ? e.handleError(A, A.errno || -1) : (e.status = 200, e.responseText = ne.toString("utf8"), e.response = ne, C(e.DONE));
        });
      else
        try {
          this.response = he.readFileSync(unescape(L.pathname)), this.responseText = this.response.toString("utf8"), this.status = 200, C(e.DONE);
        } catch (A) {
          this.handleError(A, A.errno || -1);
        }
      return;
    }
    var K = L.port || (y ? 443 : 80), J = L.pathname + (L.search ? L.search : "");
    if (f.Host = N, y && K === 443 || K === 80 || (f.Host += ":" + L.port), o.user) {
      typeof o.password > "u" && (o.password = "");
      var me = new Buffer(o.user + ":" + o.password);
      f.Authorization = "Basic " + me.toString("base64");
    }
    if (o.method === "GET" || o.method === "HEAD")
      d = null;
    else if (d) {
      f["Content-Length"] = Buffer.isBuffer(d) ? d.length : Buffer.byteLength(d);
      var nr = Object.keys(f);
      nr.some(function(A) {
        return A.toLowerCase() === "content-type";
      }) || (f["Content-Type"] = "text/plain;charset=UTF-8");
    } else o.method === "POST" && (f["Content-Length"] = 0);
    var ir = r.agent || !1, V = {
      host: N,
      port: K,
      path: J,
      method: o.method,
      headers: f,
      agent: ir
    };
    if (y && (V.pfx = r.pfx, V.key = r.key, V.passphrase = r.passphrase, V.cert = r.cert, V.ca = r.ca, V.ciphers = r.ciphers, V.rejectUnauthorized = r.rejectUnauthorized !== !1), g = !1, o.async) {
      var tt = y ? s.request : t.request;
      l = !0, e.dispatchEvent("readystatechange");
      var st = function(A) {
        if (i = A, i.statusCode === 302 || i.statusCode === 303 || i.statusCode === 307) {
          o.url = i.headers.location;
          var ne = Gt.parse(o.url);
          N = ne.hostname;
          var Q = {
            hostname: ne.hostname,
            port: ne.port,
            path: ne.path,
            method: i.statusCode === 303 ? "GET" : o.method,
            headers: f
          };
          y && (Q.pfx = r.pfx, Q.key = r.key, Q.passphrase = r.passphrase, Q.cert = r.cert, Q.ca = r.ca, Q.ciphers = r.ciphers, Q.rejectUnauthorized = r.rejectUnauthorized !== !1), n = tt(Q, st).on("error", rt), n.end();
          return;
        }
        C(e.HEADERS_RECEIVED), e.status = i.statusCode, i.on("data", function(Le) {
          if (Le) {
            var hr = Buffer.from(Le);
            e.response = Buffer.concat([e.response, hr]);
          }
          l && C(e.LOADING);
        }), i.on("end", function() {
          l && (l = !1, C(e.DONE), e.responseText = e.response.toString("utf8"));
        }), i.on("error", function(Le) {
          e.handleError(Le);
        });
      }, rt = function(A) {
        if (n.reusedSocket && A.code === "ECONNRESET")
          return tt(V, st).on("error", rt);
        e.handleError(A);
      };
      n = tt(V, st).on("error", rt), r.autoUnref && n.on("socket", (A) => {
        A.unref();
      }), d && n.write(d), n.end(), e.dispatchEvent("loadstart");
    } else {
      var ye = ".node-xmlhttprequest-content-" + process.pid, Ee = ".node-xmlhttprequest-sync-" + process.pid;
      he.writeFileSync(Ee, "", "utf8");
      for (var or = "var http = require('http'), https = require('https'), fs = require('fs');var doRequest = http" + (y ? "s" : "") + ".request;var options = " + JSON.stringify(V) + ";var responseText = '';var responseData = Buffer.alloc(0);var req = doRequest(options, function(response) {response.on('data', function(chunk) {  var data = Buffer.from(chunk);  responseText += data.toString('utf8');  responseData = Buffer.concat([responseData, data]);});response.on('end', function() {fs.writeFileSync('" + ye + "', JSON.stringify({err: null, data: {statusCode: response.statusCode, headers: response.headers, text: responseText, data: responseData.toString('base64')}}), 'utf8');fs.unlinkSync('" + Ee + "');});response.on('error', function(error) {fs.writeFileSync('" + ye + "', 'NODE-XMLHTTPREQUEST-ERROR:' + JSON.stringify(error), 'utf8');fs.unlinkSync('" + Ee + "');});}).on('error', function(error) {fs.writeFileSync('" + ye + "', 'NODE-XMLHTTPREQUEST-ERROR:' + JSON.stringify(error), 'utf8');fs.unlinkSync('" + Ee + "');});" + (d ? "req.write('" + JSON.stringify(d).slice(1, -1).replace(/'/g, "\\'") + "');" : "") + "req.end();", ar = Tr(process.argv[0], ["-e", or]); he.existsSync(Ee); )
        ;
      if (e.responseText = he.readFileSync(ye, "utf8"), ar.stdin.end(), he.unlinkSync(ye), e.responseText.match(/^NODE-XMLHTTPREQUEST-ERROR:/)) {
        var cr = JSON.parse(e.responseText.replace(/^NODE-XMLHTTPREQUEST-ERROR:/, ""));
        e.handleError(cr, 503);
      } else {
        e.status = e.responseText.replace(/^NODE-XMLHTTPREQUEST-STATUS:([0-9]*),.*/, "$1");
        var nt = JSON.parse(e.responseText.replace(/^NODE-XMLHTTPREQUEST-STATUS:[0-9]*,(.*)/, "$1"));
        i = {
          statusCode: e.status,
          headers: nt.data.headers
        }, e.responseText = nt.data.text, e.response = Buffer.from(nt.data.data, "base64"), C(e.DONE);
      }
    }
  }, this.handleError = function(d, y) {
    this.status = y || 0, this.statusText = d, this.responseText = d.stack, g = !0, C(this.DONE);
  }, this.abort = function() {
    n && (n.abort(), n = null), f = Object.assign({}, a), this.responseText = "", this.responseXML = "", this.response = Buffer.alloc(0), g = _ = !0, this.readyState !== this.UNSENT && (this.readyState !== this.OPENED || l) && this.readyState !== this.DONE && (l = !1, C(this.DONE)), this.readyState = this.UNSENT;
  }, this.addEventListener = function(d, y) {
    d in p || (p[d] = []), p[d].push(y);
  }, this.removeEventListener = function(d, y) {
    d in p && (p[d] = p[d].filter(function(k) {
      return k !== y;
    }));
  }, this.dispatchEvent = function(d) {
    if (typeof e["on" + d] == "function" && (this.readyState === this.DONE && o.async ? setTimeout(function() {
      e["on" + d]();
    }, 0) : e["on" + d]()), d in p)
      for (let y = 0, k = p[d].length; y < k; y++)
        this.readyState === this.DONE ? setTimeout(function() {
          p[d][y].call(e);
        }, 0) : p[d][y].call(e);
  };
  var C = function(d) {
    if (!(e.readyState === d || e.readyState === e.UNSENT && _) && (e.readyState = d, (o.async || e.readyState < e.OPENED || e.readyState === e.DONE) && e.dispatchEvent("readystatechange"), e.readyState === e.DONE)) {
      let y;
      _ ? y = "abort" : g ? y = "error" : y = "load", e.dispatchEvent(y), e.dispatchEvent("loadend");
    }
  };
}
const Ns = /* @__PURE__ */ Dt(Ls), Rr = /* @__PURE__ */ Cr({
  __proto__: null,
  default: Ns
}, [Ls]), z = /* @__PURE__ */ Object.create(null);
z.open = "0";
z.close = "1";
z.ping = "2";
z.pong = "3";
z.message = "4";
z.upgrade = "5";
z.noop = "6";
const $e = /* @__PURE__ */ Object.create(null);
Object.keys(z).forEach((r) => {
  $e[z[r]] = r;
});
const bt = { type: "error", data: "parser error" }, Ft = ({ type: r, data: e }, t, s) => e instanceof ArrayBuffer || ArrayBuffer.isView(e) ? s(t ? e : "b" + As(e, !0).toString("base64")) : s(z[r] + (e || "")), As = (r, e) => Buffer.isBuffer(r) || r instanceof Uint8Array && !e ? r : r instanceof ArrayBuffer ? Buffer.from(r) : Buffer.from(r.buffer, r.byteOffset, r.byteLength);
let ot;
function xr(r, e) {
  if (r.data instanceof ArrayBuffer || ArrayBuffer.isView(r.data))
    return e(As(r.data, !1));
  Ft(r, !0, (t) => {
    ot || (ot = new TextEncoder()), e(ot.encode(t));
  });
}
const Mt = (r, e) => {
  if (typeof r != "string")
    return {
      type: "message",
      data: jt(r, e)
    };
  const t = r.charAt(0);
  if (t === "b") {
    const s = Buffer.from(r.substring(1), "base64");
    return {
      type: "message",
      data: jt(s, e)
    };
  }
  return $e[t] ? r.length > 1 ? {
    type: $e[t],
    data: r.substring(1)
  } : {
    type: $e[t]
  } : bt;
}, jt = (r, e) => {
  switch (e) {
    case "arraybuffer":
      return r instanceof ArrayBuffer ? r : Buffer.isBuffer(r) ? r.buffer.slice(r.byteOffset, r.byteOffset + r.byteLength) : r.buffer;
    case "nodebuffer":
    default:
      return Buffer.isBuffer(r) ? r : Buffer.from(r);
  }
}, Is = "", Lr = (r, e) => {
  const t = r.length, s = new Array(t);
  let n = 0;
  r.forEach((i, o) => {
    Ft(i, !1, (h) => {
      s[o] = h, ++n === t && e(s.join(Is));
    });
  });
}, Nr = (r, e) => {
  const t = r.split(Is), s = [];
  for (let n = 0; n < t.length; n++) {
    const i = Mt(t[n], e);
    if (s.push(i), i.type === "error")
      break;
  }
  return s;
};
function Ar() {
  return new TransformStream({
    transform(r, e) {
      xr(r, (t) => {
        const s = t.length;
        let n;
        if (s < 126)
          n = new Uint8Array(1), new DataView(n.buffer).setUint8(0, s);
        else if (s < 65536) {
          n = new Uint8Array(3);
          const i = new DataView(n.buffer);
          i.setUint8(0, 126), i.setUint16(1, s);
        } else {
          n = new Uint8Array(9);
          const i = new DataView(n.buffer);
          i.setUint8(0, 127), i.setBigUint64(1, BigInt(s));
        }
        r.data && typeof r.data != "string" && (n[0] |= 128), e.enqueue(n), e.enqueue(t);
      });
    }
  });
}
let at;
function Ne(r) {
  return r.reduce((e, t) => e + t.length, 0);
}
function Ae(r, e) {
  if (r[0].length === e)
    return r.shift();
  const t = new Uint8Array(e);
  let s = 0;
  for (let n = 0; n < e; n++)
    t[n] = r[0][s++], s === r[0].length && (r.shift(), s = 0);
  return r.length && s < r[0].length && (r[0] = r[0].slice(s)), t;
}
function Ir(r, e) {
  at || (at = new TextDecoder());
  const t = [];
  let s = 0, n = -1, i = !1;
  return new TransformStream({
    transform(o, h) {
      for (t.push(o); ; ) {
        if (s === 0) {
          if (Ne(t) < 1)
            break;
          const a = Ae(t, 1);
          i = (a[0] & 128) === 128, n = a[0] & 127, n < 126 ? s = 3 : n === 126 ? s = 1 : s = 2;
        } else if (s === 1) {
          if (Ne(t) < 2)
            break;
          const a = Ae(t, 2);
          n = new DataView(a.buffer, a.byteOffset, a.length).getUint16(0), s = 3;
        } else if (s === 2) {
          if (Ne(t) < 8)
            break;
          const a = Ae(t, 8), f = new DataView(a.buffer, a.byteOffset, a.length), u = f.getUint32(0);
          if (u > Math.pow(2, 21) - 1) {
            h.enqueue(bt);
            break;
          }
          n = u * Math.pow(2, 32) + f.getUint32(4), s = 3;
        } else {
          if (Ne(t) < n)
            break;
          const a = Ae(t, n);
          h.enqueue(Mt(i ? a : at.decode(a), e)), s = 0;
        }
        if (n === 0 || n > r) {
          h.enqueue(bt);
          break;
        }
      }
    }
  });
}
const Ps = 4;
function T(r) {
  if (r) return Pr(r);
}
function Pr(r) {
  for (var e in T.prototype)
    r[e] = T.prototype[e];
  return r;
}
T.prototype.on = T.prototype.addEventListener = function(r, e) {
  return this._callbacks = this._callbacks || {}, (this._callbacks["$" + r] = this._callbacks["$" + r] || []).push(e), this;
};
T.prototype.once = function(r, e) {
  function t() {
    this.off(r, t), e.apply(this, arguments);
  }
  return t.fn = e, this.on(r, t), this;
};
T.prototype.off = T.prototype.removeListener = T.prototype.removeAllListeners = T.prototype.removeEventListener = function(r, e) {
  if (this._callbacks = this._callbacks || {}, arguments.length == 0)
    return this._callbacks = {}, this;
  var t = this._callbacks["$" + r];
  if (!t) return this;
  if (arguments.length == 1)
    return delete this._callbacks["$" + r], this;
  for (var s, n = 0; n < t.length; n++)
    if (s = t[n], s === e || s.fn === e) {
      t.splice(n, 1);
      break;
    }
  return t.length === 0 && delete this._callbacks["$" + r], this;
};
T.prototype.emit = function(r) {
  this._callbacks = this._callbacks || {};
  for (var e = new Array(arguments.length - 1), t = this._callbacks["$" + r], s = 1; s < arguments.length; s++)
    e[s - 1] = arguments[s];
  if (t) {
    t = t.slice(0);
    for (var s = 0, n = t.length; s < n; ++s)
      t[s].apply(this, e);
  }
  return this;
};
T.prototype.emitReserved = T.prototype.emit;
T.prototype.listeners = function(r) {
  return this._callbacks = this._callbacks || {}, this._callbacks["$" + r] || [];
};
T.prototype.hasListeners = function(r) {
  return !!this.listeners(r).length;
};
const Xe = process.nextTick, G = global, Br = "nodebuffer";
function Dr() {
  return new Mr();
}
function Fr(r) {
  const e = r.split("; "), t = e[0].indexOf("=");
  if (t === -1)
    return;
  const s = e[0].substring(0, t).trim();
  if (!s.length)
    return;
  let n = e[0].substring(t + 1).trim();
  n.charCodeAt(0) === 34 && (n = n.slice(1, -1));
  const i = {
    name: s,
    value: n
  };
  for (let o = 1; o < e.length; o++) {
    const h = e[o].split("=");
    if (h.length !== 2)
      continue;
    const a = h[0].trim(), f = h[1].trim();
    switch (a) {
      case "Expires":
        i.expires = new Date(f);
        break;
      case "Max-Age":
        const u = /* @__PURE__ */ new Date();
        u.setUTCSeconds(u.getUTCSeconds() + parseInt(f, 10)), i.expires = u;
        break;
    }
  }
  return i;
}
class Mr {
  constructor() {
    this._cookies = /* @__PURE__ */ new Map();
  }
  parseCookies(e) {
    e && e.forEach((t) => {
      const s = Fr(t);
      s && this._cookies.set(s.name, s);
    });
  }
  get cookies() {
    const e = Date.now();
    return this._cookies.forEach((t, s) => {
      var n;
      ((n = t.expires) === null || n === void 0 ? void 0 : n.getTime()) < e && this._cookies.delete(s);
    }), this._cookies.entries();
  }
  addCookies(e) {
    const t = [];
    for (const [s, n] of this.cookies)
      t.push(`${s}=${n.value}`);
    t.length && (e.setDisableHeaderCheck(!0), e.setRequestHeader("cookie", t.join("; ")));
  }
  appendCookies(e) {
    for (const [t, s] of this.cookies)
      e.append("cookie", `${t}=${s.value}`);
  }
}
function Bs(r, ...e) {
  return e.reduce((t, s) => (r.hasOwnProperty(s) && (t[s] = r[s]), t), {});
}
const Ur = G.setTimeout, $r = G.clearTimeout;
function Ke(r, e) {
  e.useNativeTimers ? (r.setTimeoutFn = Ur.bind(G), r.clearTimeoutFn = $r.bind(G)) : (r.setTimeoutFn = G.setTimeout.bind(G), r.clearTimeoutFn = G.clearTimeout.bind(G));
}
const qr = 1.33;
function Hr(r) {
  return typeof r == "string" ? Vr(r) : Math.ceil((r.byteLength || r.size) * qr);
}
function Vr(r) {
  let e = 0, t = 0;
  for (let s = 0, n = r.length; s < n; s++)
    e = r.charCodeAt(s), e < 128 ? t += 1 : e < 2048 ? t += 2 : e < 55296 || e >= 57344 ? t += 3 : (s++, t += 4);
  return t;
}
function Ds() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function Wr(r) {
  let e = "";
  for (let t in r)
    r.hasOwnProperty(t) && (e.length && (e += "&"), e += encodeURIComponent(t) + "=" + encodeURIComponent(r[t]));
  return e;
}
function Gr(r) {
  let e = {}, t = r.split("&");
  for (let s = 0, n = t.length; s < n; s++) {
    let i = t[s].split("=");
    e[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
  }
  return e;
}
var St = { exports: {} }, Ie = { exports: {} }, ct, zt;
function jr() {
  if (zt) return ct;
  zt = 1;
  var r = 1e3, e = r * 60, t = e * 60, s = t * 24, n = s * 7, i = s * 365.25;
  ct = function(u, c) {
    c = c || {};
    var l = typeof u;
    if (l === "string" && u.length > 0)
      return o(u);
    if (l === "number" && isFinite(u))
      return c.long ? a(u) : h(u);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(u)
    );
  };
  function o(u) {
    if (u = String(u), !(u.length > 100)) {
      var c = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        u
      );
      if (c) {
        var l = parseFloat(c[1]), g = (c[2] || "ms").toLowerCase();
        switch (g) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return l * i;
          case "weeks":
          case "week":
          case "w":
            return l * n;
          case "days":
          case "day":
          case "d":
            return l * s;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return l * t;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return l * e;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return l * r;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return l;
          default:
            return;
        }
      }
    }
  }
  function h(u) {
    var c = Math.abs(u);
    return c >= s ? Math.round(u / s) + "d" : c >= t ? Math.round(u / t) + "h" : c >= e ? Math.round(u / e) + "m" : c >= r ? Math.round(u / r) + "s" : u + "ms";
  }
  function a(u) {
    var c = Math.abs(u);
    return c >= s ? f(u, c, s, "day") : c >= t ? f(u, c, t, "hour") : c >= e ? f(u, c, e, "minute") : c >= r ? f(u, c, r, "second") : u + " ms";
  }
  function f(u, c, l, g) {
    var _ = c >= l * 1.5;
    return Math.round(u / l) + " " + g + (_ ? "s" : "");
  }
  return ct;
}
var ht, Yt;
function Fs() {
  if (Yt) return ht;
  Yt = 1;
  function r(e) {
    s.debug = s, s.default = s, s.coerce = f, s.disable = h, s.enable = i, s.enabled = a, s.humanize = jr(), s.destroy = u, Object.keys(e).forEach((c) => {
      s[c] = e[c];
    }), s.names = [], s.skips = [], s.formatters = {};
    function t(c) {
      let l = 0;
      for (let g = 0; g < c.length; g++)
        l = (l << 5) - l + c.charCodeAt(g), l |= 0;
      return s.colors[Math.abs(l) % s.colors.length];
    }
    s.selectColor = t;
    function s(c) {
      let l, g = null, _, p;
      function v(...S) {
        if (!v.enabled)
          return;
        const C = v, d = Number(/* @__PURE__ */ new Date()), y = d - (l || d);
        C.diff = y, C.prev = l, C.curr = d, l = d, S[0] = s.coerce(S[0]), typeof S[0] != "string" && S.unshift("%O");
        let k = 0;
        S[0] = S[0].replace(/%([a-zA-Z%])/g, (N, K) => {
          if (N === "%%")
            return "%";
          k++;
          const J = s.formatters[K];
          if (typeof J == "function") {
            const me = S[k];
            N = J.call(C, me), S.splice(k, 1), k--;
          }
          return N;
        }), s.formatArgs.call(C, S), (C.log || s.log).apply(C, S);
      }
      return v.namespace = c, v.useColors = s.useColors(), v.color = s.selectColor(c), v.extend = n, v.destroy = s.destroy, Object.defineProperty(v, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => g !== null ? g : (_ !== s.namespaces && (_ = s.namespaces, p = s.enabled(c)), p),
        set: (S) => {
          g = S;
        }
      }), typeof s.init == "function" && s.init(v), v;
    }
    function n(c, l) {
      const g = s(this.namespace + (typeof l > "u" ? ":" : l) + c);
      return g.log = this.log, g;
    }
    function i(c) {
      s.save(c), s.namespaces = c, s.names = [], s.skips = [];
      const l = (typeof c == "string" ? c : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const g of l)
        g[0] === "-" ? s.skips.push(g.slice(1)) : s.names.push(g);
    }
    function o(c, l) {
      let g = 0, _ = 0, p = -1, v = 0;
      for (; g < c.length; )
        if (_ < l.length && (l[_] === c[g] || l[_] === "*"))
          l[_] === "*" ? (p = _, v = g, _++) : (g++, _++);
        else if (p !== -1)
          _ = p + 1, v++, g = v;
        else
          return !1;
      for (; _ < l.length && l[_] === "*"; )
        _++;
      return _ === l.length;
    }
    function h() {
      const c = [
        ...s.names,
        ...s.skips.map((l) => "-" + l)
      ].join(",");
      return s.enable(""), c;
    }
    function a(c) {
      for (const l of s.skips)
        if (o(c, l))
          return !1;
      for (const l of s.names)
        if (o(c, l))
          return !0;
      return !1;
    }
    function f(c) {
      return c instanceof Error ? c.stack || c.message : c;
    }
    function u() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return s.enable(s.load()), s;
  }
  return ht = r, ht;
}
var Xt;
function zr() {
  return Xt || (Xt = 1, function(r, e) {
    e.formatArgs = s, e.save = n, e.load = i, e.useColors = t, e.storage = o(), e.destroy = /* @__PURE__ */ (() => {
      let a = !1;
      return () => {
        a || (a = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), e.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function t() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let a;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (a = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(a[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function s(a) {
      if (a[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + a[0] + (this.useColors ? "%c " : " ") + "+" + r.exports.humanize(this.diff), !this.useColors)
        return;
      const f = "color: " + this.color;
      a.splice(1, 0, f, "color: inherit");
      let u = 0, c = 0;
      a[0].replace(/%[a-zA-Z%]/g, (l) => {
        l !== "%%" && (u++, l === "%c" && (c = u));
      }), a.splice(c, 0, f);
    }
    e.log = console.debug || console.log || (() => {
    });
    function n(a) {
      try {
        a ? e.storage.setItem("debug", a) : e.storage.removeItem("debug");
      } catch {
      }
    }
    function i() {
      let a;
      try {
        a = e.storage.getItem("debug") || e.storage.getItem("DEBUG");
      } catch {
      }
      return !a && typeof process < "u" && "env" in process && (a = process.env.DEBUG), a;
    }
    function o() {
      try {
        return localStorage;
      } catch {
      }
    }
    r.exports = Fs()(e);
    const { formatters: h } = r.exports;
    h.j = function(a) {
      try {
        return JSON.stringify(a);
      } catch (f) {
        return "[UnexpectedJSONParseError]: " + f.message;
      }
    };
  }(Ie, Ie.exports)), Ie.exports;
}
var Pe = { exports: {} }, lt, Kt;
function Yr() {
  return Kt || (Kt = 1, lt = (r, e = process.argv) => {
    const t = r.startsWith("-") ? "" : r.length === 1 ? "-" : "--", s = e.indexOf(t + r), n = e.indexOf("--");
    return s !== -1 && (n === -1 || s < n);
  }), lt;
}
var ft, Jt;
function Xr() {
  if (Jt) return ft;
  Jt = 1;
  const r = mr, e = Rs, t = Yr(), { env: s } = process;
  let n;
  t("no-color") || t("no-colors") || t("color=false") || t("color=never") ? n = 0 : (t("color") || t("colors") || t("color=true") || t("color=always")) && (n = 1), "FORCE_COLOR" in s && (s.FORCE_COLOR === "true" ? n = 1 : s.FORCE_COLOR === "false" ? n = 0 : n = s.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(s.FORCE_COLOR, 10), 3));
  function i(a) {
    return a === 0 ? !1 : {
      level: a,
      hasBasic: !0,
      has256: a >= 2,
      has16m: a >= 3
    };
  }
  function o(a, f) {
    if (n === 0)
      return 0;
    if (t("color=16m") || t("color=full") || t("color=truecolor"))
      return 3;
    if (t("color=256"))
      return 2;
    if (a && !f && n === void 0)
      return 0;
    const u = n || 0;
    if (s.TERM === "dumb")
      return u;
    if (process.platform === "win32") {
      const c = r.release().split(".");
      return Number(c[0]) >= 10 && Number(c[2]) >= 10586 ? Number(c[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in s)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((c) => c in s) || s.CI_NAME === "codeship" ? 1 : u;
    if ("TEAMCITY_VERSION" in s)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(s.TEAMCITY_VERSION) ? 1 : 0;
    if (s.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in s) {
      const c = parseInt((s.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (s.TERM_PROGRAM) {
        case "iTerm.app":
          return c >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(s.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(s.TERM) || "COLORTERM" in s ? 1 : u;
  }
  function h(a) {
    const f = o(a, a && a.isTTY);
    return i(f);
  }
  return ft = {
    supportsColor: h,
    stdout: i(o(!0, e.isatty(1))),
    stderr: i(o(!0, e.isatty(2)))
  }, ft;
}
var Qt;
function Kr() {
  return Qt || (Qt = 1, function(r, e) {
    const t = Rs, s = _r;
    e.init = u, e.log = h, e.formatArgs = i, e.save = a, e.load = f, e.useColors = n, e.destroy = s.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), e.colors = [6, 2, 3, 4, 5, 1];
    try {
      const l = Xr();
      l && (l.stderr || l).level >= 2 && (e.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ]);
    } catch {
    }
    e.inspectOpts = Object.keys(process.env).filter((l) => /^debug_/i.test(l)).reduce((l, g) => {
      const _ = g.substring(6).toLowerCase().replace(/_([a-z])/g, (v, S) => S.toUpperCase());
      let p = process.env[g];
      return /^(yes|on|true|enabled)$/i.test(p) ? p = !0 : /^(no|off|false|disabled)$/i.test(p) ? p = !1 : p === "null" ? p = null : p = Number(p), l[_] = p, l;
    }, {});
    function n() {
      return "colors" in e.inspectOpts ? !!e.inspectOpts.colors : t.isatty(process.stderr.fd);
    }
    function i(l) {
      const { namespace: g, useColors: _ } = this;
      if (_) {
        const p = this.color, v = "\x1B[3" + (p < 8 ? p : "8;5;" + p), S = `  ${v};1m${g} \x1B[0m`;
        l[0] = S + l[0].split(`
`).join(`
` + S), l.push(v + "m+" + r.exports.humanize(this.diff) + "\x1B[0m");
      } else
        l[0] = o() + g + " " + l[0];
    }
    function o() {
      return e.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function h(...l) {
      return process.stderr.write(s.formatWithOptions(e.inspectOpts, ...l) + `
`);
    }
    function a(l) {
      l ? process.env.DEBUG = l : delete process.env.DEBUG;
    }
    function f() {
      return process.env.DEBUG;
    }
    function u(l) {
      l.inspectOpts = {};
      const g = Object.keys(e.inspectOpts);
      for (let _ = 0; _ < g.length; _++)
        l.inspectOpts[g[_]] = e.inspectOpts[g[_]];
    }
    r.exports = Fs()(e);
    const { formatters: c } = r.exports;
    c.o = function(l) {
      return this.inspectOpts.colors = this.useColors, s.inspect(l, this.inspectOpts).split(`
`).map((g) => g.trim()).join(" ");
    }, c.O = function(l) {
      return this.inspectOpts.colors = this.useColors, s.inspect(l, this.inspectOpts);
    };
  }(Pe, Pe.exports)), Pe.exports;
}
typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? St.exports = zr() : St.exports = Kr();
var Jr = St.exports;
const H = /* @__PURE__ */ Dt(Jr), Qr = H("engine.io-client:transport");
class Zr extends Error {
  constructor(e, t, s) {
    super(e), this.description = t, this.context = s, this.type = "TransportError";
  }
}
class Ut extends T {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(e) {
    super(), this.writable = !1, Ke(this, e), this.opts = e, this.query = e.query, this.socket = e.socket, this.supportsBinary = !e.forceBase64;
  }
  /**
   * Emits an error.
   *
   * @param {String} reason
   * @param description
   * @param context - the error context
   * @return {Transport} for chaining
   * @protected
   */
  onError(e, t, s) {
    return super.emitReserved("error", new Zr(e, t, s)), this;
  }
  /**
   * Opens the transport.
   */
  open() {
    return this.readyState = "opening", this.doOpen(), this;
  }
  /**
   * Closes the transport.
   */
  close() {
    return (this.readyState === "opening" || this.readyState === "open") && (this.doClose(), this.onClose()), this;
  }
  /**
   * Sends multiple packets.
   *
   * @param {Array} packets
   */
  send(e) {
    this.readyState === "open" ? this.write(e) : Qr("transport is not open, discarding packets");
  }
  /**
   * Called upon open
   *
   * @protected
   */
  onOpen() {
    this.readyState = "open", this.writable = !0, super.emitReserved("open");
  }
  /**
   * Called with data.
   *
   * @param {String} data
   * @protected
   */
  onData(e) {
    const t = Mt(e, this.socket.binaryType);
    this.onPacket(t);
  }
  /**
   * Called with a decoded packet.
   *
   * @protected
   */
  onPacket(e) {
    super.emitReserved("packet", e);
  }
  /**
   * Called upon close.
   *
   * @protected
   */
  onClose(e) {
    this.readyState = "closed", super.emitReserved("close", e);
  }
  /**
   * Pauses the transport, in order not to lose packets during an upgrade.
   *
   * @param onPause
   */
  pause(e) {
  }
  createUri(e, t = {}) {
    return e + "://" + this._hostname() + this._port() + this.opts.path + this._query(t);
  }
  _hostname() {
    const e = this.opts.hostname;
    return e.indexOf(":") === -1 ? e : "[" + e + "]";
  }
  _port() {
    return this.opts.port && (this.opts.secure && Number(this.opts.port) !== 443 || !this.opts.secure && Number(this.opts.port) !== 80) ? ":" + this.opts.port : "";
  }
  _query(e) {
    const t = Wr(e);
    return t.length ? "?" + t : "";
  }
}
const M = H("engine.io-client:polling");
class en extends Ut {
  constructor() {
    super(...arguments), this._polling = !1;
  }
  get name() {
    return "polling";
  }
  /**
   * Opens the socket (triggers polling). We write a PING message to determine
   * when the transport is open.
   *
   * @protected
   */
  doOpen() {
    this._poll();
  }
  /**
   * Pauses polling.
   *
   * @param {Function} onPause - callback upon buffers are flushed and transport is paused
   * @package
   */
  pause(e) {
    this.readyState = "pausing";
    const t = () => {
      M("paused"), this.readyState = "paused", e();
    };
    if (this._polling || !this.writable) {
      let s = 0;
      this._polling && (M("we are currently polling - waiting to pause"), s++, this.once("pollComplete", function() {
        M("pre-pause polling complete"), --s || t();
      })), this.writable || (M("we are currently writing - waiting to pause"), s++, this.once("drain", function() {
        M("pre-pause writing complete"), --s || t();
      }));
    } else
      t();
  }
  /**
   * Starts polling cycle.
   *
   * @private
   */
  _poll() {
    M("polling"), this._polling = !0, this.doPoll(), this.emitReserved("poll");
  }
  /**
   * Overloads onData to detect payloads.
   *
   * @protected
   */
  onData(e) {
    M("polling got data %s", e);
    const t = (s) => {
      if (this.readyState === "opening" && s.type === "open" && this.onOpen(), s.type === "close")
        return this.onClose({ description: "transport closed by the server" }), !1;
      this.onPacket(s);
    };
    Nr(e, this.socket.binaryType).forEach(t), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" ? this._poll() : M('ignoring poll - transport state "%s"', this.readyState));
  }
  /**
   * For polling, send a close packet.
   *
   * @protected
   */
  doClose() {
    const e = () => {
      M("writing close packet"), this.write([{ type: "close" }]);
    };
    this.readyState === "open" ? (M("transport open - closing"), e()) : (M("transport not open - deferring close"), this.once("open", e));
  }
  /**
   * Writes a packets payload.
   *
   * @param {Array} packets - data packets
   * @protected
   */
  write(e) {
    this.writable = !1, Lr(e, (t) => {
      this.doWrite(t, () => {
        this.writable = !0, this.emitReserved("drain");
      });
    });
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const e = this.opts.secure ? "https" : "http", t = this.query || {};
    return this.opts.timestampRequests !== !1 && (t[this.opts.timestampParam] = Ds()), !this.supportsBinary && !t.sid && (t.b64 = 1), this.createUri(e, t);
  }
}
let Ms = !1;
try {
  Ms = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const tn = Ms, Ct = H("engine.io-client:polling");
function sn() {
}
class rn extends en {
  /**
   * XHR Polling constructor.
   *
   * @param {Object} opts
   * @package
   */
  constructor(e) {
    if (super(e), typeof location < "u") {
      const t = location.protocol === "https:";
      let s = location.port;
      s || (s = t ? "443" : "80"), this.xd = typeof location < "u" && e.hostname !== location.hostname || s !== e.port;
    }
  }
  /**
   * Sends data.
   *
   * @param {String} data to send.
   * @param {Function} called upon flush.
   * @private
   */
  doWrite(e, t) {
    const s = this.request({
      method: "POST",
      data: e
    });
    s.on("success", t), s.on("error", (n, i) => {
      this.onError("xhr post error", n, i);
    });
  }
  /**
   * Starts a poll cycle.
   *
   * @private
   */
  doPoll() {
    Ct("xhr poll");
    const e = this.request();
    e.on("data", this.onData.bind(this)), e.on("error", (t, s) => {
      this.onError("xhr poll error", t, s);
    }), this.pollXhr = e;
  }
}
class j extends T {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(e, t, s) {
    super(), this.createRequest = e, Ke(this, s), this._opts = s, this._method = s.method || "GET", this._uri = t, this._data = s.data !== void 0 ? s.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var e;
    const t = Bs(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
    t.xdomain = !!this._opts.xd;
    const s = this._xhr = this.createRequest(t);
    try {
      Ct("xhr open %s: %s", this._method, this._uri), s.open(this._method, this._uri, !0);
      try {
        if (this._opts.extraHeaders) {
          s.setDisableHeaderCheck && s.setDisableHeaderCheck(!0);
          for (let n in this._opts.extraHeaders)
            this._opts.extraHeaders.hasOwnProperty(n) && s.setRequestHeader(n, this._opts.extraHeaders[n]);
        }
      } catch {
      }
      if (this._method === "POST")
        try {
          s.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
        } catch {
        }
      try {
        s.setRequestHeader("Accept", "*/*");
      } catch {
      }
      (e = this._opts.cookieJar) === null || e === void 0 || e.addCookies(s), "withCredentials" in s && (s.withCredentials = this._opts.withCredentials), this._opts.requestTimeout && (s.timeout = this._opts.requestTimeout), s.onreadystatechange = () => {
        var n;
        s.readyState === 3 && ((n = this._opts.cookieJar) === null || n === void 0 || n.parseCookies(
          // @ts-ignore
          s.getResponseHeader("set-cookie")
        )), s.readyState === 4 && (s.status === 200 || s.status === 1223 ? this._onLoad() : this.setTimeoutFn(() => {
          this._onError(typeof s.status == "number" ? s.status : 0);
        }, 0));
      }, Ct("xhr data %s", this._data), s.send(this._data);
    } catch (n) {
      this.setTimeoutFn(() => {
        this._onError(n);
      }, 0);
      return;
    }
    typeof document < "u" && (this._index = j.requestsCount++, j.requests[this._index] = this);
  }
  /**
   * Called upon error.
   *
   * @private
   */
  _onError(e) {
    this.emitReserved("error", e, this._xhr), this._cleanup(!0);
  }
  /**
   * Cleans up house.
   *
   * @private
   */
  _cleanup(e) {
    if (!(typeof this._xhr > "u" || this._xhr === null)) {
      if (this._xhr.onreadystatechange = sn, e)
        try {
          this._xhr.abort();
        } catch {
        }
      typeof document < "u" && delete j.requests[this._index], this._xhr = null;
    }
  }
  /**
   * Called upon load.
   *
   * @private
   */
  _onLoad() {
    const e = this._xhr.responseText;
    e !== null && (this.emitReserved("data", e), this.emitReserved("success"), this._cleanup());
  }
  /**
   * Aborts the request.
   *
   * @package
   */
  abort() {
    this._cleanup();
  }
}
j.requestsCount = 0;
j.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function")
    attachEvent("onunload", Zt);
  else if (typeof addEventListener == "function") {
    const r = "onpagehide" in G ? "pagehide" : "unload";
    addEventListener(r, Zt, !1);
  }
}
function Zt() {
  for (let r in j.requests)
    j.requests.hasOwnProperty(r) && j.requests[r].abort();
}
(function() {
  const r = nn({
    xdomain: !1
  });
  return r && r.responseType !== null;
})();
function nn(r) {
  const e = r.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!e || tn))
      return new XMLHttpRequest();
  } catch {
  }
  try {
    return new G[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
  } catch {
  }
}
const on = Ns || Rr;
class an extends rn {
  request(e = {}) {
    var t;
    return Object.assign(e, { xd: this.xd, cookieJar: (t = this.socket) === null || t === void 0 ? void 0 : t._cookieJar }, this.opts), new j((s) => new on(s), this.uri(), e);
  }
}
var je = { exports: {} };
const Us = ["nodebuffer", "arraybuffer", "fragments"], $s = typeof Blob < "u";
$s && Us.push("blob");
var re = {
  BINARY_TYPES: Us,
  EMPTY_BUFFER: Buffer.alloc(0),
  GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
  hasBlob: $s,
  kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
  kListener: Symbol("kListener"),
  kStatusCode: Symbol("status-code"),
  kWebSocket: Symbol("websocket"),
  NOOP: () => {
  }
};
const cn = {}, hn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: cn
}, Symbol.toStringTag, { value: "Module" })), ln = /* @__PURE__ */ xs(hn);
var fn, un;
const { EMPTY_BUFFER: dn } = re, kt = Buffer[Symbol.species];
function pn(r, e) {
  if (r.length === 0) return dn;
  if (r.length === 1) return r[0];
  const t = Buffer.allocUnsafe(e);
  let s = 0;
  for (let n = 0; n < r.length; n++) {
    const i = r[n];
    t.set(i, s), s += i.length;
  }
  return s < e ? new kt(t.buffer, t.byteOffset, s) : t;
}
function qs(r, e, t, s, n) {
  for (let i = 0; i < n; i++)
    t[s + i] = r[i] ^ e[i & 3];
}
function Hs(r, e) {
  for (let t = 0; t < r.length; t++)
    r[t] ^= e[t & 3];
}
function gn(r) {
  return r.length === r.buffer.byteLength ? r.buffer : r.buffer.slice(r.byteOffset, r.byteOffset + r.length);
}
function Ot(r) {
  if (Ot.readOnly = !0, Buffer.isBuffer(r)) return r;
  let e;
  return r instanceof ArrayBuffer ? e = new kt(r) : ArrayBuffer.isView(r) ? e = new kt(r.buffer, r.byteOffset, r.byteLength) : (e = Buffer.from(r), Ot.readOnly = !1), e;
}
je.exports = {
  concat: pn,
  mask: qs,
  toArrayBuffer: gn,
  toBuffer: Ot,
  unmask: Hs
};
if (!process.env.WS_NO_BUFFER_UTIL)
  try {
    const r = ln;
    un = je.exports.mask = function(e, t, s, n, i) {
      i < 48 ? qs(e, t, s, n, i) : r.mask(e, t, s, n, i);
    }, fn = je.exports.unmask = function(e, t) {
      e.length < 32 ? Hs(e, t) : r.unmask(e, t);
    };
  } catch {
  }
var Je = je.exports;
const es = Symbol("kDone"), ut = Symbol("kRun");
let _n = class {
  /**
   * Creates a new `Limiter`.
   *
   * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
   *     to run concurrently
   */
  constructor(e) {
    this[es] = () => {
      this.pending--, this[ut]();
    }, this.concurrency = e || 1 / 0, this.jobs = [], this.pending = 0;
  }
  /**
   * Adds a job to the queue.
   *
   * @param {Function} job The job to run
   * @public
   */
  add(e) {
    this.jobs.push(e), this[ut]();
  }
  /**
   * Removes a job from the queue and runs it if possible.
   *
   * @private
   */
  [ut]() {
    if (this.pending !== this.concurrency && this.jobs.length) {
      const e = this.jobs.shift();
      this.pending++, e(this[es]);
    }
  }
};
var mn = _n;
const ve = br, ts = Je, yn = mn, { kStatusCode: Vs } = re, En = Buffer[Symbol.species], vn = Buffer.from([0, 0, 255, 255]), ze = Symbol("permessage-deflate"), Y = Symbol("total-length"), ue = Symbol("callback"), ee = Symbol("buffers"), pe = Symbol("error");
let Be, wn = class {
  /**
   * Creates a PerMessageDeflate instance.
   *
   * @param {Object} [options] Configuration options
   * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
   *     for, or request, a custom client window size
   * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
   *     acknowledge disabling of client context takeover
   * @param {Number} [options.concurrencyLimit=10] The number of concurrent
   *     calls to zlib
   * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
   *     use of a custom server window size
   * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
   *     disabling of server context takeover
   * @param {Number} [options.threshold=1024] Size (in bytes) below which
   *     messages should not be compressed if context takeover is disabled
   * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
   *     deflate
   * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
   *     inflate
   * @param {Boolean} [isServer=false] Create the instance in either server or
   *     client mode
   * @param {Number} [maxPayload=0] The maximum allowed message length
   */
  constructor(e, t, s) {
    if (this._maxPayload = s | 0, this._options = e || {}, this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024, this._isServer = !!t, this._deflate = null, this._inflate = null, this.params = null, !Be) {
      const n = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
      Be = new yn(n);
    }
  }
  /**
   * @type {String}
   */
  static get extensionName() {
    return "permessage-deflate";
  }
  /**
   * Create an extension negotiation offer.
   *
   * @return {Object} Extension parameters
   * @public
   */
  offer() {
    const e = {};
    return this._options.serverNoContextTakeover && (e.server_no_context_takeover = !0), this._options.clientNoContextTakeover && (e.client_no_context_takeover = !0), this._options.serverMaxWindowBits && (e.server_max_window_bits = this._options.serverMaxWindowBits), this._options.clientMaxWindowBits ? e.client_max_window_bits = this._options.clientMaxWindowBits : this._options.clientMaxWindowBits == null && (e.client_max_window_bits = !0), e;
  }
  /**
   * Accept an extension negotiation offer/response.
   *
   * @param {Array} configurations The extension negotiation offers/reponse
   * @return {Object} Accepted configuration
   * @public
   */
  accept(e) {
    return e = this.normalizeParams(e), this.params = this._isServer ? this.acceptAsServer(e) : this.acceptAsClient(e), this.params;
  }
  /**
   * Releases all resources used by the extension.
   *
   * @public
   */
  cleanup() {
    if (this._inflate && (this._inflate.close(), this._inflate = null), this._deflate) {
      const e = this._deflate[ue];
      this._deflate.close(), this._deflate = null, e && e(
        new Error(
          "The deflate stream was closed while data was being processed"
        )
      );
    }
  }
  /**
   *  Accept an extension negotiation offer.
   *
   * @param {Array} offers The extension negotiation offers
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsServer(e) {
    const t = this._options, s = e.find((n) => !(t.serverNoContextTakeover === !1 && n.server_no_context_takeover || n.server_max_window_bits && (t.serverMaxWindowBits === !1 || typeof t.serverMaxWindowBits == "number" && t.serverMaxWindowBits > n.server_max_window_bits) || typeof t.clientMaxWindowBits == "number" && !n.client_max_window_bits));
    if (!s)
      throw new Error("None of the extension offers can be accepted");
    return t.serverNoContextTakeover && (s.server_no_context_takeover = !0), t.clientNoContextTakeover && (s.client_no_context_takeover = !0), typeof t.serverMaxWindowBits == "number" && (s.server_max_window_bits = t.serverMaxWindowBits), typeof t.clientMaxWindowBits == "number" ? s.client_max_window_bits = t.clientMaxWindowBits : (s.client_max_window_bits === !0 || t.clientMaxWindowBits === !1) && delete s.client_max_window_bits, s;
  }
  /**
   * Accept the extension negotiation response.
   *
   * @param {Array} response The extension negotiation response
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsClient(e) {
    const t = e[0];
    if (this._options.clientNoContextTakeover === !1 && t.client_no_context_takeover)
      throw new Error('Unexpected parameter "client_no_context_takeover"');
    if (!t.client_max_window_bits)
      typeof this._options.clientMaxWindowBits == "number" && (t.client_max_window_bits = this._options.clientMaxWindowBits);
    else if (this._options.clientMaxWindowBits === !1 || typeof this._options.clientMaxWindowBits == "number" && t.client_max_window_bits > this._options.clientMaxWindowBits)
      throw new Error(
        'Unexpected or invalid parameter "client_max_window_bits"'
      );
    return t;
  }
  /**
   * Normalize parameters.
   *
   * @param {Array} configurations The extension negotiation offers/reponse
   * @return {Array} The offers/response with normalized parameters
   * @private
   */
  normalizeParams(e) {
    return e.forEach((t) => {
      Object.keys(t).forEach((s) => {
        let n = t[s];
        if (n.length > 1)
          throw new Error(`Parameter "${s}" must have only a single value`);
        if (n = n[0], s === "client_max_window_bits") {
          if (n !== !0) {
            const i = +n;
            if (!Number.isInteger(i) || i < 8 || i > 15)
              throw new TypeError(
                `Invalid value for parameter "${s}": ${n}`
              );
            n = i;
          } else if (!this._isServer)
            throw new TypeError(
              `Invalid value for parameter "${s}": ${n}`
            );
        } else if (s === "server_max_window_bits") {
          const i = +n;
          if (!Number.isInteger(i) || i < 8 || i > 15)
            throw new TypeError(
              `Invalid value for parameter "${s}": ${n}`
            );
          n = i;
        } else if (s === "client_no_context_takeover" || s === "server_no_context_takeover") {
          if (n !== !0)
            throw new TypeError(
              `Invalid value for parameter "${s}": ${n}`
            );
        } else
          throw new Error(`Unknown parameter "${s}"`);
        t[s] = n;
      });
    }), e;
  }
  /**
   * Decompress data. Concurrency limited.
   *
   * @param {Buffer} data Compressed data
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  decompress(e, t, s) {
    Be.add((n) => {
      this._decompress(e, t, (i, o) => {
        n(), s(i, o);
      });
    });
  }
  /**
   * Compress data. Concurrency limited.
   *
   * @param {(Buffer|String)} data Data to compress
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  compress(e, t, s) {
    Be.add((n) => {
      this._compress(e, t, (i, o) => {
        n(), s(i, o);
      });
    });
  }
  /**
   * Decompress data.
   *
   * @param {Buffer} data Compressed data
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @private
   */
  _decompress(e, t, s) {
    const n = this._isServer ? "client" : "server";
    if (!this._inflate) {
      const i = `${n}_max_window_bits`, o = typeof this.params[i] != "number" ? ve.Z_DEFAULT_WINDOWBITS : this.params[i];
      this._inflate = ve.createInflateRaw({
        ...this._options.zlibInflateOptions,
        windowBits: o
      }), this._inflate[ze] = this, this._inflate[Y] = 0, this._inflate[ee] = [], this._inflate.on("error", Sn), this._inflate.on("data", Ws);
    }
    this._inflate[ue] = s, this._inflate.write(e), t && this._inflate.write(vn), this._inflate.flush(() => {
      const i = this._inflate[pe];
      if (i) {
        this._inflate.close(), this._inflate = null, s(i);
        return;
      }
      const o = ts.concat(
        this._inflate[ee],
        this._inflate[Y]
      );
      this._inflate._readableState.endEmitted ? (this._inflate.close(), this._inflate = null) : (this._inflate[Y] = 0, this._inflate[ee] = [], t && this.params[`${n}_no_context_takeover`] && this._inflate.reset()), s(null, o);
    });
  }
  /**
   * Compress data.
   *
   * @param {(Buffer|String)} data Data to compress
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @private
   */
  _compress(e, t, s) {
    const n = this._isServer ? "server" : "client";
    if (!this._deflate) {
      const i = `${n}_max_window_bits`, o = typeof this.params[i] != "number" ? ve.Z_DEFAULT_WINDOWBITS : this.params[i];
      this._deflate = ve.createDeflateRaw({
        ...this._options.zlibDeflateOptions,
        windowBits: o
      }), this._deflate[Y] = 0, this._deflate[ee] = [], this._deflate.on("data", bn);
    }
    this._deflate[ue] = s, this._deflate.write(e), this._deflate.flush(ve.Z_SYNC_FLUSH, () => {
      if (!this._deflate)
        return;
      let i = ts.concat(
        this._deflate[ee],
        this._deflate[Y]
      );
      t && (i = new En(i.buffer, i.byteOffset, i.length - 4)), this._deflate[ue] = null, this._deflate[Y] = 0, this._deflate[ee] = [], t && this.params[`${n}_no_context_takeover`] && this._deflate.reset(), s(null, i);
    });
  }
};
var $t = wn;
function bn(r) {
  this[ee].push(r), this[Y] += r.length;
}
function Ws(r) {
  if (this[Y] += r.length, this[ze]._maxPayload < 1 || this[Y] <= this[ze]._maxPayload) {
    this[ee].push(r);
    return;
  }
  this[pe] = new RangeError("Max payload size exceeded"), this[pe].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH", this[pe][Vs] = 1009, this.removeListener("data", Ws), this.reset();
}
function Sn(r) {
  if (this[ze]._inflate = null, this[pe]) {
    this[ue](this[pe]);
    return;
  }
  r[Vs] = 1007, this[ue](r);
}
var Ye = { exports: {} };
const Cn = {}, kn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Cn
}, Symbol.toStringTag, { value: "Module" })), On = /* @__PURE__ */ xs(kn);
var ss;
const { isUtf8: rs } = Sr, { hasBlob: Tn } = re, Rn = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  // 0 - 15
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  // 16 - 31
  0,
  1,
  0,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  1,
  1,
  0,
  1,
  1,
  0,
  // 32 - 47
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  0,
  0,
  0,
  // 48 - 63
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  // 64 - 79
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  1,
  1,
  // 80 - 95
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  // 96 - 111
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  1,
  0,
  1,
  0
  // 112 - 127
];
function xn(r) {
  return r >= 1e3 && r <= 1014 && r !== 1004 && r !== 1005 && r !== 1006 || r >= 3e3 && r <= 4999;
}
function Tt(r) {
  const e = r.length;
  let t = 0;
  for (; t < e; )
    if (!(r[t] & 128))
      t++;
    else if ((r[t] & 224) === 192) {
      if (t + 1 === e || (r[t + 1] & 192) !== 128 || (r[t] & 254) === 192)
        return !1;
      t += 2;
    } else if ((r[t] & 240) === 224) {
      if (t + 2 >= e || (r[t + 1] & 192) !== 128 || (r[t + 2] & 192) !== 128 || r[t] === 224 && (r[t + 1] & 224) === 128 || // Overlong
      r[t] === 237 && (r[t + 1] & 224) === 160)
        return !1;
      t += 3;
    } else if ((r[t] & 248) === 240) {
      if (t + 3 >= e || (r[t + 1] & 192) !== 128 || (r[t + 2] & 192) !== 128 || (r[t + 3] & 192) !== 128 || r[t] === 240 && (r[t + 1] & 240) === 128 || // Overlong
      r[t] === 244 && r[t + 1] > 143 || r[t] > 244)
        return !1;
      t += 4;
    } else
      return !1;
  return !0;
}
function Ln(r) {
  return Tn && typeof r == "object" && typeof r.arrayBuffer == "function" && typeof r.type == "string" && typeof r.stream == "function" && (r[Symbol.toStringTag] === "Blob" || r[Symbol.toStringTag] === "File");
}
Ye.exports = {
  isBlob: Ln,
  isValidStatusCode: xn,
  isValidUTF8: Tt,
  tokenChars: Rn
};
if (rs)
  ss = Ye.exports.isValidUTF8 = function(r) {
    return r.length < 24 ? Tt(r) : rs(r);
  };
else if (!process.env.WS_NO_UTF_8_VALIDATE)
  try {
    const r = On;
    ss = Ye.exports.isValidUTF8 = function(e) {
      return e.length < 32 ? Tt(e) : r(e);
    };
  } catch {
  }
var xe = Ye.exports;
const { Writable: Nn } = Re, ns = $t, {
  BINARY_TYPES: An,
  EMPTY_BUFFER: is,
  kStatusCode: In,
  kWebSocket: Pn
} = re, { concat: dt, toArrayBuffer: Bn, unmask: Dn } = Je, { isValidStatusCode: Fn, isValidUTF8: os } = xe, De = Buffer[Symbol.species], D = 0, as = 1, cs = 2, hs = 3, pt = 4, gt = 5, Fe = 6;
let Mn = class extends Nn {
  /**
   * Creates a Receiver instance.
   *
   * @param {Object} [options] Options object
   * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
   *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
   *     multiple times in the same tick
   * @param {String} [options.binaryType=nodebuffer] The type for binary data
   * @param {Object} [options.extensions] An object containing the negotiated
   *     extensions
   * @param {Boolean} [options.isServer=false] Specifies whether to operate in
   *     client or server mode
   * @param {Number} [options.maxPayload=0] The maximum allowed message length
   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
   *     not to skip UTF-8 validation for text and close messages
   */
  constructor(e = {}) {
    super(), this._allowSynchronousEvents = e.allowSynchronousEvents !== void 0 ? e.allowSynchronousEvents : !0, this._binaryType = e.binaryType || An[0], this._extensions = e.extensions || {}, this._isServer = !!e.isServer, this._maxPayload = e.maxPayload | 0, this._skipUTF8Validation = !!e.skipUTF8Validation, this[Pn] = void 0, this._bufferedBytes = 0, this._buffers = [], this._compressed = !1, this._payloadLength = 0, this._mask = void 0, this._fragmented = 0, this._masked = !1, this._fin = !1, this._opcode = 0, this._totalPayloadLength = 0, this._messageLength = 0, this._fragments = [], this._errored = !1, this._loop = !1, this._state = D;
  }
  /**
   * Implements `Writable.prototype._write()`.
   *
   * @param {Buffer} chunk The chunk of data to write
   * @param {String} encoding The character encoding of `chunk`
   * @param {Function} cb Callback
   * @private
   */
  _write(e, t, s) {
    if (this._opcode === 8 && this._state == D) return s();
    this._bufferedBytes += e.length, this._buffers.push(e), this.startLoop(s);
  }
  /**
   * Consumes `n` bytes from the buffered data.
   *
   * @param {Number} n The number of bytes to consume
   * @return {Buffer} The consumed bytes
   * @private
   */
  consume(e) {
    if (this._bufferedBytes -= e, e === this._buffers[0].length) return this._buffers.shift();
    if (e < this._buffers[0].length) {
      const s = this._buffers[0];
      return this._buffers[0] = new De(
        s.buffer,
        s.byteOffset + e,
        s.length - e
      ), new De(s.buffer, s.byteOffset, e);
    }
    const t = Buffer.allocUnsafe(e);
    do {
      const s = this._buffers[0], n = t.length - e;
      e >= s.length ? t.set(this._buffers.shift(), n) : (t.set(new Uint8Array(s.buffer, s.byteOffset, e), n), this._buffers[0] = new De(
        s.buffer,
        s.byteOffset + e,
        s.length - e
      )), e -= s.length;
    } while (e > 0);
    return t;
  }
  /**
   * Starts the parsing loop.
   *
   * @param {Function} cb Callback
   * @private
   */
  startLoop(e) {
    this._loop = !0;
    do
      switch (this._state) {
        case D:
          this.getInfo(e);
          break;
        case as:
          this.getPayloadLength16(e);
          break;
        case cs:
          this.getPayloadLength64(e);
          break;
        case hs:
          this.getMask();
          break;
        case pt:
          this.getData(e);
          break;
        case gt:
        case Fe:
          this._loop = !1;
          return;
      }
    while (this._loop);
    this._errored || e();
  }
  /**
   * Reads the first two bytes of a frame.
   *
   * @param {Function} cb Callback
   * @private
   */
  getInfo(e) {
    if (this._bufferedBytes < 2) {
      this._loop = !1;
      return;
    }
    const t = this.consume(2);
    if (t[0] & 48) {
      const n = this.createError(
        RangeError,
        "RSV2 and RSV3 must be clear",
        !0,
        1002,
        "WS_ERR_UNEXPECTED_RSV_2_3"
      );
      e(n);
      return;
    }
    const s = (t[0] & 64) === 64;
    if (s && !this._extensions[ns.extensionName]) {
      const n = this.createError(
        RangeError,
        "RSV1 must be clear",
        !0,
        1002,
        "WS_ERR_UNEXPECTED_RSV_1"
      );
      e(n);
      return;
    }
    if (this._fin = (t[0] & 128) === 128, this._opcode = t[0] & 15, this._payloadLength = t[1] & 127, this._opcode === 0) {
      if (s) {
        const n = this.createError(
          RangeError,
          "RSV1 must be clear",
          !0,
          1002,
          "WS_ERR_UNEXPECTED_RSV_1"
        );
        e(n);
        return;
      }
      if (!this._fragmented) {
        const n = this.createError(
          RangeError,
          "invalid opcode 0",
          !0,
          1002,
          "WS_ERR_INVALID_OPCODE"
        );
        e(n);
        return;
      }
      this._opcode = this._fragmented;
    } else if (this._opcode === 1 || this._opcode === 2) {
      if (this._fragmented) {
        const n = this.createError(
          RangeError,
          `invalid opcode ${this._opcode}`,
          !0,
          1002,
          "WS_ERR_INVALID_OPCODE"
        );
        e(n);
        return;
      }
      this._compressed = s;
    } else if (this._opcode > 7 && this._opcode < 11) {
      if (!this._fin) {
        const n = this.createError(
          RangeError,
          "FIN must be set",
          !0,
          1002,
          "WS_ERR_EXPECTED_FIN"
        );
        e(n);
        return;
      }
      if (s) {
        const n = this.createError(
          RangeError,
          "RSV1 must be clear",
          !0,
          1002,
          "WS_ERR_UNEXPECTED_RSV_1"
        );
        e(n);
        return;
      }
      if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
        const n = this.createError(
          RangeError,
          `invalid payload length ${this._payloadLength}`,
          !0,
          1002,
          "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
        );
        e(n);
        return;
      }
    } else {
      const n = this.createError(
        RangeError,
        `invalid opcode ${this._opcode}`,
        !0,
        1002,
        "WS_ERR_INVALID_OPCODE"
      );
      e(n);
      return;
    }
    if (!this._fin && !this._fragmented && (this._fragmented = this._opcode), this._masked = (t[1] & 128) === 128, this._isServer) {
      if (!this._masked) {
        const n = this.createError(
          RangeError,
          "MASK must be set",
          !0,
          1002,
          "WS_ERR_EXPECTED_MASK"
        );
        e(n);
        return;
      }
    } else if (this._masked) {
      const n = this.createError(
        RangeError,
        "MASK must be clear",
        !0,
        1002,
        "WS_ERR_UNEXPECTED_MASK"
      );
      e(n);
      return;
    }
    this._payloadLength === 126 ? this._state = as : this._payloadLength === 127 ? this._state = cs : this.haveLength(e);
  }
  /**
   * Gets extended payload length (7+16).
   *
   * @param {Function} cb Callback
   * @private
   */
  getPayloadLength16(e) {
    if (this._bufferedBytes < 2) {
      this._loop = !1;
      return;
    }
    this._payloadLength = this.consume(2).readUInt16BE(0), this.haveLength(e);
  }
  /**
   * Gets extended payload length (7+64).
   *
   * @param {Function} cb Callback
   * @private
   */
  getPayloadLength64(e) {
    if (this._bufferedBytes < 8) {
      this._loop = !1;
      return;
    }
    const t = this.consume(8), s = t.readUInt32BE(0);
    if (s > Math.pow(2, 21) - 1) {
      const n = this.createError(
        RangeError,
        "Unsupported WebSocket frame: payload length > 2^53 - 1",
        !1,
        1009,
        "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
      );
      e(n);
      return;
    }
    this._payloadLength = s * Math.pow(2, 32) + t.readUInt32BE(4), this.haveLength(e);
  }
  /**
   * Payload length has been read.
   *
   * @param {Function} cb Callback
   * @private
   */
  haveLength(e) {
    if (this._payloadLength && this._opcode < 8 && (this._totalPayloadLength += this._payloadLength, this._totalPayloadLength > this._maxPayload && this._maxPayload > 0)) {
      const t = this.createError(
        RangeError,
        "Max payload size exceeded",
        !1,
        1009,
        "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
      );
      e(t);
      return;
    }
    this._masked ? this._state = hs : this._state = pt;
  }
  /**
   * Reads mask bytes.
   *
   * @private
   */
  getMask() {
    if (this._bufferedBytes < 4) {
      this._loop = !1;
      return;
    }
    this._mask = this.consume(4), this._state = pt;
  }
  /**
   * Reads data bytes.
   *
   * @param {Function} cb Callback
   * @private
   */
  getData(e) {
    let t = is;
    if (this._payloadLength) {
      if (this._bufferedBytes < this._payloadLength) {
        this._loop = !1;
        return;
      }
      t = this.consume(this._payloadLength), this._masked && this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3] && Dn(t, this._mask);
    }
    if (this._opcode > 7) {
      this.controlMessage(t, e);
      return;
    }
    if (this._compressed) {
      this._state = gt, this.decompress(t, e);
      return;
    }
    t.length && (this._messageLength = this._totalPayloadLength, this._fragments.push(t)), this.dataMessage(e);
  }
  /**
   * Decompresses data.
   *
   * @param {Buffer} data Compressed data
   * @param {Function} cb Callback
   * @private
   */
  decompress(e, t) {
    this._extensions[ns.extensionName].decompress(e, this._fin, (n, i) => {
      if (n) return t(n);
      if (i.length) {
        if (this._messageLength += i.length, this._messageLength > this._maxPayload && this._maxPayload > 0) {
          const o = this.createError(
            RangeError,
            "Max payload size exceeded",
            !1,
            1009,
            "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
          );
          t(o);
          return;
        }
        this._fragments.push(i);
      }
      this.dataMessage(t), this._state === D && this.startLoop(t);
    });
  }
  /**
   * Handles a data message.
   *
   * @param {Function} cb Callback
   * @private
   */
  dataMessage(e) {
    if (!this._fin) {
      this._state = D;
      return;
    }
    const t = this._messageLength, s = this._fragments;
    if (this._totalPayloadLength = 0, this._messageLength = 0, this._fragmented = 0, this._fragments = [], this._opcode === 2) {
      let n;
      this._binaryType === "nodebuffer" ? n = dt(s, t) : this._binaryType === "arraybuffer" ? n = Bn(dt(s, t)) : this._binaryType === "blob" ? n = new Blob(s) : n = s, this._allowSynchronousEvents ? (this.emit("message", n, !0), this._state = D) : (this._state = Fe, setImmediate(() => {
        this.emit("message", n, !0), this._state = D, this.startLoop(e);
      }));
    } else {
      const n = dt(s, t);
      if (!this._skipUTF8Validation && !os(n)) {
        const i = this.createError(
          Error,
          "invalid UTF-8 sequence",
          !0,
          1007,
          "WS_ERR_INVALID_UTF8"
        );
        e(i);
        return;
      }
      this._state === gt || this._allowSynchronousEvents ? (this.emit("message", n, !1), this._state = D) : (this._state = Fe, setImmediate(() => {
        this.emit("message", n, !1), this._state = D, this.startLoop(e);
      }));
    }
  }
  /**
   * Handles a control message.
   *
   * @param {Buffer} data Data to handle
   * @return {(Error|RangeError|undefined)} A possible error
   * @private
   */
  controlMessage(e, t) {
    if (this._opcode === 8) {
      if (e.length === 0)
        this._loop = !1, this.emit("conclude", 1005, is), this.end();
      else {
        const s = e.readUInt16BE(0);
        if (!Fn(s)) {
          const i = this.createError(
            RangeError,
            `invalid status code ${s}`,
            !0,
            1002,
            "WS_ERR_INVALID_CLOSE_CODE"
          );
          t(i);
          return;
        }
        const n = new De(
          e.buffer,
          e.byteOffset + 2,
          e.length - 2
        );
        if (!this._skipUTF8Validation && !os(n)) {
          const i = this.createError(
            Error,
            "invalid UTF-8 sequence",
            !0,
            1007,
            "WS_ERR_INVALID_UTF8"
          );
          t(i);
          return;
        }
        this._loop = !1, this.emit("conclude", s, n), this.end();
      }
      this._state = D;
      return;
    }
    this._allowSynchronousEvents ? (this.emit(this._opcode === 9 ? "ping" : "pong", e), this._state = D) : (this._state = Fe, setImmediate(() => {
      this.emit(this._opcode === 9 ? "ping" : "pong", e), this._state = D, this.startLoop(t);
    }));
  }
  /**
   * Builds an error object.
   *
   * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
   * @param {String} message The error message
   * @param {Boolean} prefix Specifies whether or not to add a default prefix to
   *     `message`
   * @param {Number} statusCode The status code
   * @param {String} errorCode The exposed error code
   * @return {(Error|RangeError)} The error
   * @private
   */
  createError(e, t, s, n, i) {
    this._loop = !1, this._errored = !0;
    const o = new e(
      s ? `Invalid WebSocket frame: ${t}` : t
    );
    return Error.captureStackTrace(o, this.createError), o.code = i, o[In] = n, o;
  }
};
var Un = Mn;
const { Duplex: Do } = Re, { randomFillSync: $n } = Bt, ls = $t, { EMPTY_BUFFER: qn, kWebSocket: Hn, NOOP: Vn } = re, { isBlob: le, isValidStatusCode: Wn } = xe, { mask: fs, toBuffer: ie } = Je, F = Symbol("kByteLength"), Gn = Buffer.alloc(4), qe = 8 * 1024;
let oe, fe = qe;
const U = 0, jn = 1, zn = 2;
let Yn = class ae {
  /**
   * Creates a Sender instance.
   *
   * @param {Duplex} socket The connection socket
   * @param {Object} [extensions] An object containing the negotiated extensions
   * @param {Function} [generateMask] The function used to generate the masking
   *     key
   */
  constructor(e, t, s) {
    this._extensions = t || {}, s && (this._generateMask = s, this._maskBuffer = Buffer.alloc(4)), this._socket = e, this._firstFragment = !0, this._compress = !1, this._bufferedBytes = 0, this._queue = [], this._state = U, this.onerror = Vn, this[Hn] = void 0;
  }
  /**
   * Frames a piece of data according to the HyBi WebSocket protocol.
   *
   * @param {(Buffer|String)} data The data to frame
   * @param {Object} options Options object
   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
   *     FIN bit
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
   *     key
   * @param {Number} options.opcode The opcode
   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
   *     modified
   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
   *     RSV1 bit
   * @return {(Buffer|String)[]} The framed data
   * @public
   */
  static frame(e, t) {
    let s, n = !1, i = 2, o = !1;
    t.mask && (s = t.maskBuffer || Gn, t.generateMask ? t.generateMask(s) : (fe === qe && (oe === void 0 && (oe = Buffer.alloc(qe)), $n(oe, 0, qe), fe = 0), s[0] = oe[fe++], s[1] = oe[fe++], s[2] = oe[fe++], s[3] = oe[fe++]), o = (s[0] | s[1] | s[2] | s[3]) === 0, i = 6);
    let h;
    typeof e == "string" ? (!t.mask || o) && t[F] !== void 0 ? h = t[F] : (e = Buffer.from(e), h = e.length) : (h = e.length, n = t.mask && t.readOnly && !o);
    let a = h;
    h >= 65536 ? (i += 8, a = 127) : h > 125 && (i += 2, a = 126);
    const f = Buffer.allocUnsafe(n ? h + i : i);
    return f[0] = t.fin ? t.opcode | 128 : t.opcode, t.rsv1 && (f[0] |= 64), f[1] = a, a === 126 ? f.writeUInt16BE(h, 2) : a === 127 && (f[2] = f[3] = 0, f.writeUIntBE(h, 4, 6)), t.mask ? (f[1] |= 128, f[i - 4] = s[0], f[i - 3] = s[1], f[i - 2] = s[2], f[i - 1] = s[3], o ? [f, e] : n ? (fs(e, s, f, i, h), [f]) : (fs(e, s, e, 0, h), [f, e])) : [f, e];
  }
  /**
   * Sends a close message to the other peer.
   *
   * @param {Number} [code] The status code component of the body
   * @param {(String|Buffer)} [data] The message component of the body
   * @param {Boolean} [mask=false] Specifies whether or not to mask the message
   * @param {Function} [cb] Callback
   * @public
   */
  close(e, t, s, n) {
    let i;
    if (e === void 0)
      i = qn;
    else {
      if (typeof e != "number" || !Wn(e))
        throw new TypeError("First argument must be a valid error code number");
      if (t === void 0 || !t.length)
        i = Buffer.allocUnsafe(2), i.writeUInt16BE(e, 0);
      else {
        const h = Buffer.byteLength(t);
        if (h > 123)
          throw new RangeError("The message must not be greater than 123 bytes");
        i = Buffer.allocUnsafe(2 + h), i.writeUInt16BE(e, 0), typeof t == "string" ? i.write(t, 2) : i.set(t, 2);
      }
    }
    const o = {
      [F]: i.length,
      fin: !0,
      generateMask: this._generateMask,
      mask: s,
      maskBuffer: this._maskBuffer,
      opcode: 8,
      readOnly: !1,
      rsv1: !1
    };
    this._state !== U ? this.enqueue([this.dispatch, i, !1, o, n]) : this.sendFrame(ae.frame(i, o), n);
  }
  /**
   * Sends a ping message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback
   * @public
   */
  ping(e, t, s) {
    let n, i;
    if (typeof e == "string" ? (n = Buffer.byteLength(e), i = !1) : le(e) ? (n = e.size, i = !1) : (e = ie(e), n = e.length, i = ie.readOnly), n > 125)
      throw new RangeError("The data size must not be greater than 125 bytes");
    const o = {
      [F]: n,
      fin: !0,
      generateMask: this._generateMask,
      mask: t,
      maskBuffer: this._maskBuffer,
      opcode: 9,
      readOnly: i,
      rsv1: !1
    };
    le(e) ? this._state !== U ? this.enqueue([this.getBlobData, e, !1, o, s]) : this.getBlobData(e, !1, o, s) : this._state !== U ? this.enqueue([this.dispatch, e, !1, o, s]) : this.sendFrame(ae.frame(e, o), s);
  }
  /**
   * Sends a pong message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback
   * @public
   */
  pong(e, t, s) {
    let n, i;
    if (typeof e == "string" ? (n = Buffer.byteLength(e), i = !1) : le(e) ? (n = e.size, i = !1) : (e = ie(e), n = e.length, i = ie.readOnly), n > 125)
      throw new RangeError("The data size must not be greater than 125 bytes");
    const o = {
      [F]: n,
      fin: !0,
      generateMask: this._generateMask,
      mask: t,
      maskBuffer: this._maskBuffer,
      opcode: 10,
      readOnly: i,
      rsv1: !1
    };
    le(e) ? this._state !== U ? this.enqueue([this.getBlobData, e, !1, o, s]) : this.getBlobData(e, !1, o, s) : this._state !== U ? this.enqueue([this.dispatch, e, !1, o, s]) : this.sendFrame(ae.frame(e, o), s);
  }
  /**
   * Sends a data message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Object} options Options object
   * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
   *     or text
   * @param {Boolean} [options.compress=false] Specifies whether or not to
   *     compress `data`
   * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
   *     last one
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Function} [cb] Callback
   * @public
   */
  send(e, t, s) {
    const n = this._extensions[ls.extensionName];
    let i = t.binary ? 2 : 1, o = t.compress, h, a;
    typeof e == "string" ? (h = Buffer.byteLength(e), a = !1) : le(e) ? (h = e.size, a = !1) : (e = ie(e), h = e.length, a = ie.readOnly), this._firstFragment ? (this._firstFragment = !1, o && n && n.params[n._isServer ? "server_no_context_takeover" : "client_no_context_takeover"] && (o = h >= n._threshold), this._compress = o) : (o = !1, i = 0), t.fin && (this._firstFragment = !0);
    const f = {
      [F]: h,
      fin: t.fin,
      generateMask: this._generateMask,
      mask: t.mask,
      maskBuffer: this._maskBuffer,
      opcode: i,
      readOnly: a,
      rsv1: o
    };
    le(e) ? this._state !== U ? this.enqueue([this.getBlobData, e, this._compress, f, s]) : this.getBlobData(e, this._compress, f, s) : this._state !== U ? this.enqueue([this.dispatch, e, this._compress, f, s]) : this.dispatch(e, this._compress, f, s);
  }
  /**
   * Gets the contents of a blob as binary data.
   *
   * @param {Blob} blob The blob
   * @param {Boolean} [compress=false] Specifies whether or not to compress
   *     the data
   * @param {Object} options Options object
   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
   *     FIN bit
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
   *     key
   * @param {Number} options.opcode The opcode
   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
   *     modified
   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
   *     RSV1 bit
   * @param {Function} [cb] Callback
   * @private
   */
  getBlobData(e, t, s, n) {
    this._bufferedBytes += s[F], this._state = zn, e.arrayBuffer().then((i) => {
      if (this._socket.destroyed) {
        const h = new Error(
          "The socket was closed while the blob was being read"
        );
        process.nextTick(Rt, this, h, n);
        return;
      }
      this._bufferedBytes -= s[F];
      const o = ie(i);
      t ? this.dispatch(o, t, s, n) : (this._state = U, this.sendFrame(ae.frame(o, s), n), this.dequeue());
    }).catch((i) => {
      process.nextTick(Kn, this, i, n);
    });
  }
  /**
   * Dispatches a message.
   *
   * @param {(Buffer|String)} data The message to send
   * @param {Boolean} [compress=false] Specifies whether or not to compress
   *     `data`
   * @param {Object} options Options object
   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
   *     FIN bit
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
   *     key
   * @param {Number} options.opcode The opcode
   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
   *     modified
   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
   *     RSV1 bit
   * @param {Function} [cb] Callback
   * @private
   */
  dispatch(e, t, s, n) {
    if (!t) {
      this.sendFrame(ae.frame(e, s), n);
      return;
    }
    const i = this._extensions[ls.extensionName];
    this._bufferedBytes += s[F], this._state = jn, i.compress(e, s.fin, (o, h) => {
      if (this._socket.destroyed) {
        const a = new Error(
          "The socket was closed while data was being compressed"
        );
        Rt(this, a, n);
        return;
      }
      this._bufferedBytes -= s[F], this._state = U, s.readOnly = !1, this.sendFrame(ae.frame(h, s), n), this.dequeue();
    });
  }
  /**
   * Executes queued send operations.
   *
   * @private
   */
  dequeue() {
    for (; this._state === U && this._queue.length; ) {
      const e = this._queue.shift();
      this._bufferedBytes -= e[3][F], Reflect.apply(e[0], this, e.slice(1));
    }
  }
  /**
   * Enqueues a send operation.
   *
   * @param {Array} params Send operation parameters.
   * @private
   */
  enqueue(e) {
    this._bufferedBytes += e[3][F], this._queue.push(e);
  }
  /**
   * Sends a frame.
   *
   * @param {(Buffer | String)[]} list The frame to send
   * @param {Function} [cb] Callback
   * @private
   */
  sendFrame(e, t) {
    e.length === 2 ? (this._socket.cork(), this._socket.write(e[0]), this._socket.write(e[1], t), this._socket.uncork()) : this._socket.write(e[0], t);
  }
};
var Xn = Yn;
function Rt(r, e, t) {
  typeof t == "function" && t(e);
  for (let s = 0; s < r._queue.length; s++) {
    const n = r._queue[s], i = n[n.length - 1];
    typeof i == "function" && i(e);
  }
}
function Kn(r, e, t) {
  Rt(r, e, t), r.onerror(e);
}
const { kForOnEventAttribute: we, kListener: _t } = re, us = Symbol("kCode"), ds = Symbol("kData"), ps = Symbol("kError"), gs = Symbol("kMessage"), _s = Symbol("kReason"), de = Symbol("kTarget"), ms = Symbol("kType"), ys = Symbol("kWasClean");
class ge {
  /**
   * Create a new `Event`.
   *
   * @param {String} type The name of the event
   * @throws {TypeError} If the `type` argument is not specified
   */
  constructor(e) {
    this[de] = null, this[ms] = e;
  }
  /**
   * @type {*}
   */
  get target() {
    return this[de];
  }
  /**
   * @type {String}
   */
  get type() {
    return this[ms];
  }
}
Object.defineProperty(ge.prototype, "target", { enumerable: !0 });
Object.defineProperty(ge.prototype, "type", { enumerable: !0 });
class Qe extends ge {
  /**
   * Create a new `CloseEvent`.
   *
   * @param {String} type The name of the event
   * @param {Object} [options] A dictionary object that allows for setting
   *     attributes via object members of the same name
   * @param {Number} [options.code=0] The status code explaining why the
   *     connection was closed
   * @param {String} [options.reason=''] A human-readable string explaining why
   *     the connection was closed
   * @param {Boolean} [options.wasClean=false] Indicates whether or not the
   *     connection was cleanly closed
   */
  constructor(e, t = {}) {
    super(e), this[us] = t.code === void 0 ? 0 : t.code, this[_s] = t.reason === void 0 ? "" : t.reason, this[ys] = t.wasClean === void 0 ? !1 : t.wasClean;
  }
  /**
   * @type {Number}
   */
  get code() {
    return this[us];
  }
  /**
   * @type {String}
   */
  get reason() {
    return this[_s];
  }
  /**
   * @type {Boolean}
   */
  get wasClean() {
    return this[ys];
  }
}
Object.defineProperty(Qe.prototype, "code", { enumerable: !0 });
Object.defineProperty(Qe.prototype, "reason", { enumerable: !0 });
Object.defineProperty(Qe.prototype, "wasClean", { enumerable: !0 });
class qt extends ge {
  /**
   * Create a new `ErrorEvent`.
   *
   * @param {String} type The name of the event
   * @param {Object} [options] A dictionary object that allows for setting
   *     attributes via object members of the same name
   * @param {*} [options.error=null] The error that generated this event
   * @param {String} [options.message=''] The error message
   */
  constructor(e, t = {}) {
    super(e), this[ps] = t.error === void 0 ? null : t.error, this[gs] = t.message === void 0 ? "" : t.message;
  }
  /**
   * @type {*}
   */
  get error() {
    return this[ps];
  }
  /**
   * @type {String}
   */
  get message() {
    return this[gs];
  }
}
Object.defineProperty(qt.prototype, "error", { enumerable: !0 });
Object.defineProperty(qt.prototype, "message", { enumerable: !0 });
class Gs extends ge {
  /**
   * Create a new `MessageEvent`.
   *
   * @param {String} type The name of the event
   * @param {Object} [options] A dictionary object that allows for setting
   *     attributes via object members of the same name
   * @param {*} [options.data=null] The message content
   */
  constructor(e, t = {}) {
    super(e), this[ds] = t.data === void 0 ? null : t.data;
  }
  /**
   * @type {*}
   */
  get data() {
    return this[ds];
  }
}
Object.defineProperty(Gs.prototype, "data", { enumerable: !0 });
const Jn = {
  /**
   * Register an event listener.
   *
   * @param {String} type A string representing the event type to listen for
   * @param {(Function|Object)} handler The listener to add
   * @param {Object} [options] An options object specifies characteristics about
   *     the event listener
   * @param {Boolean} [options.once=false] A `Boolean` indicating that the
   *     listener should be invoked at most once after being added. If `true`,
   *     the listener would be automatically removed when invoked.
   * @public
   */
  addEventListener(r, e, t = {}) {
    for (const n of this.listeners(r))
      if (!t[we] && n[_t] === e && !n[we])
        return;
    let s;
    if (r === "message")
      s = function(i, o) {
        const h = new Gs("message", {
          data: o ? i : i.toString()
        });
        h[de] = this, Me(e, this, h);
      };
    else if (r === "close")
      s = function(i, o) {
        const h = new Qe("close", {
          code: i,
          reason: o.toString(),
          wasClean: this._closeFrameReceived && this._closeFrameSent
        });
        h[de] = this, Me(e, this, h);
      };
    else if (r === "error")
      s = function(i) {
        const o = new qt("error", {
          error: i,
          message: i.message
        });
        o[de] = this, Me(e, this, o);
      };
    else if (r === "open")
      s = function() {
        const i = new ge("open");
        i[de] = this, Me(e, this, i);
      };
    else
      return;
    s[we] = !!t[we], s[_t] = e, t.once ? this.once(r, s) : this.on(r, s);
  },
  /**
   * Remove an event listener.
   *
   * @param {String} type A string representing the event type to remove
   * @param {(Function|Object)} handler The listener to remove
   * @public
   */
  removeEventListener(r, e) {
    for (const t of this.listeners(r))
      if (t[_t] === e && !t[we]) {
        this.removeListener(r, t);
        break;
      }
  }
};
var Qn = {
  EventTarget: Jn
};
function Me(r, e, t) {
  typeof r == "object" && r.handleEvent ? r.handleEvent.call(r, t) : r.call(e, t);
}
const { tokenChars: be } = xe;
function W(r, e, t) {
  r[e] === void 0 ? r[e] = [t] : r[e].push(t);
}
function Zn(r) {
  const e = /* @__PURE__ */ Object.create(null);
  let t = /* @__PURE__ */ Object.create(null), s = !1, n = !1, i = !1, o, h, a = -1, f = -1, u = -1, c = 0;
  for (; c < r.length; c++)
    if (f = r.charCodeAt(c), o === void 0)
      if (u === -1 && be[f] === 1)
        a === -1 && (a = c);
      else if (c !== 0 && (f === 32 || f === 9))
        u === -1 && a !== -1 && (u = c);
      else if (f === 59 || f === 44) {
        if (a === -1)
          throw new SyntaxError(`Unexpected character at index ${c}`);
        u === -1 && (u = c);
        const g = r.slice(a, u);
        f === 44 ? (W(e, g, t), t = /* @__PURE__ */ Object.create(null)) : o = g, a = u = -1;
      } else
        throw new SyntaxError(`Unexpected character at index ${c}`);
    else if (h === void 0)
      if (u === -1 && be[f] === 1)
        a === -1 && (a = c);
      else if (f === 32 || f === 9)
        u === -1 && a !== -1 && (u = c);
      else if (f === 59 || f === 44) {
        if (a === -1)
          throw new SyntaxError(`Unexpected character at index ${c}`);
        u === -1 && (u = c), W(t, r.slice(a, u), !0), f === 44 && (W(e, o, t), t = /* @__PURE__ */ Object.create(null), o = void 0), a = u = -1;
      } else if (f === 61 && a !== -1 && u === -1)
        h = r.slice(a, c), a = u = -1;
      else
        throw new SyntaxError(`Unexpected character at index ${c}`);
    else if (n) {
      if (be[f] !== 1)
        throw new SyntaxError(`Unexpected character at index ${c}`);
      a === -1 ? a = c : s || (s = !0), n = !1;
    } else if (i)
      if (be[f] === 1)
        a === -1 && (a = c);
      else if (f === 34 && a !== -1)
        i = !1, u = c;
      else if (f === 92)
        n = !0;
      else
        throw new SyntaxError(`Unexpected character at index ${c}`);
    else if (f === 34 && r.charCodeAt(c - 1) === 61)
      i = !0;
    else if (u === -1 && be[f] === 1)
      a === -1 && (a = c);
    else if (a !== -1 && (f === 32 || f === 9))
      u === -1 && (u = c);
    else if (f === 59 || f === 44) {
      if (a === -1)
        throw new SyntaxError(`Unexpected character at index ${c}`);
      u === -1 && (u = c);
      let g = r.slice(a, u);
      s && (g = g.replace(/\\/g, ""), s = !1), W(t, h, g), f === 44 && (W(e, o, t), t = /* @__PURE__ */ Object.create(null), o = void 0), h = void 0, a = u = -1;
    } else
      throw new SyntaxError(`Unexpected character at index ${c}`);
  if (a === -1 || i || f === 32 || f === 9)
    throw new SyntaxError("Unexpected end of input");
  u === -1 && (u = c);
  const l = r.slice(a, u);
  return o === void 0 ? W(e, l, t) : (h === void 0 ? W(t, l, !0) : s ? W(t, h, l.replace(/\\/g, "")) : W(t, h, l), W(e, o, t)), e;
}
function ei(r) {
  return Object.keys(r).map((e) => {
    let t = r[e];
    return Array.isArray(t) || (t = [t]), t.map((s) => [e].concat(
      Object.keys(s).map((n) => {
        let i = s[n];
        return Array.isArray(i) || (i = [i]), i.map((o) => o === !0 ? n : `${n}=${o}`).join("; ");
      })
    ).join("; ")).join(", ");
  }).join(", ");
}
var ti = { format: ei, parse: Zn };
const si = yr, ri = Ts, ni = Os, js = vr, ii = wr, { randomBytes: oi, createHash: ai } = Bt, { Duplex: Fo, Readable: Mo } = Re, { URL: mt } = ks, te = $t, ci = Un, hi = Xn, { isBlob: li } = xe, {
  BINARY_TYPES: Es,
  EMPTY_BUFFER: Ue,
  GUID: fi,
  kForOnEventAttribute: yt,
  kListener: ui,
  kStatusCode: di,
  kWebSocket: R,
  NOOP: zs
} = re, {
  EventTarget: { addEventListener: pi, removeEventListener: gi }
} = Qn, { format: _i, parse: mi } = ti, { toBuffer: yi } = Je, Ei = 30 * 1e3, Ys = Symbol("kAborted"), Et = [8, 13], X = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"], vi = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
class m extends si {
  /**
   * Create a new `WebSocket`.
   *
   * @param {(String|URL)} address The URL to which to connect
   * @param {(String|String[])} [protocols] The subprotocols
   * @param {Object} [options] Connection options
   */
  constructor(e, t, s) {
    super(), this._binaryType = Es[0], this._closeCode = 1006, this._closeFrameReceived = !1, this._closeFrameSent = !1, this._closeMessage = Ue, this._closeTimer = null, this._errorEmitted = !1, this._extensions = {}, this._paused = !1, this._protocol = "", this._readyState = m.CONNECTING, this._receiver = null, this._sender = null, this._socket = null, e !== null ? (this._bufferedAmount = 0, this._isServer = !1, this._redirects = 0, t === void 0 ? t = [] : Array.isArray(t) || (typeof t == "object" && t !== null ? (s = t, t = []) : t = [t]), Xs(this, e, t, s)) : (this._autoPong = s.autoPong, this._isServer = !0);
  }
  /**
   * For historical reasons, the custom "nodebuffer" type is used by the default
   * instead of "blob".
   *
   * @type {String}
   */
  get binaryType() {
    return this._binaryType;
  }
  set binaryType(e) {
    Es.includes(e) && (this._binaryType = e, this._receiver && (this._receiver._binaryType = e));
  }
  /**
   * @type {Number}
   */
  get bufferedAmount() {
    return this._socket ? this._socket._writableState.length + this._sender._bufferedBytes : this._bufferedAmount;
  }
  /**
   * @type {String}
   */
  get extensions() {
    return Object.keys(this._extensions).join();
  }
  /**
   * @type {Boolean}
   */
  get isPaused() {
    return this._paused;
  }
  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onclose() {
    return null;
  }
  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onerror() {
    return null;
  }
  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onopen() {
    return null;
  }
  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onmessage() {
    return null;
  }
  /**
   * @type {String}
   */
  get protocol() {
    return this._protocol;
  }
  /**
   * @type {Number}
   */
  get readyState() {
    return this._readyState;
  }
  /**
   * @type {String}
   */
  get url() {
    return this._url;
  }
  /**
   * Set up the socket and the internal resources.
   *
   * @param {Duplex} socket The network socket between the server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Object} options Options object
   * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
   *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
   *     multiple times in the same tick
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Number} [options.maxPayload=0] The maximum allowed message size
   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
   *     not to skip UTF-8 validation for text and close messages
   * @private
   */
  setSocket(e, t, s) {
    const n = new ci({
      allowSynchronousEvents: s.allowSynchronousEvents,
      binaryType: this.binaryType,
      extensions: this._extensions,
      isServer: this._isServer,
      maxPayload: s.maxPayload,
      skipUTF8Validation: s.skipUTF8Validation
    }), i = new hi(e, this._extensions, s.generateMask);
    this._receiver = n, this._sender = i, this._socket = e, n[R] = this, i[R] = this, e[R] = this, n.on("conclude", Ci), n.on("drain", ki), n.on("error", Oi), n.on("message", Ti), n.on("ping", Ri), n.on("pong", xi), i.onerror = Li, e.setTimeout && e.setTimeout(0), e.setNoDelay && e.setNoDelay(), t.length > 0 && e.unshift(t), e.on("close", Qs), e.on("data", Ze), e.on("end", Zs), e.on("error", er), this._readyState = m.OPEN, this.emit("open");
  }
  /**
   * Emit the `'close'` event.
   *
   * @private
   */
  emitClose() {
    if (!this._socket) {
      this._readyState = m.CLOSED, this.emit("close", this._closeCode, this._closeMessage);
      return;
    }
    this._extensions[te.extensionName] && this._extensions[te.extensionName].cleanup(), this._receiver.removeAllListeners(), this._readyState = m.CLOSED, this.emit("close", this._closeCode, this._closeMessage);
  }
  /**
   * Start a closing handshake.
   *
   *          +----------+   +-----------+   +----------+
   *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
   *    |     +----------+   +-----------+   +----------+     |
   *          +----------+   +-----------+         |
   * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
   *          +----------+   +-----------+   |
   *    |           |                        |   +---+        |
   *                +------------------------+-->|fin| - - - -
   *    |         +---+                      |   +---+
   *     - - - - -|fin|<---------------------+
   *              +---+
   *
   * @param {Number} [code] Status code explaining why the connection is closing
   * @param {(String|Buffer)} [data] The reason why the connection is
   *     closing
   * @public
   */
  close(e, t) {
    if (this.readyState !== m.CLOSED) {
      if (this.readyState === m.CONNECTING) {
        B(this, this._req, "WebSocket was closed before the connection was established");
        return;
      }
      if (this.readyState === m.CLOSING) {
        this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted) && this._socket.end();
        return;
      }
      this._readyState = m.CLOSING, this._sender.close(e, t, !this._isServer, (s) => {
        s || (this._closeFrameSent = !0, (this._closeFrameReceived || this._receiver._writableState.errorEmitted) && this._socket.end());
      }), Js(this);
    }
  }
  /**
   * Pause the socket.
   *
   * @public
   */
  pause() {
    this.readyState === m.CONNECTING || this.readyState === m.CLOSED || (this._paused = !0, this._socket.pause());
  }
  /**
   * Send a ping.
   *
   * @param {*} [data] The data to send
   * @param {Boolean} [mask] Indicates whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when the ping is sent
   * @public
   */
  ping(e, t, s) {
    if (this.readyState === m.CONNECTING)
      throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
    if (typeof e == "function" ? (s = e, e = t = void 0) : typeof t == "function" && (s = t, t = void 0), typeof e == "number" && (e = e.toString()), this.readyState !== m.OPEN) {
      vt(this, e, s);
      return;
    }
    t === void 0 && (t = !this._isServer), this._sender.ping(e || Ue, t, s);
  }
  /**
   * Send a pong.
   *
   * @param {*} [data] The data to send
   * @param {Boolean} [mask] Indicates whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when the pong is sent
   * @public
   */
  pong(e, t, s) {
    if (this.readyState === m.CONNECTING)
      throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
    if (typeof e == "function" ? (s = e, e = t = void 0) : typeof t == "function" && (s = t, t = void 0), typeof e == "number" && (e = e.toString()), this.readyState !== m.OPEN) {
      vt(this, e, s);
      return;
    }
    t === void 0 && (t = !this._isServer), this._sender.pong(e || Ue, t, s);
  }
  /**
   * Resume the socket.
   *
   * @public
   */
  resume() {
    this.readyState === m.CONNECTING || this.readyState === m.CLOSED || (this._paused = !1, this._receiver._writableState.needDrain || this._socket.resume());
  }
  /**
   * Send a data message.
   *
   * @param {*} data The message to send
   * @param {Object} [options] Options object
   * @param {Boolean} [options.binary] Specifies whether `data` is binary or
   *     text
   * @param {Boolean} [options.compress] Specifies whether or not to compress
   *     `data`
   * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
   *     last one
   * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when data is written out
   * @public
   */
  send(e, t, s) {
    if (this.readyState === m.CONNECTING)
      throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
    if (typeof t == "function" && (s = t, t = {}), typeof e == "number" && (e = e.toString()), this.readyState !== m.OPEN) {
      vt(this, e, s);
      return;
    }
    const n = {
      binary: typeof e != "string",
      mask: !this._isServer,
      compress: !0,
      fin: !0,
      ...t
    };
    this._extensions[te.extensionName] || (n.compress = !1), this._sender.send(e || Ue, n, s);
  }
  /**
   * Forcibly close the connection.
   *
   * @public
   */
  terminate() {
    if (this.readyState !== m.CLOSED) {
      if (this.readyState === m.CONNECTING) {
        B(this, this._req, "WebSocket was closed before the connection was established");
        return;
      }
      this._socket && (this._readyState = m.CLOSING, this._socket.destroy());
    }
  }
}
Object.defineProperty(m, "CONNECTING", {
  enumerable: !0,
  value: X.indexOf("CONNECTING")
});
Object.defineProperty(m.prototype, "CONNECTING", {
  enumerable: !0,
  value: X.indexOf("CONNECTING")
});
Object.defineProperty(m, "OPEN", {
  enumerable: !0,
  value: X.indexOf("OPEN")
});
Object.defineProperty(m.prototype, "OPEN", {
  enumerable: !0,
  value: X.indexOf("OPEN")
});
Object.defineProperty(m, "CLOSING", {
  enumerable: !0,
  value: X.indexOf("CLOSING")
});
Object.defineProperty(m.prototype, "CLOSING", {
  enumerable: !0,
  value: X.indexOf("CLOSING")
});
Object.defineProperty(m, "CLOSED", {
  enumerable: !0,
  value: X.indexOf("CLOSED")
});
Object.defineProperty(m.prototype, "CLOSED", {
  enumerable: !0,
  value: X.indexOf("CLOSED")
});
[
  "binaryType",
  "bufferedAmount",
  "extensions",
  "isPaused",
  "protocol",
  "readyState",
  "url"
].forEach((r) => {
  Object.defineProperty(m.prototype, r, { enumerable: !0 });
});
["open", "error", "close", "message"].forEach((r) => {
  Object.defineProperty(m.prototype, `on${r}`, {
    enumerable: !0,
    get() {
      for (const e of this.listeners(r))
        if (e[yt]) return e[ui];
      return null;
    },
    set(e) {
      for (const t of this.listeners(r))
        if (t[yt]) {
          this.removeListener(r, t);
          break;
        }
      typeof e == "function" && this.addEventListener(r, e, {
        [yt]: !0
      });
    }
  });
});
m.prototype.addEventListener = pi;
m.prototype.removeEventListener = gi;
var wi = m;
function Xs(r, e, t, s) {
  const n = {
    allowSynchronousEvents: !0,
    autoPong: !0,
    protocolVersion: Et[1],
    maxPayload: 104857600,
    skipUTF8Validation: !1,
    perMessageDeflate: !0,
    followRedirects: !1,
    maxRedirects: 10,
    ...s,
    socketPath: void 0,
    hostname: void 0,
    protocol: void 0,
    timeout: void 0,
    method: "GET",
    host: void 0,
    path: void 0,
    port: void 0
  };
  if (r._autoPong = n.autoPong, !Et.includes(n.protocolVersion))
    throw new RangeError(
      `Unsupported protocol version: ${n.protocolVersion} (supported versions: ${Et.join(", ")})`
    );
  let i;
  if (e instanceof mt)
    i = e;
  else
    try {
      i = new mt(e);
    } catch {
      throw new SyntaxError(`Invalid URL: ${e}`);
    }
  i.protocol === "http:" ? i.protocol = "ws:" : i.protocol === "https:" && (i.protocol = "wss:"), r._url = i.href;
  const o = i.protocol === "wss:", h = i.protocol === "ws+unix:";
  let a;
  if (i.protocol !== "ws:" && !o && !h ? a = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"` : h && !i.pathname ? a = "The URL's pathname is empty" : i.hash && (a = "The URL contains a fragment identifier"), a) {
    const p = new SyntaxError(a);
    if (r._redirects === 0)
      throw p;
    He(r, p);
    return;
  }
  const f = o ? 443 : 80, u = oi(16).toString("base64"), c = o ? ri.request : ni.request, l = /* @__PURE__ */ new Set();
  let g;
  if (n.createConnection = n.createConnection || (o ? Si : bi), n.defaultPort = n.defaultPort || f, n.port = i.port || f, n.host = i.hostname.startsWith("[") ? i.hostname.slice(1, -1) : i.hostname, n.headers = {
    ...n.headers,
    "Sec-WebSocket-Version": n.protocolVersion,
    "Sec-WebSocket-Key": u,
    Connection: "Upgrade",
    Upgrade: "websocket"
  }, n.path = i.pathname + i.search, n.timeout = n.handshakeTimeout, n.perMessageDeflate && (g = new te(
    n.perMessageDeflate !== !0 ? n.perMessageDeflate : {},
    !1,
    n.maxPayload
  ), n.headers["Sec-WebSocket-Extensions"] = _i({
    [te.extensionName]: g.offer()
  })), t.length) {
    for (const p of t) {
      if (typeof p != "string" || !vi.test(p) || l.has(p))
        throw new SyntaxError(
          "An invalid or duplicated subprotocol was specified"
        );
      l.add(p);
    }
    n.headers["Sec-WebSocket-Protocol"] = t.join(",");
  }
  if (n.origin && (n.protocolVersion < 13 ? n.headers["Sec-WebSocket-Origin"] = n.origin : n.headers.Origin = n.origin), (i.username || i.password) && (n.auth = `${i.username}:${i.password}`), h) {
    const p = n.path.split(":");
    n.socketPath = p[0], n.path = p[1];
  }
  let _;
  if (n.followRedirects) {
    if (r._redirects === 0) {
      r._originalIpc = h, r._originalSecure = o, r._originalHostOrSocketPath = h ? n.socketPath : i.host;
      const p = s && s.headers;
      if (s = { ...s, headers: {} }, p)
        for (const [v, S] of Object.entries(p))
          s.headers[v.toLowerCase()] = S;
    } else if (r.listenerCount("redirect") === 0) {
      const p = h ? r._originalIpc ? n.socketPath === r._originalHostOrSocketPath : !1 : r._originalIpc ? !1 : i.host === r._originalHostOrSocketPath;
      (!p || r._originalSecure && !o) && (delete n.headers.authorization, delete n.headers.cookie, p || delete n.headers.host, n.auth = void 0);
    }
    n.auth && !s.headers.authorization && (s.headers.authorization = "Basic " + Buffer.from(n.auth).toString("base64")), _ = r._req = c(n), r._redirects && r.emit("redirect", r.url, _);
  } else
    _ = r._req = c(n);
  n.timeout && _.on("timeout", () => {
    B(r, _, "Opening handshake has timed out");
  }), _.on("error", (p) => {
    _ === null || _[Ys] || (_ = r._req = null, He(r, p));
  }), _.on("response", (p) => {
    const v = p.headers.location, S = p.statusCode;
    if (v && n.followRedirects && S >= 300 && S < 400) {
      if (++r._redirects > n.maxRedirects) {
        B(r, _, "Maximum redirects exceeded");
        return;
      }
      _.abort();
      let C;
      try {
        C = new mt(v, e);
      } catch {
        const y = new SyntaxError(`Invalid URL: ${v}`);
        He(r, y);
        return;
      }
      Xs(r, C, t, s);
    } else r.emit("unexpected-response", _, p) || B(
      r,
      _,
      `Unexpected server response: ${p.statusCode}`
    );
  }), _.on("upgrade", (p, v, S) => {
    if (r.emit("upgrade", p), r.readyState !== m.CONNECTING) return;
    _ = r._req = null;
    const C = p.headers.upgrade;
    if (C === void 0 || C.toLowerCase() !== "websocket") {
      B(r, v, "Invalid Upgrade header");
      return;
    }
    const d = ai("sha1").update(u + fi).digest("base64");
    if (p.headers["sec-websocket-accept"] !== d) {
      B(r, v, "Invalid Sec-WebSocket-Accept header");
      return;
    }
    const y = p.headers["sec-websocket-protocol"];
    let k;
    if (y !== void 0 ? l.size ? l.has(y) || (k = "Server sent an invalid subprotocol") : k = "Server sent a subprotocol but none was requested" : l.size && (k = "Server sent no subprotocol"), k) {
      B(r, v, k);
      return;
    }
    y && (r._protocol = y);
    const L = p.headers["sec-websocket-extensions"];
    if (L !== void 0) {
      if (!g) {
        B(r, v, "Server sent a Sec-WebSocket-Extensions header but no extension was requested");
        return;
      }
      let N;
      try {
        N = mi(L);
      } catch {
        B(r, v, "Invalid Sec-WebSocket-Extensions header");
        return;
      }
      const K = Object.keys(N);
      if (K.length !== 1 || K[0] !== te.extensionName) {
        B(r, v, "Server indicated an extension that was not requested");
        return;
      }
      try {
        g.accept(N[te.extensionName]);
      } catch {
        B(r, v, "Invalid Sec-WebSocket-Extensions header");
        return;
      }
      r._extensions[te.extensionName] = g;
    }
    r.setSocket(v, S, {
      allowSynchronousEvents: n.allowSynchronousEvents,
      generateMask: n.generateMask,
      maxPayload: n.maxPayload,
      skipUTF8Validation: n.skipUTF8Validation
    });
  }), n.finishRequest ? n.finishRequest(_, r) : _.end();
}
function He(r, e) {
  r._readyState = m.CLOSING, r._errorEmitted = !0, r.emit("error", e), r.emitClose();
}
function bi(r) {
  return r.path = r.socketPath, js.connect(r);
}
function Si(r) {
  return r.path = void 0, !r.servername && r.servername !== "" && (r.servername = js.isIP(r.host) ? "" : r.host), ii.connect(r);
}
function B(r, e, t) {
  r._readyState = m.CLOSING;
  const s = new Error(t);
  Error.captureStackTrace(s, B), e.setHeader ? (e[Ys] = !0, e.abort(), e.socket && !e.socket.destroyed && e.socket.destroy(), process.nextTick(He, r, s)) : (e.destroy(s), e.once("error", r.emit.bind(r, "error")), e.once("close", r.emitClose.bind(r)));
}
function vt(r, e, t) {
  if (e) {
    const s = li(e) ? e.size : yi(e).length;
    r._socket ? r._sender._bufferedBytes += s : r._bufferedAmount += s;
  }
  if (t) {
    const s = new Error(
      `WebSocket is not open: readyState ${r.readyState} (${X[r.readyState]})`
    );
    process.nextTick(t, s);
  }
}
function Ci(r, e) {
  const t = this[R];
  t._closeFrameReceived = !0, t._closeMessage = e, t._closeCode = r, t._socket[R] !== void 0 && (t._socket.removeListener("data", Ze), process.nextTick(Ks, t._socket), r === 1005 ? t.close() : t.close(r, e));
}
function ki() {
  const r = this[R];
  r.isPaused || r._socket.resume();
}
function Oi(r) {
  const e = this[R];
  e._socket[R] !== void 0 && (e._socket.removeListener("data", Ze), process.nextTick(Ks, e._socket), e.close(r[di])), e._errorEmitted || (e._errorEmitted = !0, e.emit("error", r));
}
function vs() {
  this[R].emitClose();
}
function Ti(r, e) {
  this[R].emit("message", r, e);
}
function Ri(r) {
  const e = this[R];
  e._autoPong && e.pong(r, !this._isServer, zs), e.emit("ping", r);
}
function xi(r) {
  this[R].emit("pong", r);
}
function Ks(r) {
  r.resume();
}
function Li(r) {
  const e = this[R];
  e.readyState !== m.CLOSED && (e.readyState === m.OPEN && (e._readyState = m.CLOSING, Js(e)), this._socket.end(), e._errorEmitted || (e._errorEmitted = !0, e.emit("error", r)));
}
function Js(r) {
  r._closeTimer = setTimeout(
    r._socket.destroy.bind(r._socket),
    Ei
  );
}
function Qs() {
  const r = this[R];
  this.removeListener("close", Qs), this.removeListener("data", Ze), this.removeListener("end", Zs), r._readyState = m.CLOSING;
  let e;
  !this._readableState.endEmitted && !r._closeFrameReceived && !r._receiver._writableState.errorEmitted && (e = r._socket.read()) !== null && r._receiver.write(e), r._receiver.end(), this[R] = void 0, clearTimeout(r._closeTimer), r._receiver._writableState.finished || r._receiver._writableState.errorEmitted ? r.emitClose() : (r._receiver.on("error", vs), r._receiver.on("finish", vs));
}
function Ze(r) {
  this[R]._receiver.write(r) || this.pause();
}
function Zs() {
  const r = this[R];
  r._readyState = m.CLOSING, r._receiver.end(), this.end();
}
function er() {
  const r = this[R];
  this.removeListener("error", er), this.on("error", zs), r && (r._readyState = m.CLOSING, this.destroy());
}
const Ni = /* @__PURE__ */ Dt(wi), { Duplex: Uo } = Re, { tokenChars: $o } = xe, { Duplex: qo } = Re, { createHash: Ho } = Bt, { GUID: Vo, kWebSocket: Wo } = re, Ai = H("engine.io-client:websocket"), Ii = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class Pi extends Ut {
  get name() {
    return "websocket";
  }
  doOpen() {
    const e = this.uri(), t = this.opts.protocols, s = Ii ? {} : Bs(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
    this.opts.extraHeaders && (s.headers = this.opts.extraHeaders);
    try {
      this.ws = this.createSocket(e, t, s);
    } catch (n) {
      return this.emitReserved("error", n);
    }
    this.ws.binaryType = this.socket.binaryType, this.addEventListeners();
  }
  /**
   * Adds event listeners to the socket
   *
   * @private
   */
  addEventListeners() {
    this.ws.onopen = () => {
      this.opts.autoUnref && this.ws._socket.unref(), this.onOpen();
    }, this.ws.onclose = (e) => this.onClose({
      description: "websocket connection closed",
      context: e
    }), this.ws.onmessage = (e) => this.onData(e.data), this.ws.onerror = (e) => this.onError("websocket error", e);
  }
  write(e) {
    this.writable = !1;
    for (let t = 0; t < e.length; t++) {
      const s = e[t], n = t === e.length - 1;
      Ft(s, this.supportsBinary, (i) => {
        try {
          this.doWrite(s, i);
        } catch {
          Ai("websocket closed before onclose event");
        }
        n && Xe(() => {
          this.writable = !0, this.emitReserved("drain");
        }, this.setTimeoutFn);
      });
    }
  }
  doClose() {
    typeof this.ws < "u" && (this.ws.onerror = () => {
    }, this.ws.close(), this.ws = null);
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const e = this.opts.secure ? "wss" : "ws", t = this.query || {};
    return this.opts.timestampRequests && (t[this.opts.timestampParam] = Ds()), this.supportsBinary || (t.b64 = 1), this.createUri(e, t);
  }
}
class Bi extends Pi {
  createSocket(e, t, s) {
    var n;
    if (!((n = this.socket) === null || n === void 0) && n._cookieJar) {
      s.headers = s.headers || {}, s.headers.cookie = typeof s.headers.cookie == "string" ? [s.headers.cookie] : s.headers.cookie || [];
      for (const [i, o] of this.socket._cookieJar.cookies)
        s.headers.cookie.push(`${i}=${o.value}`);
    }
    return new Ni(e, t, s);
  }
  doWrite(e, t) {
    const s = {};
    e.options && (s.compress = e.options.compress), this.opts.perMessageDeflate && // @ts-ignore
    (typeof t == "string" ? Buffer.byteLength(t) : t.length) < this.opts.perMessageDeflate.threshold && (s.compress = !1), this.ws.send(t, s);
  }
}
const Se = H("engine.io-client:webtransport");
class Di extends Ut {
  get name() {
    return "webtransport";
  }
  doOpen() {
    try {
      this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
    } catch (e) {
      return this.emitReserved("error", e);
    }
    this._transport.closed.then(() => {
      Se("transport closed gracefully"), this.onClose();
    }).catch((e) => {
      Se("transport closed due to %s", e), this.onError("webtransport error", e);
    }), this._transport.ready.then(() => {
      this._transport.createBidirectionalStream().then((e) => {
        const t = Ir(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = e.readable.pipeThrough(t).getReader(), n = Ar();
        n.readable.pipeTo(e.writable), this._writer = n.writable.getWriter();
        const i = () => {
          s.read().then(({ done: h, value: a }) => {
            if (h) {
              Se("session is closed");
              return;
            }
            Se("received chunk: %o", a), this.onPacket(a), i();
          }).catch((h) => {
            Se("an error occurred while reading: %s", h);
          });
        };
        i();
        const o = { type: "open" };
        this.query.sid && (o.data = `{"sid":"${this.query.sid}"}`), this._writer.write(o).then(() => this.onOpen());
      });
    });
  }
  write(e) {
    this.writable = !1;
    for (let t = 0; t < e.length; t++) {
      const s = e[t], n = t === e.length - 1;
      this._writer.write(s).then(() => {
        n && Xe(() => {
          this.writable = !0, this.emitReserved("drain");
        }, this.setTimeoutFn);
      });
    }
  }
  doClose() {
    var e;
    (e = this._transport) === null || e === void 0 || e.close();
  }
}
const Fi = {
  websocket: Bi,
  webtransport: Di,
  polling: an
}, Mi = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, Ui = [
  "source",
  "protocol",
  "authority",
  "userInfo",
  "user",
  "password",
  "host",
  "port",
  "relative",
  "path",
  "directory",
  "file",
  "query",
  "anchor"
];
function xt(r) {
  if (r.length > 8e3)
    throw "URI too long";
  const e = r, t = r.indexOf("["), s = r.indexOf("]");
  t != -1 && s != -1 && (r = r.substring(0, t) + r.substring(t, s).replace(/:/g, ";") + r.substring(s, r.length));
  let n = Mi.exec(r || ""), i = {}, o = 14;
  for (; o--; )
    i[Ui[o]] = n[o] || "";
  return t != -1 && s != -1 && (i.source = e, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = $i(i, i.path), i.queryKey = qi(i, i.query), i;
}
function $i(r, e) {
  const t = /\/{2,9}/g, s = e.replace(t, "/").split("/");
  return (e.slice(0, 1) == "/" || e.length === 0) && s.splice(0, 1), e.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function qi(r, e) {
  const t = {};
  return e.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, n, i) {
    n && (t[n] = i);
  }), t;
}
const b = H("engine.io-client:socket"), Lt = typeof addEventListener == "function" && typeof removeEventListener == "function", Oe = [];
Lt && addEventListener("offline", () => {
  b("closing %d connection(s) because the network was lost", Oe.length), Oe.forEach((r) => r());
}, !1);
class se extends T {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(e, t) {
    if (super(), this.binaryType = Br, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, e && typeof e == "object" && (t = e, e = null), e) {
      const s = xt(e);
      t.hostname = s.host, t.secure = s.protocol === "https" || s.protocol === "wss", t.port = s.port, s.query && (t.query = s.query);
    } else t.host && (t.hostname = xt(t.host).host);
    Ke(this, t), this.secure = t.secure != null ? t.secure : typeof location < "u" && location.protocol === "https:", t.hostname && !t.port && (t.port = this.secure ? "443" : "80"), this.hostname = t.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = t.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, t.transports.forEach((s) => {
      const n = s.prototype.name;
      this.transports.push(n), this._transportsByName[n] = s;
    }), this.opts = Object.assign({
      path: "/engine.io",
      agent: !1,
      withCredentials: !1,
      upgrade: !0,
      timestampParam: "t",
      rememberUpgrade: !1,
      addTrailingSlash: !0,
      rejectUnauthorized: !0,
      perMessageDeflate: {
        threshold: 1024
      },
      transportOptions: {},
      closeOnBeforeunload: !1
    }, t), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = Gr(this.opts.query)), Lt && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (b("adding listener for the 'offline' event"), this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, Oe.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = Dr()), this._open();
  }
  /**
   * Creates transport of the given type.
   *
   * @param {String} name - transport name
   * @return {Transport}
   * @private
   */
  createTransport(e) {
    b('creating transport "%s"', e);
    const t = Object.assign({}, this.opts.query);
    t.EIO = Ps, t.transport = e, this.id && (t.sid = this.id);
    const s = Object.assign({}, this.opts, {
      query: t,
      socket: this,
      hostname: this.hostname,
      secure: this.secure,
      port: this.port
    }, this.opts.transportOptions[e]);
    return b("options: %j", s), new this._transportsByName[e](s);
  }
  /**
   * Initializes transport to use and starts probe.
   *
   * @private
   */
  _open() {
    if (this.transports.length === 0) {
      this.setTimeoutFn(() => {
        this.emitReserved("error", "No transports available");
      }, 0);
      return;
    }
    const e = this.opts.rememberUpgrade && se.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
    this.readyState = "opening";
    const t = this.createTransport(e);
    t.open(), this.setTransport(t);
  }
  /**
   * Sets the current transport. Disables the existing one (if any).
   *
   * @private
   */
  setTransport(e) {
    b("setting transport %s", e.name), this.transport && (b("clearing existing transport %s", this.transport.name), this.transport.removeAllListeners()), this.transport = e, e.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", (t) => this._onClose("transport close", t));
  }
  /**
   * Called when connection is deemed open.
   *
   * @private
   */
  onOpen() {
    b("socket open"), this.readyState = "open", se.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
  }
  /**
   * Handles a packet.
   *
   * @private
   */
  _onPacket(e) {
    if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing")
      switch (b('socket receive: type "%s", data "%s"', e.type, e.data), this.emitReserved("packet", e), this.emitReserved("heartbeat"), e.type) {
        case "open":
          this.onHandshake(JSON.parse(e.data));
          break;
        case "ping":
          this._sendPacket("pong"), this.emitReserved("ping"), this.emitReserved("pong"), this._resetPingTimeout();
          break;
        case "error":
          const t = new Error("server error");
          t.code = e.data, this._onError(t);
          break;
        case "message":
          this.emitReserved("data", e.data), this.emitReserved("message", e.data);
          break;
      }
    else
      b('packet received with socket readyState "%s"', this.readyState);
  }
  /**
   * Called upon handshake completion.
   *
   * @param {Object} data - handshake obj
   * @private
   */
  onHandshake(e) {
    this.emitReserved("handshake", e), this.id = e.sid, this.transport.query.sid = e.sid, this._pingInterval = e.pingInterval, this._pingTimeout = e.pingTimeout, this._maxPayload = e.maxPayload, this.onOpen(), this.readyState !== "closed" && this._resetPingTimeout();
  }
  /**
   * Sets and resets ping timeout timer based on server pings.
   *
   * @private
   */
  _resetPingTimeout() {
    this.clearTimeoutFn(this._pingTimeoutTimer);
    const e = this._pingInterval + this._pingTimeout;
    this._pingTimeoutTime = Date.now() + e, this._pingTimeoutTimer = this.setTimeoutFn(() => {
      this._onClose("ping timeout");
    }, e), this.opts.autoUnref && this._pingTimeoutTimer.unref();
  }
  /**
   * Called on `drain` event
   *
   * @private
   */
  _onDrain() {
    this.writeBuffer.splice(0, this._prevBufferLen), this._prevBufferLen = 0, this.writeBuffer.length === 0 ? this.emitReserved("drain") : this.flush();
  }
  /**
   * Flush write buffers.
   *
   * @private
   */
  flush() {
    if (this.readyState !== "closed" && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
      const e = this._getWritablePackets();
      b("flushing %d packets in socket", e.length), this.transport.send(e), this._prevBufferLen = e.length, this.emitReserved("flush");
    }
  }
  /**
   * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
   * long-polling)
   *
   * @private
   */
  _getWritablePackets() {
    if (!(this._maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1))
      return this.writeBuffer;
    let t = 1;
    for (let s = 0; s < this.writeBuffer.length; s++) {
      const n = this.writeBuffer[s].data;
      if (n && (t += Hr(n)), s > 0 && t > this._maxPayload)
        return b("only send %d out of %d packets", s, this.writeBuffer.length), this.writeBuffer.slice(0, s);
      t += 2;
    }
    return b("payload size is %d (max: %d)", t, this._maxPayload), this.writeBuffer;
  }
  /**
   * Checks whether the heartbeat timer has expired but the socket has not yet been notified.
   *
   * Note: this method is private for now because it does not really fit the WebSocket API, but if we put it in the
   * `write()` method then the message would not be buffered by the Socket.IO client.
   *
   * @return {boolean}
   * @private
   */
  /* private */
  _hasPingExpired() {
    if (!this._pingTimeoutTime)
      return !0;
    const e = Date.now() > this._pingTimeoutTime;
    return e && (b("throttled timer detected, scheduling connection close"), this._pingTimeoutTime = 0, Xe(() => {
      this._onClose("ping timeout");
    }, this.setTimeoutFn)), e;
  }
  /**
   * Sends a message.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  write(e, t, s) {
    return this._sendPacket("message", e, t, s), this;
  }
  /**
   * Sends a message. Alias of {@link Socket#write}.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  send(e, t, s) {
    return this._sendPacket("message", e, t, s), this;
  }
  /**
   * Sends a packet.
   *
   * @param {String} type: packet type.
   * @param {String} data.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @private
   */
  _sendPacket(e, t, s, n) {
    if (typeof t == "function" && (n = t, t = void 0), typeof s == "function" && (n = s, s = null), this.readyState === "closing" || this.readyState === "closed")
      return;
    s = s || {}, s.compress = s.compress !== !1;
    const i = {
      type: e,
      data: t,
      options: s
    };
    this.emitReserved("packetCreate", i), this.writeBuffer.push(i), n && this.once("flush", n), this.flush();
  }
  /**
   * Closes the connection.
   */
  close() {
    const e = () => {
      this._onClose("forced close"), b("socket closing - telling transport to close"), this.transport.close();
    }, t = () => {
      this.off("upgrade", t), this.off("upgradeError", t), e();
    }, s = () => {
      this.once("upgrade", t), this.once("upgradeError", t);
    };
    return (this.readyState === "opening" || this.readyState === "open") && (this.readyState = "closing", this.writeBuffer.length ? this.once("drain", () => {
      this.upgrading ? s() : e();
    }) : this.upgrading ? s() : e()), this;
  }
  /**
   * Called upon transport error
   *
   * @private
   */
  _onError(e) {
    if (b("socket error %j", e), se.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
      return b("trying next transport"), this.transports.shift(), this._open();
    this.emitReserved("error", e), this._onClose("transport error", e);
  }
  /**
   * Called upon transport close.
   *
   * @private
   */
  _onClose(e, t) {
    if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing") {
      if (b('socket close with reason: "%s"', e), this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), Lt && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = Oe.indexOf(this._offlineEventListener);
        s !== -1 && (b("removing listener for the 'offline' event"), Oe.splice(s, 1));
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", e, t), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
se.protocol = Ps;
class Hi extends se {
  constructor() {
    super(...arguments), this._upgrades = [];
  }
  onOpen() {
    if (super.onOpen(), this.readyState === "open" && this.opts.upgrade) {
      b("starting upgrade probes");
      for (let e = 0; e < this._upgrades.length; e++)
        this._probe(this._upgrades[e]);
    }
  }
  /**
   * Probes a transport.
   *
   * @param {String} name - transport name
   * @private
   */
  _probe(e) {
    b('probing transport "%s"', e);
    let t = this.createTransport(e), s = !1;
    se.priorWebsocketSuccess = !1;
    const n = () => {
      s || (b('probe transport "%s" opened', e), t.send([{ type: "ping", data: "probe" }]), t.once("packet", (c) => {
        if (!s)
          if (c.type === "pong" && c.data === "probe") {
            if (b('probe transport "%s" pong', e), this.upgrading = !0, this.emitReserved("upgrading", t), !t)
              return;
            se.priorWebsocketSuccess = t.name === "websocket", b('pausing current transport "%s"', this.transport.name), this.transport.pause(() => {
              s || this.readyState !== "closed" && (b("changing transport and sending upgrade packet"), u(), this.setTransport(t), t.send([{ type: "upgrade" }]), this.emitReserved("upgrade", t), t = null, this.upgrading = !1, this.flush());
            });
          } else {
            b('probe transport "%s" failed', e);
            const l = new Error("probe error");
            l.transport = t.name, this.emitReserved("upgradeError", l);
          }
      }));
    };
    function i() {
      s || (s = !0, u(), t.close(), t = null);
    }
    const o = (c) => {
      const l = new Error("probe error: " + c);
      l.transport = t.name, i(), b('probe transport "%s" failed because of error: %s', e, c), this.emitReserved("upgradeError", l);
    };
    function h() {
      o("transport closed");
    }
    function a() {
      o("socket closed");
    }
    function f(c) {
      t && c.name !== t.name && (b('"%s" works - aborting "%s"', c.name, t.name), i());
    }
    const u = () => {
      t.removeListener("open", n), t.removeListener("error", o), t.removeListener("close", h), this.off("close", a), this.off("upgrading", f);
    };
    t.once("open", n), t.once("error", o), t.once("close", h), this.once("close", a), this.once("upgrading", f), this._upgrades.indexOf("webtransport") !== -1 && e !== "webtransport" ? this.setTimeoutFn(() => {
      s || t.open();
    }, 200) : t.open();
  }
  onHandshake(e) {
    this._upgrades = this._filterUpgrades(e.upgrades), super.onHandshake(e);
  }
  /**
   * Filters upgrades, returning only those matching client transports.
   *
   * @param {Array} upgrades - server upgrades
   * @private
   */
  _filterUpgrades(e) {
    const t = [];
    for (let s = 0; s < e.length; s++)
      ~this.transports.indexOf(e[s]) && t.push(e[s]);
    return t;
  }
}
let Vi = class extends Hi {
  constructor(e, t = {}) {
    const s = typeof e == "object" ? e : t;
    (!s.transports || s.transports && typeof s.transports[0] == "string") && (s.transports = (s.transports || ["polling", "websocket", "webtransport"]).map((n) => Fi[n]).filter((n) => !!n)), super(e, s);
  }
};
const ws = H("socket.io-client:url");
function Wi(r, e = "", t) {
  let s = r;
  t = t || typeof location < "u" && location, r == null && (r = t.protocol + "//" + t.host), typeof r == "string" && (r.charAt(0) === "/" && (r.charAt(1) === "/" ? r = t.protocol + r : r = t.host + r), /^(https?|wss?):\/\//.test(r) || (ws("protocol-less url %s", r), typeof t < "u" ? r = t.protocol + "//" + r : r = "https://" + r), ws("parse %s", r), s = xt(r)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + i + ":" + s.port + e, s.href = s.protocol + "://" + i + (t && t.port === s.port ? "" : ":" + s.port), s;
}
const Gi = typeof ArrayBuffer == "function", ji = (r) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(r) : r.buffer instanceof ArrayBuffer, tr = Object.prototype.toString, zi = typeof Blob == "function" || typeof Blob < "u" && tr.call(Blob) === "[object BlobConstructor]", Yi = typeof File == "function" || typeof File < "u" && tr.call(File) === "[object FileConstructor]";
function Ht(r) {
  return Gi && (r instanceof ArrayBuffer || ji(r)) || zi && r instanceof Blob || Yi && r instanceof File;
}
function Ve(r, e) {
  if (!r || typeof r != "object")
    return !1;
  if (Array.isArray(r)) {
    for (let t = 0, s = r.length; t < s; t++)
      if (Ve(r[t]))
        return !0;
    return !1;
  }
  if (Ht(r))
    return !0;
  if (r.toJSON && typeof r.toJSON == "function" && arguments.length === 1)
    return Ve(r.toJSON(), !0);
  for (const t in r)
    if (Object.prototype.hasOwnProperty.call(r, t) && Ve(r[t]))
      return !0;
  return !1;
}
function Xi(r) {
  const e = [], t = r.data, s = r;
  return s.data = Nt(t, e), s.attachments = e.length, { packet: s, buffers: e };
}
function Nt(r, e) {
  if (!r)
    return r;
  if (Ht(r)) {
    const t = { _placeholder: !0, num: e.length };
    return e.push(r), t;
  } else if (Array.isArray(r)) {
    const t = new Array(r.length);
    for (let s = 0; s < r.length; s++)
      t[s] = Nt(r[s], e);
    return t;
  } else if (typeof r == "object" && !(r instanceof Date)) {
    const t = {};
    for (const s in r)
      Object.prototype.hasOwnProperty.call(r, s) && (t[s] = Nt(r[s], e));
    return t;
  }
  return r;
}
function Ki(r, e) {
  return r.data = At(r.data, e), delete r.attachments, r;
}
function At(r, e) {
  if (!r)
    return r;
  if (r && r._placeholder === !0) {
    if (typeof r.num == "number" && r.num >= 0 && r.num < e.length)
      return e[r.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(r))
    for (let t = 0; t < r.length; t++)
      r[t] = At(r[t], e);
  else if (typeof r == "object")
    for (const t in r)
      Object.prototype.hasOwnProperty.call(r, t) && (r[t] = At(r[t], e));
  return r;
}
const It = H("socket.io-parser"), Ji = [
  "connect",
  // used on the client side
  "connect_error",
  // used on the client side
  "disconnect",
  // used on both sides
  "disconnecting",
  // used on the server side
  "newListener",
  // used by the Node.js EventEmitter
  "removeListener"
  // used by the Node.js EventEmitter
];
var w;
(function(r) {
  r[r.CONNECT = 0] = "CONNECT", r[r.DISCONNECT = 1] = "DISCONNECT", r[r.EVENT = 2] = "EVENT", r[r.ACK = 3] = "ACK", r[r.CONNECT_ERROR = 4] = "CONNECT_ERROR", r[r.BINARY_EVENT = 5] = "BINARY_EVENT", r[r.BINARY_ACK = 6] = "BINARY_ACK";
})(w || (w = {}));
class Qi {
  /**
   * Encoder constructor
   *
   * @param {function} replacer - custom replacer to pass down to JSON.parse
   */
  constructor(e) {
    this.replacer = e;
  }
  /**
   * Encode a packet as a single string if non-binary, or as a
   * buffer sequence, depending on packet type.
   *
   * @param {Object} obj - packet object
   */
  encode(e) {
    return It("encoding packet %j", e), (e.type === w.EVENT || e.type === w.ACK) && Ve(e) ? this.encodeAsBinary({
      type: e.type === w.EVENT ? w.BINARY_EVENT : w.BINARY_ACK,
      nsp: e.nsp,
      data: e.data,
      id: e.id
    }) : [this.encodeAsString(e)];
  }
  /**
   * Encode packet as string.
   */
  encodeAsString(e) {
    let t = "" + e.type;
    return (e.type === w.BINARY_EVENT || e.type === w.BINARY_ACK) && (t += e.attachments + "-"), e.nsp && e.nsp !== "/" && (t += e.nsp + ","), e.id != null && (t += e.id), e.data != null && (t += JSON.stringify(e.data, this.replacer)), It("encoded %j as %s", e, t), t;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(e) {
    const t = Xi(e), s = this.encodeAsString(t.packet), n = t.buffers;
    return n.unshift(s), n;
  }
}
class Vt extends T {
  /**
   * Decoder constructor
   */
  constructor(e) {
    super(), this.opts = Object.assign({
      reviver: void 0,
      maxAttachments: 10
    }, typeof e == "function" ? { reviver: e } : e);
  }
  /**
   * Decodes an encoded packet string into packet JSON.
   *
   * @param {String} obj - encoded packet
   */
  add(e) {
    let t;
    if (typeof e == "string") {
      if (this.reconstructor)
        throw new Error("got plaintext data when reconstructing a packet");
      t = this.decodeString(e);
      const s = t.type === w.BINARY_EVENT;
      s || t.type === w.BINARY_ACK ? (t.type = s ? w.EVENT : w.ACK, this.reconstructor = new Zi(t), t.attachments === 0 && super.emitReserved("decoded", t)) : super.emitReserved("decoded", t);
    } else if (Ht(e) || e.base64)
      if (this.reconstructor)
        t = this.reconstructor.takeBinaryData(e), t && (this.reconstructor = null, super.emitReserved("decoded", t));
      else
        throw new Error("got binary data when not reconstructing a packet");
    else
      throw new Error("Unknown type: " + e);
  }
  /**
   * Decode a packet String (JSON data)
   *
   * @param {String} str
   * @return {Object} packet
   */
  decodeString(e) {
    let t = 0;
    const s = {
      type: Number(e.charAt(0))
    };
    if (w[s.type] === void 0)
      throw new Error("unknown packet type " + s.type);
    if (s.type === w.BINARY_EVENT || s.type === w.BINARY_ACK) {
      const i = t + 1;
      for (; e.charAt(++t) !== "-" && t != e.length; )
        ;
      const o = e.substring(i, t);
      if (o != Number(o) || e.charAt(t) !== "-")
        throw new Error("Illegal attachments");
      const h = Number(o);
      if (!eo(h) || h < 0)
        throw new Error("Illegal attachments");
      if (h > this.opts.maxAttachments)
        throw new Error("too many attachments");
      s.attachments = h;
    }
    if (e.charAt(t + 1) === "/") {
      const i = t + 1;
      for (; ++t && !(e.charAt(t) === "," || t === e.length); )
        ;
      s.nsp = e.substring(i, t);
    } else
      s.nsp = "/";
    const n = e.charAt(t + 1);
    if (n !== "" && Number(n) == n) {
      const i = t + 1;
      for (; ++t; ) {
        const o = e.charAt(t);
        if (o == null || Number(o) != o) {
          --t;
          break;
        }
        if (t === e.length)
          break;
      }
      s.id = Number(e.substring(i, t + 1));
    }
    if (e.charAt(++t)) {
      const i = this.tryParse(e.substr(t));
      if (Vt.isPayloadValid(s.type, i))
        s.data = i;
      else
        throw new Error("invalid payload");
    }
    return It("decoded %s as %j", e, s), s;
  }
  tryParse(e) {
    try {
      return JSON.parse(e, this.opts.reviver);
    } catch {
      return !1;
    }
  }
  static isPayloadValid(e, t) {
    switch (e) {
      case w.CONNECT:
        return bs(t);
      case w.DISCONNECT:
        return t === void 0;
      case w.CONNECT_ERROR:
        return typeof t == "string" || bs(t);
      case w.EVENT:
      case w.BINARY_EVENT:
        return Array.isArray(t) && (typeof t[0] == "number" || typeof t[0] == "string" && Ji.indexOf(t[0]) === -1);
      case w.ACK:
      case w.BINARY_ACK:
        return Array.isArray(t);
    }
  }
  /**
   * Deallocates a parser's resources
   */
  destroy() {
    this.reconstructor && (this.reconstructor.finishedReconstruction(), this.reconstructor = null);
  }
}
class Zi {
  constructor(e) {
    this.packet = e, this.buffers = [], this.reconPack = e;
  }
  /**
   * Method to be called when binary data received from connection
   * after a BINARY_EVENT packet.
   *
   * @param {Buffer | ArrayBuffer} binData - the raw binary data received
   * @return {null | Object} returns null if more binary data is expected or
   *   a reconstructed packet object if all buffers have been received.
   */
  takeBinaryData(e) {
    if (this.buffers.push(e), this.buffers.length === this.reconPack.attachments) {
      const t = Ki(this.reconPack, this.buffers);
      return this.finishedReconstruction(), t;
    }
    return null;
  }
  /**
   * Cleans up binary packet reconstruction variables.
   */
  finishedReconstruction() {
    this.reconPack = null, this.buffers = [];
  }
}
const eo = Number.isInteger || function(r) {
  return typeof r == "number" && isFinite(r) && Math.floor(r) === r;
};
function bs(r) {
  return Object.prototype.toString.call(r) === "[object Object]";
}
const to = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: Vt,
  Encoder: Qi,
  get PacketType() {
    return w;
  }
}, Symbol.toStringTag, { value: "Module" }));
function $(r, e, t) {
  return r.on(e, t), function() {
    r.off(e, t);
  };
}
const O = H("socket.io-client:socket"), so = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class sr extends T {
  /**
   * `Socket` constructor.
   */
  constructor(e, t, s) {
    super(), this.connected = !1, this.recovered = !1, this.receiveBuffer = [], this.sendBuffer = [], this._queue = [], this._queueSeq = 0, this.ids = 0, this.acks = {}, this.flags = {}, this.io = e, this.nsp = t, s && s.auth && (this.auth = s.auth), this._opts = Object.assign({}, s), this.io._autoConnect && this.open();
  }
  /**
   * Whether the socket is currently disconnected
   *
   * @example
   * const socket = io();
   *
   * socket.on("connect", () => {
   *   console.log(socket.disconnected); // false
   * });
   *
   * socket.on("disconnect", () => {
   *   console.log(socket.disconnected); // true
   * });
   */
  get disconnected() {
    return !this.connected;
  }
  /**
   * Subscribe to open, close and packet events
   *
   * @private
   */
  subEvents() {
    if (this.subs)
      return;
    const e = this.io;
    this.subs = [
      $(e, "open", this.onopen.bind(this)),
      $(e, "packet", this.onpacket.bind(this)),
      $(e, "error", this.onerror.bind(this)),
      $(e, "close", this.onclose.bind(this))
    ];
  }
  /**
   * Whether the Socket will try to reconnect when its Manager connects or reconnects.
   *
   * @example
   * const socket = io();
   *
   * console.log(socket.active); // true
   *
   * socket.on("disconnect", (reason) => {
   *   if (reason === "io server disconnect") {
   *     // the disconnection was initiated by the server, you need to manually reconnect
   *     console.log(socket.active); // false
   *   }
   *   // else the socket will automatically try to reconnect
   *   console.log(socket.active); // true
   * });
   */
  get active() {
    return !!this.subs;
  }
  /**
   * "Opens" the socket.
   *
   * @example
   * const socket = io({
   *   autoConnect: false
   * });
   *
   * socket.connect();
   */
  connect() {
    return this.connected ? this : (this.subEvents(), this.io._reconnecting || this.io.open(), this.io._readyState === "open" && this.onopen(), this);
  }
  /**
   * Alias for {@link connect()}.
   */
  open() {
    return this.connect();
  }
  /**
   * Sends a `message` event.
   *
   * This method mimics the WebSocket.send() method.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
   *
   * @example
   * socket.send("hello");
   *
   * // this is equivalent to
   * socket.emit("message", "hello");
   *
   * @return self
   */
  send(...e) {
    return e.unshift("message"), this.emit.apply(this, e), this;
  }
  /**
   * Override `emit`.
   * If the event is in `events`, it's emitted normally.
   *
   * @example
   * socket.emit("hello", "world");
   *
   * // all serializable datastructures are supported (no need to call JSON.stringify)
   * socket.emit("hello", 1, "2", { 3: ["4"], 5: Uint8Array.from([6]) });
   *
   * // with an acknowledgement from the server
   * socket.emit("hello", "world", (val) => {
   *   // ...
   * });
   *
   * @return self
   */
  emit(e, ...t) {
    var s, n, i;
    if (so.hasOwnProperty(e))
      throw new Error('"' + e.toString() + '" is a reserved event name');
    if (t.unshift(e), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
      return this._addToQueue(t), this;
    const o = {
      type: w.EVENT,
      data: t
    };
    if (o.options = {}, o.options.compress = this.flags.compress !== !1, typeof t[t.length - 1] == "function") {
      const u = this.ids++;
      O("emitting packet with ack id %d", u);
      const c = t.pop();
      this._registerAckCallback(u, c), o.id = u;
    }
    const h = (n = (s = this.io.engine) === null || s === void 0 ? void 0 : s.transport) === null || n === void 0 ? void 0 : n.writable, a = this.connected && !(!((i = this.io.engine) === null || i === void 0) && i._hasPingExpired());
    return this.flags.volatile && !h ? O("discard packet as the transport is not currently writable") : a ? (this.notifyOutgoingListeners(o), this.packet(o)) : this.sendBuffer.push(o), this.flags = {}, this;
  }
  /**
   * @private
   */
  _registerAckCallback(e, t) {
    var s;
    const n = (s = this.flags.timeout) !== null && s !== void 0 ? s : this._opts.ackTimeout;
    if (n === void 0) {
      this.acks[e] = t;
      return;
    }
    const i = this.io.setTimeoutFn(() => {
      delete this.acks[e];
      for (let h = 0; h < this.sendBuffer.length; h++)
        this.sendBuffer[h].id === e && (O("removing packet with ack id %d from the buffer", e), this.sendBuffer.splice(h, 1));
      O("event with ack id %d has timed out after %d ms", e, n), t.call(this, new Error("operation has timed out"));
    }, n), o = (...h) => {
      this.io.clearTimeoutFn(i), t.apply(this, h);
    };
    o.withError = !0, this.acks[e] = o;
  }
  /**
   * Emits an event and waits for an acknowledgement
   *
   * @example
   * // without timeout
   * const response = await socket.emitWithAck("hello", "world");
   *
   * // with a specific timeout
   * try {
   *   const response = await socket.timeout(1000).emitWithAck("hello", "world");
   * } catch (err) {
   *   // the server did not acknowledge the event in the given delay
   * }
   *
   * @return a Promise that will be fulfilled when the server acknowledges the event
   */
  emitWithAck(e, ...t) {
    return new Promise((s, n) => {
      const i = (o, h) => o ? n(o) : s(h);
      i.withError = !0, t.push(i), this.emit(e, ...t);
    });
  }
  /**
   * Add the packet to the queue.
   * @param args
   * @private
   */
  _addToQueue(e) {
    let t;
    typeof e[e.length - 1] == "function" && (t = e.pop());
    const s = {
      id: this._queueSeq++,
      tryCount: 0,
      pending: !1,
      args: e,
      flags: Object.assign({ fromQueue: !0 }, this.flags)
    };
    e.push((n, ...i) => s !== this._queue[0] ? O("packet [%d] already acknowledged", s.id) : (n !== null ? s.tryCount > this._opts.retries && (O("packet [%d] is discarded after %d tries", s.id, s.tryCount), this._queue.shift(), t && t(n)) : (O("packet [%d] was successfully sent", s.id), this._queue.shift(), t && t(null, ...i)), s.pending = !1, this._drainQueue())), this._queue.push(s), this._drainQueue();
  }
  /**
   * Send the first packet of the queue, and wait for an acknowledgement from the server.
   * @param force - whether to resend a packet that has not been acknowledged yet
   *
   * @private
   */
  _drainQueue(e = !1) {
    if (O("draining queue"), !this.connected || this._queue.length === 0)
      return;
    const t = this._queue[0];
    if (t.pending && !e) {
      O("packet [%d] has already been sent and is waiting for an ack", t.id);
      return;
    }
    t.pending = !0, t.tryCount++, O("sending packet [%d] (try n°%d)", t.id, t.tryCount), this.flags = t.flags, this.emit.apply(this, t.args);
  }
  /**
   * Sends a packet.
   *
   * @param packet
   * @private
   */
  packet(e) {
    e.nsp = this.nsp, this.io._packet(e);
  }
  /**
   * Called upon engine `open`.
   *
   * @private
   */
  onopen() {
    O("transport is open - connecting"), typeof this.auth == "function" ? this.auth((e) => {
      this._sendConnectPacket(e);
    }) : this._sendConnectPacket(this.auth);
  }
  /**
   * Sends a CONNECT packet to initiate the Socket.IO session.
   *
   * @param data
   * @private
   */
  _sendConnectPacket(e) {
    this.packet({
      type: w.CONNECT,
      data: this._pid ? Object.assign({ pid: this._pid, offset: this._lastOffset }, e) : e
    });
  }
  /**
   * Called upon engine or manager `error`.
   *
   * @param err
   * @private
   */
  onerror(e) {
    this.connected || this.emitReserved("connect_error", e);
  }
  /**
   * Called upon engine `close`.
   *
   * @param reason
   * @param description
   * @private
   */
  onclose(e, t) {
    O("close (%s)", e), this.connected = !1, delete this.id, this.emitReserved("disconnect", e, t), this._clearAcks();
  }
  /**
   * Clears the acknowledgement handlers upon disconnection, since the client will never receive an acknowledgement from
   * the server.
   *
   * @private
   */
  _clearAcks() {
    Object.keys(this.acks).forEach((e) => {
      if (!this.sendBuffer.some((s) => String(s.id) === e)) {
        const s = this.acks[e];
        delete this.acks[e], s.withError && s.call(this, new Error("socket has been disconnected"));
      }
    });
  }
  /**
   * Called with socket packet.
   *
   * @param packet
   * @private
   */
  onpacket(e) {
    if (e.nsp === this.nsp)
      switch (e.type) {
        case w.CONNECT:
          e.data && e.data.sid ? this.onconnect(e.data.sid, e.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
          break;
        case w.EVENT:
        case w.BINARY_EVENT:
          this.onevent(e);
          break;
        case w.ACK:
        case w.BINARY_ACK:
          this.onack(e);
          break;
        case w.DISCONNECT:
          this.ondisconnect();
          break;
        case w.CONNECT_ERROR:
          this.destroy();
          const s = new Error(e.data.message);
          s.data = e.data.data, this.emitReserved("connect_error", s);
          break;
      }
  }
  /**
   * Called upon a server event.
   *
   * @param packet
   * @private
   */
  onevent(e) {
    const t = e.data || [];
    O("emitting event %j", t), e.id != null && (O("attaching ack callback to event"), t.push(this.ack(e.id))), this.connected ? this.emitEvent(t) : this.receiveBuffer.push(Object.freeze(t));
  }
  emitEvent(e) {
    if (this._anyListeners && this._anyListeners.length) {
      const t = this._anyListeners.slice();
      for (const s of t)
        s.apply(this, e);
    }
    super.emit.apply(this, e), this._pid && e.length && typeof e[e.length - 1] == "string" && (this._lastOffset = e[e.length - 1]);
  }
  /**
   * Produces an ack callback to emit with an event.
   *
   * @private
   */
  ack(e) {
    const t = this;
    let s = !1;
    return function(...n) {
      s || (s = !0, O("sending ack %j", n), t.packet({
        type: w.ACK,
        id: e,
        data: n
      }));
    };
  }
  /**
   * Called upon a server acknowledgement.
   *
   * @param packet
   * @private
   */
  onack(e) {
    const t = this.acks[e.id];
    if (typeof t != "function") {
      O("bad ack %s", e.id);
      return;
    }
    delete this.acks[e.id], O("calling ack %s with %j", e.id, e.data), t.withError && e.data.unshift(null), t.apply(this, e.data);
  }
  /**
   * Called upon server connect.
   *
   * @private
   */
  onconnect(e, t) {
    O("socket connected with id %s", e), this.id = e, this.recovered = t && this._pid === t, this._pid = t, this.connected = !0, this.emitBuffered(), this._drainQueue(!0), this.emitReserved("connect");
  }
  /**
   * Emit buffered events (received and emitted).
   *
   * @private
   */
  emitBuffered() {
    this.receiveBuffer.forEach((e) => this.emitEvent(e)), this.receiveBuffer = [], this.sendBuffer.forEach((e) => {
      this.notifyOutgoingListeners(e), this.packet(e);
    }), this.sendBuffer = [];
  }
  /**
   * Called upon server disconnect.
   *
   * @private
   */
  ondisconnect() {
    O("server disconnect (%s)", this.nsp), this.destroy(), this.onclose("io server disconnect");
  }
  /**
   * Called upon forced client/server side disconnections,
   * this method ensures the manager stops tracking us and
   * that reconnections don't get triggered for this.
   *
   * @private
   */
  destroy() {
    this.subs && (this.subs.forEach((e) => e()), this.subs = void 0), this.io._destroy(this);
  }
  /**
   * Disconnects the socket manually. In that case, the socket will not try to reconnect.
   *
   * If this is the last active Socket instance of the {@link Manager}, the low-level connection will be closed.
   *
   * @example
   * const socket = io();
   *
   * socket.on("disconnect", (reason) => {
   *   // console.log(reason); prints "io client disconnect"
   * });
   *
   * socket.disconnect();
   *
   * @return self
   */
  disconnect() {
    return this.connected && (O("performing disconnect (%s)", this.nsp), this.packet({ type: w.DISCONNECT })), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
  }
  /**
   * Alias for {@link disconnect()}.
   *
   * @return self
   */
  close() {
    return this.disconnect();
  }
  /**
   * Sets the compress flag.
   *
   * @example
   * socket.compress(false).emit("hello");
   *
   * @param compress - if `true`, compresses the sending data
   * @return self
   */
  compress(e) {
    return this.flags.compress = e, this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
   * ready to send messages.
   *
   * @example
   * socket.volatile.emit("hello"); // the server may or may not receive it
   *
   * @returns self
   */
  get volatile() {
    return this.flags.volatile = !0, this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
   * given number of milliseconds have elapsed without an acknowledgement from the server:
   *
   * @example
   * socket.timeout(5000).emit("my-event", (err) => {
   *   if (err) {
   *     // the server did not acknowledge the event in the given delay
   *   }
   * });
   *
   * @returns self
   */
  timeout(e) {
    return this.flags.timeout = e, this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * @example
   * socket.onAny((event, ...args) => {
   *   console.log(`got ${event}`);
   * });
   *
   * @param listener
   */
  onAny(e) {
    return this._anyListeners = this._anyListeners || [], this._anyListeners.push(e), this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * @example
   * socket.prependAny((event, ...args) => {
   *   console.log(`got event ${event}`);
   * });
   *
   * @param listener
   */
  prependAny(e) {
    return this._anyListeners = this._anyListeners || [], this._anyListeners.unshift(e), this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`got event ${event}`);
   * }
   *
   * socket.onAny(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAny(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAny();
   *
   * @param listener
   */
  offAny(e) {
    if (!this._anyListeners)
      return this;
    if (e) {
      const t = this._anyListeners;
      for (let s = 0; s < t.length; s++)
        if (e === t[s])
          return t.splice(s, 1), this;
    } else
      this._anyListeners = [];
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAny() {
    return this._anyListeners || [];
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.onAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  onAnyOutgoing(e) {
    return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.push(e), this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.prependAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  prependAnyOutgoing(e) {
    return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.unshift(e), this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`sent event ${event}`);
   * }
   *
   * socket.onAnyOutgoing(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAnyOutgoing(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAnyOutgoing();
   *
   * @param [listener] - the catch-all listener (optional)
   */
  offAnyOutgoing(e) {
    if (!this._anyOutgoingListeners)
      return this;
    if (e) {
      const t = this._anyOutgoingListeners;
      for (let s = 0; s < t.length; s++)
        if (e === t[s])
          return t.splice(s, 1), this;
    } else
      this._anyOutgoingListeners = [];
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAnyOutgoing() {
    return this._anyOutgoingListeners || [];
  }
  /**
   * Notify the listeners for each packet sent
   *
   * @param packet
   *
   * @private
   */
  notifyOutgoingListeners(e) {
    if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
      const t = this._anyOutgoingListeners.slice();
      for (const s of t)
        s.apply(this, e.data);
    }
  }
}
function _e(r) {
  r = r || {}, this.ms = r.min || 100, this.max = r.max || 1e4, this.factor = r.factor || 2, this.jitter = r.jitter > 0 && r.jitter <= 1 ? r.jitter : 0, this.attempts = 0;
}
_e.prototype.duration = function() {
  var r = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var e = Math.random(), t = Math.floor(e * this.jitter * r);
    r = Math.floor(e * 10) & 1 ? r + t : r - t;
  }
  return Math.min(r, this.max) | 0;
};
_e.prototype.reset = function() {
  this.attempts = 0;
};
_e.prototype.setMin = function(r) {
  this.ms = r;
};
_e.prototype.setMax = function(r) {
  this.max = r;
};
_e.prototype.setJitter = function(r) {
  this.jitter = r;
};
const x = H("socket.io-client:manager");
class Pt extends T {
  constructor(e, t) {
    var s;
    super(), this.nsps = {}, this.subs = [], e && typeof e == "object" && (t = e, e = void 0), t = t || {}, t.path = t.path || "/socket.io", this.opts = t, Ke(this, t), this.reconnection(t.reconnection !== !1), this.reconnectionAttempts(t.reconnectionAttempts || 1 / 0), this.reconnectionDelay(t.reconnectionDelay || 1e3), this.reconnectionDelayMax(t.reconnectionDelayMax || 5e3), this.randomizationFactor((s = t.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new _e({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(t.timeout == null ? 2e4 : t.timeout), this._readyState = "closed", this.uri = e;
    const n = t.parser || to;
    this.encoder = new n.Encoder(), this.decoder = new n.Decoder(), this._autoConnect = t.autoConnect !== !1, this._autoConnect && this.open();
  }
  reconnection(e) {
    return arguments.length ? (this._reconnection = !!e, e || (this.skipReconnect = !0), this) : this._reconnection;
  }
  reconnectionAttempts(e) {
    return e === void 0 ? this._reconnectionAttempts : (this._reconnectionAttempts = e, this);
  }
  reconnectionDelay(e) {
    var t;
    return e === void 0 ? this._reconnectionDelay : (this._reconnectionDelay = e, (t = this.backoff) === null || t === void 0 || t.setMin(e), this);
  }
  randomizationFactor(e) {
    var t;
    return e === void 0 ? this._randomizationFactor : (this._randomizationFactor = e, (t = this.backoff) === null || t === void 0 || t.setJitter(e), this);
  }
  reconnectionDelayMax(e) {
    var t;
    return e === void 0 ? this._reconnectionDelayMax : (this._reconnectionDelayMax = e, (t = this.backoff) === null || t === void 0 || t.setMax(e), this);
  }
  timeout(e) {
    return arguments.length ? (this._timeout = e, this) : this._timeout;
  }
  /**
   * Starts trying to reconnect if reconnection is enabled and we have not
   * started reconnecting yet
   *
   * @private
   */
  maybeReconnectOnOpen() {
    !this._reconnecting && this._reconnection && this.backoff.attempts === 0 && this.reconnect();
  }
  /**
   * Sets the current transport `socket`.
   *
   * @param {Function} fn - optional, callback
   * @return self
   * @public
   */
  open(e) {
    if (x("readyState %s", this._readyState), ~this._readyState.indexOf("open"))
      return this;
    x("opening %s", this.uri), this.engine = new Vi(this.uri, this.opts);
    const t = this.engine, s = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const n = $(t, "open", function() {
      s.onopen(), e && e();
    }), i = (h) => {
      x("error"), this.cleanup(), this._readyState = "closed", this.emitReserved("error", h), e ? e(h) : this.maybeReconnectOnOpen();
    }, o = $(t, "error", i);
    if (this._timeout !== !1) {
      const h = this._timeout;
      x("connect attempt will timeout after %d", h);
      const a = this.setTimeoutFn(() => {
        x("connect attempt timed out after %d", h), n(), i(new Error("timeout")), t.close();
      }, h);
      this.opts.autoUnref && a.unref(), this.subs.push(() => {
        this.clearTimeoutFn(a);
      });
    }
    return this.subs.push(n), this.subs.push(o), this;
  }
  /**
   * Alias for open()
   *
   * @return self
   * @public
   */
  connect(e) {
    return this.open(e);
  }
  /**
   * Called upon transport open.
   *
   * @private
   */
  onopen() {
    x("open"), this.cleanup(), this._readyState = "open", this.emitReserved("open");
    const e = this.engine;
    this.subs.push(
      $(e, "ping", this.onping.bind(this)),
      $(e, "data", this.ondata.bind(this)),
      $(e, "error", this.onerror.bind(this)),
      $(e, "close", this.onclose.bind(this)),
      // @ts-ignore
      $(this.decoder, "decoded", this.ondecoded.bind(this))
    );
  }
  /**
   * Called upon a ping.
   *
   * @private
   */
  onping() {
    this.emitReserved("ping");
  }
  /**
   * Called with data.
   *
   * @private
   */
  ondata(e) {
    try {
      this.decoder.add(e);
    } catch (t) {
      this.onclose("parse error", t);
    }
  }
  /**
   * Called when parser fully decodes a packet.
   *
   * @private
   */
  ondecoded(e) {
    Xe(() => {
      this.emitReserved("packet", e);
    }, this.setTimeoutFn);
  }
  /**
   * Called upon socket error.
   *
   * @private
   */
  onerror(e) {
    x("error", e), this.emitReserved("error", e);
  }
  /**
   * Creates a new socket for the given `nsp`.
   *
   * @return {Socket}
   * @public
   */
  socket(e, t) {
    let s = this.nsps[e];
    return s ? this._autoConnect && !s.active && s.connect() : (s = new sr(this, e, t), this.nsps[e] = s), s;
  }
  /**
   * Called upon a socket close.
   *
   * @param socket
   * @private
   */
  _destroy(e) {
    const t = Object.keys(this.nsps);
    for (const s of t)
      if (this.nsps[s].active) {
        x("socket %s is still active, skipping close", s);
        return;
      }
    this._close();
  }
  /**
   * Writes a packet.
   *
   * @param packet
   * @private
   */
  _packet(e) {
    x("writing packet %j", e);
    const t = this.encoder.encode(e);
    for (let s = 0; s < t.length; s++)
      this.engine.write(t[s], e.options);
  }
  /**
   * Clean up transport subscriptions and packet buffer.
   *
   * @private
   */
  cleanup() {
    x("cleanup"), this.subs.forEach((e) => e()), this.subs.length = 0, this.decoder.destroy();
  }
  /**
   * Close the current socket.
   *
   * @private
   */
  _close() {
    x("disconnect"), this.skipReconnect = !0, this._reconnecting = !1, this.onclose("forced close");
  }
  /**
   * Alias for close()
   *
   * @private
   */
  disconnect() {
    return this._close();
  }
  /**
   * Called when:
   *
   * - the low-level engine is closed
   * - the parser encountered a badly formatted packet
   * - all sockets are disconnected
   *
   * @private
   */
  onclose(e, t) {
    var s;
    x("closed due to %s", e), this.cleanup(), (s = this.engine) === null || s === void 0 || s.close(), this.backoff.reset(), this._readyState = "closed", this.emitReserved("close", e, t), this._reconnection && !this.skipReconnect && this.reconnect();
  }
  /**
   * Attempt a reconnection.
   *
   * @private
   */
  reconnect() {
    if (this._reconnecting || this.skipReconnect)
      return this;
    const e = this;
    if (this.backoff.attempts >= this._reconnectionAttempts)
      x("reconnect failed"), this.backoff.reset(), this.emitReserved("reconnect_failed"), this._reconnecting = !1;
    else {
      const t = this.backoff.duration();
      x("will wait %dms before reconnect attempt", t), this._reconnecting = !0;
      const s = this.setTimeoutFn(() => {
        e.skipReconnect || (x("attempting reconnect"), this.emitReserved("reconnect_attempt", e.backoff.attempts), !e.skipReconnect && e.open((n) => {
          n ? (x("reconnect attempt error"), e._reconnecting = !1, e.reconnect(), this.emitReserved("reconnect_error", n)) : (x("reconnect success"), e.onreconnect());
        }));
      }, t);
      this.opts.autoUnref && s.unref(), this.subs.push(() => {
        this.clearTimeoutFn(s);
      });
    }
  }
  /**
   * Called upon successful reconnect.
   *
   * @private
   */
  onreconnect() {
    const e = this.backoff.attempts;
    this._reconnecting = !1, this.backoff.reset(), this.emitReserved("reconnect", e);
  }
}
const Ss = H("socket.io-client"), Ce = {};
function We(r, e) {
  typeof r == "object" && (e = r, r = void 0), e = e || {};
  const t = Wi(r, e.path || "/socket.io"), s = t.source, n = t.id, i = t.path, o = Ce[n] && i in Ce[n].nsps, h = e.forceNew || e["force new connection"] || e.multiplex === !1 || o;
  let a;
  return h ? (Ss("ignoring socket cache for %s", s), a = new Pt(s, e)) : (Ce[n] || (Ss("new io instance for %s", s), Ce[n] = new Pt(s, e)), a = Ce[n]), t.query && !e.query && (e.query = t.queryKey), a.socket(t.path, e);
}
Object.assign(We, {
  Manager: Pt,
  Socket: sr,
  io: We,
  connect: We
});
process.env.SERVER_URL, process.env.WS_URL;
process.cwd();
const ro = {
  // 环境配置
  env: "development",
  // 服务端配置
  server: {
    host: process.env.SERVER_HOST || "localhost",
    port: parseInt(process.env.SERVER_PORT || "3000", 10),
    wsPort: parseInt(process.env.WS_PORT || "3001", 10),
    apiBasePath: process.env.API_BASE_PATH || "/api",
    timeout: parseInt(process.env.SERVER_TIMEOUT || "30000", 10)
  },
  // 客户端配置
  client: {
    name: process.env.CLIENT_NAME || "auto-test-agent",
    version: process.env.npm_package_version || "0.2.0",
    reconnectInterval: parseInt(process.env.RECONNECT_INTERVAL || "3000", 10),
    maxReconnectAttempts: parseInt(process.env.MAX_RECONNECT_ATTEMPTS || "5", 10),
    heartbeatInterval: parseInt(process.env.HEARTBEAT_INTERVAL || "30000", 10)
  },
  // 任务执行配置
  taskExecutor: {
    maxRetries: parseInt(process.env.MAX_RETRIES || "3", 10),
    retryDelay: parseInt(process.env.RETRY_DELAY || "2000", 10),
    stepTimeout: parseInt(process.env.STEP_TIMEOUT || "30000", 10),
    headless: process.env.HEADLESS !== "false",
    // 默认无头模式
    performanceThreshold: parseInt(process.env.PERFORMANCE_THRESHOLD || "10000", 10),
    autoOptimization: process.env.AUTO_OPTIMIZATION !== "false",
    performanceMonitoring: process.env.PERFORMANCE_MONITORING !== "false"
  },
  // Chrome 配置
  chrome: {
    preferSystemChrome: process.env.PREFER_SYSTEM_CHROME !== "false",
    executablePath: process.env.CHROME_PATH,
    debugPort: parseInt(process.env.CHROME_DEBUG_PORT || "9222", 10),
    launchArgs: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-web-security"
    ]
  },
  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || "info",
    enableFileLogging: process.env.ENABLE_FILE_LOGGING !== "false",
    logFilePath: process.env.LOG_FILE_PATH || "./logs",
    maxLogFileSize: parseInt(process.env.MAX_LOG_FILE_SIZE || "10", 10),
    logRetentionDays: parseInt(process.env.LOG_RETENTION_DAYS || "7", 10)
  },
  // UI 配置
  ui: {
    enableFullscreenLogs: !0,
    enableErrorAssistant: !0,
    logRefreshInterval: parseInt(process.env.LOG_REFRESH_INTERVAL || "1000", 10)
  }
};
class no {
  constructor(e) {
    I(this, "config");
    this.config = this.mergeConfig(ro, e), this.validateConfig();
  }
  /**
   * 获取完整配置
   */
  getConfig() {
    return this.config;
  }
  /**
   * 获取服务端配置
   */
  getServerConfig() {
    return this.config.server;
  }
  /**
   * 获取客户端配置
   */
  getClientConfig() {
    return this.config.client;
  }
  /**
   * 获取任务执行配置
   */
  getTaskExecutorConfig() {
    return this.config.taskExecutor;
  }
  /**
   * 获取 Chrome 配置
   */
  getChromeConfig() {
    return this.config.chrome;
  }
  /**
   * 获取日志配置
   */
  getLoggingConfig() {
    return this.config.logging;
  }
  /**
   * 获取 UI 配置
   */
  getUIConfig() {
    return this.config.ui;
  }
  /**
   * 更新配置
   */
  updateConfig(e) {
    this.config = this.mergeConfig(this.config, e), this.validateConfig();
  }
  /**
   * 获取 WebSocket 服务器 URL
   */
  getWebSocketURL() {
    return `ws://${this.config.server.host}:${this.config.server.wsPort}`;
  }
  /**
   * 获取 HTTP 服务器 URL
   */
  getHTTPURL() {
    return `http://${this.config.server.host}:${this.config.server.port}`;
  }
  /**
   * 获取 API 基础 URL
   */
  getAPIBaseURL() {
    return `${this.getHTTPURL()}${this.config.server.apiBasePath}`;
  }
  /**
   * 合并配置对象
   */
  mergeConfig(e, t) {
    return t ? {
      env: t.env || e.env,
      server: { ...e.server, ...t.server },
      client: { ...e.client, ...t.client },
      taskExecutor: { ...e.taskExecutor, ...t.taskExecutor },
      chrome: { ...e.chrome, ...t.chrome },
      logging: { ...e.logging, ...t.logging },
      ui: { ...e.ui, ...t.ui }
    } : e;
  }
  /**
   * 验证配置的有效性
   */
  validateConfig() {
    if (this.config.server.port < 1 || this.config.server.port > 65535)
      throw new Error(`Invalid server port: ${this.config.server.port}`);
    if (this.config.server.wsPort < 1 || this.config.server.wsPort > 65535)
      throw new Error(`Invalid WebSocket port: ${this.config.server.wsPort}`);
    if (this.config.server.timeout <= 0)
      throw new Error(`Invalid server timeout: ${this.config.server.timeout}`);
    if (this.config.taskExecutor.maxRetries < 0)
      throw new Error(`Invalid max retries: ${this.config.taskExecutor.maxRetries}`);
    if (this.config.taskExecutor.performanceThreshold <= 0)
      throw new Error(`Invalid performance threshold: ${this.config.taskExecutor.performanceThreshold}`);
  }
}
const et = new no();
var Cs;
process.env.SERVER_HOST, parseInt(process.env.PORT || "3000", 10), parseInt(process.env.WS_PORT || "3001", 10), process.env.NODE_ENV, (Cs = process.env.ALLOWED_ORIGINS) != null && Cs.split(","), process.env.DATA_DIR, process.env.LOGS_DIR, process.env.TEMP_DIR, process.env.SCREENSHOTS_DIR, process.env.REPORTS_DIR, process.env.TASKS_DIR, process.env.DATABASE_URL, parseInt(process.env.DATABASE_POOL_SIZE || "10", 10), process.env.LOG_LEVEL, process.env.LOG_FILE, parseInt(process.env.LOG_MAX_SIZE || "10485760", 10), parseInt(process.env.LOG_MAX_FILES || "5", 10), parseInt(process.env.TASK_TIMEOUT || "30000", 10), parseInt(process.env.MAX_RETRIES || "3", 10), process.env.DEFAULT_HEADLESS, process.env.SCREENSHOT_ON_FAILURE, parseInt(process.env.SLOW_MO || "0", 10), process.env.PLAYWRIGHT_BROWSERS_PATH, process.env.PLAYWRIGHT_CHANNEL, process.env.PLAYWRIGHT_DEVTOOLS, parseInt(process.env.CLIENT_HEARTBEAT_INTERVAL || "30000", 10), parseInt(process.env.CLIENT_TIMEOUT || "60000", 10), parseInt(process.env.CLIENT_MAX_RECONNECT || "5", 10), parseInt(process.env.RATE_LIMIT_WINDOW || "900000", 10), parseInt(process.env.RATE_LIMIT_MAX || "100", 10), process.env.ENABLE_PROFILING, process.env.ENABLE_METRICS;
class io extends Er {
  constructor() {
    super(...arguments);
    I(this, "socket", null);
    I(this, "connectionState", "disconnected");
    I(this, "reconnectAttempts", 0);
    I(this, "maxReconnectAttempts", 5);
    I(this, "reconnectDelay", 1e3);
    // 1秒
    I(this, "heartbeatInterval", null);
    I(this, "messageQueue", []);
    I(this, "isManualDisconnect", !1);
  }
  /**
   * 连接到WebSocket服务器
   */
  connect() {
    if (this.connectionState === "connected" || this.connectionState === "connecting") {
      console.log("🔌 WebSocket已连接或正在连接中");
      return;
    }
    console.log("🔌 连接到WebSocket服务器..."), this.connectionState = "connecting";
    try {
      const t = et.getWebSocketURL();
      console.log(`📡 WebSocket URL: ${t}`), this.socket = We(t, {
        reconnection: !0,
        reconnectionDelay: this.reconnectDelay,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 1e4,
        transports: ["websocket", "polling"]
      }), this.setupEventHandlers();
    } catch (t) {
      console.error("❌ WebSocket连接失败:", t), this.connectionState = "error", this.emit("error", t);
    }
  }
  /**
   * 设置事件处理器
   */
  setupEventHandlers() {
    this.socket && (this.socket.on("connect", () => {
      console.log("✅ WebSocket连接成功"), this.connectionState = "connected", this.reconnectAttempts = 0, this.isManualDisconnect = !1, this.registerClient(), this.flushMessageQueue(), this.startHeartbeat(), this.emit("connected");
    }), this.socket.on("connect_error", (t) => {
      console.error("❌ WebSocket连接错误:", t), this.connectionState = "error", this.emit("error", t);
    }), this.socket.on("disconnect", (t) => {
      console.log(`🔌 WebSocket断开连接: ${t}`), this.connectionState = "disconnected", this.stopHeartbeat(), !this.isManualDisconnect && t !== "io client disconnect" && (console.log("🔄 尝试重新连接..."), this.connectionState = "reconnecting", this.emit("reconnecting"));
    }), this.socket.on("reconnect", (t) => {
      console.log(`✅ WebSocket重连成功 (第${t}次尝试)`), this.connectionState = "connected", this.reconnectAttempts = 0, this.emit("reconnected", t);
    }), this.socket.on("reconnect_failed", () => {
      console.error("❌ WebSocket重连失败"), this.connectionState = "error", this.emit("reconnectFailed");
    }), this.setupMessageHandlers());
  }
  /**
   * 设置消息处理器
   */
  setupMessageHandlers() {
    this.socket && (this.socket.on("task:assigned", (t) => {
      console.log("📋 收到任务分配:", t), this.emit("task:assigned", t);
    }), this.socket.on("task:start", (t) => {
      console.log("🚀 收到任务开始指令:", t), this.emit("task:start", t);
    }), this.socket.on("task:cancel", (t) => {
      console.log("🛑 收到任务取消指令:", t), this.emit("task:cancel", t);
    }), this.socket.on("step:start", (t) => {
      console.log("📝 步骤开始:", t), this.emit("step:start", t);
    }), this.socket.on("step:complete", (t) => {
      console.log("✅ 步骤完成:", t), this.emit("step:complete", t);
    }), this.socket.on("step:failed", (t) => {
      console.log("❌ 步骤失败:", t), this.emit("step:failed", t);
    }), this.socket.on("server:ping", () => {
      this.emit("server:ping");
    }));
  }
  /**
   * 注册客户端
   */
  registerClient() {
    if (!this.socket || !this.socket.connected) return;
    const t = {
      type: "desktop-client",
      version: P.getVersion(),
      platform: process.platform,
      arch: process.arch,
      hostname: require("os").hostname(),
      timestamp: Date.now()
    };
    this.send("client:register", t), console.log("📱 客户端已注册:", t);
  }
  /**
   * 开始心跳
   */
  startHeartbeat() {
    this.stopHeartbeat(), this.heartbeatInterval = setInterval(() => {
      var t;
      (t = this.socket) != null && t.connected && this.send("client:heartbeat", {
        timestamp: Date.now()
      });
    }, 3e4);
  }
  /**
   * 停止心跳
   */
  stopHeartbeat() {
    this.heartbeatInterval && (clearInterval(this.heartbeatInterval), this.heartbeatInterval = null);
  }
  /**
   * 发送消息到服务器
   */
  send(t, s) {
    var n, i;
    if (!((n = this.socket) != null && n.connected))
      return console.warn("⚠️ WebSocket未连接，消息加入队列"), this.messageQueue.push({ event: t, data: s, timestamp: Date.now() }), !1;
    try {
      return this.socket.emit(t, s), console.log(`📤 发送消息: ${t}`, ((i = s == null ? void 0 : s.toString) == null ? void 0 : i.call(s).substring(0, 100)) || ""), !0;
    } catch (o) {
      return console.error("❌ 发送消息失败:", o), !1;
    }
  }
  /**
   * 发送任务进度
   */
  sendTaskProgress(t, s) {
    return this.send("task:progress", {
      taskId: t,
      progress: s,
      timestamp: Date.now()
    });
  }
  /**
   * 发送任务完成
   */
  sendTaskCompleted(t, s) {
    return this.send("task:completed", {
      taskId: t,
      result: s,
      timestamp: Date.now()
    });
  }
  /**
   * 发送任务失败
   */
  sendTaskFailed(t, s) {
    return this.send("task:failed", {
      taskId: t,
      error: s,
      timestamp: Date.now()
    });
  }
  /**
   * 发送日志
   */
  sendLog(t, s, n) {
    return this.send("log", {
      level: t,
      message: s,
      data: n,
      timestamp: Date.now()
    });
  }
  /**
   * 发送截图
   */
  sendScreenshot(t, s, n) {
    return this.send("screenshot", {
      taskId: t,
      stepId: s,
      screenshotPath: n,
      timestamp: Date.now()
    });
  }
  /**
   * 清空消息队列
   */
  flushMessageQueue() {
    var t;
    for (console.log(`📤 发送队列中的消息: ${this.messageQueue.length}条`); this.messageQueue.length > 0 && ((t = this.socket) != null && t.connected); ) {
      const s = this.messageQueue.shift();
      s && this.socket.emit(s.event, s.data);
    }
  }
  /**
   * 断开连接
   */
  disconnect() {
    console.log("🔌 断开WebSocket连接"), this.isManualDisconnect = !0, this.stopHeartbeat(), this.socket && (this.socket.disconnect(), this.socket = null), this.connectionState = "disconnected";
  }
  /**
   * 获取连接状态
   */
  getConnectionState() {
    return this.connectionState;
  }
  /**
   * 检查是否已连接
   */
  isConnected() {
    var t;
    return this.connectionState === "connected" && ((t = this.socket) == null ? void 0 : t.connected) === !0;
  }
}
const q = new io();
let E = null, Te = null;
function rr() {
  console.log("🪟 创建主窗口...");
  const r = new dr({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: !0,
      contextIsolation: !1
    },
    icon: Wt.join(__dirname, "../../assets/icon.png"),
    title: "Auto Test Agent"
  });
  return process.env.NODE_ENV === "development" ? (r.loadURL("http://localhost:5174"), r.webContents.openDevTools()) : r.loadFile(Wt.join(__dirname, "../renderer/index.html")), r.on("closed", () => {
    console.log("🪟 主窗口已关闭"), E = null;
  }), r.webContents.on("did-finish-load", () => {
    console.log("✅ 主窗口加载完成"), Te && r.webContents.send("task:assigned", { taskId: Te });
  }), console.log("✅ 主窗口创建成功"), r;
}
async function oo(r) {
  console.log("📞 处理协议调用:", r);
  try {
    switch (r.action) {
      case ke.RUN:
        r.taskId ? await ao(r.taskId, r.server) : console.warn("⚠️ 缺少任务ID参数");
        break;
      case ke.VIEW:
        r.taskId ? await co(r.taskId, r.server) : console.warn("⚠️ 缺少任务ID参数");
        break;
      case ke.CONFIG:
        ho();
        break;
      case ke.HEALTH:
        await lo();
        break;
      default:
        console.warn("⚠️ 未知的协议操作:", r.action);
    }
  } catch (e) {
    console.error("❌ 处理协议调用失败:", e);
  }
}
async function ao(r, e) {
  console.log(`🚀 开始执行任务: ${r}`), Te = r, E ? (E.show(), E.focus(), E.webContents.send("task:start", {
    taskId: r,
    server: e || et.getHTTPURL()
  }), console.log(`📤 任务执行命令已发送到渲染进程: ${r}`)) : console.warn("⚠️ 主窗口未创建，无法执行任务");
}
async function co(r, e) {
  console.log(`👀 查看任务: ${r}`), E && (E.show(), E.focus(), E.webContents.send("task:view", {
    taskId: r,
    server: e || et.getHTTPURL()
  }));
}
function ho() {
  console.log("⚙️ 打开配置页面"), E && (E.show(), E.focus(), E.webContents.send("config:open", {}));
}
async function lo() {
  console.log("🏥 执行健康检查");
  try {
    const r = {
      status: "ok",
      version: P.getVersion(),
      platform: process.platform,
      arch: process.arch,
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node
    };
    console.log("✅ 健康检查通过:", r), E && E.webContents.send("health:check", r);
  } catch (r) {
    console.error("❌ 健康检查失败:", r);
  }
}
function fo() {
  Z.handle("app:getInfo", async () => ({
    name: P.getName(),
    version: P.getVersion(),
    platform: process.platform,
    arch: process.arch,
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node
  })), Z.handle("config:get", async () => et.getConfig()), Z.on("task:status", (r, e) => {
    console.log("📊 任务状态更新:", e), q.sendTaskProgress(e.taskId, e), E && E.webContents.send("task:status:update", e);
  }), Z.on("task:completed", (r, e) => {
    console.log("✅ 任务完成:", e), Te = null, q.sendTaskCompleted(e.taskId, e), E && E.webContents.send("task:completed:update", e);
  }), Z.on("task:failed", (r, e) => {
    console.error("❌ 任务失败:", e), Te = null, q.sendTaskFailed(e.taskId, e), E && E.webContents.send("task:failed:update", e);
  }), Z.handle("ws:getState", async () => q.getConnectionState()), Z.on("ws:connect", () => {
    q.connect();
  }), Z.on("ws:disconnect", () => {
    q.disconnect();
  }), console.log("📡 IPC通信处理器已设置");
}
function uo() {
  q.on("task:assigned", (r) => {
    console.log("📋 收到任务分配:", r), E && E.webContents.send("task:assigned", r);
  }), q.on("task:start", (r) => {
    console.log("🚀 收到任务开始指令:", r), E && E.webContents.send("task:start", r);
  }), q.on("step:complete", (r) => {
    console.log("✅ 步骤完成:", r), E && E.webContents.send("step:complete", r);
  }), q.on("step:failed", (r) => {
    console.log("❌ 步骤失败:", r), E && E.webContents.send("step:failed", r);
  }), console.log("📡 WebSocket事件处理器已设置");
}
P.whenReady().then(() => {
  console.log("🚀 应用已就绪"), E = rr(), fo(), q.connect(), uo(), Or(oo), console.log("✅ 应用初始化完成");
});
P.on("activate", () => {
  E === null && (console.log("🔄 重新创建主窗口（macOS）"), E = rr());
});
P.on("window-all-closed", () => {
  console.log("🪟 所有窗口已关闭"), process.platform !== "darwin" && (console.log("👋 退出应用"), P.quit());
});
P.on("before-quit", () => {
  console.log("👋 应用即将退出");
});
const po = P.requestSingleInstanceLock();
po ? P.on("second-instance", (r, e, t) => {
  console.log("🔄 收到第二个实例启动请求"), E && (E.isMinimized() && E.restore(), E.focus(), console.log("🪟 主窗口已聚焦"));
  const s = e.find((n) => n.startsWith("midscene://"));
  s && console.log("📞 检测到协议参数:", s);
}) : (console.log("🔒 已有实例运行，退出当前实例"), P.quit());
kr();
process.on("uncaughtException", (r) => {
  console.error("❌ 未捕获的异常:", r);
});
process.on("unhandledRejection", (r, e) => {
  console.error("❌ 未处理的Promise拒绝:", r);
});
console.log(`
╔════════════════════════════════════════════════════════════╗
║              Auto Test Agent - Desktop Client              ║
║                                                              ║
║  Version: ${P.getVersion().padEnd(46)}║
║  Platform: ${process.platform.padEnd(45)}║
║  Arch: ${process.arch.padEnd(52)}║
╚════════════════════════════════════════════════════════════╝
`);
