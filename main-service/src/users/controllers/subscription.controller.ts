import { Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { SubscriptionService } from "../services/subscription.service";
import { UserId } from "src/common/decorator/user-id";
import { ApiBearerAuth } from "@nestjs/swagger";
import { VideoPaginationDto } from "src/video/dto/video-pagination.dto";
@ApiBearerAuth("access-token") // Match name in addBearerAuth
@Controller("users")
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get("me/subscription")
  getMySubs(@UserId() userId: string) {
    return this.subscriptionService.getUserSubscriptions(userId);
  }
  @Get("me/subscription/videos")
  getMySubsVideos(
    @UserId() userId: string,
    @Query() query: VideoPaginationDto,
  ) {
    return this.subscriptionService.getUserSubscriptionsVideos(userId, query);
  }
  @Get(":userId/subscription")
  getUserSubs(@Param("userId") userId: string) {
    return this.subscriptionService.getUserSubscriptions(userId);
  }
  @Post(":userId/subscribe")
  newSubscription(@UserId() userId: string, @Param("userId") targetId: string) {
    return this.subscriptionService.subscribe(userId, targetId);
  }

  @Delete(":userId/subscribe")
  unSubscripe(@UserId() userId: string, @Param("userId") targetId: string) {
    return this.subscriptionService.unSubscribe(userId, targetId);
  }
}
