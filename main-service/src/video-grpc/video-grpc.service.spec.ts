import { Test, type TestingModule } from '@nestjs/testing';
import { VideoGrpcService } from './video-grpc.service';

describe('VideoGrpcService', () => {
  let service: VideoGrpcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoGrpcService],
    }).compile();

    service = module.get<VideoGrpcService>(VideoGrpcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
