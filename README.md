# RephaserAI Chrome Extension

RephaserAI is a Chrome extension that allows you to rephrase selected text using advanced AI models. This extension is created using Aider and Mistral AI Large.

## Features

- **Rephrase Text**: Select any text on a webpage, right-click, and choose "Rephrase with RephaserAI" to get a rephrased version of the text.
- **Custom API Key**: Use your own Gemini API key or any OpenAI-compatible API key.
- **Model Selection**: Choose between different models, including Gemini and OpenAI models.
- **Local Execution**: Run the extension locally using Ollama.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/rephaserai.git
   ```
2. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`.
   - Enable "Developer mode" by toggling the switch in the top right corner.
   - Click on "Load unpacked" and select the directory where you cloned the repository.

## Usage

1. Select the text you want to rephrase.
2. Right-click and choose "Rephrase with RephaserAI".
3. The rephrased text will appear in a popup window.
4. You can copy the rephrased text to the clipboard by clicking the "Copy" button.

## Configuration

- **API Key**: Enter your API key in the "Advanced Settings" section of the popup.
- **Model**: Select the model you want to use for rephrasing.
- **Base URL**: Enter the base URL for the API (e.g., `https://api.openai.com`).
- **API Type**: Choose between Gemini and OpenAI.

## Advanced Features

- **Gemini API**: Use your own Gemini API key to rephrase text.
- **OpenAI-Compatible API**: Use any OpenAI-compatible API by entering the base URL and API key.
- **Local Execution**: Run the extension locally using Ollama by setting the base URL to `http://localhost:11434`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- This project is created using Aider and Mistral AI Large.
- Special thanks to the developers of Gemini, OpenAI, and Ollama for their APIs and tools.
