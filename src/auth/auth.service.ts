// src/auth/auth.service.ts - VERSION COMPLÈTE CORRIGÉE
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { User, UserRole, UserStatus } from "../users/entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/forgot-password.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { UpdateProfileDto } from "../users/dto/update-profile.dto";
import { JwtPayload } from "./strategies/jwt.strategy";
import { NotificationsService } from "../notifications/notifications.service";
import { MailService } from "../email/email.service";
import { EmailTemplatesService } from "../email/email-templates.service";
import {
  NotificationPriority,
  NotificationType,
} from "../notifications/entities/notification.entity";
import { Eno } from "../academics/entities/eno.entity";
import { Pole } from "../academics/entities/pole.entity";
import { Filiere } from "../academics/entities/filiere.entity";
import {
  computePasswordStrength,
  isStrongPassword,
} from "./utils/password-strength";
import { PasswordReset } from "./entities/password-reset.entity";
import * as crypto from "crypto";

// DTO spécifique pour la réponse d'inscription
export interface RegisterResponseDto {
  message: string;
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    status: UserStatus;
  };
  requiresActivation: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Eno)
    private enosRepository: Repository<Eno>,
    @InjectRepository(Pole)
    private polesRepository: Repository<Pole>,
    @InjectRepository(Filiere)
    private filieresRepository: Repository<Filiere>,
    @InjectRepository(PasswordReset)
    private resetRepository: Repository<PasswordReset>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notifications: NotificationsService,
    private mail: MailService,
    private emailTemplates: EmailTemplatesService
  ) {}

  // 🔎 Validation utilisateur avec logs détaillés
  async validateUser(
    identifier: string,
    password: string
  ): Promise<User | null> {
    console.log("🔍 validateUser - Début avec:", {
      identifier,
      hasPassword: !!password,
    });

    try {
      const raw = identifier?.toString() ?? "";
      const normalized = raw.trim();
      const isEmail = normalized.includes("@");
      const lookup = isEmail
        ? { email: normalized.toLowerCase() }
        : { telephone: normalized };

      const user = await this.usersRepository.findOne({ where: lookup });

      console.log("📊 Résultat de la recherche utilisateur:", {
        userFound: !!user,
        userId: user?.id,
        userEmail: user?.email,
        userStatus: user?.status,
        hasStoredPassword: !!user?.password,
        storedPasswordLength: user?.password?.length,
      });

      if (!user) {
        console.log("❌ Aucun utilisateur trouvé avec cet identifier");
        return null;
      }

      console.log("🔐 Validation du mot de passe...");
      const isPasswordValid = await user.validatePassword(password);

      console.log("🔐 Résultat de la validation du mot de passe:", {
        isValid: isPasswordValid,
        inputPasswordLength: password?.length,
      });

      if (!isPasswordValid) {
        console.log("❌ Mot de passe invalide");
        return null;
      }

      console.log("✅ Utilisateur et mot de passe validés");
      return user;
    } catch (error) {
      console.error("❌ Erreur dans validateUser:", error);
      return null;
    }
  }

  // 📝 Inscription SANS auto-connexion
  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    console.log("🔄 AuthService.register - Début");

    const {
      nom,
      prenom,
      email,
      password,
      confirmer_mot_de_passe,
      telephone,
      adresse,
      ville,
      universite,
      eno_rattachement,
      filiere,
      annee_promotion,
      niveau,
      motivation,
      enoId,
      poleId,
      filiereId,
    } = registerDto;

    if (!enoId || !poleId || !filiereId) {
      throw new BadRequestException(
        "Les champs ENO, Pôle et Filière sont requis"
      );
    }

    if (password !== confirmer_mot_de_passe) {
      console.log("❌ Mots de passe ne correspondent pas");
      throw new BadRequestException("Les mots de passe ne correspondent pas");
    }

    try {
      if (!isStrongPassword(password)) {
        const s = computePasswordStrength(password || "");
        throw new BadRequestException(
          `Mot de passe trop faible (score ${s.score}/100). Exigez au moins 8 caractères avec majuscules, minuscules, chiffres${s.hasSymbol ? "" : ", idéalement des symboles"}.`
        );
      }

      const existingUserByEmail = await this.usersRepository.findOne({
        where: { email },
      });

      if (existingUserByEmail) {
        console.log("❌ Email déjà utilisé");
        throw new ConflictException("Cet email est déjà utilisé");
      }

      const existingUserByPhone = await this.usersRepository.findOne({
        where: { telephone },
      });

      if (existingUserByPhone) {
        console.log("❌ Téléphone déjà utilisé");
        throw new ConflictException("Ce numéro de téléphone est déjà utilisé");
      }

      let enoRecord: Eno | null = null;
      let poleRecord: Pole | null = null;
      let filiereRecord: Filiere | null = null;

      if (enoId)
        enoRecord = await this.enosRepository.findOne({ where: { id: enoId } });
      if (poleId)
        poleRecord = await this.polesRepository.findOne({
          where: { id: poleId },
        });
      if (filiereId)
        filiereRecord = await this.filieresRepository.findOne({
          where: { id: filiereId },
        });

      if (
        filiereRecord &&
        poleRecord &&
        filiereRecord.poleId !== poleRecord.id
      ) {
        throw new BadRequestException(
          "La filière sélectionnée n'appartient pas au pôle choisi"
        );
      }

      console.log("🔄 Création utilisateur...");
      const user = this.usersRepository.create({
        nom,
        prenom,
        email,
        password,
        telephone,
        adresse,
        ville,
        universite: "Université Numérique Cheikh Hamidou Kane",
        eno_rattachement: enoRecord?.name || eno_rattachement,
        filiere: filiereRecord?.name || filiere,
        annee_promotion,
        niveau,
        motivation,
        enoId: enoRecord?.id,
        poleId: poleRecord?.id,
        filiereId: filiereRecord?.id,
        role: UserRole.MEMBER,
        status: UserStatus.PENDING, // Status EN ATTENTE
        isActive: true,
        date_inscription: new Date(),
      });

      const savedUser = await this.usersRepository.save(user);
      console.log("✅ Utilisateur créé avec ID:", savedUser.id);
      console.log("📋 Status de l'utilisateur:", savedUser.status);

      // Notifier les admins
      const admins = await this.usersRepository.find({
        where: { role: UserRole.ADMIN },
      });
      const adminEmails = admins.map((a) => a.email).filter(Boolean);

      // Créer les notifications immédiates
      await Promise.all(
        admins.map((a) =>
          this.notifications.create({
            userId: a.id,
            title: "Nouvelle inscription en attente",
            message: `${savedUser.nom} ${savedUser.prenom} a créé un compte. Statut: EN ATTENTE`,
            type: NotificationType.INFO,
            priority: NotificationPriority.HIGH,
          })
        )
      );

      // Envoi d'email en arrière-plan (non-bloquant)
      if (adminEmails.length) {
        const adminTemplate = this.emailTemplates.getAdminNewRegistrationEmail(
          `${savedUser.nom} ${savedUser.prenom}`,
          savedUser.email
        );
        this.mail.send(adminEmails, adminTemplate.subject, adminTemplate.text, adminTemplate.html)
          .then((emailResult) => {
            console.log('✅ Email de nouvelle inscription envoyé aux admins:', emailResult);
          }).catch((e) => {
            console.error('❌ Erreur lors de l\'envoi de l\'email de nouvelle inscription aux admins:', e);
          });
      }

      // Envoi d'email de bienvenue à l'utilisateur (non-bloquant)
      const fullName = `${savedUser.nom} ${savedUser.prenom}`;
      const welcomeTemplate = this.emailTemplates.getNewRegistrationEmail(fullName);

      this.mail.send(savedUser.email, welcomeTemplate.subject, welcomeTemplate.text, welcomeTemplate.html)
        .then((emailResult) => {
          console.log('✅ Email de bienvenue envoyé à l\'utilisateur:', emailResult);
        }).catch((e) => {
          console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:', e);
        });

      // ✅ RETOUR SANS TOKEN
      return {
        message:
          "Inscription réussie ! Votre compte est en attente d'activation par un administrateur.",
        user: {
          id: savedUser.id,
          nom: savedUser.nom,
          prenom: savedUser.prenom,
          email: savedUser.email,
          status: savedUser.status,
        },
        requiresActivation: true,
      };
    } catch (error) {
      console.error("❌ Erreur register:", error);
      throw error;
    }
  }

  // 🔑 Connexion avec vérification du statut ACTIVE
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    console.log("🔄 AuthService.login - Début");
    console.log("📥 LoginDto:", {
      email: loginDto.email,
      telephone: loginDto.telephone,
      passwordLength: loginDto.password?.length,
    });

    const { email, telephone, password } = loginDto;

    if (!password) {
      throw new BadRequestException("Mot de passe requis");
    }

    const identifier = email || telephone;
    if (!identifier) {
      throw new BadRequestException("Email ou téléphone requis");
    }

    console.log("🔍 Recherche utilisateur avec:", identifier);

    const user = await this.validateUser(identifier, password);

    if (!user) {
      console.log("❌ Utilisateur non validé");
      throw new UnauthorizedException("Email ou mot de passe incorrect");
    }

    // ✅ VÉRIFICATION STRICTE DU STATUT
    if (user.status !== UserStatus.ACTIVE) {
      console.log("❌ Compte non actif, status:", user.status);

      if (user.status === UserStatus.PENDING) {
        throw new UnauthorizedException(
          "Votre compte n'est pas encore activé par un administrateur. Veuillez patienter."
        );
      }
      if (user.status === UserStatus.SUSPENDED) {
        throw new UnauthorizedException(
          "Votre compte est suspendu. Contactez l'administrateur."
        );
      }
      if (user.status === UserStatus.INACTIVE) {
        throw new UnauthorizedException(
          "Votre compte est désactivé. Contactez l'administrateur."
        );
      }

      throw new UnauthorizedException(
        "Votre compte n'est pas actif. Contactez l'administrateur."
      );
    }

    console.log("✅ Utilisateur validé et autorisé à se connecter");

    // Mettre à jour la dernière connexion
    user.lastLoginAt = new Date();
    await this.usersRepository.save(user);

    const tokens = await this.generateTokens(user);

    return {
      user,
      access_token: tokens.access_token,
      token: tokens.access_token,
      refreshToken: tokens.refresh_token,
      message: "Connexion réussie",
      requiresActivation: false,
    };
  }

  // 👤 Récupération du profil
  async getProfile(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    return user;
  }

  // ✏️ Mise à jour du profil avec validation d'unicité
  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto
  ): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    // Vérifier l'unicité de l'email si modifié
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUserByEmail = await this.usersRepository.findOne({
        where: { email: updateProfileDto.email },
      });

      if (existingUserByEmail) {
        throw new ConflictException("Cet email est déjà utilisé");
      }
    }

    // Vérifier l'unicité du téléphone si modifié
    if (
      updateProfileDto.telephone &&
      updateProfileDto.telephone !== user.telephone
    ) {
      const existingUserByPhone = await this.usersRepository.findOne({
        where: { telephone: updateProfileDto.telephone },
      });

      if (existingUserByPhone) {
        throw new ConflictException("Ce numéro de téléphone est déjà utilisé");
      }
    }

    if (typeof updateProfileDto.universite !== "undefined") {
      delete (updateProfileDto as any).universite;
    }

    // Mettre à jour les champs autorisés
    Object.assign(user, updateProfileDto);

    return await this.usersRepository.save(user);
  }

  // 🔑 Changement de mot de passe
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    const { oldPassword, newPassword, confirmNewPassword } = changePasswordDto;

    // Vérifier la confirmation du nouveau mot de passe si fournie
    if (
      typeof confirmNewPassword !== "undefined" &&
      newPassword !== confirmNewPassword
    ) {
      throw new BadRequestException(
        "Les nouveaux mots de passe ne correspondent pas"
      );
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    const isOldPasswordValid = await user.validatePassword(oldPassword);

    if (!isOldPasswordValid) {
      throw new UnauthorizedException("Ancien mot de passe incorrect");
    }

    if (!isStrongPassword(newPassword)) {
      const s = computePasswordStrength(newPassword || "");
      throw new BadRequestException(
        `Mot de passe trop faible (score ${s.score}/100). Exigez au moins 8 caractères avec majuscules, minuscules, chiffres.`
      );
    }

    user.password = newPassword;
    await this.usersRepository.save(user);
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      return {
        message:
          "Si cet email existe, un lien de réinitialisation a été envoyé",
      };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const ttlMinutes = 15;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    const reset = this.resetRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });
    await this.resetRepository.save(reset);

    const frontendUrl = this.configService.get<string>("frontend.url");
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const fullName = user.nom && user.prenom ? `${user.nom} ${user.prenom}` : (user.nom || user.email);
    const template = this.emailTemplates.getPasswordResetEmail(
      fullName,
      resetUrl,
      ttlMinutes
    );

    this.mail
      .send(user.email, template.subject, template.text, template.html)
      .then((result) => {
        console.log(`✅ Email de réinitialisation envoyé à ${user.email}`, result);
      })
      .catch((error) => {
        console.error(`❌ Erreur lors de l'envoi de l'email de réinitialisation à ${user.email}:`, error);
      });

    return {
      message: "Si cet email existe, un lien de réinitialisation a été envoyé",
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto
  ): Promise<{ message: string }> {
    const { token, newPassword, confirmNewPassword } = resetPasswordDto;

    if (
      typeof confirmNewPassword !== "undefined" &&
      newPassword !== confirmNewPassword
    ) {
      throw new BadRequestException("Les mots de passe ne correspondent pas");
    }

    if (!isStrongPassword(newPassword)) {
      const s = computePasswordStrength(newPassword || "");
      throw new BadRequestException(
        `Mot de passe trop faible (score ${s.score}/100).`
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const pr = await this.resetRepository.findOne({ where: { tokenHash } });

    if (!pr || pr.usedAt || pr.expiresAt < new Date()) {
      throw new BadRequestException(
        "Token de réinitialisation invalide ou expiré"
      );
    }

    const user = await this.usersRepository.findOne({
      where: { id: pr.userId },
    });
    if (!user) throw new NotFoundException("Utilisateur introuvable");

    user.password = newPassword;
    await this.usersRepository.save(user);

    pr.usedAt = new Date();
    await this.resetRepository.save(pr);

    return { message: "Mot de passe réinitialisé avec succès" };
  }

  // 🔁 Rafraîchissement des tokens
  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>("jwt.refreshSecret"),
      });

      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException("Token invalide");
      }

      const tokens = await this.generateTokens(user);

      return {
        access_token: tokens.access_token,
      };
    } catch (error) {
      throw new UnauthorizedException("Token de rafraîchissement invalide");
    }
  }

  // 📧 Test d'envoi d'email
  async testEmail(
    to: string,
    subject?: string,
    message?: string
  ): Promise<{ success: boolean; message: string; details?: any }> {
    const emailSubject = subject || "Email de test - AEM UNCHK";
    const emailText =
      message ||
      "Ceci est un email de test pour vérifier la configuration SMTP.";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Email de Test</h2>
        <p>${emailText}</p>
        <hr/>
        <p style="color: #666; font-size: 12px;">
          Cet email a été envoyé depuis le système AEM UNCHK pour tester la configuration SMTP.
        </p>
      </div>
    `;

    const result = await this.mail.send(to, emailSubject, emailText, emailHtml);

    if (result.sent) {
      return {
        success: true,
        message: `Email de test envoyé avec succès à ${to}`,
        details: { messageId: result.id },
      };
    } else {
      return {
        success: false,
        message: `Échec de l'envoi de l'email de test`,
        details: { error: result.error },
      };
    }
  }

  // 📧 Test de tous les templates d'email
  async testAllEmailTemplates(to: string): Promise<{
    success: boolean;
    message: string;
    results: {
      welcomeEmail: any;
      activationEmail: any;
      statusChangeEmail: any;
      roleChangeEmail: any;
      passwordResetEmail: any;
    };
  }> {
    console.log(`🧪 [testAllEmailTemplates] Starting comprehensive email template test for: ${to}`);

    const results = {
      welcomeEmail: null,
      activationEmail: null,
      statusChangeEmail: null,
      roleChangeEmail: null,
      passwordResetEmail: null,
    };

    try {
      // Test 1: Email de bienvenue (inscription)
      console.log('📧 Test 1/5: Email de bienvenue...');
      const welcomeTemplate = this.emailTemplates.getNewRegistrationEmail('Test User');
      results.welcomeEmail = await this.mail.send(to, welcomeTemplate.subject, welcomeTemplate.text, welcomeTemplate.html);

      // Attendre un peu entre chaque email pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test 2: Email d'activation de compte
      console.log('📧 Test 2/5: Email d\'activation de compte...');
      const activationTemplate = this.emailTemplates.getAccountActivatedEmail('Test User');
      results.activationEmail = await this.mail.send(to, activationTemplate.subject, activationTemplate.text, activationTemplate.html);

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test 3: Email de changement de statut
      console.log('📧 Test 3/5: Email de changement de statut...');
      const statusTemplate = this.emailTemplates.getStatusChangedEmail('Test User', 'PENDING' as any, 'SUSPENDED' as any);
      results.statusChangeEmail = await this.mail.send(to, statusTemplate.subject, statusTemplate.text, statusTemplate.html);

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test 4: Email de changement de rôle
      console.log('📧 Test 4/5: Email de changement de rôle...');
      const roleTemplate = this.emailTemplates.getRoleChangedEmail('Test User', 'MEMBER' as any, 'ADMIN' as any);
      results.roleChangeEmail = await this.mail.send(to, roleTemplate.subject, roleTemplate.text, roleTemplate.html);

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test 5: Email de réinitialisation de mot de passe
      console.log('📧 Test 5/5: Email de réinitialisation de mot de passe...');
      const resetTemplate = this.emailTemplates.getPasswordResetEmail('Test User', 'https://aem-unchk-connect.vercel.app/reset-password?token=test-token-123456', 15);
      results.passwordResetEmail = await this.mail.send(to, resetTemplate.subject, resetTemplate.text, resetTemplate.html);

      // Compter les succès
      const successCount = Object.values(results).filter((r: any) => r?.sent === true).length;
      const totalTests = 5;

      console.log(`✅ [testAllEmailTemplates] Tests terminés: ${successCount}/${totalTests} réussis`);

      return {
        success: successCount === totalTests,
        message: `${successCount}/${totalTests} emails de test envoyés avec succès à ${to}`,
        results,
      };
    } catch (error) {
      console.error('❌ [testAllEmailTemplates] Erreur lors des tests:', error);
      return {
        success: false,
        message: `Erreur lors de l'envoi des emails de test: ${error.message}`,
        results,
      };
    }
  }

  // 🔑 Génération des tokens avec logs détaillés
  private async generateTokens(user: User): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    console.log("🔑 Génération des tokens pour utilisateur:", user.id);

    const payload: Omit<JwtPayload, "iat" | "exp"> = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    console.log("📝 Payload JWT:", payload);

    // Vérifier la configuration
    const jwtSecret = this.configService.get<string>("jwt.secret");
    const jwtRefreshSecret =
      this.configService.get<string>("jwt.refreshSecret");
    const jwtExpiresIn = this.configService.get<string>("jwt.expiresIn");
    const jwtRefreshExpiresIn = this.configService.get<string>(
      "jwt.refreshExpiresIn"
    );

    console.log("🔧 Configuration JWT:", {
      hasSecret: !!jwtSecret,
      hasRefreshSecret: !!jwtRefreshSecret,
      expiresIn: jwtExpiresIn,
      refreshExpiresIn: jwtRefreshExpiresIn,
    });

    if (!jwtSecret) {
      console.error("❌ JWT_SECRET manquant dans la configuration");
      throw new Error("Configuration JWT manquante");
    }

    try {
      console.log("🔄 Signature des tokens...");

      const [access_token, refresh_token] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: jwtSecret,
          expiresIn: jwtExpiresIn || "1h",
        }),
        this.jwtService.signAsync(payload, {
          secret: jwtRefreshSecret || jwtSecret, // Fallback sur le secret principal
          expiresIn: jwtRefreshExpiresIn || "7d",
        }),
      ]);

      console.log("✅ Tokens générés avec succès:", {
        access_token_length: access_token?.length,
        refresh_token_length: refresh_token?.length,
      });

      return {
        access_token,
        refresh_token,
      };
    } catch (error) {
      console.error("❌ Erreur lors de la génération des tokens:", error);
      throw new Error(`Échec de génération des tokens: ${error.message}`);
    }
  }
}
