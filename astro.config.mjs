import react from "@astrojs/react";
import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), tailwind()],
  site: 'https://agoraio-community.github.io',
  base: 'openai-demo'
});