import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { whereFromQuery } from '../common/query-filter';
import { Department } from '../database/models';

@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);

  constructor(@InjectModel(Department) private readonly departments: typeof Department) {}

  // GET /api/v1/departments?<column>=<value>
  list(query: Record<string, unknown>): Promise<Department[]> {
    return this.departments.findAll({ where: whereFromQuery(Department, query), logging: false });
  }

  // DELETE /api/v1/departments?department_id=<id>: answers the number of deleted rows; failures are `{ err }` with HTTP 200,
  // like the old server
  async remove(departmentId: unknown): Promise<number | { err: string }> {
    if (typeof departmentId !== 'string' || !/^[0-9]+$/.test(departmentId)) {
      return { err: 'department_id must be a number' };
    }
    try {
      return await this.departments.destroy({ where: { department_id: departmentId } });
    } catch (err) {
      this.logger.error(`deleting department ${departmentId} failed: ${(err as Error).message}`);
      return { err: 'Verwijderen mislukt' };
    }
  }
}
