import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class SubscriptionService {
  constructor(private readonly prismaService: PrismaService) {}

  getUserSubscriptions(userId: string) {
    return this.prismaService.subscription.findMany({
      where: { follower_id: userId },
      include: {
        following: true,
      },
    });
  }
  subscribe(userId: string, targetId: string) {
    return this.prismaService.subscription.create({
      data: { follower_id: userId, following_id: targetId },
    });
  }

  unSubscribe(userId: string, targetId: string) {
    return this.prismaService.subscription.deleteMany({
      where: { follower_id: userId, following_id: targetId },
    });
  }
}
