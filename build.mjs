// Build script; run through the npm scripts in package.json:
//   npm run dev        dev server with live reload, at http://localhost:<port>/index-dev.html
//   npm run build      production build into dist/ (point Wallpaper Engine at dist/project.json)
//   npm run build:dev  dev build (with dev menu) into dist-dev/, which can also be loaded in Wallpaper Engine
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const dev = args.includes('--dev');
const serve = args.includes('--serve');

const appDir = 'app';
const outDir = dev ? 'dist-dev' : 'dist';

// [source in app/, destination in outDir]
const staticFiles = dev
  ? [
      ['index-dev.html', 'index.html'],
      ['style.css', 'style.css'],
      ['dev-src/dev-style.css', 'dev-src/dev-style.css'],
      ['twgl-full.js', 'twgl-full.js'],
    ]
  : [
      ['index.html', 'index.html'],
      ['style.css', 'style.css'],
      ['twgl-full.min.js', 'twgl-full.min.js'],
    ];

const buildOptions = {
  entryPoints: [path.join(appDir, 'src/main.js')],
  bundle: true,
  // classic script, because Wallpaper Engine loads the wallpaper from disk, where ES modules don't load
  format: 'iife',
  // DEV is a compile-time constant, so production builds strip the dev menu and dev stats entirely
  define: { DEV: String(dev) },
  minify: !dev,
  sourcemap: dev ? 'inline' : false,
  logLevel: 'info',
};

if (serve) {
  const ctx = await esbuild.context({
    ...buildOptions,
    // served from memory alongside the rest of app/; never written to disk
    outfile: path.join(appDir, 'bundle.js'),
    write: false,
    banner: { js: "new EventSource('/esbuild').addEventListener('change', () => location.reload());" },
  });
  await ctx.watch();
  const { port } = await ctx.serve({ servedir: appDir });
  console.log(`\nDev server: http://localhost:${port}/index-dev.html\n`);
} else {
  fs.rmSync(outDir, { recursive: true, force: true });
  await esbuild.build({ ...buildOptions, outfile: path.join(outDir, 'bundle.js') });

  for (const [from, to] of staticFiles) {
    fs.mkdirSync(path.dirname(path.join(outDir, to)), { recursive: true });
    fs.copyFileSync(path.join(appDir, from), path.join(outDir, to));
  }

  const project = JSON.parse(fs.readFileSync(path.join(appDir, 'project.json'), 'utf8'));
  if (dev)
    project.title += ' (dev)'; // so it's distinguishable from the production build in Wallpaper Engine
  fs.writeFileSync(path.join(outDir, 'project.json'), JSON.stringify(project, null, '\t'));

  console.log(`Built ${outDir}/`);
}
