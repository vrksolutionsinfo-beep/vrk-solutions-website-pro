import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock('resend', () => ({ Resend: class { emails = { send }; } }));
import { POST } from '../app/api/enquiry/route';
const data = {
  kind: 'quote',
  name: 'Example Name',
  email: 'example@example.com',
  service: 'Software Development',
  message: 'A custom internal application for our operations.',
  consent: true,
  website: '',
};
function request(body: unknown, origin = 'https://vrksolutions.in') {
  return new Request('https://vrksolutions.in/api/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', origin },
    body: JSON.stringify(body),
  });
}
describe('server enquiry endpoint', () => {
  beforeEach(() => {
    vi.stubEnv('RESEND_API_KEY', 'test-placeholder');
    vi.stubEnv('ENQUIRY_FROM', 'VRK Solutions <website@vrksolutions.in>');
    vi.stubEnv('ENQUIRY_TO', 'info@vrksolutions.in');
    send.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());
  it.each(['contact', 'book-consultation', 'get-quote'])('sends %s to the company with visitor Reply-To', async (kind) => {
    send.mockResolvedValue({ data: { id: 'test-message-id' }, error: null });
    const response = await POST(request({ ...data, kind }));
    expect(response.status).toBe(200);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      from: 'VRK Solutions <website@vrksolutions.in>',
      to: 'info@vrksolutions.in', replyTo: data.email,
      text: expect.stringContaining(data.message),
    }));
  });
  it.each([
    { data: null, error: { message: 'Domain not verified' } },
    { data: null, error: null },
  ])('does not claim success without provider acceptance', async (result) => {
    send.mockResolvedValue(result);
    expect((await POST(request(data))).status).toBe(502);
  });
  it('handles provider connection failure', async () => {
    send.mockRejectedValue(new Error('Connection failed'));
    expect((await POST(request(data))).status).toBe(502);
  });
  it('never sends honeypot submissions', async () => {
    await POST(request({ ...data, website: 'spam.example' }));
    expect(send).not.toHaveBeenCalled();
  });
  it('rejects cross-origin submissions', async () => {
    expect((await POST(request(data, 'https://other.example'))).status).toBe(
      403,
    );
  });
  it('rejects invalid input', async () => {
    expect((await POST(request({ ...data, email: 'invalid' }))).status).toBe(
      400,
    );
  });
  it('never claims delivery when email is unconfigured', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    const response = await POST(request(data));
    expect(response.status).toBe(503);
    expect((await response.json()).message).toContain('not connected');
    vi.unstubAllEnvs();
  });
});
