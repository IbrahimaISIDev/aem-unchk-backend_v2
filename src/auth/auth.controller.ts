// auth/auth.controller.ts - VERSION CORRIGÉE
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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    // ❌ SUPPRIMER CETTE LIGNE qui cause l'erreur :
    // private readonly usersService: UsersService,
  ) {}

  // Dans auth.controller.ts - Modifiez temporairement la méthode login
@Public()
@Post('login')
@HttpCode(HttpStatus.OK)
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
    });

    return result;
  } catch (error) {
    console.error('❌ Erreur dans AuthController.login:', error);
    throw error;
  }
}
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
    description: 'Identifiants invalides',
  })
  @ApiResponse({
    status: 429,
    description: 'Trop de tentatives de connexion',
  })
  // async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
  //   return this.authService.login(loginDto);
  // }

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Inscription utilisateur',
    description: 'Crée un nouveau compte utilisateur',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'Informations d\'inscription',
  })
  @ApiResponse({
    status: 201,
    description: 'Inscription réussie',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email ou téléphone déjà utilisé',
  })
  @ApiResponse({
    status: 400,
    description: 'Données d\'inscription invalides',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Profil utilisateur',
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
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    // ✅ CHANGEMENT : Utiliser authService au lieu de usersService
    return this.authService.updateProfile(user.id, updateProfileDto);
  }

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
    description: 'Ancien mot de passe incorrect',
  })
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    return this.authService.changePassword(user.id, changePasswordDto);
  }

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
  })
  async changePasswordPost(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    return this.authService.changePassword(user.id, changePasswordDto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mot de passe oublié',
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
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Réinitialiser mot de passe',
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
    description: 'Refresh token invalide',
  })
  async refresh(
    @Body('refreshToken') refreshToken: string,
  ): Promise<{ access_token: string }> {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Déconnexion',
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
  async logout(): Promise<{ message: string }> {
    // La déconnexion côté serveur pourrait impliquer l'invalidation du token
    // Pour l'instant, on laisse le client gérer la suppression du token
    return {
      message: 'Déconnexion réussie',
    };
  }
}