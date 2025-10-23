import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { allowedCardsForRole, adminRouteForCard } from './rbac';

@ApiTags('Authentication')
@Controller('auth')
export class MeController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Infos utilisateur courant + RBAC' })
  @ApiResponse({ status: 200, description: 'OK' })
  me(@CurrentUser() user: User) {
    const role = user.role;
    const allowedCards = allowedCardsForRole(role);
    const routes = allowedCards.map((c) => ({ card: c, route: adminRouteForCard(c) }));
    return {
      user,
      role,
      permissions: [],
      allowedCards,
      routes,
    };
  }
}