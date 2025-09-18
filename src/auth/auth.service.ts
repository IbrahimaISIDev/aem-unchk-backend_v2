// src/auth/auth.service.ts - VERSION FUSIONNÉE
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // 🔎 Validation utilisateur avec logs détaillés
  async validateUser(identifier: string, password: string): Promise<User | null> {
    console.log('🔍 validateUser - Début avec:', {
      identifier,
      hasPassword: !!password,
    });

    try {
      const raw = identifier?.toString() ?? '';
      const normalized = raw.trim();
      const isEmail = normalized.includes('@');
      const lookup = isEmail
        ? { email: normalized.toLowerCase() }
        : { telephone: normalized };

      const user = await this.usersRepository.findOne({ where: lookup });

      console.log('📊 Résultat de la recherche utilisateur:', {
        userFound: !!user,
        userId: user?.id,
        userEmail: user?.email,
        userStatus: user?.status,
        hasStoredPassword: !!user?.password,
        storedPasswordLength: user?.password?.length,
      });

      if (!user) {
        console.log('❌ Aucun utilisateur trouvé avec cet identifier');
        return null;
      }

      console.log('🔐 Validation du mot de passe...');
      const isPasswordValid = await user.validatePassword(password);

      console.log('🔐 Résultat de la validation du mot de passe:', {
        isValid: isPasswordValid,
        inputPasswordLength: password?.length,
      });

      if (!isPasswordValid) {
        console.log('❌ Mot de passe invalide');
        return null;
      }

      console.log('✅ Utilisateur et mot de passe validés');
      return user;
    } catch (error) {
      console.error('❌ Erreur dans validateUser:', error);
      return null;
    }
  }

  // 📝 Inscription avec validation complète
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    console.log('🔄 AuthService.register - Début');
    console.log('📥 RegisterDto:', {
      email: registerDto.email,
      passwordLength: registerDto.password?.length,
      confirmPasswordLength: registerDto.confirmer_mot_de_passe?.length,
      passwordsMatch: registerDto.password === registerDto.confirmer_mot_de_passe,
    });

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
    } = registerDto;

    // Vérifier que les mots de passe correspondent
    if (password !== confirmer_mot_de_passe) {
      console.log('❌ Mots de passe ne correspondent pas');
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    try {
      // Vérifier l'unicité de l'email
      const existingUserByEmail = await this.usersRepository.findOne({
        where: { email },
      });

      if (existingUserByEmail) {
        console.log('❌ Email déjà utilisé');
        throw new ConflictException('Cet email est déjà utilisé');
      }

      // Vérifier l'unicité du téléphone
      const existingUserByPhone = await this.usersRepository.findOne({
        where: { telephone },
      });

      if (existingUserByPhone) {
        console.log('❌ Téléphone déjà utilisé');
        throw new ConflictException('Ce numéro de téléphone est déjà utilisé');
      }

      // Créer le nouvel utilisateur
      console.log('🔄 Création utilisateur...');
      const user = this.usersRepository.create({
        nom,
        prenom,
        email,
        password, // Sera haché automatiquement par @BeforeInsert
        telephone,
        adresse,
        ville,
        universite,
        eno_rattachement,
        filiere,
        annee_promotion,
        niveau,
        motivation,
        role: UserRole.MEMBER, // Par défaut MEMBER
        status: UserStatus.PENDING, // En attente par défaut
        isActive: true,
        date_inscription: new Date(),
      });

      const savedUser = await this.usersRepository.save(user);
      console.log('✅ Utilisateur créé avec ID:', savedUser.id);

      // Générer les tokens
      const tokens = await this.generateTokens(savedUser);

      return {
        user: savedUser,
        access_token: tokens.access_token,
        token: tokens.access_token,
        refreshToken: tokens.refresh_token,
      };
    } catch (error) {
      console.error('❌ Erreur register:', error);
      throw error;
    }
  }

  // 🔑 Connexion avec logs détaillés
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    console.log('🔄 AuthService.login - Début');
    console.log('📥 LoginDto:', {
      email: loginDto.email,
      telephone: loginDto.telephone,
      passwordLength: loginDto.password?.length,
    });

    const { email, telephone, password } = loginDto;

    if (!password) {
      throw new BadRequestException('Mot de passe requis');
    }

    const identifier = email || telephone;
    if (!identifier) {
      throw new BadRequestException('Email ou téléphone requis');
    }

    console.log('🔍 Recherche utilisateur avec:', identifier);

    const user = await this.validateUser(identifier, password);

    if (!user) {
      console.log('❌ Utilisateur non validé');
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (user.status !== UserStatus.ACTIVE) {
      console.log('❌ Compte non actif, status:', user.status);
      throw new UnauthorizedException('Compte non activé');
    }

    console.log('✅ Utilisateur validé');

    // Mettre à jour la dernière connexion
    user.lastLoginAt = new Date();
    await this.usersRepository.save(user);

    const tokens = await this.generateTokens(user);

    return {
      user,
      access_token: tokens.access_token,
      token: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };
  }

  // 👤 Récupération du profil
  async getProfile(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return user;
  }

  // ✏️ Mise à jour du profil avec validation d'unicité
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Vérifier l'unicité de l'email si modifié
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUserByEmail = await this.usersRepository.findOne({
        where: { email: updateProfileDto.email },
      });

      if (existingUserByEmail) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
    }

    // Vérifier l'unicité du téléphone si modifié
    if (updateProfileDto.telephone && updateProfileDto.telephone !== user.telephone) {
      const existingUserByPhone = await this.usersRepository.findOne({
        where: { telephone: updateProfileDto.telephone },
      });

      if (existingUserByPhone) {
        throw new ConflictException('Ce numéro de téléphone est déjà utilisé');
      }
    }

    // Mettre à jour les champs autorisés
    Object.assign(user, updateProfileDto);

    return await this.usersRepository.save(user);
  }

  // 🔑 Changement de mot de passe
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { oldPassword, newPassword, confirmNewPassword } = changePasswordDto;

    // Vérifier la confirmation du nouveau mot de passe si fournie
    if (typeof confirmNewPassword !== 'undefined' && newPassword !== confirmNewPassword) {
      throw new BadRequestException('Les nouveaux mots de passe ne correspondent pas');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const isOldPasswordValid = await user.validatePassword(oldPassword);

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Ancien mot de passe incorrect');
    }

    user.password = newPassword;
    await this.usersRepository.save(user);
  }

  // 📩 Mot de passe oublié (placeholder sécurisé)
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
      return {
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      };
    }

    // TODO: Implémenter l'envoi d'email avec token de réinitialisation
    // Pour l'instant, retourner un message de succès

    return {
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
    };
  }

  // 🔄 Réinitialisation de mot de passe (placeholder)
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword, confirmNewPassword } = resetPasswordDto;

    if (typeof confirmNewPassword !== 'undefined' && newPassword !== confirmNewPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    // TODO: Implémenter la validation du token de réinitialisation
    // Pour l'instant, retourner un message d'erreur

    throw new BadRequestException('Token de réinitialisation invalide ou expiré');
  }

  // 🔁 Rafraîchissement des tokens
  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Token invalide');
      }

      const tokens = await this.generateTokens(user);

      return {
        access_token: tokens.access_token,
      };
    } catch (error) {
      throw new UnauthorizedException('Token de rafraîchissement invalide');
    }
  }

  // 🔑 Génération des tokens avec logs détaillés
  private async generateTokens(user: User): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    console.log('🔑 Génération des tokens pour utilisateur:', user.id);

    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    console.log('📝 Payload JWT:', payload);

    // Vérifier la configuration
    const jwtSecret = this.configService.get<string>('jwt.secret');
    const jwtRefreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const jwtExpiresIn = this.configService.get<string>('jwt.expiresIn');
    const jwtRefreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn');

    console.log('🔧 Configuration JWT:', {
      hasSecret: !!jwtSecret,
      hasRefreshSecret: !!jwtRefreshSecret,
      expiresIn: jwtExpiresIn,
      refreshExpiresIn: jwtRefreshExpiresIn,
    });

    if (!jwtSecret) {
      console.error('❌ JWT_SECRET manquant dans la configuration');
      throw new Error('Configuration JWT manquante');
    }

    try {
      console.log('🔄 Signature des tokens...');

      const [access_token, refresh_token] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: jwtSecret,
          expiresIn: jwtExpiresIn || '1h',
        }),
        this.jwtService.signAsync(payload, {
          secret: jwtRefreshSecret || jwtSecret, // Fallback sur le secret principal
          expiresIn: jwtRefreshExpiresIn || '7d',
        }),
      ]);

      console.log('✅ Tokens générés avec succès:', {
        access_token_length: access_token?.length,
        refresh_token_length: refresh_token?.length,
      });

      return {
        access_token,
        refresh_token,
      };
    } catch (error) {
      console.error('❌ Erreur lors de la génération des tokens:', error);
      throw new Error(`Échec de génération des tokens: ${error.message}`);
    }
  }
}