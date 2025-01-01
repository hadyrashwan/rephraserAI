import { describe, it, expect, vi } from 'vitest';
import { server } from './proxy.ts';

describe('proxy.ts', () => {
    it('should return a successful response for /gemini/default', async () => {
        const mockFetch = vi.fn();
        global.fetch = mockFetch;

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            headers: new Headers({ 'Content-Type': 'application/json' }),
            json: async () => ({ candidates: [{ content: { parts: [{ text: 'Mocked response' }] } }] }),
        });

        const requestBody = {
            contents: [{
              parts: [{ text: "Write a short poem about the sea." }],
            }],
          };
    
        const req = new Request("http://localhost/gemini/default", {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const response = await server(req);
        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toBe("application/json");
        const data = await response.json();
        expect(data).toBeDefined();
        expect(data.candidates).toBeDefined();
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should return an error response for /gemini/default with invalid request', async () => {
        const mockFetch = vi.fn();
        global.fetch = mockFetch;

        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            headers: new Headers({ 'Content-Type': 'application/json' }),
            json: async () => ({ error: { message: 'Mocked error' } }),
        });

        const requestBody = {
            contents: [{
              parts: [{ text: "Write a short poem about the sea." }],
            }],
            invalidField: "invalid",
          };
    
        const req = new Request("http://localhost/gemini/default", {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const response = await server(req);
        expect(response.headers.get("Content-Type")).toBe("application/json");
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toBeDefined();
        expect(data.error).toBeDefined();
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should return a 404 response for non-existent endpoints', async () => {
        const mockFetch = vi.fn();
        global.fetch = mockFetch;

        const req = new Request("http://localhost/nonexistent");
        const response = await server(req);
        expect(response.status).toBe(404);
        expect(response.headers.get("Content-Type")).toBe("application/json");
        const data = await response.json();
        expect(data.message).toBe("not found");
        expect(mockFetch).toHaveBeenCalledTimes(0);
    });

});
