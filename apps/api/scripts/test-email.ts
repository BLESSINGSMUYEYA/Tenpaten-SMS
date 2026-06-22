/**
 * Quick smoke-test for the Resend email integration.
 * Run with: npx tsx scripts/test-email.ts <recipient-email>
 * 
 * This sends a simple test email to verify the Resend API key is valid
 * and the domain (myklasi.online) is correctly verified.
 */
import { Resend } from 'resend';

// Load env manually
import fs from 'fs';
import path from 'path';

const envPaths = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env'),
];

let apiKey = '';
let emailFrom = 'noreply@myklasi.online';
let emailFromName = 'MyKlasi SMS';

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.substring(0, eq).trim();
      let val = trimmed.substring(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      if (key === 'RESEND_API_KEY') apiKey = val;
      if (key === 'EMAIL_FROM') emailFrom = val;
      if (key === 'EMAIL_FROM_NAME') emailFromName = val;
    }
    console.log(`✅ Loaded env from: ${envPath}`);
    break;
  }
}

if (!apiKey) {
  console.error('❌ RESEND_API_KEY not found in .env files');
  process.exit(1);
}

const recipient = process.argv[2];
if (!recipient) {
  console.error('Usage: npx tsx scripts/test-email.ts <recipient-email>');
  console.error('Example: npx tsx scripts/test-email.ts yourname@gmail.com');
  process.exit(1);
}

async function main() {
  console.log(`\n📬 Sending test email...`);
  console.log(`   From: ${emailFromName} <${emailFrom}>`);
  console.log(`   To:   ${recipient}`);
  console.log(`   API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: `${emailFromName} <${emailFrom}>`,
      to: [recipient],
      subject: '🧪 MyKlasi Email Test — Resend Integration',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">✅ Email Works!</h1>
            <p style="color: #e0e7ff; margin: 8px 0 0; font-size: 14px;">MyKlasi + Resend Integration Test</p>
          </div>
          <div style="padding: 32px 24px;">
            <p style="font-size: 16px; color: #1f2937;">Hello!</p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
              If you're reading this, the <strong>Resend email integration</strong> for MyKlasi SMS is working correctly.
            </p>
            <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #22c55e;">
              <p style="margin: 0; font-size: 14px; color: #166534;">
                ✅ API Key is valid<br/>
                ✅ Domain verification is working<br/>
                ✅ Email delivery is functional
              </p>
            </div>
            <p style="font-size: 13px; color: #9ca3af;">
              Sent at: ${new Date().toISOString()}<br/>
              From: ${emailFrom}
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend API returned an error:');
      console.error(JSON.stringify(error, null, 2));
      
      // Common error explanations
      if (error.message?.includes('domain') || error.message?.includes('verify')) {
        console.error('\n💡 This usually means the domain "myklasi.online" is not verified in Resend.');
        console.error('   Go to https://resend.com/domains and add the required DNS records.');
        console.error('   Alternatively, you can test with: from: "onboarding@resend.dev"');
      }
      process.exit(1);
    }

    console.log('🎉 Email sent successfully!');
    console.log(`   Email ID: ${data?.id}`);
    console.log(`\n📥 Check your inbox at: ${recipient}`);
  } catch (err: any) {
    console.error('❌ Exception while sending email:', err.message || err);
    process.exit(1);
  }
}

main();
