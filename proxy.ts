// Run local command
// deno run --allow-env --allow-net  proxy.ts
// make sure to set the envs in .env

// Get API keys from environment variables
const API_KEY = Deno.env.get("GEMINI_API_KEY");
const model = "gemini-1.5-flash-8b";

// Example usage in a Deno Deploy function

export const server = async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;
  if (pathname === "/gemini/default") {
    const requestUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
    const jsonData = await req.json();
    const body = JSON.stringify(jsonData);
    const requestBody = body;

    const headers = {
      "Content-Type": "application/json",
    };

    const options = {
      method: "POST",
      headers: headers,
      body: requestBody,
    };

    const response = await fetch(requestUrl, options);
    const data = await response.json();

    if (response.ok){
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        });
    }else{
        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" },
            status: response.status
          });  
    }

  }
  return new Response(JSON.stringify({ message: "not found" }), {
    headers: { "Content-Type": "application/json" },
    status: 404,
  });
}

Deno.serve(server);
