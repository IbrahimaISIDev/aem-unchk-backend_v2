// src/auth/auth.controller.ts - VERSION CORRIGÉE
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Put,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService, RegisterResponseDto } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 🔑 Connexion
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion utilisateur',
    description: 'Authentifie un utilisateur avec email/téléphone et mot de passe. Seuls les comptes ACTIFS peuvent se connecter.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Identifiants de connexion',
  })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Identifiants invalides ou compte non activé',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string', 
          examples: [
            'Email ou mot de passe incorrect',
            'Votre compte n\'est pas encore activé par un administrateur. Veuillez patienter.',
            'Votre compte est suspendu. Contactez l\'administrateur.'
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 429,
    description: 'Trop de tentatives de connexion',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    console.log('🔄 AuthController.login - Début');
    
    try {
      const result = await this.authService.login(loginDto);
      
      console.log('✅ AuthService.login terminé avec succès');
      console.log('📤 DEBUG - Réponse complète à retourner:', JSON.stringify(result, null, 2));
      console.log('📤 DEBUG - Structure de la réponse:', {
        has_user: !!result.user,
        has_access_token: !!result.access_token,
        has_token: !!result.token,
        has_refreshToken: !!result.refreshToken,
        access_token_length: result.access_token?.length,
        token_length: result.token?.length,
        user_id: result.user?.id,
        user_email: result.user?.email,
        user_status: result.user?.status,
      });

      return result;
    } catch (error) {
      console.error('❌ Erreur dans AuthController.login:', error);
      throw error;
    }
  }

  // 📝 Inscription SANS auto-connexion
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Inscription utilisateur',
    description: 'Crée un nouveau compte utilisateur en statut PENDING. L\'utilisateur ne peut pas se connecter tant que son compte n\'est pas activé par un administrateur.',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'Informations d\'inscription',
  })
  @ApiResponse({
    status: 201,
    description: 'Inscription réussie - Compte en attente d\'activation',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string', 
          example: 'Inscription réussie ! Votre compte est en attente d\'activation par un administrateur.' 
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nom: { type: 'string' },
            prenom: { type: 'string' },
            email: { type: 'string' },
            status: { type: 'string', enum: ['PENDING'] }
          }
        },
        requiresActivation: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Email ou téléphone déjà utilisé',
  })
  @ApiResponse({
    status: 400,
    description: 'Données d\'inscription invalides',
  })
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
    console.log('🔄 AuthController.register - Début');
    
    try {
      const result = await this.authService.register(registerDto);
      
      console.log('✅ AuthService.register terminé avec succès');
      console.log('📤 Réponse d\'inscription:', {
        message: result.message,
        user_id: result.user.id,
        user_status: result.user.status,
        requiresActivation: result.requiresActivation,
      });

      return result;
    } catch (error) {
      console.error('❌ Erreur dans AuthController.register:', error);
      throw error;
    }
  }

  // 👤 Profil
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Profil utilisateur connecté',
    description: 'Récupère le profil de l\'utilisateur connecté',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil récupéré avec succès',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: 'Token d\'authentification requis',
  })
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return this.authService.getProfile(user.id);
  }

  // ✏️ Mise à jour du profil
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Mettre à jour le profil',
    description: 'Met à jour le profil de l\'utilisateur connecté',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil mis à jour avec succès',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: 'Token d\'authentification requis',
  })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    return this.authService.updateProfile(user.id, updateProfileDto);
  }

  // 🔑 Changer mot de passe
  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Changer mot de passe',
    description: 'Change le mot de passe de l\'utilisateur connecté',
  })
  @ApiBody({
    type: ChangePasswordDto,
    description: 'Ancien et nouveau mot de passe',
  })
  @ApiResponse({
    status: 204,
    description: 'Mot de passe changé avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: 401,
    description: 'Ancien mot de passe incorrect ou token invalide',
  })
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    return this.authService.changePassword(user.id, changePasswordDto);
  }

  // 🔑 Alias POST pour changer mot de passe
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Changer mot de passe (alias POST)',
    description: 'Alias POST pour changer le mot de passe',
  })
  @ApiBody({
    type: ChangePasswordDto,
    description: 'Ancien et nouveau mot de passe',
  })
  @ApiResponse({
    status: 204,
    description: 'Mot de passe changé avec succès',
  })
  async changePasswordPost(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    return this.authService.changePassword(user.id, changePasswordDto);
  }

  // 📩 Mot de passe oublié
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Demande de réinitialisation du mot de passe',
    description: 'Envoie un email de réinitialisation de mot de passe',
  })
  @ApiBody({
    type: ForgotPasswordDto,
    description: 'Email pour la réinitialisation',
  })
  @ApiResponse({
    status: 200,
    description: 'Email de réinitialisation envoyé',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Email de réinitialisation envoyé' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Email non trouvé',
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  // 🔄 Réinitialisation
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Réinitialiser mot de passe avec token',
    description: 'Réinitialise le mot de passe avec un token de réinitialisation',
  })
  @ApiBody({
    type: ResetPasswordDto,
    description: 'Token et nouveau mot de passe',
  })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe réinitialisé avec succès',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Mot de passe réinitialisé avec succès' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Token invalide ou expiré',
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // 📊 Force mot de passe
  @Public()
  @Get('password-strength')
  @ApiOperation({ summary: "Calculer la robustesse d'un mot de passe" })
  async strength(@Query('password') password: string) {
    const { computePasswordStrength } = await import('./utils/password-strength');
    return computePasswordStrength(password || '');
  }

  // 👨‍💼 Admin: déclencher un reset par email
  @Post('admin/reset-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Déclencher un email de réinitialisation pour un utilisateur' })
  async adminReset(@Body('email') email: string) {
    return this.authService.forgotPassword({ email });
  }

  // 🔁 Refresh Token
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rafraîchir token',
    description: 'Génère un nouveau token d\'accès à partir du refresh token',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          description: 'Token de rafraîchissement',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['refreshToken'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token rafraîchi avec succès',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token invalide ou expiré',
  })
  async refresh(
    @Body('refreshToken') refreshToken: string,
  ): Promise<{ access_token: string }> {
    return this.authService.refreshToken(refreshToken);
  }

  // 🚪 Déconnexion
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Déconnexion utilisateur',
    description: 'Déconnecte l\'utilisateur (côté client uniquement)',
  })
  @ApiResponse({
    status: 200,
    description: 'Déconnexion réussie',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Déconnexion réussie' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token d\'authentification requis',
  })
  async logout(): Promise<{ message: string }> {
    // La déconnexion côté serveur pourrait impliquer l'invalidation du token
    // Pour l'instant, on laisse le client gérer la suppression du token
    return {
      message: 'Déconnexion réussie',
    };
  }

  // 📧 Test Email (Admin uniquement)
  @Post('test-email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Tester l\'envoi d\'email',
    description: 'Endpoint de test pour vérifier la configuration SMTP (Admin uniquement)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: { type: 'string', example: 'test@example.com' },
        subject: { type: 'string', example: 'Email de test' },
        message: { type: 'string', example: 'Ceci est un email de test' },
      },
      required: ['to'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Email envoyé avec succès',
  })
  async testEmail(@Body() body: { to: string; subject?: string; message?: string }) {
    return this.authService.testEmail(body.to, body.subject, body.message);
  }

  @Post('test-all-email-templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Tester tous les templates d\'email',
    description: 'Envoie un exemple de chaque type d\'email pour vérifier les templates (Admin uniquement)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: { type: 'string', example: 'test@example.com', description: 'Email destinataire pour tous les tests' },
      },
      required: ['to'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tous les emails de test ont été envoyés',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        results: {
          type: 'object',
          properties: {
            welcomeEmail: { type: 'object' },
            activationEmail: { type: 'object' },
            statusChangeEmail: { type: 'object' },
            roleChangeEmail: { type: 'object' },
            passwordResetEmail: { type: 'object' },
          },
        },
      },
    },
  })
  async testAllEmailTemplates(@Body() body: { to: string }) {
    return this.authService.testAllEmailTemplates(body.to);
  }
}