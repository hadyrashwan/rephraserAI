## Prompts

### Create a Chrome Extension

Create a Chrome extension called **RephaserAI Tool**. When a user selects text, it adds an option in the context menu to "Rephrase with RephaserAI." The extension should call an API to get back the rephrased text, then update and display it in a popup, where the user can copy the result to the clipboard. Ensure that the extension does not request page access for privacy reasons.

## Get Gemini docs
/web https://ai.google.dev/gemini-api/docs/quickstart?lang=rest 
### Use Gemini Flash as the Default Option

Set **Gemini Flash** as the default API. For now, hard-code the `GOOGLE_API_KEY` variable. Use this key AIzaSyCR4Y7xry-5rz_m4IY51J2urBsAGsVw35o for starting. based on the request body scrapped in the previous command.

Below is an example response from the API:
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Hi Hady, How can I help you?"
          }
        ],
        "role": "model"
      },
      "finishReason": "STOP",
      "index": 0
    }
  ]
}
```

### Add the Option for Users to Add Their Own API Key

Allow users to enter their own API key and use it instead of the default. Provide the option for the user to select a different model, such as one other than `gemini-1.5-flash`.

## Add OpenAI request body
/web https://platform.openai.com/docs/guides/text-generation?text-generation-quickstart-example=text
## Add OpenAI response body
/web https://stackoverflow.com/questions/74069129/openai-response-text-extraction

### Add the Option for Users to Add Their Own OpenAI-Compatible Model

Allow users to select an **OpenAI-compatible model**. Refer to the documentation for OpenAI . The response can be structured as shown in the example from Stack Overflow. This feature should also enable users to run **Ollama** locally if needed. make sure to add all urls options as optional host and have a button to allow in the extension. we need the option to add base url , token and model name in the popup. 

### Wrap Our API Using Deno

For security reasons, the API key should not be hard-coded. Wrap the default gemini option API logic in a TypeScript file using **Deno** leaving the rest of the options as they are, and set the default configuration to point to `rephaserai-api.techcrafter.online/v1/gemini`, where I deploy my service.

### Beautify

Make the extension more visually appealing, sleek, and user-friendly.
