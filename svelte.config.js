import NodeAdapter from "@sveltejs/adapter-node";
import SveltePreprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: NodeAdapter(),
  },

  preprocess: SveltePreprocess({
    scss: {
      api: "modern-compiler",
      quietDeps: true,
      silenceDeprecations: ["mixed-decls", "color-functions", "global-builtin", "import"],
    },
  }),

  onwarn: (warning, handler) => {
    if (warning.code.startsWith('a11y-')) {
      return;
    }

    if (warning.code === "vite-plugin-svelte-preprocess-many-dependencies") {
      return;
    }

    console.log(warning.code)

    handler(warning);
  },
};

export default config;
