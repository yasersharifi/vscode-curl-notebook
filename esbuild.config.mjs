import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const extensionBuild = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node18',
  sourcemap: true,
  minify: !watch,
};

const testEntries = [
  'test/unit/cell-splitter.test.ts',
  'test/unit/variable-parser.test.ts',
  'test/unit/curl-tokenizer.test.ts',
  'test/unit/response-path-resolver.test.ts',
];

async function buildTests() {
  await Promise.all(
    testEntries.map((entry) =>
      esbuild.build({
        entryPoints: [entry],
        outfile: `dist-test/${entry.replace('test/unit/', '').replace('.ts', '.js')}`,
        bundle: true,
        platform: 'node',
        target: 'node18',
        format: 'cjs',
        sourcemap: true,
        external: ['vscode'],
      })
    )
  );
}

async function main() {
  if (watch) {
    const ctx = await esbuild.context(extensionBuild);
    await ctx.watch();
    console.log('[vscode-curl-notebook] watching extension...');
    return;
  }

  await esbuild.build(extensionBuild);
  await buildTests();
  console.log('[vscode-curl-notebook] build complete');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
