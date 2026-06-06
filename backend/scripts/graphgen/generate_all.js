const fs = require('fs');
const pathModule = require('path');
const glob = require('glob');
const babelParser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
// We will emit DOT files and attempt to render them with Graphviz `dot` if available.

function parseCode(code, filePath) {
  try {
    return babelParser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'classProperties', 'typescript', 'decorators-legacy']
    });
  } catch (e) {
    console.error('Parse error', filePath, e.message);
    return null;
  }
}

function collectFrontendAxiosCalls(frontendRoot) {
  const files = glob.sync('**/*.{js,jsx,ts,tsx}', { cwd: frontendRoot, absolute: true, ignore: ['**/node_modules/**'] });
  const calls = []; // {file, funcName, loc, url}
  for (const file of files) {
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) continue;
    const code = fs.readFileSync(file, 'utf8');
    const ast = parseCode(code, file);
    if (!ast) continue;
    traverse(ast, {
      CallExpression(path) {
        const callee = path.node.callee;
        let isAxios = false;
        let url = null;
        // axios.post(...), axios.get(...)
        if (callee.type === 'MemberExpression' && callee.object && callee.object.name === 'axios') {
          isAxios = true;
          const args = path.node.arguments;
          if (args && args.length > 0) {
            const first = args[0];
            if (first.type === 'StringLiteral') url = first.value;
            else if (first.type === 'TemplateLiteral' && first.quasis && first.quasis[0]) url = first.quasis[0].value.raw;
          }
        }
        // axios(url, ...)
        if (callee.type === 'Identifier' && callee.name === 'axios') {
          isAxios = true;
          const args = path.node.arguments;
          if (args && args.length > 0) {
            const first = args[0];
            if (first.type === 'StringLiteral') url = first.value;
          }
        }
        // fetch('/api/...')
        if (callee.type === 'Identifier' && callee.name === 'fetch') {
          isAxios = true;
          const args = path.node.arguments;
          if (args && args.length > 0) {
            const first = args[0];
            if (first.type === 'StringLiteral') url = first.value;
          }
        }
        if (isAxios) {
          // find enclosing function name or module
          const fnPath = path.getFunctionParent();
          let funcName = null;
          if (fnPath) {
            const fn = fnPath.node;
            if (fn.type === 'FunctionDeclaration' && fn.id) funcName = fn.id.name;
            else if (fn.type === 'FunctionExpression' || fn.type === 'ArrowFunctionExpression') {
              // try to get variable name if assigned
              const parent = fnPath.parentPath;
              if (parent && parent.node.type === 'VariableDeclarator' && parent.node.id && parent.node.id.name) funcName = parent.node.id.name;
              else funcName = `(anonymous@${path.node.loc.start.line})`;
            }
          } else {
            funcName = '(module)';
          }
          calls.push({ file: pathModule.relative(process.cwd(), file).replace(/\\/g, '/'), func: funcName, url, loc: path.node.loc });
        }
      }
    });
  }
  return calls;
}

