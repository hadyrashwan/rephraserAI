import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { domContentLoaded, saveListener } from './popup.js';

// Mock chrome.storage API
globalThis.chrome = {
  storage: {
    sync: {
      get: vi.fn((keys, callback) => {
        // Provide default values if no data is stored
        const data = {};
        if (keys.includes('apiKey')) data.apiKey = 'test-api-key';
        if (keys.includes('model')) data.model = 'test-model';
        if (keys.includes('baseUrl')) data.baseUrl = 'test-base-url';
        if (keys.includes('apiType')) data.apiType = 'openai';
        callback(data);
      }),
      set: vi.fn((_items, callback) => {
        callback();
      }),
    },
    local: {
      get: vi.fn((keys, callback) => {
        const data = {};
        if (keys.includes('popupData')) data.popupData = 'test rephrased text';
        callback(data);
      }),
      set: vi.fn((_items, callback) => {
        callback();
      }),
    },
  },
};

// Mock navigator.clipboard
globalThis.navigator = {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
};

describe('popup.js', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Popup</title>
      </head>
      <body>
        <textarea id="rephrasedText"></textarea>
        <button id="copyButton">Copy</button>
        <form id="settingsForm">
          <input type="text" id="apiKey" />
          <input type="text" id="model" />
          <input type="text" id="baseUrl" />
           <select id="apiType">
              <option value="openai">OpenAI</option>
              <option value="azure">Azure</option>
            </select>
          <button id="saveButton">Save</button>
        </form>
      </body>
      </html>
    `);
    document = dom.window.document;
    globalThis.document = document;
    domContentLoaded()();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should load saved values from chrome storage on DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const modelInput = document.getElementById('model');
    const baseUrlInput = document.getElementById('baseUrl');
    const apiTypeSelect = document.getElementById('apiType');
    const rephrasedTextElement = document.getElementById('rephrasedText');

    expect(apiKeyInput.value).toBe('test-api-key');
    expect(modelInput.value).toBe('test-model');
    expect(baseUrlInput.value).toBe('test-base-url');
    expect(apiTypeSelect.value).toBe('openai');
    expect(rephrasedTextElement.value).toBe('test rephrased text');
  });

  it('should save values to chrome storage on form submit', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const modelInput = document.getElementById('model');
    const baseUrlInput = document.getElementById('baseUrl');
    const apiTypeSelect = document.getElementById('apiType');
    const saveButton = document.getElementById('saveButton');
    const settingsForm = document.getElementById('settingsForm');

    apiKeyInput.value = 'new-api-key';
    modelInput.value = 'new-model';
    baseUrlInput.value = 'new-base-url';
    apiTypeSelect.value = 'azure';

    settingsForm.dispatchEvent(new dom.window.Event('submit'));

    // expect(saveButton.textContent).toBe('Saving...');
    expect(saveButton.disabled).toBe(true);

    // Simulate the timeout
    vi.advanceTimersByTime(2000);

    expect(chrome.storage.sync.set).toHaveBeenCalledWith(
      {
        apiKey: 'new-api-key',
        model: 'new-model',
        baseUrl: 'new-base-url',
        apiType: 'azure',
      },
      expect.any(Function),
    );
    // expect(saveButton.textContent).toBe('Saved!');
    expect(saveButton.disabled).toBe(false);
  });

  it('should copy text to clipboard on copy button click', async () => {
    const rephrasedTextElement = document.getElementById('rephrasedText');
    const copyButton = document.getElementById('copyButton');
    rephrasedTextElement.value = 'text to copy';

    copyButton.click();

    await Promise.resolve(); // Wait for the async operation to complete

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('text to copy');
    expect(copyButton.textContent).toBe('Copied!');

    // Simulate the timeout
    vi.advanceTimersByTime(2000);
    expect(copyButton.textContent).toBe('Copy');
  });

  it('should handle copy error', async () => {
    const rephrasedTextElement = document.getElementById('rephrasedText');
    const copyButton = document.getElementById('copyButton');
    rephrasedTextElement.value = 'text to copy';
    navigator.clipboard.writeText.mockImplementationOnce(() => Promise.reject('copy error'));

    copyButton.click();

    await Promise.resolve(); // Wait for the async operation to complete

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('text to copy');
    expect(copyButton.textContent).toBe('Error');

    // Simulate the timeout
    vi.advanceTimersByTime(2000);
    expect(copyButton.textContent).toBe('Copy');
  });

  it('should call saveListener and save values to chrome storage', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const modelInput = document.getElementById('model');
    const baseUrlInput = document.getElementById('baseUrl');
    const apiTypeSelect = document.getElementById('apiType');
    const saveButton = document.getElementById('saveButton');

    const saveHandler = saveListener(apiKeyInput, modelInput, baseUrlInput, apiTypeSelect, saveButton);
    const event = new dom.window.Event('submit');

    apiKeyInput.value = 'new-api-key';
    modelInput.value = 'new-model';
    baseUrlInput.value = 'new-base-url';
    apiTypeSelect.value = 'azure';

    saveHandler(event);

    // expect(saveButton.textContent).toBe('Saving...');
    expect(saveButton.textContent).toBe('Saved!');
    expect(saveButton.disabled).toBe(true);

    vi.advanceTimersByTime(2000);

    expect(chrome.storage.sync.set).toHaveBeenCalledWith(
      {
        apiKey: 'new-api-key',
        model: 'new-model',
        baseUrl: 'new-base-url',
        apiType: 'azure',
      },
      expect.any(Function),
    );
    expect(saveButton.textContent).toBe('Save');
    expect(saveButton.disabled).toBe(false);
  });
});