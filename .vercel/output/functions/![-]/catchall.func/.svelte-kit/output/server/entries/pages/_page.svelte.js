import { w as attributes, x as attr, y as ensure_array_like, z as attr_class, F as attr_style, G as bind_props, J as head } from "../../chunks/index.js";
import { l as ssr_context, m as fallback, k as escape_html } from "../../chunks/context.js";
import "clsx";
function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
const matchIconName = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const stringToIcon = (value, validate, allowSimpleName, provider = "") => {
  const colonSeparated = value.split(":");
  if (value.slice(0, 1) === "@") {
    if (colonSeparated.length < 2 || colonSeparated.length > 3) return null;
    provider = colonSeparated.shift().slice(1);
  }
  if (colonSeparated.length > 3 || !colonSeparated.length) return null;
  if (colonSeparated.length > 1) {
    const name$1 = colonSeparated.pop();
    const prefix = colonSeparated.pop();
    const result = {
      provider: colonSeparated.length > 0 ? colonSeparated[0] : provider,
      prefix,
      name: name$1
    };
    return validate && !validateIconName(result) ? null : result;
  }
  const name = colonSeparated[0];
  const dashSeparated = name.split("-");
  if (dashSeparated.length > 1) {
    const result = {
      provider,
      prefix: dashSeparated.shift(),
      name: dashSeparated.join("-")
    };
    return validate && !validateIconName(result) ? null : result;
  }
  if (allowSimpleName && provider === "") {
    const result = {
      provider,
      prefix: "",
      name
    };
    return validate && !validateIconName(result, allowSimpleName) ? null : result;
  }
  return null;
};
const validateIconName = (icon, allowSimpleName) => {
  if (!icon) return false;
  return !!((allowSimpleName && icon.prefix === "" || !!icon.prefix) && !!icon.name);
};
function getIconsTree(data, names) {
  const icons = data.icons;
  const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
  const resolved = /* @__PURE__ */ Object.create(null);
  function resolve(name) {
    if (icons[name]) return resolved[name] = [];
    if (!(name in resolved)) {
      resolved[name] = null;
      const parent = aliases[name] && aliases[name].parent;
      const value = parent && resolve(parent);
      if (value) resolved[name] = [parent].concat(value);
    }
    return resolved[name];
  }
  Object.keys(icons).concat(Object.keys(aliases)).forEach(resolve);
  return resolved;
}
const defaultIconDimensions = Object.freeze({
  left: 0,
  top: 0,
  width: 16,
  height: 16
});
const defaultIconTransformations = Object.freeze({
  rotate: 0,
  vFlip: false,
  hFlip: false
});
const defaultIconProps = Object.freeze({
  ...defaultIconDimensions,
  ...defaultIconTransformations
});
const defaultExtendedIconProps = Object.freeze({
  ...defaultIconProps,
  body: "",
  hidden: false
});
function mergeIconTransformations(obj1, obj2) {
  const result = {};
  if (!obj1.hFlip !== !obj2.hFlip) result.hFlip = true;
  if (!obj1.vFlip !== !obj2.vFlip) result.vFlip = true;
  const rotate = ((obj1.rotate || 0) + (obj2.rotate || 0)) % 4;
  if (rotate) result.rotate = rotate;
  return result;
}
function mergeIconData(parent, child) {
  const result = mergeIconTransformations(parent, child);
  for (const key in defaultExtendedIconProps) if (key in defaultIconTransformations) {
    if (key in parent && !(key in result)) result[key] = defaultIconTransformations[key];
  } else if (key in child) result[key] = child[key];
  else if (key in parent) result[key] = parent[key];
  return result;
}
function internalGetIconData(data, name, tree) {
  const icons = data.icons;
  const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
  let currentProps = {};
  function parse(name$1) {
    currentProps = mergeIconData(icons[name$1] || aliases[name$1], currentProps);
  }
  parse(name);
  tree.forEach(parse);
  return mergeIconData(data, currentProps);
}
function parseIconSet(data, callback) {
  const names = [];
  if (typeof data !== "object" || typeof data.icons !== "object") return names;
  if (data.not_found instanceof Array) data.not_found.forEach((name) => {
    callback(name, null);
    names.push(name);
  });
  const tree = getIconsTree(data);
  for (const name in tree) {
    const item = tree[name];
    if (item) {
      callback(name, internalGetIconData(data, name, item));
      names.push(name);
    }
  }
  return names;
}
const optionalPropertyDefaults = {
  provider: "",
  aliases: {},
  not_found: {},
  ...defaultIconDimensions
};
function checkOptionalProps(item, defaults) {
  for (const prop in defaults) if (prop in item && typeof item[prop] !== typeof defaults[prop]) return false;
  return true;
}
function quicklyValidateIconSet(obj) {
  if (typeof obj !== "object" || obj === null) return null;
  const data = obj;
  if (typeof data.prefix !== "string" || !obj.icons || typeof obj.icons !== "object") return null;
  if (!checkOptionalProps(obj, optionalPropertyDefaults)) return null;
  const icons = data.icons;
  for (const name in icons) {
    const icon = icons[name];
    if (!name || typeof icon.body !== "string" || !checkOptionalProps(icon, defaultExtendedIconProps)) return null;
  }
  const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
  for (const name in aliases) {
    const icon = aliases[name];
    const parent = icon.parent;
    if (!name || typeof parent !== "string" || !icons[parent] && !aliases[parent] || !checkOptionalProps(icon, defaultExtendedIconProps)) return null;
  }
  return data;
}
const dataStorage = /* @__PURE__ */ Object.create(null);
function newStorage(provider, prefix) {
  return {
    provider,
    prefix,
    icons: /* @__PURE__ */ Object.create(null),
    missing: /* @__PURE__ */ new Set()
  };
}
function getStorage(provider, prefix) {
  const providerStorage = dataStorage[provider] || (dataStorage[provider] = /* @__PURE__ */ Object.create(null));
  return providerStorage[prefix] || (providerStorage[prefix] = newStorage(provider, prefix));
}
function addIconSet(storage2, data) {
  if (!quicklyValidateIconSet(data)) return [];
  return parseIconSet(data, (name, icon) => {
    if (icon) storage2.icons[name] = icon;
    else storage2.missing.add(name);
  });
}
function addIconToStorage(storage2, name, icon) {
  try {
    if (typeof icon.body === "string") {
      storage2.icons[name] = { ...icon };
      return true;
    }
  } catch (err) {
  }
  return false;
}
let simpleNames = false;
function allowSimpleNames(allow) {
  if (typeof allow === "boolean") simpleNames = allow;
  return simpleNames;
}
function getIconData(name) {
  const icon = typeof name === "string" ? stringToIcon(name, true, simpleNames) : name;
  if (icon) {
    const storage2 = getStorage(icon.provider, icon.prefix);
    const iconName = icon.name;
    return storage2.icons[iconName] || (storage2.missing.has(iconName) ? null : void 0);
  }
}
function addIcon(name, data) {
  const icon = stringToIcon(name, true, simpleNames);
  if (!icon) return false;
  const storage2 = getStorage(icon.provider, icon.prefix);
  if (data) return addIconToStorage(storage2, icon.name, data);
  else {
    storage2.missing.add(icon.name);
    return true;
  }
}
function addCollection(data, provider) {
  if (typeof data !== "object") return false;
  if (typeof provider !== "string") provider = data.provider || "";
  if (simpleNames && !provider && !data.prefix) {
    let added = false;
    if (quicklyValidateIconSet(data)) {
      data.prefix = "";
      parseIconSet(data, (name, icon) => {
        if (addIcon(name, icon)) added = true;
      });
    }
    return added;
  }
  const prefix = data.prefix;
  if (!validateIconName({
    prefix,
    name: "a"
  })) return false;
  return !!addIconSet(getStorage(provider, prefix), data);
}
const defaultIconSizeCustomisations = Object.freeze({
  width: null,
  height: null
});
const defaultIconCustomisations = Object.freeze({
  ...defaultIconSizeCustomisations,
  ...defaultIconTransformations
});
const unitsSplit = /(-?[0-9.]*[0-9]+[0-9.]*)/g;
const unitsTest = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
function calculateSize(size, ratio, precision) {
  if (ratio === 1) return size;
  precision = precision || 100;
  if (typeof size === "number") return Math.ceil(size * ratio * precision) / precision;
  if (typeof size !== "string") return size;
  const oldParts = size.split(unitsSplit);
  if (oldParts === null || !oldParts.length) return size;
  const newParts = [];
  let code = oldParts.shift();
  let isNumber = unitsTest.test(code);
  while (true) {
    if (isNumber) {
      const num = parseFloat(code);
      if (isNaN(num)) newParts.push(code);
      else newParts.push(Math.ceil(num * ratio * precision) / precision);
    } else newParts.push(code);
    code = oldParts.shift();
    if (code === void 0) return newParts.join("");
    isNumber = !isNumber;
  }
}
function splitSVGDefs(content, tag = "defs") {
  let defs = "";
  const index = content.indexOf("<" + tag);
  while (index >= 0) {
    const start = content.indexOf(">", index);
    const end = content.indexOf("</" + tag);
    if (start === -1 || end === -1) break;
    const endEnd = content.indexOf(">", end);
    if (endEnd === -1) break;
    defs += content.slice(start + 1, end).trim();
    content = content.slice(0, index).trim() + content.slice(endEnd + 1);
  }
  return {
    defs,
    content
  };
}
function mergeDefsAndContent(defs, content) {
  return defs ? "<defs>" + defs + "</defs>" + content : content;
}
function wrapSVGContent(body, start, end) {
  const split = splitSVGDefs(body);
  return mergeDefsAndContent(split.defs, start + split.content + end);
}
const isUnsetKeyword = (value) => value === "unset" || value === "undefined" || value === "none";
function iconToSVG(icon, customisations) {
  const fullIcon = {
    ...defaultIconProps,
    ...icon
  };
  const fullCustomisations = {
    ...defaultIconCustomisations,
    ...customisations
  };
  const box = {
    left: fullIcon.left,
    top: fullIcon.top,
    width: fullIcon.width,
    height: fullIcon.height
  };
  let body = fullIcon.body;
  [fullIcon, fullCustomisations].forEach((props) => {
    const transformations = [];
    const hFlip = props.hFlip;
    const vFlip = props.vFlip;
    let rotation = props.rotate;
    if (hFlip) if (vFlip) rotation += 2;
    else {
      transformations.push("translate(" + (box.width + box.left).toString() + " " + (0 - box.top).toString() + ")");
      transformations.push("scale(-1 1)");
      box.top = box.left = 0;
    }
    else if (vFlip) {
      transformations.push("translate(" + (0 - box.left).toString() + " " + (box.height + box.top).toString() + ")");
      transformations.push("scale(1 -1)");
      box.top = box.left = 0;
    }
    let tempValue;
    if (rotation < 0) rotation -= Math.floor(rotation / 4) * 4;
    rotation = rotation % 4;
    switch (rotation) {
      case 1:
        tempValue = box.height / 2 + box.top;
        transformations.unshift("rotate(90 " + tempValue.toString() + " " + tempValue.toString() + ")");
        break;
      case 2:
        transformations.unshift("rotate(180 " + (box.width / 2 + box.left).toString() + " " + (box.height / 2 + box.top).toString() + ")");
        break;
      case 3:
        tempValue = box.width / 2 + box.left;
        transformations.unshift("rotate(-90 " + tempValue.toString() + " " + tempValue.toString() + ")");
        break;
    }
    if (rotation % 2 === 1) {
      if (box.left !== box.top) {
        tempValue = box.left;
        box.left = box.top;
        box.top = tempValue;
      }
      if (box.width !== box.height) {
        tempValue = box.width;
        box.width = box.height;
        box.height = tempValue;
      }
    }
    if (transformations.length) body = wrapSVGContent(body, '<g transform="' + transformations.join(" ") + '">', "</g>");
  });
  const customisationsWidth = fullCustomisations.width;
  const customisationsHeight = fullCustomisations.height;
  const boxWidth = box.width;
  const boxHeight = box.height;
  let width;
  let height;
  if (customisationsWidth === null) {
    height = customisationsHeight === null ? "1em" : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
    width = calculateSize(height, boxWidth / boxHeight);
  } else {
    width = customisationsWidth === "auto" ? boxWidth : customisationsWidth;
    height = customisationsHeight === null ? calculateSize(width, boxHeight / boxWidth) : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
  }
  const attributes2 = {};
  const setAttr = (prop, value) => {
    if (!isUnsetKeyword(value)) attributes2[prop] = value.toString();
  };
  setAttr("width", width);
  setAttr("height", height);
  const viewBox = [
    box.left,
    box.top,
    boxWidth,
    boxHeight
  ];
  attributes2.viewBox = viewBox.join(" ");
  return {
    attributes: attributes2,
    viewBox,
    body
  };
}
const regex = /\sid="(\S+)"/g;
const counters = /* @__PURE__ */ new Map();
function nextID(id) {
  id = id.replace(/[0-9]+$/, "") || "a";
  const count = counters.get(id) || 0;
  counters.set(id, count + 1);
  return count ? `${id}${count}` : id;
}
function replaceIDs(body) {
  const ids = [];
  let match;
  while (match = regex.exec(body)) ids.push(match[1]);
  if (!ids.length) return body;
  const suffix = "suffix" + (Math.random() * 16777216 | Date.now()).toString(16);
  ids.forEach((id) => {
    const newID = nextID(id);
    const escapedID = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    body = body.replace(new RegExp('([#;"])(' + escapedID + ')([")]|\\.[a-z])', "g"), "$1" + newID + suffix + "$3");
  });
  body = body.replace(new RegExp(suffix, "g"), "");
  return body;
}
const storage = /* @__PURE__ */ Object.create(null);
function setAPIModule(provider, item) {
  storage[provider] = item;
}
function getAPIModule(provider) {
  return storage[provider] || storage[""];
}
function createAPIConfig(source) {
  let resources;
  if (typeof source.resources === "string") resources = [source.resources];
  else {
    resources = source.resources;
    if (!(resources instanceof Array) || !resources.length) return null;
  }
  return {
    resources,
    path: source.path || "/",
    maxURL: source.maxURL || 500,
    rotate: source.rotate || 750,
    timeout: source.timeout || 5e3,
    random: source.random === true,
    index: source.index || 0,
    dataAfterTimeout: source.dataAfterTimeout !== false
  };
}
const configStorage = /* @__PURE__ */ Object.create(null);
const fallBackAPISources = ["https://api.simplesvg.com", "https://api.unisvg.com"];
const fallBackAPI = [];
while (fallBackAPISources.length > 0) if (fallBackAPISources.length === 1) fallBackAPI.push(fallBackAPISources.shift());
else if (Math.random() > 0.5) fallBackAPI.push(fallBackAPISources.shift());
else fallBackAPI.push(fallBackAPISources.pop());
configStorage[""] = createAPIConfig({ resources: ["https://api.iconify.design"].concat(fallBackAPI) });
function addAPIProvider(provider, customConfig) {
  const config = createAPIConfig(customConfig);
  if (config === null) return false;
  configStorage[provider] = config;
  return true;
}
function getAPIConfig(provider) {
  return configStorage[provider];
}
const detectFetch = () => {
  let callback;
  try {
    callback = fetch;
    if (typeof callback === "function") return callback;
  } catch (err) {
  }
};
let fetchModule = detectFetch();
function calculateMaxLength(provider, prefix) {
  const config = getAPIConfig(provider);
  if (!config) return 0;
  let result;
  if (!config.maxURL) result = 0;
  else {
    let maxHostLength = 0;
    config.resources.forEach((item) => {
      const host = item;
      maxHostLength = Math.max(maxHostLength, host.length);
    });
    const url = prefix + ".json?icons=";
    result = config.maxURL - maxHostLength - config.path.length - url.length;
  }
  return result;
}
function shouldAbort(status) {
  return status === 404;
}
const prepare = (provider, prefix, icons) => {
  const results = [];
  const maxLength = calculateMaxLength(provider, prefix);
  const type = "icons";
  let item = {
    type,
    provider,
    prefix,
    icons: []
  };
  let length = 0;
  icons.forEach((name, index) => {
    length += name.length + 1;
    if (length >= maxLength && index > 0) {
      results.push(item);
      item = {
        type,
        provider,
        prefix,
        icons: []
      };
      length = name.length;
    }
    item.icons.push(name);
  });
  results.push(item);
  return results;
};
function getPath(provider) {
  if (typeof provider === "string") {
    const config = getAPIConfig(provider);
    if (config) return config.path;
  }
  return "/";
}
const send = (host, params, callback) => {
  if (!fetchModule) {
    callback("abort", 424);
    return;
  }
  let path = getPath(params.provider);
  switch (params.type) {
    case "icons": {
      const prefix = params.prefix;
      const iconsList = params.icons.join(",");
      const urlParams = new URLSearchParams({ icons: iconsList });
      path += prefix + ".json?" + urlParams.toString();
      break;
    }
    case "custom": {
      const uri = params.uri;
      path += uri.slice(0, 1) === "/" ? uri.slice(1) : uri;
      break;
    }
    default:
      callback("abort", 400);
      return;
  }
  let defaultError = 503;
  fetchModule(host + path).then((response) => {
    const status = response.status;
    if (status !== 200) {
      setTimeout(() => {
        callback(shouldAbort(status) ? "abort" : "next", status);
      });
      return;
    }
    defaultError = 501;
    return response.json();
  }).then((data) => {
    if (typeof data !== "object" || data === null) {
      setTimeout(() => {
        if (data === 404) callback("abort", data);
        else callback("next", defaultError);
      });
      return;
    }
    setTimeout(() => {
      callback("success", data);
    });
  }).catch(() => {
    callback("next", defaultError);
  });
};
const fetchAPIModule = {
  prepare,
  send
};
function removeCallback(storages, id) {
  storages.forEach((storage2) => {
    const items = storage2.loaderCallbacks;
    if (items) storage2.loaderCallbacks = items.filter((row) => row.id !== id);
  });
}
function updateCallbacks(storage2) {
  if (!storage2.pendingCallbacksFlag) {
    storage2.pendingCallbacksFlag = true;
    setTimeout(() => {
      storage2.pendingCallbacksFlag = false;
      const items = storage2.loaderCallbacks ? storage2.loaderCallbacks.slice(0) : [];
      if (!items.length) return;
      let hasPending = false;
      const provider = storage2.provider;
      const prefix = storage2.prefix;
      items.forEach((item) => {
        const icons = item.icons;
        const oldLength = icons.pending.length;
        icons.pending = icons.pending.filter((icon) => {
          if (icon.prefix !== prefix) return true;
          const name = icon.name;
          if (storage2.icons[name]) icons.loaded.push({
            provider,
            prefix,
            name
          });
          else if (storage2.missing.has(name)) icons.missing.push({
            provider,
            prefix,
            name
          });
          else {
            hasPending = true;
            return true;
          }
          return false;
        });
        if (icons.pending.length !== oldLength) {
          if (!hasPending) removeCallback([storage2], item.id);
          item.callback(icons.loaded.slice(0), icons.missing.slice(0), icons.pending.slice(0), item.abort);
        }
      });
    });
  }
}
let idCounter = 0;
function storeCallback(callback, icons, pendingSources) {
  const id = idCounter++;
  const abort = removeCallback.bind(null, pendingSources, id);
  if (!icons.pending.length) return abort;
  const item = {
    id,
    icons,
    callback,
    abort
  };
  pendingSources.forEach((storage2) => {
    (storage2.loaderCallbacks || (storage2.loaderCallbacks = [])).push(item);
  });
  return abort;
}
function sortIcons(icons) {
  const result = {
    loaded: [],
    missing: [],
    pending: []
  };
  const storage2 = /* @__PURE__ */ Object.create(null);
  icons.sort((a, b) => {
    if (a.provider !== b.provider) return a.provider.localeCompare(b.provider);
    if (a.prefix !== b.prefix) return a.prefix.localeCompare(b.prefix);
    return a.name.localeCompare(b.name);
  });
  let lastIcon = {
    provider: "",
    prefix: "",
    name: ""
  };
  icons.forEach((icon) => {
    if (lastIcon.name === icon.name && lastIcon.prefix === icon.prefix && lastIcon.provider === icon.provider) return;
    lastIcon = icon;
    const provider = icon.provider;
    const prefix = icon.prefix;
    const name = icon.name;
    const providerStorage = storage2[provider] || (storage2[provider] = /* @__PURE__ */ Object.create(null));
    const localStorage2 = providerStorage[prefix] || (providerStorage[prefix] = getStorage(provider, prefix));
    let list;
    if (name in localStorage2.icons) list = result.loaded;
    else if (prefix === "" || localStorage2.missing.has(name)) list = result.missing;
    else list = result.pending;
    const item = {
      provider,
      prefix,
      name
    };
    list.push(item);
  });
  return result;
}
function listToIcons(list, validate = true, simpleNames2 = false) {
  const result = [];
  list.forEach((item) => {
    const icon = typeof item === "string" ? stringToIcon(item, validate, simpleNames2) : item;
    if (icon) result.push(icon);
  });
  return result;
}
const defaultConfig = {
  resources: [],
  index: 0,
  timeout: 2e3,
  rotate: 750,
  random: false,
  dataAfterTimeout: false
};
function sendQuery(config, payload, query, done) {
  const resourcesCount = config.resources.length;
  const startIndex = config.random ? Math.floor(Math.random() * resourcesCount) : config.index;
  let resources;
  if (config.random) {
    let list = config.resources.slice(0);
    resources = [];
    while (list.length > 1) {
      const nextIndex = Math.floor(Math.random() * list.length);
      resources.push(list[nextIndex]);
      list = list.slice(0, nextIndex).concat(list.slice(nextIndex + 1));
    }
    resources = resources.concat(list);
  } else resources = config.resources.slice(startIndex).concat(config.resources.slice(0, startIndex));
  const startTime = Date.now();
  let status = "pending";
  let queriesSent = 0;
  let lastError;
  let timer = null;
  let queue = [];
  let doneCallbacks = [];
  if (typeof done === "function") doneCallbacks.push(done);
  function resetTimer() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }
  function abort() {
    if (status === "pending") status = "aborted";
    resetTimer();
    queue.forEach((item) => {
      if (item.status === "pending") item.status = "aborted";
    });
    queue = [];
  }
  function subscribe(callback, overwrite) {
    if (overwrite) doneCallbacks = [];
    if (typeof callback === "function") doneCallbacks.push(callback);
  }
  function getQueryStatus() {
    return {
      startTime,
      payload,
      status,
      queriesSent,
      queriesPending: queue.length,
      subscribe,
      abort
    };
  }
  function failQuery() {
    status = "failed";
    doneCallbacks.forEach((callback) => {
      callback(void 0, lastError);
    });
  }
  function clearQueue() {
    queue.forEach((item) => {
      if (item.status === "pending") item.status = "aborted";
    });
    queue = [];
  }
  function moduleResponse(item, response, data) {
    const isError = response !== "success";
    queue = queue.filter((queued) => queued !== item);
    switch (status) {
      case "pending":
        break;
      case "failed":
        if (isError || !config.dataAfterTimeout) return;
        break;
      default:
        return;
    }
    if (response === "abort") {
      lastError = data;
      failQuery();
      return;
    }
    if (isError) {
      lastError = data;
      if (!queue.length) if (!resources.length) failQuery();
      else execNext();
      return;
    }
    resetTimer();
    clearQueue();
    if (!config.random) {
      const index = config.resources.indexOf(item.resource);
      if (index !== -1 && index !== config.index) config.index = index;
    }
    status = "completed";
    doneCallbacks.forEach((callback) => {
      callback(data);
    });
  }
  function execNext() {
    if (status !== "pending") return;
    resetTimer();
    const resource = resources.shift();
    if (resource === void 0) {
      if (queue.length) {
        timer = setTimeout(() => {
          resetTimer();
          if (status === "pending") {
            clearQueue();
            failQuery();
          }
        }, config.timeout);
        return;
      }
      failQuery();
      return;
    }
    const item = {
      status: "pending",
      resource,
      callback: (status$1, data) => {
        moduleResponse(item, status$1, data);
      }
    };
    queue.push(item);
    queriesSent++;
    timer = setTimeout(execNext, config.rotate);
    query(resource, payload, item.callback);
  }
  setTimeout(execNext);
  return getQueryStatus;
}
function initRedundancy(cfg) {
  const config = {
    ...defaultConfig,
    ...cfg
  };
  let queries = [];
  function cleanup() {
    queries = queries.filter((item) => item().status === "pending");
  }
  function query(payload, queryCallback, doneCallback) {
    const query$1 = sendQuery(config, payload, queryCallback, (data, error) => {
      cleanup();
      if (doneCallback) doneCallback(data, error);
    });
    queries.push(query$1);
    return query$1;
  }
  function find(callback) {
    return queries.find((value) => {
      return callback(value);
    }) || null;
  }
  return {
    query,
    find,
    setIndex: (index) => {
      config.index = index;
    },
    getIndex: () => config.index,
    cleanup
  };
}
function emptyCallback$1() {
}
const redundancyCache = /* @__PURE__ */ Object.create(null);
function getRedundancyCache(provider) {
  if (!redundancyCache[provider]) {
    const config = getAPIConfig(provider);
    if (!config) return;
    redundancyCache[provider] = {
      config,
      redundancy: initRedundancy(config)
    };
  }
  return redundancyCache[provider];
}
function sendAPIQuery(target, query, callback) {
  let redundancy;
  let send2;
  if (typeof target === "string") {
    const api = getAPIModule(target);
    if (!api) {
      callback(void 0, 424);
      return emptyCallback$1;
    }
    send2 = api.send;
    const cached = getRedundancyCache(target);
    if (cached) redundancy = cached.redundancy;
  } else {
    const config = createAPIConfig(target);
    if (config) {
      redundancy = initRedundancy(config);
      const api = getAPIModule(target.resources ? target.resources[0] : "");
      if (api) send2 = api.send;
    }
  }
  if (!redundancy || !send2) {
    callback(void 0, 424);
    return emptyCallback$1;
  }
  return redundancy.query(query, send2, callback)().abort;
}
function emptyCallback() {
}
function loadedNewIcons(storage2) {
  if (!storage2.iconsLoaderFlag) {
    storage2.iconsLoaderFlag = true;
    setTimeout(() => {
      storage2.iconsLoaderFlag = false;
      updateCallbacks(storage2);
    });
  }
}
function checkIconNamesForAPI(icons) {
  const valid = [];
  const invalid = [];
  icons.forEach((name) => {
    (name.match(matchIconName) ? valid : invalid).push(name);
  });
  return {
    valid,
    invalid
  };
}
function parseLoaderResponse(storage2, icons, data) {
  function checkMissing() {
    const pending = storage2.pendingIcons;
    icons.forEach((name) => {
      if (pending) pending.delete(name);
      if (!storage2.icons[name]) storage2.missing.add(name);
    });
  }
  if (data && typeof data === "object") try {
    if (!addIconSet(storage2, data).length) {
      checkMissing();
      return;
    }
  } catch (err) {
    console.error(err);
  }
  checkMissing();
  loadedNewIcons(storage2);
}
function parsePossiblyAsyncResponse(response, callback) {
  if (response instanceof Promise) response.then((data) => {
    callback(data);
  }).catch(() => {
    callback(null);
  });
  else callback(response);
}
function loadNewIcons(storage2, icons) {
  if (!storage2.iconsToLoad) storage2.iconsToLoad = icons;
  else storage2.iconsToLoad = storage2.iconsToLoad.concat(icons).sort();
  if (!storage2.iconsQueueFlag) {
    storage2.iconsQueueFlag = true;
    setTimeout(() => {
      storage2.iconsQueueFlag = false;
      const { provider, prefix } = storage2;
      const icons$1 = storage2.iconsToLoad;
      delete storage2.iconsToLoad;
      if (!icons$1 || !icons$1.length) return;
      const customIconLoader = storage2.loadIcon;
      if (storage2.loadIcons && (icons$1.length > 1 || !customIconLoader)) {
        parsePossiblyAsyncResponse(storage2.loadIcons(icons$1, prefix, provider), (data) => {
          parseLoaderResponse(storage2, icons$1, data);
        });
        return;
      }
      if (customIconLoader) {
        icons$1.forEach((name) => {
          parsePossiblyAsyncResponse(customIconLoader(name, prefix, provider), (data) => {
            parseLoaderResponse(storage2, [name], data ? {
              prefix,
              icons: { [name]: data }
            } : null);
          });
        });
        return;
      }
      const { valid, invalid } = checkIconNamesForAPI(icons$1);
      if (invalid.length) parseLoaderResponse(storage2, invalid, null);
      if (!valid.length) return;
      const api = prefix.match(matchIconName) ? getAPIModule(provider) : null;
      if (!api) {
        parseLoaderResponse(storage2, valid, null);
        return;
      }
      api.prepare(provider, prefix, valid).forEach((item) => {
        sendAPIQuery(provider, item, (data) => {
          parseLoaderResponse(storage2, item.icons, data);
        });
      });
    });
  }
}
const loadIcons = (icons, callback) => {
  const sortedIcons = sortIcons(listToIcons(icons, true, allowSimpleNames()));
  if (!sortedIcons.pending.length) {
    let callCallback = true;
    if (callback) setTimeout(() => {
      if (callCallback) callback(sortedIcons.loaded, sortedIcons.missing, sortedIcons.pending, emptyCallback);
    });
    return () => {
      callCallback = false;
    };
  }
  const newIcons = /* @__PURE__ */ Object.create(null);
  const sources = [];
  let lastProvider, lastPrefix;
  sortedIcons.pending.forEach((icon) => {
    const { provider, prefix } = icon;
    if (prefix === lastPrefix && provider === lastProvider) return;
    lastProvider = provider;
    lastPrefix = prefix;
    sources.push(getStorage(provider, prefix));
    const providerNewIcons = newIcons[provider] || (newIcons[provider] = /* @__PURE__ */ Object.create(null));
    if (!providerNewIcons[prefix]) providerNewIcons[prefix] = [];
  });
  sortedIcons.pending.forEach((icon) => {
    const { provider, prefix, name } = icon;
    const storage2 = getStorage(provider, prefix);
    const pendingQueue = storage2.pendingIcons || (storage2.pendingIcons = /* @__PURE__ */ new Set());
    if (!pendingQueue.has(name)) {
      pendingQueue.add(name);
      newIcons[provider][prefix].push(name);
    }
  });
  sources.forEach((storage2) => {
    const list = newIcons[storage2.provider][storage2.prefix];
    if (list.length) loadNewIcons(storage2, list);
  });
  return callback ? storeCallback(callback, sortedIcons, sources) : emptyCallback;
};
function mergeCustomisations(defaults, item) {
  const result = { ...defaults };
  for (const key in item) {
    const value = item[key];
    const valueType = typeof value;
    if (key in defaultIconSizeCustomisations) {
      if (value === null || value && (valueType === "string" || valueType === "number")) result[key] = value;
    } else if (valueType === typeof result[key]) result[key] = key === "rotate" ? value % 4 : value;
  }
  return result;
}
const separator = /[\s,]+/;
function flipFromString(custom, flip) {
  flip.split(separator).forEach((str) => {
    switch (str.trim()) {
      case "horizontal":
        custom.hFlip = true;
        break;
      case "vertical":
        custom.vFlip = true;
        break;
    }
  });
}
function rotateFromString(value, defaultValue = 0) {
  const units = value.replace(/^-?[0-9.]*/, "");
  function cleanup(value$1) {
    while (value$1 < 0) value$1 += 4;
    return value$1 % 4;
  }
  if (units === "") {
    const num = parseInt(value);
    return isNaN(num) ? 0 : cleanup(num);
  } else if (units !== value) {
    let split = 0;
    switch (units) {
      case "%":
        split = 25;
        break;
      case "deg":
        split = 90;
    }
    if (split) {
      let num = parseFloat(value.slice(0, value.length - units.length));
      if (isNaN(num)) return 0;
      num = num / split;
      return num % 1 === 0 ? cleanup(num) : 0;
    }
  }
  return defaultValue;
}
function iconToHTML(body, attributes2) {
  let renderAttribsHTML = body.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
  for (const attr2 in attributes2) renderAttribsHTML += " " + attr2 + '="' + attributes2[attr2] + '"';
  return '<svg xmlns="http://www.w3.org/2000/svg"' + renderAttribsHTML + ">" + body + "</svg>";
}
function encodeSVGforURL(svg) {
  return svg.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ");
}
function svgToData(svg) {
  return "data:image/svg+xml," + encodeSVGforURL(svg);
}
function svgToURL(svg) {
  return 'url("' + svgToData(svg) + '")';
}
const defaultExtendedIconCustomisations = {
  ...defaultIconCustomisations,
  inline: false
};
const svgDefaults = {
  "xmlns": "http://www.w3.org/2000/svg",
  "xmlns:xlink": "http://www.w3.org/1999/xlink",
  "aria-hidden": true,
  "role": "img"
};
const commonProps = {
  display: "inline-block"
};
const monotoneProps = {
  "background-color": "currentColor"
};
const coloredProps = {
  "background-color": "transparent"
};
const propsToAdd = {
  image: "var(--svg)",
  repeat: "no-repeat",
  size: "100% 100%"
};
const propsToAddTo = {
  "-webkit-mask": monotoneProps,
  "mask": monotoneProps,
  "background": coloredProps
};
for (const prefix in propsToAddTo) {
  const list = propsToAddTo[prefix];
  for (const prop in propsToAdd) {
    list[prefix + "-" + prop] = propsToAdd[prop];
  }
}
function fixSize(value) {
  return value + (value.match(/^[-0-9.]+$/) ? "px" : "");
}
function render(icon, props) {
  const customisations = mergeCustomisations(defaultExtendedIconCustomisations, props);
  const mode = props.mode || "svg";
  const componentProps = mode === "svg" ? { ...svgDefaults } : {};
  if (icon.body.indexOf("xlink:") === -1) {
    delete componentProps["xmlns:xlink"];
  }
  let style = typeof props.style === "string" ? props.style : "";
  for (let key in props) {
    const value = props[key];
    if (value === void 0) {
      continue;
    }
    switch (key) {
      // Properties to ignore
      case "icon":
      case "style":
      case "onLoad":
      case "mode":
      case "ssr":
        break;
      // Boolean attributes
      case "inline":
      case "hFlip":
      case "vFlip":
        customisations[key] = value === true || value === "true" || value === 1;
        break;
      // Flip as string: 'horizontal,vertical'
      case "flip":
        if (typeof value === "string") {
          flipFromString(customisations, value);
        }
        break;
      // Color: copy to style, add extra ';' in case style is missing it
      case "color":
        style = style + (style.length > 0 && style.trim().slice(-1) !== ";" ? ";" : "") + "color: " + value + "; ";
        break;
      // Rotation as string
      case "rotate":
        if (typeof value === "string") {
          customisations[key] = rotateFromString(value);
        } else if (typeof value === "number") {
          customisations[key] = value;
        }
        break;
      // Remove aria-hidden
      case "ariaHidden":
      case "aria-hidden":
        if (value !== true && value !== "true") {
          delete componentProps["aria-hidden"];
        }
        break;
      default:
        if (key.slice(0, 3) === "on:") {
          break;
        }
        if (defaultExtendedIconCustomisations[key] === void 0) {
          componentProps[key] = value;
        }
    }
  }
  const item = iconToSVG(icon, customisations);
  const renderAttribs = item.attributes;
  if (customisations.inline) {
    style = "vertical-align: -0.125em; " + style;
  }
  if (mode === "svg") {
    Object.assign(componentProps, renderAttribs);
    if (style !== "") {
      componentProps.style = style;
    }
    return {
      svg: true,
      attributes: componentProps,
      body: replaceIDs(item.body)
    };
  }
  const { body, width, height } = icon;
  const useMask = mode === "mask" || (mode === "bg" ? false : body.indexOf("currentColor") !== -1);
  const html2 = iconToHTML(body, {
    ...renderAttribs,
    width: width + "",
    height: height + ""
  });
  const url = svgToURL(html2);
  const styles = {
    "--svg": url
  };
  const size = (prop) => {
    const value = renderAttribs[prop];
    if (value) {
      styles[prop] = fixSize(value);
    }
  };
  size("width");
  size("height");
  Object.assign(styles, commonProps, useMask ? monotoneProps : coloredProps);
  let customStyle = "";
  for (const key in styles) {
    customStyle += key + ": " + styles[key] + ";";
  }
  componentProps.style = customStyle + style;
  return {
    svg: false,
    attributes: componentProps
  };
}
allowSimpleNames(true);
setAPIModule("", fetchAPIModule);
if (typeof document !== "undefined" && typeof window !== "undefined") {
  const _window = window;
  if (_window.IconifyPreload !== void 0) {
    const preload = _window.IconifyPreload;
    const err = "Invalid IconifyPreload syntax.";
    if (typeof preload === "object" && preload !== null) {
      (preload instanceof Array ? preload : [preload]).forEach((item) => {
        try {
          if (
            // Check if item is an object and not null/array
            typeof item !== "object" || item === null || item instanceof Array || // Check for 'icons' and 'prefix'
            typeof item.icons !== "object" || typeof item.prefix !== "string" || // Add icon set
            !addCollection(item)
          ) {
            console.error(err);
          }
        } catch (e) {
          console.error(err);
        }
      });
    }
  }
  if (_window.IconifyProviders !== void 0) {
    const providers = _window.IconifyProviders;
    if (typeof providers === "object" && providers !== null) {
      for (let key in providers) {
        const err = "IconifyProviders[" + key + "] is invalid.";
        try {
          const value = providers[key];
          if (typeof value !== "object" || !value || value.resources === void 0) {
            continue;
          }
          if (!addAPIProvider(key, value)) {
            console.error(err);
          }
        } catch (e) {
          console.error(err);
        }
      }
    }
  }
}
function isSSR() {
  try {
    return typeof window !== "object";
  } catch (err) {
    return true;
  }
}
function checkIconState(icon, state, callback, onload) {
  function abortLoading() {
    if (state.loading) {
      state.loading.abort();
      state.loading = null;
    }
  }
  if (typeof icon === "object" && icon !== null && typeof icon.body === "string") {
    state.name = "";
    abortLoading();
    return { data: { ...defaultIconProps, ...icon } };
  }
  let iconName;
  if (typeof icon !== "string" || (iconName = stringToIcon(icon, false, true)) === null) {
    abortLoading();
    return null;
  }
  const data = getIconData(iconName);
  if (!data) {
    if (!isSSR() && (!state.loading || state.loading.name !== icon)) {
      abortLoading();
      state.name = "";
      state.loading = {
        name: icon,
        abort: loadIcons([iconName], callback)
      };
    }
    return null;
  }
  abortLoading();
  if (state.name !== icon) {
    state.name = icon;
    if (onload && !state.destroyed) {
      setTimeout(() => {
        onload(icon);
      });
    }
  }
  const classes = ["iconify"];
  if (iconName.prefix !== "") {
    classes.push("iconify--" + iconName.prefix);
  }
  if (iconName.provider !== "") {
    classes.push("iconify--" + iconName.provider);
  }
  return { data, classes };
}
function generateIcon(icon, props) {
  return icon ? render({
    ...defaultIconProps,
    ...icon
  }, props) : null;
}
function Icon($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const iconState = {
      // Last icon name
      name: "",
      // Loading status
      loading: null,
      // Destroyed status
      destroyed: false
    };
    const { $$slots, $$events, ...props } = $$props;
    let iconData = (() => {
      return checkIconState(props.icon, iconState, loaded, props.onload);
    })();
    let data = (() => {
      const generatedData = iconData ? generateIcon(iconData.data, props) : null;
      if (generatedData && iconData.classes && props["class"] === void 0) {
        generatedData.attributes["class"] = (typeof props["class"] === "string" ? props["class"] + " " : "") + iconData.classes.join(" ");
      }
      return generatedData;
    })();
    function loaded() {
    }
    onDestroy(() => {
      iconState.destroyed = true;
      if (iconState.loading) {
        iconState.loading.abort();
        iconState.loading = null;
      }
    });
    if (data) {
      $$renderer2.push("<!--[-->");
      if (data.svg) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<svg${attributes({ ...data.attributes }, void 0, void 0, void 0, 3)}>${html(data.body)}</svg>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<span${attributes({ ...data.attributes })}></span>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function Tool($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let height = fallback($$props["height"], 540);
    let width = fallback($$props["width"], 720);
    let color = fallback($$props["color"], "#111");
    let background = fallback($$props["background"], "#f5f5f5");
    let transparentBg = fallback($$props["transparentBg"], false);
    let lineWidth = fallback($$props["lineWidth"], 3);
    let showGrid = fallback($$props["showGrid"], true);
    let gridSize = fallback($$props["gridSize"], 16);
    let autoCopy = fallback($$props["autoCopy"], true);
    let filename = fallback($$props["filename"], "copycanvas");
    let exportFormat = fallback($$props["exportFormat"], "image/png");
    let exportScale = fallback($$props["exportScale"], 1);
    let pages = fallback($$props["pages"], () => [], true);
    let activePageId = $$props["activePageId"];
    let onReset = $$props["onReset"];
    let onUndo = $$props["onUndo"];
    let onRedo = $$props["onRedo"];
    let onDownload = $$props["onDownload"];
    let onExport = $$props["onExport"];
    let onSaveLocal = $$props["onSaveLocal"];
    let onLoadLocal = $$props["onLoadLocal"];
    let onNewPage = $$props["onNewPage"];
    let onDuplicatePage = $$props["onDuplicatePage"];
    let onDeletePage = $$props["onDeletePage"];
    let onSelectPage = $$props["onSelectPage"];
    const palette = ["#111", "#444", "#888", "#cfcfcf", "#ffffff"];
    const lineOptions = [1, 2, 3, 4, 6, 8, 10, 12];
    $$renderer2.push(`<div class="panel svelte-56nqft"><div class="panel__header svelte-56nqft"><div><p class="eyebrow svelte-56nqft">Workspace</p> <h3 class="svelte-56nqft">Controls</h3></div></div> <div class="cluster svelte-56nqft"><div class="field svelte-56nqft"><p class="label-title svelte-56nqft">Canvas (px)</p> <div class="inputs svelte-56nqft"><input type="number" min="64" max="4096"${attr("value", width)} class="svelte-56nqft"/> <span class="by svelte-56nqft">×</span> <input type="number" min="64" max="4096"${attr("value", height)} class="svelte-56nqft"/></div></div> <div class="field svelte-56nqft"><p class="label-title svelte-56nqft">Pages</p> <div class="inputs svelte-56nqft">`);
    $$renderer2.select(
      { value: activePageId, "aria-label": "페이지 선택", class: "" },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(pages);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let page = each_array[$$index];
          $$renderer3.option({ value: page.id }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(page.name)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      },
      "svelte-56nqft"
    );
    $$renderer2.push(` <div class="buttons svelte-56nqft"><button class="ghost svelte-56nqft" title="New page">`);
    Icon($$renderer2, { icon: "lucide:plus", width: "16" });
    $$renderer2.push(`<!----></button> <button class="ghost svelte-56nqft" title="Duplicate page">`);
    Icon($$renderer2, { icon: "lucide:copy", width: "16" });
    $$renderer2.push(`<!----></button> <button class="ghost svelte-56nqft" title="Delete page">`);
    Icon($$renderer2, { icon: "lucide:trash", width: "16" });
    $$renderer2.push(`<!----></button></div></div></div></div> <div class="cluster two-cols svelte-56nqft"><div class="field svelte-56nqft"><p class="label-title svelte-56nqft">Stroke</p> <div class="palette svelte-56nqft"><!--[-->`);
    const each_array_1 = ensure_array_like(palette);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let swatch = each_array_1[$$index_1];
      $$renderer2.push(`<button${attr_class(`swatch ${color === swatch ? "active" : ""}`, "svelte-56nqft")}${attr_style(`background:${swatch}`)}${attr("aria-pressed", color === swatch)}${attr("aria-label", `색상 ${swatch}`)}></button>`);
    }
    $$renderer2.push(`<!--]--> <label class="picker svelte-56nqft" aria-label="직접 색상 선택"><input type="color"${attr("value", color)} class="svelte-56nqft"/></label></div> <div class="inputs svelte-56nqft">`);
    $$renderer2.select(
      { value: lineWidth, "aria-label": "선 두께", class: "" },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array_2 = ensure_array_like(lineOptions);
        for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
          let value = each_array_2[$$index_2];
          $$renderer3.option({ value }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(value)}px`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      },
      "svelte-56nqft"
    );
    $$renderer2.push(` <button class="ghost svelte-56nqft" title="Eraser (white)">`);
    Icon($$renderer2, { icon: "lucide:eraser", width: "16" });
    $$renderer2.push(`<!----></button></div></div> <div class="field svelte-56nqft"><p class="label-title svelte-56nqft">Background</p> <div class="inputs svelte-56nqft"><input type="color"${attr("value", background)}${attr("disabled", transparentBg, true)} class="svelte-56nqft"/> <label class="toggle svelte-56nqft"><input type="checkbox"${attr("checked", transparentBg, true)} class="svelte-56nqft"/> <span>Transparent</span></label></div> <div class="inputs svelte-56nqft"><label class="toggle svelte-56nqft"><input type="checkbox"${attr("checked", showGrid, true)} class="svelte-56nqft"/> <span>Grid</span></label> <input type="number" min="4" max="128" step="2"${attr("value", gridSize)} aria-label="격자 간격" class="svelte-56nqft"/></div></div></div> <div class="cluster two-cols svelte-56nqft"><div class="field svelte-56nqft"><p class="label-title svelte-56nqft">History</p> <div class="buttons svelte-56nqft"><button class="svelte-56nqft">`);
    Icon($$renderer2, { icon: "lucide:undo", width: "16" });
    $$renderer2.push(`<!----> Undo</button> <button class="svelte-56nqft">`);
    Icon($$renderer2, { icon: "lucide:redo", width: "16" });
    $$renderer2.push(`<!----> Redo</button> <button class="ghost svelte-56nqft">`);
    Icon($$renderer2, { icon: "lucide:rotate-ccw", width: "16" });
    $$renderer2.push(`<!----> Reset</button></div></div> <div class="field svelte-56nqft"><p class="label-title svelte-56nqft">Clipboard</p> <label class="toggle svelte-56nqft"><input type="checkbox"${attr("checked", autoCopy, true)} class="svelte-56nqft"/> <span>Auto copy on draw</span></label> <div class="buttons svelte-56nqft"><button class="ghost svelte-56nqft">Save</button> <button class="ghost svelte-56nqft">Load</button></div></div></div> <div class="cluster svelte-56nqft"><div class="field svelte-56nqft"><p class="label-title svelte-56nqft">Export</p> <div class="inputs svelte-56nqft"><input type="text"${attr("value", filename)} placeholder="filename" aria-label="파일 이름" class="svelte-56nqft"/> `);
    $$renderer2.select(
      { value: exportFormat, "aria-label": "포맷", class: "" },
      ($$renderer3) => {
        $$renderer3.option({ value: "image/png" }, ($$renderer4) => {
          $$renderer4.push(`PNG`);
        });
        $$renderer3.option({ value: "image/jpeg" }, ($$renderer4) => {
          $$renderer4.push(`JPG`);
        });
        $$renderer3.option({ value: "image/webp" }, ($$renderer4) => {
          $$renderer4.push(`WEBP`);
        });
      },
      "svelte-56nqft"
    );
    $$renderer2.push(` <input type="number" min="1" max="4" step="0.5"${attr("value", exportScale)} aria-label="배율" class="svelte-56nqft"/></div> <div class="buttons svelte-56nqft"><button class="svelte-56nqft">`);
    Icon($$renderer2, { icon: "lucide:download", width: "16" });
    $$renderer2.push(`<!----> Quick save</button> <button class="ghost svelte-56nqft">`);
    Icon($$renderer2, { icon: "lucide:export", width: "16" });
    $$renderer2.push(`<!----> Export options</button></div></div></div> <div class="hint svelte-56nqft"><div class="hint__row svelte-56nqft"><span>Ctrl/Cmd + Z</span> <span>Undo · Shift+Z redo</span></div> <div class="hint__row svelte-56nqft"><span>Ctrl/Cmd + S</span> <span>Quick save PNG</span></div> <div class="hint__row svelte-56nqft"><span>Click + drag</span> <span>Draw · touch supported</span></div></div></div>`);
    bind_props($$props, {
      height,
      width,
      color,
      background,
      transparentBg,
      lineWidth,
      showGrid,
      gridSize,
      autoCopy,
      filename,
      exportFormat,
      exportScale,
      pages,
      activePageId,
      onReset,
      onUndo,
      onRedo,
      onDownload,
      onExport,
      onSaveLocal,
      onLoadLocal,
      onNewPage,
      onDuplicatePage,
      onDeletePage,
      onSelectPage
    });
  });
}
const copyCanvasToClipboard = async (canvas, format) => {
  return;
};
function Canvas($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let canvas;
    let width = 720;
    let height = 540;
    let color = "#111";
    let background = "#f5f5f5";
    let transparentBg = false;
    let lineWidth = 3;
    let showGrid = true;
    let gridSize = 16;
    let autoCopy = true;
    let exportFormat = "image/png";
    let exportScale = 1;
    let filename = "copycanvas";
    let undoStack = [];
    let redoStack = [];
    let pages = [{ id: crypto.randomUUID(), name: "Page 1", dataUrl: "" }];
    let activePageId = pages[0].id;
    const captureClipboard = async () => {
      if (!autoCopy) return;
      await copyCanvasToClipboard();
    };
    const redrawFromImage = (img) => {
    };
    const loadFromDataUrl = (dataUrl) => {
      if (!dataUrl) {
        return;
      }
      const img = new Image();
      img.onload = () => redrawFromImage();
      img.src = dataUrl;
    };
    const persistPage = () => {
      pages.findIndex((p) => p.id === activePageId);
      return;
    };
    const selectPage = (id) => {
      persistPage();
      activePageId = id;
      const page = pages.find((p) => p.id === id);
      if (page) {
        loadFromDataUrl(page.dataUrl);
        resetHistory();
      }
    };
    const addPage = () => {
      persistPage();
      const id = crypto.randomUUID();
      pages = [
        ...pages,
        { id, name: `Page ${pages.length + 1}`, dataUrl: "" }
      ];
      selectPage(id);
    };
    const duplicatePage = () => {
      persistPage();
      const current = pages.find((p) => p.id === activePageId);
      const id = crypto.randomUUID();
      pages = [
        ...pages,
        {
          id,
          name: `${current?.name || "Page"} Copy`,
          dataUrl: current?.dataUrl || canvas?.toDataURL("image/png") || ""
        }
      ];
      selectPage(id);
    };
    const deletePage = () => {
      if (pages.length === 1) return;
      const nextPages = pages.filter((p) => p.id !== activePageId);
      pages = nextPages;
      const fallback2 = nextPages[0];
      selectPage(fallback2.id);
    };
    const resetHistory = () => {
      undoStack = [];
      redoStack = [];
    };
    const resetCanvas = (silent = false) => {
      if (!silent && !confirm("Reset canvas?")) return;
      redoStack = [];
      captureClipboard();
    };
    const undo = () => {
      if (!undoStack.length) return;
      undoStack.pop();
      captureClipboard();
    };
    const redo = () => {
      const next = redoStack.pop();
      if (!next) return;
      captureClipboard();
    };
    const download = () => exportImage({ format: "image/png" });
    const exportImage = ({
      format = exportFormat,
      name = filename,
      scale = exportScale,
      quality = 0.92
    }) => {
    };
    const saveLocal = () => {
      localStorage.setItem("copycanvas:last", canvas.toDataURL("image/png"));
    };
    const loadLocal = () => {
      const saved = localStorage.getItem("copycanvas:last");
      if (saved) loadFromDataUrl(saved);
    };
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="canvas-shell svelte-b9mh77"><div class="canvas-area svelte-b9mh77"${attr_style(`--grid-size:${gridSize}px`)}>`);
      Tool($$renderer3, {
        pages,
        activePageId,
        onReset: resetCanvas,
        onUndo: undo,
        onRedo: redo,
        onDownload: download,
        onExport: exportImage,
        onSaveLocal: saveLocal,
        onLoadLocal: loadLocal,
        onNewPage: addPage,
        onDuplicatePage: duplicatePage,
        onDeletePage: deletePage,
        onSelectPage: selectPage,
        get height() {
          return height;
        },
        set height($$value) {
          height = $$value;
          $$settled = false;
        },
        get width() {
          return width;
        },
        set width($$value) {
          width = $$value;
          $$settled = false;
        },
        get color() {
          return color;
        },
        set color($$value) {
          color = $$value;
          $$settled = false;
        },
        get background() {
          return background;
        },
        set background($$value) {
          background = $$value;
          $$settled = false;
        },
        get transparentBg() {
          return transparentBg;
        },
        set transparentBg($$value) {
          transparentBg = $$value;
          $$settled = false;
        },
        get lineWidth() {
          return lineWidth;
        },
        set lineWidth($$value) {
          lineWidth = $$value;
          $$settled = false;
        },
        get showGrid() {
          return showGrid;
        },
        set showGrid($$value) {
          showGrid = $$value;
          $$settled = false;
        },
        get gridSize() {
          return gridSize;
        },
        set gridSize($$value) {
          gridSize = $$value;
          $$settled = false;
        },
        get autoCopy() {
          return autoCopy;
        },
        set autoCopy($$value) {
          autoCopy = $$value;
          $$settled = false;
        },
        get filename() {
          return filename;
        },
        set filename($$value) {
          filename = $$value;
          $$settled = false;
        },
        get exportFormat() {
          return exportFormat;
        },
        set exportFormat($$value) {
          exportFormat = $$value;
          $$settled = false;
        },
        get exportScale() {
          return exportScale;
        },
        set exportScale($$value) {
          exportScale = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <div${attr_class(`board ${showGrid ? "board-grid" : ""}`, "svelte-b9mh77")}>`);
      if (transparentBg) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="checker svelte-b9mh77" aria-hidden="true"></div>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> <canvas tabindex="0"${attr("width", width)}${attr("height", height)} class="svelte-b9mh77"></canvas></div></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.push(`<link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/> <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700&amp;display=swap" rel="stylesheet"/>`);
    });
    $$renderer2.push(`<main class="page svelte-1uha8ag"><section class="workbench svelte-1uha8ag"><div class="topbar svelte-1uha8ag"><div class="brand svelte-1uha8ag">copycanvas</div> <button class="mode svelte-1uha8ag" aria-label="테마 전환">`);
    Icon($$renderer2, {
      icon: "lucide:sun",
      width: "18",
      height: "18"
    });
    $$renderer2.push(`<!----></button></div> `);
    Canvas($$renderer2);
    $$renderer2.push(`<!----></section></main>`);
  });
}
export {
  _page as default
};
