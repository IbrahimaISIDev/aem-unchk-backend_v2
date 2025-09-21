import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Eno } from './entities/eno.entity';
import { Pole } from './entities/pole.entity';
import { Filiere } from './entities/filiere.entity';
import { CreateEnoDto } from './dto/create-eno.dto';
import { UpdateEnoDto } from './dto/update-eno.dto';
import { CreatePoleDto } from './dto/create-pole.dto';
import { UpdatePoleDto } from './dto/update-pole.dto';
import { CreateFiliereDto } from './dto/create-filiere.dto';
import { UpdateFiliereDto } from './dto/update-filiere.dto';

@Injectable()
export class AcademicsService {
  constructor(
    @InjectRepository(Eno) private enos: Repository<Eno>,
    @InjectRepository(Pole) private poles: Repository<Pole>,
    @InjectRepository(Filiere) private filieres: Repository<Filiere>,
  ) {}

  async listEnos() {
    return this.enos.find({ order: { name: 'ASC' } });
  }

  async createEno(dto: CreateEnoDto) {
    const code = dto.code || this.slug(dto.name);
    const eno = this.enos.create({ ...dto, code });
    return this.enos.save(eno);
  }

  async updateEno(id: string, dto: UpdateEnoDto) {
    const eno = await this.enos.findOne({ where: { id } });
    if (!eno) throw new NotFoundException('ENO introuvable');
    if (dto.name && !dto.code) eno.code = this.slug(dto.name);
    Object.assign(eno, dto);
    return this.enos.save(eno);
  }

  async deleteEno(id: string) {
    const eno = await this.enos.findOne({ where: { id } });
    if (!eno) throw new NotFoundException('ENO introuvable');
    await this.enos.remove(eno);
  }

  async listPoles() {
    return this.poles.find({ order: { name: 'ASC' } });
  }

  async createPole(dto: CreatePoleDto) {
    const code = dto.code || this.slug(dto.name).toUpperCase().slice(0, 10);
    const pole = this.poles.create({ ...dto, code });
    return this.poles.save(pole);
  }

  async updatePole(id: string, dto: UpdatePoleDto) {
    const pole = await this.poles.findOne({ where: { id } });
    if (!pole) throw new NotFoundException('Pôle introuvable');
    if (dto.name && !dto.code) pole.code = this.slug(dto.name).toUpperCase().slice(0, 10);
    Object.assign(pole, dto);
    return this.poles.save(pole);
  }

  async deletePole(id: string) {
    const pole = await this.poles.findOne({ where: { id } });
    if (!pole) throw new NotFoundException('Pôle introuvable');
    await this.poles.remove(pole);
  }

  async listFilieres(poleId?: string) {
    if (poleId) return this.filieres.find({ where: { poleId }, order: { name: 'ASC' } });
    return this.filieres.find({ order: { name: 'ASC' } });
  }

  async createFiliere(dto: CreateFiliereDto) {
    const code = dto.code || this.slug(dto.name).toUpperCase().slice(0, 10);
    const filiere = this.filieres.create({ ...dto, code });
    return this.filieres.save(filiere);
  }

  async updateFiliere(id: string, dto: UpdateFiliereDto) {
    const filiere = await this.filieres.findOne({ where: { id } });
    if (!filiere) throw new NotFoundException('Filière introuvable');
    if (dto.name && !dto.code) filiere.code = this.slug(dto.name).toUpperCase().slice(0, 10);
    Object.assign(filiere, dto);
    return this.filieres.save(filiere);
  }

  async deleteFiliere(id: string) {
    const filiere = await this.filieres.findOne({ where: { id } });
    if (!filiere) throw new NotFoundException('Filière introuvable');
    await this.filieres.remove(filiere);
  }

  async getCatalog() {
    const poles = await this.poles.find();
    const filieres = await this.filieres.find();
    return poles.map((p) => ({ ...p, filieres: filieres.filter((f) => f.poleId === p.id) }));
  }

  async seed() {
    const enoCount = await this.enos.count();
    if (enoCount === 0) {
      const enoNames = [
        'Dakar','Guédiawaye','Pikine','Keur Massar','Kaolack','Thiès','Louga','Ndioum','Podor','Saint-Louis','Diourbel','Bignona','Ziguinchor','Kolda','Sébikotane','Linguère'
      ];
      const enos = enoNames.map((name) => this.enos.create({ name, code: this.slug(name).toUpperCase() }));
      await this.enos.save(enos);
    }
    const poleCount = await this.poles.count();
    if (poleCount === 0) {
      const polesData = [
        { name: "Pôle Lettres, Sciences Humaines et de l'Education", code: 'PLSHE' },
        { name: 'Pôle Sciences, Technologies et Numérique', code: 'PSTN' },
        { name: "Pôle Sciences Economiques, Juridiques et de l'Administration", code: 'PSEJA' },
      ];
      const poles = await this.poles.save(polesData.map((p) => this.poles.create(p)));
      const map: Record<string, string[]> = {
        PLSHE: ['Anglais','Sciences de l\'Éducation','Sociologie'],
        PSTN: [
          'Arts graphiques et numériques','Communication digitale','Informatique Développement d\'Applications',
          'Mathématiques appliquées et informatique','Multimédia internet et communication digitale',
          'Modélisation mathématique analyse et simulation numériques','Sciences Informatiques et Mathématiques de la Cybersécurité',
          'Génétique moléculaire et bio-informatique','Robotique','Big data Analytics','Cybersécurité','Intelligence artificielle','Ingénierie logicielle'
        ],
        PSEJA: [
          'Sciences économiques et de gestion','Science politique','Sciences juridiques','Administration Économique et Sociale',
          'Droit et Informatique – Legal Tech','Capacité en Droit'
        ],
      };
      const filieresToCreate: Filiere[] = [] as any;
      for (const pole of poles) {
        const items = map[pole.code] || [];
        for (const name of items) {
          const code = this.slug(this.acronym(name)).toUpperCase();
          filieresToCreate.push(this.filieres.create({ name, code, poleId: pole.id }));
        }
      }
      if (filieresToCreate.length) await this.filieres.save(filieresToCreate);
    }
  }

  private slug(input: string) {
    return input
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  private acronym(input: string) {
    const specials: Record<string, string> = {
      'Informatique Développement d\'Applications': 'IDA',
      'Mathématiques appliquées et informatique': 'MAI',
      'Multimédia internet et communication digitale': 'MIC',
      'Modélisation mathématique analyse et simulation numériques': 'MMASN',
      'Sciences Informatiques et Mathématiques de la Cybersécurité': 'SIMAC',
      'Big data Analytics': 'BDA',
      'Intelligence artificielle': 'MIA',
      'Ingénierie logicielle': 'MIL',
      'Sciences économiques et de gestion': 'SEG',
      'Sciences juridiques': 'SJ',
      'Administration Économique et Sociale': 'AES',
      'Capacité en Droit': 'CD',
      'Anglais': 'ANG',
      'Sciences de l\'Éducation': 'SCE',
      'Sociologie': 'SOC',
      'Communication digitale': 'CDIG',
      'Robotique': 'ROB',
      'Génétique moléculaire et bio-informatique': 'GNB',
      'Science politique': 'SP',
      'Droit et Informatique – Legal Tech': 'LEGALTECH',
      'Cybersécurité': 'CS',
      'Arts graphiques et numériques': 'AGN',
    };
    return specials[input] || input.split(/\s+/).map((w) => w[0]).join('');
  }
}
