import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { makeRephrasingRequest } from './backgroundHelpers.js';

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

// Mock fetch API
global.fetch = vi.fn();

describe('backgroundHelpers.js', () => {
  beforeEach(() => {
    fetch.mockClear();
    chrome.storage.sync.get.mockClear();
    chrome.storage.sync.set.mockClear();
    chrome.storage.local.get.mockClear();
    chrome.storage.local.set.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should make a request to the default Gemini API when no API key is provided', async () => {
    const selectedText = 'This is some text to rephrase.';
    const data = { apiType: 'gemini' };
    const mockResponse = {
      candidates: [{ content: { parts: [{ text: 'Rephrased text.' }] } }],
    };
    fetch.mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    });

    const rephrasedText = await makeRephrasingRequest(selectedText, data);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      'https://rephraserai.deno.dev/gemini/default',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(rephrasedText).toBe('Rephrased text.');
  });

  it('should make a request to the Gemini API with an API key', async () => {
    const selectedText = 'This is some text to rephrase.';
    const apiKey = 'test-api-key';
    const model = 'gemini-1.5-pro';
    const data = { apiKey: apiKey, model: model, apiType: 'gemini' };
    const mockResponse = {
      candidates: [{ content: { parts: [{ text: 'Rephrased text with API key.' }] } }],
    };
    fetch.mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    });

    const rephrasedText = await makeRephrasingRequest(selectedText, data);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(rephrasedText).toBe('Rephrased text with API key.');
  });

  it('should make a request to the OpenAI API', async () => {
    const selectedText = 'This is some text to rephrase.';
    const apiKey = 'test-openai-api-key';
    const model = 'gpt-3.5-turbo';
    const baseUrl = 'https://api.openai.com/v1';
    const data = { apiKey: apiKey, model: model, baseUrl: baseUrl, apiType: 'openai' };
    const mockResponse = {
      choices: [{ text: 'Rephrased text from OpenAI.' }],
    };
    fetch.mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    });

    const rephrasedText = await makeRephrasingRequest(selectedText, data);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/completions`,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        }
      })
    );
    expect(rephrasedText).toBe('Rephrased text from OpenAI.');
  });

    it('should set referrerPolicy to no-referrer when baseUrl includes localhost', async () => {
        const selectedText = 'This is some text to rephrase.';
        const data = { apiType: 'gemini', baseUrl: 'http://localhost:8080' };
        const mockResponse = {
          candidates: [{ content: { parts: [{ text: 'Rephrased text.' }] } }],
        };
        fetch.mockResolvedValue({
          json: () => Promise.resolve(mockResponse),
        });
    
        await makeRephrasingRequest(selectedText, data);
    
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
          'https://rephraserai.deno.dev/gemini/default',
          expect.objectContaining({
            referrerPolicy: 'no-referrer',
          })
        );
      });

  it('should handle errors during fetch', async () => {
    const selectedText = 'This is some text to rephrase.';
    const data = { apiKey: 'test-api-key', apiType: 'gemini' };
    fetch.mockRejectedValue(new Error('Fetch error'));

    await expect(makeRephrasingRequest(selectedText, data)).rejects.toThrow('Fetch error');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