function collectBackendRoutes(backendRoot) {
  const serverFile = pathModule.join(backendRoot, 'server.js');
  const serverCode = fs.readFileSync(serverFile, 'utf8');
  const baseMounts = []; // {base, requirePath}
  const mountRegex = /app\.use\(['\"](.*?)['\"],\s*require\(['\"](.*?)['\"]\)\)/g;
  let m;
  while ((m = mountRegex.exec(serverCode)) !== null) {
    baseMounts.push({ base: m[1], requirePath: m[2] });
  }
  // now for each route file, parse router.<method>('path', handler)
  const routes = []; // {file, fullPath, method}
  for (const bm of baseMounts) {
    const routeFile = pathModule.join(backendRoot, bm.requirePath.replace(/^\.\//, ''));
    let routeFilePath = routeFile;
    if (!routeFilePath.endsWith('.js')) routeFilePath += '.js';
    if (!fs.existsSync(routeFilePath)) continue;
    const code = fs.readFileSync(routeFilePath, 'utf8');
    const ast = parseCode(code, routeFilePath);
    if (!ast) continue;
    traverse(ast, {
      CallExpression(path) {
        const callee = path.node.callee;
        if (callee.type === 'MemberExpression' && callee.object.name === 'router' && callee.property.type === 'Identifier') {
          const method = callee.property.name;
          const args = path.node.arguments;
          if (args && args.length > 0 && args[0].type === 'StringLiteral') {
            const routePath = args[0].value;
            const fullPath = (bm.base + routePath).replace(/\\/g, '/');
            routes.push({ file: pathModule.relative(process.cwd(), routeFilePath).replace(/\\/g, '/'), fullPath, method });
          }
        }
      }
    });
  }
  return routes;
}

function generateDotFB(calls, routes) {
  const nodes = new Set();
  const edges = [];
  for (const c of calls) {
    const fnNode = `"F:${c.file}::${c.func}"`;
    nodes.add(fnNode);
    // match url to route.fullPath where route.fullPath includes '/api/...'
    if (!c.url) continue;
    // normalize c.url by removing protocol and host if present
    let url = c.url.replace(/^https?:\/\/[\w\.:-]+/, '');
    // trim query
    url = url.split('?')[0];
    for (const r of routes) {
      if (url.startsWith(r.fullPath)) {
        const rNode = `"B:${r.fullPath}"`;
        nodes.add(rNode);
        edges.push(`${fnNode} -> ${rNode};`);
      }
    }
  }
  let dot = 'digraph FB {\n rankdir=LR;\n node [shape=box];\n';
  for (const n of nodes) dot += n + ';\n';
  for (const e of edges) dot += e + '\n';
  dot += '\n}';
  return dot;
}

function collectFunctionDefsAndCalls(root) {
  const files = glob.sync('**/*.{js,jsx,ts,tsx}', { cwd: root, absolute: true, ignore: ['**/node_modules/**'] });
  const defs = {}; // file -> [name]
  const calls = []; // {caller: file::func, callee: file::func}

  // first pass: collect exported function names and local function names
  for (const file of files) {
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) continue;
    const code = fs.readFileSync(file, 'utf8');
    const ast = parseCode(code, file);
    if (!ast) continue;
    const fileKey = pathModule.relative(process.cwd(), file).replace(/\\/g, '/');
    defs[fileKey] = new Set();
    traverse(ast, {
      FunctionDeclaration(path) {
        if (path.node.id && path.node.id.name) defs[fileKey].add(path.node.id.name);
      },
      VariableDeclarator(path) {
        if (path.node.id && path.node.id.name && (path.node.init && (path.node.init.type === 'ArrowFunctionExpression' || path.node.init.type === 'FunctionExpression'))) {
          defs[fileKey].add(path.node.id.name);
        }
      },
      ExportNamedDeclaration(path) {
        if (path.node.declaration) {
          const d = path.node.declaration;
          if (d.type === 'FunctionDeclaration' && d.id && d.id.name) defs[fileKey].add(d.id.name);
          if (d.type === 'VariableDeclaration') {
            for (const decl of d.declarations) if (decl.id && decl.id.name) defs[fileKey].add(decl.id.name);
          }
        } else if (path.node.specifiers) {
          for (const s of path.node.specifiers) if (s.exported && s.exported.name) defs[fileKey].add(s.exported.name);
        }
      }
    });
  }

  // second pass: resolve imports and calls
  for (const file of files) {
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) continue;
    const code = fs.readFileSync(file, 'utf8');
    const ast = parseCode(code, file);
    if (!ast) continue;
    const fileKey = pathModule.relative(process.cwd(), file).replace(/\\/g, '/');
    // map imported names to source files
    const importMap = {}; // localName -> sourceFileKey
    traverse(ast, {
      ImportDeclaration(path) {
        const src = path.node.source.value;
        let resolved = src;
        if (src.startsWith('.')) {
          const full = pathModule.resolve(file);
        }
        // crude resolution: resolve relative to file
        let srcPath = src;
        try {
          if (src.startsWith('.')) {
            const full = pathModule.resolve(file);
          }
        } catch (e) {}
        const dir = pathModule.dirname;
        for (const spec of path.node.specifiers) {
          importMap[spec.local.name] = src; // store raw source
        }
      }
    });
    // find calls
    traverse(ast, {
      CallExpression(path) {
        const callee = path.node.callee;
        if (callee.type === 'Identifier') {
          const name = callee.name;
          // check local defs
          if (defs[fileKey] && defs[fileKey].has(name)) {
            // a call to local function
            const callerFnPath = path.getFunctionParent();
            let callerName = '(module)';
            if (callerFnPath) {
              const fn = callerFnPath.node;
              if (fn.type === 'FunctionDeclaration' && fn.id) callerName = fn.id.name;
              else if (fn.type === 'FunctionExpression' || fn.type === 'ArrowFunctionExpression') {
                const parent = callerFnPath.parentPath;
                if (parent && parent.node.type === 'VariableDeclarator' && parent.node.id && parent.node.id.name) callerName = parent.node.id.name;
              }
            }
            calls.push({ caller: `${fileKey}::${callerName}`, callee: `${fileKey}::${name}` });
          }
          // check imported
          if (importMap[name]) {
            // resolve simple: imported from './utils' => try find file and see if it exports name
            let src = importMap[name];
            let srcFile = src;
            if (typeof src === 'string' && src.startsWith('.')) {
              let candidate = pathModule.join(pathModule.dirname(file), src);
              if (fs.existsSync(candidate + '.js')) candidate += '.js';
              else if (fs.existsSync(candidate + '.jsx')) candidate += '.jsx';
              else if (fs.existsSync(candidate + '/index.js')) candidate = pathModule.join(candidate, 'index.js');
              srcFile = pathModule.relative(process.cwd(), candidate).replace(/\\/g, '/');
            }
            calls.push({ caller: `${fileKey}::(module)`, callee: `${srcFile}::${name}` });
          }
        }
      }
    });
  }
  return { defs, calls };
}

async function renderDotToSvg(dot, outPath) {
  // write DOT to a .dot file next to outPath
  const dotPath = outPath.replace(/\.svg$/, '.dot');
  fs.writeFileSync(dotPath, dot, 'utf8');
  console.log('Wrote DOT', dotPath);
  // attempt to run `dot` if available to produce SVG
  try {
    const { execSync } = require('child_process');
    execSync(`dot -Tsvg -o "${outPath}" "${dotPath}"`);
    console.log('Rendered SVG via dot:', outPath);
  } catch (e) {
    console.warn('Graphviz `dot` not available or failed; DOT saved at', dotPath);
  }
}

async function main() {
  const repoRoot = pathModule.resolve(__dirname, '..', '..', '..');
  const frontendRoot = pathModule.join(repoRoot, 'frontend', 'src');
  const backendRoot = pathModule.join(repoRoot, 'backend');
  const outDir = pathModule.join(backendRoot, 'scripts', 'graphgen', 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log('Collecting frontend axios calls...');
  const fbCalls = collectFrontendAxiosCalls(frontendRoot);
  console.log('Collecting backend routes...');
  const routes = collectBackendRoutes(backendRoot);
  console.log('Building frontend-backend graph...');
  const dotFB = generateDotFB(fbCalls, routes);
  await renderDotToSvg(dotFB, pathModule.join(outDir, 'frontend-backend.svg'));

  console.log('Collecting frontend internal call graph...');
  const fe = collectFunctionDefsAndCalls(frontendRoot);
  const functionNodes = new Set();
  const functionEdges = new Set();
  for (const c of fe.calls) {
    functionNodes.add(c.caller);
    functionNodes.add(c.callee);
    functionEdges.add(`${c.caller}|||${c.callee}`);
  }

  let dotF = 'digraph F {\n rankdir=LR;\n graph [splines=ortho, nodesep=0.45, ranksep=0.9, concentrate=true];\n node [shape=box, style="rounded,filled", fillcolor="#f8fafc", color="#475569", fontname="Arial", fontsize=10];\n edge [color="#64748b", arrowsize=0.7, fontname="Arial", fontsize=9];\n';
  for (const n of functionNodes) {
    const safe = n.replace(/"/g, '\\"');
    const label = safe.replace(/::/g, '\\n');
    dotF += `"${safe}" [label="${label}"];\n`;
  }
  for (const k of functionEdges) {
    const [a, b] = k.split('|||');
    const sa = a.replace(/"/g, '\\"');
    const sb = b.replace(/"/g, '\\"');
    dotF += `"${sa}" -> "${sb}";\n`;
  }
  dotF += '\n}';
  await renderDotToSvg(dotF, pathModule.join(outDir, 'frontend-internal.svg'));

  console.log('Collecting backend internal call graph...');
  const be = collectFunctionDefsAndCalls(backendRoot);
  let dotB = 'digraph B {\n rankdir=LR; node [shape=box];\n';
  for (const c of be.calls) {
    const a = `"${c.caller.replace(/"/g, '\\"')}"`;
    const b = `"${c.callee.replace(/"/g, '\\"')}"`;
    dotB += `${a} -> ${b};\n`;
  }
  dotB += '\n}';
  await renderDotToSvg(dotB, pathModule.join(outDir, 'backend-internal.svg'));

  console.log('All graphs generated in', outDir);
}

main().catch(err => { console.error(err); process.exit(1); });
