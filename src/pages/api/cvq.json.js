import * as patterns from "consonant-vowel-patterns";
import Filter from "bad-words";

const filter = new Filter();
const vowels = ["a", "e", "i", "o", "u", "y"];

export async function get({ request }) {
  const url = new URL(request.url);
  const usp = new URLSearchParams(url.search);
  const query = usp.get("query");
  const clean = !!usp.get("clean");

  if (!query) {
    return new Response(JSON.stringify({ error: "No query provided" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const generalPattern = query
    .split("")
    .map((l) => {
      if (l === "C" || l === "V") {
        return l.toLowerCase();
      } else {
        if (vowels.includes(l)) {
          return "v";
        } else {
          return "c";
        }
      }
    })
    .join("");

  const words = patterns[generalPattern];

  const matches = words.filter((w) => {
    let match = true;
    for (let i = 0; i < w.length; i++) {
      const l = w[i];
      const q = query[i];

      if (q !== "C" && q !== "V") {
        match = q === l;
      }

      if (!match) {
        break;
      }
    }

    if (clean && filter.isProfane(w)) {
      return false;
    }

    return match;
  });

  return new Response(
    JSON.stringify({ matches, query, pattern: generalPattern }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
