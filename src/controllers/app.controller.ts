import { Controller, Get, Param } from '@nestjs/common';
import { Administrator } from '../entities/administrator.entity';
import { AdministratorService } from '../dtos/administrator/administrator.service';

@Controller()
export class AppController {
  constructor(
    private administratorService: AdministratorService
  ) { }
}