import { faker } from '@faker-js/faker';

export const getVideos =  () => {
  return Array.from({ length: 10 }, () => ({
    id: faker.number.int({ min: 1, max: 10000 }),
    title: faker.lorem.sentence(),
    thumbnail: faker.image.urlPicsumPhotos({ width: 300, height: 200, blur: 0, }),
    src: faker.internet.url(),
    description: faker.lorem.paragraph(),
    tags: faker.lorem.words(5).split(' '),
    views: faker.number.int({ min: 0, max: 1_000_000 }),
    createdAt: faker.date.recent({ days: 30 }),
    updatedAt: faker.date.recent({ days: 10 }),
  }));
}