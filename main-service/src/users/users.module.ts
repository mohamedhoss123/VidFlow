import { Module } from "@nestjs/common";
import { SubscriptionController } from "./controllers/subscription.controller";
import { SubscriptionService } from "./services/subscription.service";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class UsersModule {}
