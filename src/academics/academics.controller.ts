import { Controller, Get, Query, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AcademicsService } from './academics.service';
import { CreateEnoDto } from './dto/create-eno.dto';
import { UpdateEnoDto } from './dto/update-eno.dto';
import { CreatePoleDto } from './dto/create-pole.dto';
import { UpdatePoleDto } from './dto/update-pole.dto';
import { CreateFiliereDto } from './dto/create-filiere.dto';
import { UpdateFiliereDto } from './dto/update-filiere.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Academics')
@Controller('academics')
export class AcademicsController {
  constructor(private readonly service: AcademicsService) {}

  @Public()
  @Get('enos')
  listEnos() {
    return this.service.listEnos();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SEC_GENERAL, UserRole.TECH_MANAGER, UserRole.PEDAGOGIC_MANAGER)
  @Post('enos')
  createEno(@Body() dto: CreateEnoDto) {
    return this.service.createEno(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SEC_GENERAL, UserRole.TECH_MANAGER, UserRole.PEDAGOGIC_MANAGER)
  @Patch('enos/:id')
  updateEno(@Param('id') id: string, @Body() dto: UpdateEnoDto) {
    return this.service.updateEno(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SEC_GENERAL, UserRole.TECH_MANAGER, UserRole.PEDAGOGIC_MANAGER)
  @Delete('enos/:id')
  deleteEno(@Param('id') id: string) {
    return this.service.deleteEno(id);
  }

  @Public()
  @Get('poles')
  listPoles() {
    return this.service.listPoles();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SEC_GENERAL, UserRole.TECH_MANAGER, UserRole.PEDAGOGIC_MANAGER)
  @Post('poles')
  createPole(@Body() dto: CreatePoleDto) {
    return this.service.createPole(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SEC_GENERAL, UserRole.TECH_MANAGER, UserRole.PEDAGOGIC_MANAGER)
  @Patch('poles/:id')
  updatePole(@Param('id') id: string, @Body() dto: UpdatePoleDto) {
    return this.service.updatePole(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SEC_GENERAL, UserRole.TECH_MANAGER, UserRole.PEDAGOGIC_MANAGER)
  @Delete('poles/:id')
  deletePole(@Param('id') id: string) {
    return this.service.deletePole(id);
  }

  @Public()
  @Get('filieres')
  listFilieres(@Query('poleId') poleId?: string) {
    return this.service.listFilieres(poleId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SEC_GENERAL, UserRole.TECH_MANAGER, UserRole.PEDAGOGIC_MANAGER)
  @Post('filieres')
  createFiliere(@Body() dto: CreateFiliereDto) {
    return this.service.createFiliere(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SEC_GENERAL, UserRole.TECH_MANAGER, UserRole.PEDAGOGIC_MANAGER)
  @Patch('filieres/:id')
  updateFiliere(@Param('id') id: string, @Body() dto: UpdateFiliereDto) {
    return this.service.updateFiliere(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SEC_GENERAL, UserRole.TECH_MANAGER, UserRole.PEDAGOGIC_MANAGER)
  @Delete('filieres/:id')
  deleteFiliere(@Param('id') id: string) {
    return this.service.deleteFiliere(id);
  }

  @Public()
  @Get('catalog')
  getCatalog() {
    return this.service.getCatalog();
  }
}
