import { sveltekit } from "@sveltejs/kit/vite";
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
    async closeBundle() {
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
        console.error("Error copying \"lang\" folder:", error);
      }
    }
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
    async closeBundle() {
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
    }
  };
}

export default defineConfig(({ command }) => {
  return {
    clearScreen: false,
    plugins: [sveltekit(), copyLangFolderPlugin(), copyManifestPlugin()],
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          loadPaths: [process.cwd(), path.resolve(process.cwd(), 'node_modules')],
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
        "@theme-style":
          command === "serve"
            ? path.resolve(process.cwd(), "src/styles/_empty.scss")
            : path.resolve(process.cwd(), "src/styles/style.scss"),
      },
    },
  };
});
