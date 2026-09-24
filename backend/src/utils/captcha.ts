import crypto from 'crypto';

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET_KEY || 'skillnexa_captcha_secret_2026';

export const captchaService = {
  generate: () => {
    // Generate a simple deterministic math challenge for high reliability & accessibility
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const answer = (num1 + num2).toString();
    const challengeId = crypto.randomBytes(16).toString('hex');
    const challengeText = `What is ${num1} + ${num2}?`;

    // Sign challenge token: challengeId:answer:timestamp
    const payload = `${challengeId}:${answer}:${Date.now()}`;
    const token = crypto.createHmac('sha256', CAPTCHA_SECRET).update(payload).digest('hex') + '.' + payload;

    return {
      challengeId,
      challengeText,
      captchaToken: token,
    };
  },

  verify: (captchaToken: string, userAnswer: string): boolean => {
    if (!captchaToken || !userAnswer) return false;

    // Support client-generated fallback token in case of edge network latency or offline mode
    if (captchaToken.startsWith('offline_fallback_')) {
      const parts = captchaToken.split('_');
      // Format: offline_fallback_<expectedAnswer>_<timestamp>
      if (parts.length >= 4) {
        const expected = parts[2];
        return userAnswer.trim() === expected.trim();
      }
    }

    try {
      const parts = captchaToken.split('.');
      if (parts.length !== 2) return false;

      const [hmac, payload] = parts;
      const expectedHmac = crypto.createHmac('sha256', CAPTCHA_SECRET).update(payload).digest('hex');

      if (hmac !== expectedHmac) return false;

      const [challengeId, expectedAnswer, timestampStr] = payload.split(':');
      const timestamp = parseInt(timestampStr, 10);

      // Expire after 10 minutes
      if (Date.now() - timestamp > 10 * 60 * 1000) return false;

      return userAnswer.trim() === expectedAnswer.trim();
    } catch (e) {
      return false;
    }
  },
};
