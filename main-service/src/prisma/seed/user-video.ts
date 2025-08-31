// prisma/seed.ts
import { PrismaClient, VideoVisibility, VideoStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  // const user = await prisma.users.create({
  //   data: {
  //     id: randomUUID(),
  //     name: 'John Doe',
  //     email: 'john@example.com',
  //     password: 'hashed_password_here',
  //     created_at: new Date(),
  //   },
  // });

  // Create a video with qualities
  for(let i = 0; i < 600; i++){
    const video = await prisma.video.create({
      data: {
        id: randomUUID(),
        name: 'Sample Video',
        description: 'This is a seeded video',
        user_id:"d3fc6f9e-8032-4380-801d-c5ff2c0deb2e",
        likes_count: 10,
        comments_count: 3,
        visibility: VideoVisibility.public,
        status: VideoStatus.READY,
        created_at: new Date(),
        qualities: {
          create: [
            {
              id: randomUUID(),
              quality: "p1080",
              objectId: 'https://example.com/video-1080p.mp4',
              created_at: new Date(),
            },
            {
              id: randomUUID(),
              quality: "p720",
              objectId: 'https://example.com/video-720p.mp4',
              created_at: new Date(),
            },
          ],
        },
      },
      include: { qualities: true },
    });
  }

  // console.log('User created:', user);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
