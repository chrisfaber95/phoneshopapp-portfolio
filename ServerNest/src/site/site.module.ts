import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Cookies } from '../database/models';
import { MailModule } from '../mail/mail.module';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';

// Cookie acceptance and the feedback form of the shop front (the old /site/site route, a product scraper, comes later)
@Module({
  imports: [SequelizeModule.forFeature([Cookies]), MailModule],
  controllers: [SiteController],
  providers: [SiteService],
})
export class SiteModule {}
