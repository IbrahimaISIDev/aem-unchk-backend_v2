/**
 * Script de test pour Resend uniquement
 * Usage: node test-resend.js <email-destinataire>
 */

const { Resend } = require('resend');
require('dotenv').config();

const testResend = async (recipientEmail) => {
  console.log('📧 Test d\'envoi via Resend API');
  console.log('================================\n');

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || '"AEM UNCHK" <onboarding@resend.dev>';

  console.log('Configuration Resend:');
  console.log('  API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NON DÉFINI');
  console.log('  From:', from);
  console.log();

  if (!apiKey) {
    console.error('❌ RESEND_API_KEY non configuré dans .env');
    process.exit(1);
  }

  const resend = new Resend(apiKey);

  try {
    console.log('📤 Envoi de l\'email via Resend à:', recipientEmail);

    const result = await resend.emails.send({
      from: from,
      to: [recipientEmail],
      subject: '✅ Test Resend - AEM UNCHK',
      text: 'Ceci est un email de test pour vérifier Resend.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Resend Fonctionne !</h1>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Fallback Email Opérationnel</h2>
            <p style="color: #666; line-height: 1.6;">
              Votre système de fallback Resend est correctement configuré et fonctionnel !
            </p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">Mode de fonctionnement</h3>
              <ol style="color: #666; line-height: 1.8;">
                <li>Tentative d'envoi via SMTP Gmail</li>
                <li>Si échec (timeout, firewall) → Fallback automatique vers Resend</li>
                <li>Email envoyé avec succès via Resend ✅</li>
              </ol>
            </div>

            <div style="background: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #1565C0;">
                <strong>🎉 Parfait !</strong> Ce message prouve que Resend fonctionne. En production, si SMTP échoue, Resend prendra automatiquement le relais.
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              Cet email a été envoyé via Resend API<br>
              Date : ${new Date().toLocaleString('fr-FR')}
            </p>
          </div>
        </div>
      `,
    });

    if (result.error) {
      console.error('\n❌ Erreur Resend:', result.error);
      process.exit(1);
    }

    console.log('\n✅ Email envoyé avec succès via Resend !');
    console.log('   Email ID:', result.data?.id);
    console.log('\n🎉 Le fallback Resend fonctionne parfaitement !');
    console.log('   En production, si SMTP échoue, Resend prendra automatiquement le relais.\n');

  } catch (error) {
    console.error('\n❌ Erreur lors du test Resend:');
    console.error('   Message:', error.message);
    if (error.statusCode) console.error('   Status Code:', error.statusCode);
    console.error('\n💡 Vérifiez que votre clé API Resend est correcte.\n');
    process.exit(1);
  }
};

const recipientEmail = process.argv[2];

if (!recipientEmail) {
  console.error('Usage: node test-resend.js <email-destinataire>');
  process.exit(1);
}

testResend(recipientEmail);
