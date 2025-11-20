/**
 * Script de test pour vérifier l'envoi d'emails
 * Usage: node test-email.js <email-destinataire>
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

const testEmail = async (recipientEmail) => {
  console.log('📧 Test d\'envoi d\'email');
  console.log('========================\n');

  // Configuration
  const config = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM,
  };

  console.log('Configuration SMTP:');
  console.log('  Host:', config.host);
  console.log('  Port:', config.port);
  console.log('  User:', config.user);
  console.log('  Pass:', config.pass ? '***' + config.pass.slice(-4) : 'NON DÉFINI');
  console.log('  From:', config.from);
  console.log();

  // Vérifier que toutes les variables sont définies
  if (!config.host || !config.port || !config.user || !config.pass) {
    console.error('❌ Configuration incomplète !');
    console.error('Vérifiez que toutes les variables d\'environnement sont définies dans .env');
    process.exit(1);
  }

  // Créer le transporter
  const transportOptions = {
    host: config.host,
    port: config.port,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    connectionTimeout: 30000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
  };

  if (config.port === 465) {
    transportOptions.secure = true;
  } else if (config.port === 587) {
    transportOptions.secure = false;
    transportOptions.requireTLS = true;
  }

  const transporter = nodemailer.createTransport(transportOptions);

  try {
    // Vérifier la connexion
    console.log('🔄 Vérification de la connexion SMTP...');
    await transporter.verify();
    console.log('✅ Connexion SMTP vérifiée avec succès !\n');

    // Envoyer l'email de test
    console.log('📤 Envoi de l\'email de test à:', recipientEmail);
    const info = await transporter.sendMail({
      from: config.from,
      to: recipientEmail,
      subject: '✅ Test d\'envoi d\'email - AEM UNCHK',
      text: 'Ceci est un email de test pour vérifier la configuration SMTP.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Test réussi !</h1>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Configuration Email Fonctionnelle</h2>
            <p style="color: #666; line-height: 1.6;">
              Félicitations ! Votre configuration SMTP est correctement configurée et fonctionnelle.
            </p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">Détails de la configuration</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; color: #666; border-bottom: 1px solid #eee;"><strong>Serveur SMTP</strong></td>
                  <td style="padding: 8px; color: #333; border-bottom: 1px solid #eee;">${config.host}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; color: #666; border-bottom: 1px solid #eee;"><strong>Port</strong></td>
                  <td style="padding: 8px; color: #333; border-bottom: 1px solid #eee;">${config.port}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; color: #666; border-bottom: 1px solid #eee;"><strong>Utilisateur</strong></td>
                  <td style="padding: 8px; color: #333; border-bottom: 1px solid #eee;">${config.user}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; color: #666;"><strong>Expéditeur</strong></td>
                  <td style="padding: 8px; color: #333;">${config.from}</td>
                </tr>
              </table>
            </div>

            <div style="background: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #1565C0;">
                <strong>ℹ️ Note :</strong> Tous les emails de votre application seront maintenant envoyés avec succès !
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              Cet email a été envoyé depuis le système de test AEM UNCHK<br>
              Date : ${new Date().toLocaleString('fr-FR')}
            </p>
          </div>
        </div>
      `,
    });

    console.log('\n✅ Email envoyé avec succès !');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response || 'n/a');
    console.log('\n🎉 Tous les tests sont passés !');
    console.log('   La configuration email fonctionne correctement.');
    console.log('   Vous pouvez maintenant utiliser les fonctionnalités d\'email dans votre application.\n');

  } catch (error) {
    console.error('\n❌ Erreur lors du test d\'email:');
    console.error('   Message:', error.message);
    if (error.code) console.error('   Code:', error.code);
    if (error.command) console.error('   Commande SMTP:', error.command);
    console.error('\n📚 Consultez EMAIL_CONFIGURATION.md pour plus d\'aide.\n');
    process.exit(1);
  }
};

// Exécution
const recipientEmail = process.argv[2] || process.env.EMAIL_USER;

if (!recipientEmail) {
  console.error('Usage: node test-email.js <email-destinataire>');
  process.exit(1);
}

testEmail(recipientEmail);
