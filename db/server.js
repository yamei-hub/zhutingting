/*
  作者：朱婷婷
  建立时间：2026-11-13
  使用大模型：DeepSeek-V4.1-Flash
  功能名称：诗词数据服务器（端口 3004），提供 /api/poems 接口并同时托管项目静态页面
  运行方式：node db/server.js
*/

// 朱婷婷：引入 Node.js 内置模块，无需安装任何第三方依赖
const zttHttp = require("http");
const zttFs = require("fs");
const zttPath = require("path");

// 服务端口号
const zttPort = 3004;
// 静态文件根目录：db 文件夹的上一级（项目根目录）
const zttRootDir = zttPath.resolve(__dirname, "..");
// 数据文件路径：db 文件夹中的 db.json
const zttDataFile = zttPath.join(__dirname, "db.json");

// 常见文件类型与 Content-Type 的对应关系
const zttMimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf"
};

// 函数功能：读取 db.json 文件，返回其中的 poems 数组
function zttReadPoems() {
  const zttRaw = zttFs.readFileSync(zttDataFile, "utf-8");
  const zttData = JSON.parse(zttRaw);
  return Array.isArray(zttData.poems) ? zttData.poems : [];
}

// 函数功能：以 JSON 格式向浏览器返回数据，并允许跨域访问
function zttSendJson(zttRes, zttStatusCode, zttData) {
  const zttBody = JSON.stringify(zttData);
  zttRes.writeHead(zttStatusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(zttBody),
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store"
  });
  zttRes.end(zttBody);
}

// 函数功能：把请求路径解析为项目根目录内的真实文件路径，路径越界时返回 null
function zttResolveStatic(zttUrlPath) {
  // 去掉查询参数，并对中文等字符解码
  const zttCleanPath = decodeURIComponent(zttUrlPath.split("?")[0]);
  // 目录请求默认返回首页
  const zttRelative = zttCleanPath === "/" ? "index.html" : zttCleanPath.replace(/^\/+/, "");
  const zttFullPath = zttPath.resolve(zttRootDir, zttRelative);
  // 防止通过 ../ 访问项目根目录之外的文件
  if (!zttFullPath.startsWith(zttRootDir)) {
    return null;
  }
  return zttFullPath;
}

// 函数功能：读取并返回静态文件内容，文件不存在或读取失败时返回 404
function zttServeStatic(zttRes, zttFilePath) {
  zttFs.readFile(zttFilePath, function (zttErr, zttBuffer) {
    if (zttErr) {
      zttRes.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      zttRes.end("404 Not Found: " + zttFilePath);
      return;
    }
    const zttExt = zttPath.extname(zttFilePath).toLowerCase();
    zttRes.writeHead(200, {
      "Content-Type": zttMimeTypes[zttExt] || "application/octet-stream",
      "Content-Length": zttBuffer.length
    });
    zttRes.end(zttBuffer);
  });
}

// 函数功能：统一处理浏览器请求，/api/poems 返回诗词数据，其余路径按静态文件返回
function zttHandleRequest(zttReq, zttRes) {
  if (zttReq.method === "OPTIONS") {
    zttRes.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    zttRes.end();
    return;
  }

  // 接口一：返回全部诗词数据
  if (zttReq.url.split("?")[0] === "/api/poems") {
    try {
      zttSendJson(zttRes, 200, { poems: zttReadPoems() });
    } catch (zttError) {
      zttSendJson(zttRes, 500, { error: "读取 db.json 失败：" + zttError.message });
    }
    return;
  }

  // 其余请求：按静态文件处理
  const zttFilePath = zttResolveStatic(zttReq.url);
  if (!zttFilePath) {
    zttRes.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    zttRes.end("403 Forbidden");
    return;
  }
  zttServeStatic(zttRes, zttFilePath);
}

// 函数功能：启动服务器并监听 3004 端口
function zttStartServer() {
  zttHttp.createServer(zttHandleRequest).listen(zttPort, function () {
    console.log("服务已启动：http://localhost:" + zttPort + "/poems.html");
    console.log("数据接口：http://localhost:" + zttPort + "/api/poems");
  });
}

zttStartServer();
