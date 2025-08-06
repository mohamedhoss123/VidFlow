-- CreateEnum
CREATE TYPE "public"."VideoQualityOptions" AS ENUM ('p144', 'p240', 'p360', 'p480', 'p720', 'p1080');

-- CreateEnum
CREATE TYPE "public"."VideoVisibility" AS ENUM ('public', 'private', 'unlisted');

-- CreateEnum
CREATE TYPE "public"."VideoStatus" AS ENUM ('PROCESSING', 'READY');

-- CreateTable
CREATE TABLE "public"."Users" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" DATE NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Video" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "description" VARCHAR(255),
    "user_id" VARCHAR(255),
    "likes_count" INTEGER,
    "comments_count" INTEGER,
    "visibility" "public"."VideoVisibility",
    "status" "public"."VideoStatus",
    "created_at" DATE,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VideoQuality" (
    "id" VARCHAR(255) NOT NULL,
    "quality" "public"."VideoQualityOptions",
    "video_id" VARCHAR(255),
    "source" VARCHAR(255),
    "created_at" DATE,

    CONSTRAINT "VideoQuality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Likes" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255),
    "video_id" VARCHAR(255),
    "created_at" DATE,

    CONSTRAINT "Likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comments" (
    "id" VARCHAR(255) NOT NULL,
    "content" VARCHAR(255),
    "user_id" VARCHAR(255),
    "video_id" VARCHAR(255),
    "created_at" INTEGER,

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "id" SERIAL NOT NULL,
    "follower_id" VARCHAR(255),
    "following_id" VARCHAR(255),
    "created_at" DATE,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255),
    "content" VARCHAR(255),
    "received" BOOLEAN,
    "road" BOOLEAN,
    "created_at" DATE,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_id_key" ON "public"."Users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Video_id_key" ON "public"."Video"("id");

-- CreateIndex
CREATE UNIQUE INDEX "VideoQuality_id_key" ON "public"."VideoQuality"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Likes_id_key" ON "public"."Likes"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Comments_id_key" ON "public"."Comments"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_id_key" ON "public"."Notification"("id");

-- AddForeignKey
ALTER TABLE "public"."Video" ADD CONSTRAINT "Video_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VideoQuality" ADD CONSTRAINT "VideoQuality_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "public"."Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Likes" ADD CONSTRAINT "Likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Likes" ADD CONSTRAINT "Likes_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "public"."Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comments" ADD CONSTRAINT "Comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comments" ADD CONSTRAINT "Comments_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "public"."Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "public"."Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
