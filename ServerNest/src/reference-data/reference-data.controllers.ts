import { Controller, Delete, Get, Header, HttpCode, Post, Put, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { whereFromQuery } from '../common/query-filter';
import { Userrole } from '../database/models';
import { DepartmentsService } from './departments.service';

// GET /api/v1 and GET /api/v2: "is the server there?", same answer as the old server
@Controller('v1')
export class RootV1Controller {
  @Get()
  root(): { message: string } {
    return { message: 'Connected' };
  }
}

@Controller('v2')
export class RootV2Controller {
  @Get()
  root(): { message: string } {
    return { message: 'Connected' };
  }
}

// `res.json('No')` in the old server: a JSON string. These three routes were never implemented there; kept as they answer.
const NO = JSON.stringify('No');

@Controller('v1/departments')
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  @Get()
  all(@Query() query: Record<string, unknown>) {
    return this.service.list(query);
  }

  // the old server answered `res.json(<number of deleted rows>)`: a bare JSON number
  @Delete()
  @Header('Content-Type', 'application/json')
  async remove(@Query('department_id') departmentId: unknown): Promise<string> {
    return JSON.stringify(await this.service.remove(departmentId));
  }

  @Get('single/:productId')
  @Header('Content-Type', 'application/json')
  single(): string {
    return NO;
  }

  @Post('post')
  @HttpCode(200)
  @Header('Content-Type', 'application/json')
  create(): string {
    return NO;
  }

  @Put('update/:departmentId')
  @Header('Content-Type', 'application/json')
  update(): string {
    return NO;
  }
}

@Controller('v1/userroles')
export class UserrolesController {
  constructor(@InjectModel(Userrole) private readonly roles: typeof Userrole) {}

  @Get()
  all(@Query() query: Record<string, unknown>) {
    return this.roles.findAll({ where: whereFromQuery(Userrole, query), logging: false });
  }
}

// The old routes queried a database and a table that do not exist any more (`bollegraafdb`.`Language`, `Userroles`) and
// never answered. `rights` is the list of user roles (what the query was after); there is no language table.
@Controller('v1/settings')
export class SettingsController {
  constructor(@InjectModel(Userrole) private readonly roles: typeof Userrole) {}

  @Get('language')
  language(): { language: unknown[] } {
    return { language: [] };
  }

  @Get('rights')
  async rights(): Promise<{ rights: Userrole[] }> {
    return { rights: await this.roles.findAll({ logging: false }) };
  }
}
