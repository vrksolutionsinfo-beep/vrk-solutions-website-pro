# Deployment

Deploy this Next.js server application to a supported Node host such as Vercel. Build command `npm run build`; Node 22+. Configure the environment from `.env.example`, attach vrksolutions.in and configure DNS/TLS. Do not expose server tokens with NEXT_PUBLIC names.

Before public launch:

- Connect the real Sanity project, dataset, editor access and CORS origin. Test editorial publication and draft preview with real credentials.
- Verify the Resend sender domain and send/receive a real test enquiry. Configure platform rate limiting for `/api/enquiry` and monitoring without logging enquiry bodies.
- Review draft legal copy with the business, adding legal entity, registered address, retention details and jurisdiction.
- Supply approved case-study content and screenshots. No projects or testimonials have been fabricated.
- PNG social artwork and metadata are implemented; verify rich-link rendering on the final domain.
- Run Playwright in a browser-enabled environment, test screen readers, keyboard navigation, contrast, real mobile devices and WebGL fallback.
- Review CMS coverage: tagline, page intros/editorial bodies, articles and case studies are editable; hero and closing copy, services, process steps and FAQs are editable; module layouts and some section headings remain source-managed.
- Verify the generated sitemap includes approved published article and case-study URLs.

No live deployment, CMS authentication or transactional delivery has been performed without account credentials. The repository is an implemented foundation with the listed production prerequisites, not a claim of completed external service setup.

Search rollout: use the canonical www host already served by the domain, set SITE_INDEXING_ENABLED=true in production and false on previews, and follow SEO-AUDIT.md. The Sites demonstration remains noindex.

## Resend enquiry setup

Contact, consultation and quotation forms share the server-only `/api/enquiry` handler. It validates submissions, rejects cross-origin requests, filters a honeypot, and sends plain-text email with the visitor's email as Reply-To. Success requires Resend to return a message ID; provider acceptance does not guarantee inbox delivery.

1. Verify `vrksolutions.in` in https://resend.com/domains by adding the DNS records Resend provides. The setup test on 2026-11-14 was rejected because this domain was not verified.
2. In your Next.js hosting project's server environment, set `RESEND_API_KEY`, `ENQUIRY_FROM=VRK Solutions <website@vrksolutions.in>` and `ENQUIRY_TO=info@vrksolutions.in`. Use the host's secret settings, never source code or NEXT_PUBLIC variables. Redeploy after setting them.
3. Submit each form and check Resend delivery events and the company mailbox, including spam. Reply to an enquiry to verify Reply-To.
4. Configure host-level rate limiting for `/api/enquiry` before exposing email delivery publicly.

The separate static Sites preview does not run this API. Deploy the full Next.js application for working server-side email. The supplied key is configured in the local ignored `.env.local` only; hosting credentials were not available to configure a remote host. Rotate any API key shared in chat before production use.
