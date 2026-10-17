import { sveltekit } from "@sveltejs/kit/vite";
import NodeAdapter from "@sveltejs/adapter-node";
import SveltePreprocess from "svelte-preprocess";
import { defineConfig, loadEnv } from "vite";
import fs from "fs";
import path from "path";

const env = loadEnv("", process.cwd());

function copyLangFolderPlugin() {
  let outDir = "";

  return {
    name: "copy-lang-folder",
    apply: "build", // Run only during build
    configResolved(config) {
      // Get the output directory from Vite config
      outDir = "build/";
    },
    // SvelteKit 3 runs the adapter in a post `buildApp` hook, after every closeBundle, and adapter-node empties
    // build/ first: a copy into build/ must run after it (this plugin comes after sveltekit() in the list).
    buildApp: { order: "post", async handler() {
      const srcDir = path.resolve(process.cwd(), "lang");
      const destDir = path.resolve(process.cwd(), outDir, "lang");

      if (!fs.existsSync(srcDir)) {
        console.warn(`Source folder "lang" not found at: ${srcDir}`);
        return;
      }

      try {
        // Copy the "lang" folder recursively to the destination
        await fs.promises.cp(srcDir, destDir, { recursive: true });
        console.log(`Copied "lang" folder from ${srcDir} to ${destDir}`);
      } catch (error) {
        console.error('Error copying "lang" folder:', error);
      }
    } },
  };
}

function copyManifestPlugin(filename = "manifest.json") {
  let outDir = "";

  return {
    name: "copy-manifest-json",
    apply: "build",
    configResolved(config) {
      outDir = "build/";
    },
    // SvelteKit 3 runs the adapter in a post `buildApp` hook, after every closeBundle, and adapter-node empties
    // build/ first: a copy into build/ must run after it (this plugin comes after sveltekit() in the list).
    buildApp: { order: "post", async handler() {
      const srcPath = path.resolve(process.cwd(), filename);
      const destPath = path.resolve(process.cwd(), outDir, filename);

      if (!fs.existsSync(srcPath)) {
        console.warn(`Manifest file not found at: ${srcPath}`);
        return;
      }

      try {
        await fs.promises.copyFile(srcPath, destPath);
        console.log(`Copied manifest from ${srcPath} to ${destPath}`);
      } catch (err) {
        console.error("Failed to copy manifest.json:", err);
      }
    } },
  };
}

// SvelteKit 3 takes its options in the sveltekit() plugin; there is no svelte.config.js.
const kit = {
  adapter: NodeAdapter(),

  preprocess: SveltePreprocess({
    // Svelte 5 strips TypeScript itself; SvelteKit 3's own components are `lang="ts"` and the typescript
    // transformer would require the typescript package.
    typescript: false,
    scss: {
      api: "modern-compiler",
      quietDeps: true,
      silenceDeprecations: [
        "mixed-decls",
        "color-functions",
        "global-builtin",
        "import",
      ],
    },
  }),

  onwarn: (warning, handler) => {
    // Svelte 5 names them a11y_*, Svelte 4 named them a11y-*
    if (warning.code.startsWith("a11y")) {
      return;
    }

    if (warning.code === "vite-plugin-svelte-preprocess-many-dependencies") {
      return;
    }

    console.log(warning.code);

    handler(warning);
  },
};

export default defineConfig(({ command }) => {
  return {
    clearScreen: false,
    plugins: [sveltekit(kit), copyLangFolderPlugin(), copyManifestPlugin()],
    define: {
      // the sdk's `base` (@panomc/sdk/core/js/basePath.js): setup-ui is served at the root
      __PANO_BASE_PATH__: JSON.stringify(""),
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          loadPaths: [
            process.cwd(),
            path.resolve(process.cwd(), "node_modules"),
          ],
          quietDeps: true,
          silenceDeprecations: [
            "mixed-decls",
            "color-functions",
            "global-builtin",
            "import",
          ],
        },
      },
    },
    optimizeDeps: {
      // @panomc/sdk's core/js/* modules import the HOST app's `$lib/*` (variables,
      // Store, ToastContainer). Vite's dev pre-bundler runs them through esbuild,
      // which has no `$lib` alias, so `vite dev` died with
      // "Could not resolve "$lib/variables.js"". Excluding the SDK serves it through
      // Vite's normal transform pipeline where the `$lib` alias below applies.
      // (Same treatment as @panomc/theme-core's createViteConfig.)
      exclude: ["@panomc/sdk"],
      // The SDK's only third-party runtime dep; pre-bundle it up front so it is
      // not discovered on first request (which forces a full page reload).
      include: ["tippy.js"],
    },
    server: {
      proxy: {
        "/api": env.VITE_API_URL.replace("/api", ""),
      },
      allowedHosts: true,
      hmr: {
        path: "/",
      },
    },
    resolve: {
      alias: {
        // SvelteKit 3 no longer defines `$lib`; the app and the sdk ("host-provides": $lib/variables.js, ...) import
        // through it, and a subpath import (`#lib`) would resolve against the sdk package, not this app.
        "$lib": path.resolve(process.cwd(), "src/lib"),
        "@theme-style":
          command === "serve"
            ? path.resolve(process.cwd(), "src/styles/_empty.scss")
            : path.resolve(process.cwd(), "src/styles/style.scss"),
      },
    },
  };
});
