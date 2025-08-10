// prisma/seed.ts
import { PrismaClient, VideoQualityOptions, VideoVisibility, VideoStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  // Create a user
  const user = await prisma.users.create({
    data: {
      id: randomUUID(),
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password_here',
      created_at: new Date(),
    },
  });

  // Create a video with qualities
  const video = await prisma.video.create({
    data: {
      id: randomUUID(),
      name: 'Sample Video',
      description: 'This is a seeded video',
      user_id: user.id,
      likes_count: 10,
      comments_count: 3,
      visibility: VideoVisibility.public,
      status: VideoStatus.READY,
      created_at: new Date(),
      qualities: {
        create: [
          {
            id: randomUUID(),
            quality: VideoQualityOptions.p1080,
            source: 'https://example.com/video-1080p.mp4',
            created_at: new Date(),
          },
          {
            id: randomUUID(),
            quality: VideoQualityOptions.p720,
            source: 'https://example.com/video-720p.mp4',
            created_at: new Date(),
          },
        ],
      },
    },
    include: { qualities: true },
  });

  console.log('User created:', user);
  console.log('Video created:', video);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
