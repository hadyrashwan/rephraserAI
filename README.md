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

## Adding to Chrome Web Store

To add RephaserAI to the Chrome Web Store, follow these steps:

1. **Prepare Your Extension**:
   - Ensure your extension is complete and tested.
   - Create a ZIP file of your extension's directory.

2. **Create a Developer Account**:
   - Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard).
   - Sign in with your Google account.
   - Pay the one-time registration fee if you haven't already.

3. **Upload Your Extension**:
   - Click on "Add new item" in the developer dashboard.
   - Upload the ZIP file of your extension.
   - Fill in the required details such as the extension's name, description, and screenshots.

4. **Publish Your Extension**:
   - Review the information and click on "Publish".
   - Your extension will be reviewed by Google and, if approved, will be available in the Chrome Web Store.

## Running Locally

RephaserAI is open-source and can be run locally. You can use various AI models and services such as:

- **Gemini**: [Gemini API](https://gemini.com)
- **OpenAI**: [OpenAI API](https://openai.com)
- **Grok**: [Grok AI](https://grok.com)
- **Sambanova Cloud**: [Sambanova Cloud](https://sambanova.ai)
- **Mistral AI**: [Mistral AI](https://mistral.ai)
- **Ollama**: [Ollama](https://ollama.com)

To run locally, set the base URL to `http://localhost:11434` in the "Advanced Settings" section of the popup.

## Support

For support, please visit the [Ollama website](https://ollama.com) or contact the developers of the respective AI services.
