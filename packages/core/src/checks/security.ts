import { Issue } from '../types';
import * as tls from 'tls';
import { URL } from 'url';

export async function runSecurityCheck(urlStr: string, headers: Headers): Promise<Issue[]> {
  const issues: Issue[] = [];
  
  const hsts = headers.get('strict-transport-security');
  if (!hsts) {
    issues.push({
      category: 'security',
      severity: 'warning',
      title: 'Missing HSTS Header',
      detail: 'The Strict-Transport-Security header is not set.',
      impact: 'Without HSTS, the site is vulnerable to man-in-the-middle attacks like SSL stripping.',
    });
  }

  const csp = headers.get('content-security-policy');
  if (!csp) {
    issues.push({
      category: 'security',
      severity: 'warning',
      title: 'Missing Content Security Policy',
      detail: 'The Content-Security-Policy header is missing.',
      impact: 'A CSP helps prevent Cross-Site Scripting (XSS) and other data injection attacks.',
    });
  }

  const xFrameOptions = headers.get('x-frame-options');
  if (!xFrameOptions) {
    issues.push({
      category: 'security',
      severity: 'info',
      title: 'Missing X-Frame-Options Header',
      detail: 'The X-Frame-Options header is missing.',
      impact: 'Without this header, the site could be embedded in an iframe, making it vulnerable to clickjacking attacks.',
    });
  }

  const xContentTypeOptions = headers.get('x-content-type-options');
  if (!xContentTypeOptions || xContentTypeOptions.toLowerCase() !== 'nosniff') {
    issues.push({
      category: 'security',
      severity: 'info',
      title: 'Missing or Invalid X-Content-Type-Options',
      detail: 'The X-Content-Type-Options header is missing or not set to "nosniff".',
      impact: 'This header prevents the browser from interpreting files as a different MIME type, which can prevent MIME-sniffing vulnerabilities.',
    });
  }

  const url = new URL(urlStr);
  if (url.protocol === 'https:') {
    try {
      await new Promise<void>((resolve, reject) => {
        const socket = tls.connect(url.port ? Number(url.port) : 443, url.hostname, {
          servername: url.hostname,
        }, () => {
          const cert = socket.getPeerCertificate();
          if (socket.authorized) {
             const validTo = new Date(cert.valid_to);
             const now = new Date();
             const daysToExpiry = (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
             if (daysToExpiry < 14) {
               issues.push({
                 category: 'security',
                 severity: 'warning',
                 title: 'TLS Certificate Expiring Soon',
                 detail: `The TLS certificate expires in ${Math.round(daysToExpiry)} days.`,
                 impact: 'An expired certificate will cause browsers to block access to the site entirely.',
               });
             }
          } else {
            issues.push({
              category: 'security',
              severity: 'critical',
              title: 'Invalid TLS Certificate',
              detail: `The TLS certificate is invalid: ${socket.authorizationError}`,
              impact: 'An invalid certificate will cause browsers to display a security warning and block access to the site.',
            });
          }
          socket.end();
          resolve();
        });
        socket.on('error', (err) => {
          issues.push({
            category: 'security',
            severity: 'critical',
            title: 'TLS Connection Failed',
            detail: `Failed to establish a TLS connection: ${err.message}`,
            impact: 'The site cannot be securely accessed over HTTPS.',
          });
          resolve();
        });
      });
    } catch (e) {
      // Ignored for tests/mocking
    }
  } else {
     issues.push({
        category: 'security',
        severity: 'critical',
        title: 'Insecure Protocol',
        detail: 'The site is not using HTTPS.',
        impact: 'Data transmitted over HTTP is unencrypted and can be intercepted by attackers.',
     });
  }

  return issues;
}
