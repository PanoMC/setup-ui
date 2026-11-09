import fs from "fs";
import { resolveLanguageFile } from "$lib/language-file.js";

/** @type {import("@sveltejs/kit").RequestHandler} */
export async function GET({ params }) {
  const filePath = resolveLanguageFile(params.language);

  if (filePath) {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return new Response(fileContent, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else {
    return new Response(JSON.stringify({ error: "Language file not found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
