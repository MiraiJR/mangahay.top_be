import { Test, TestingModule } from '@nestjs/testing';
import { ComicResolver } from '../comic.resolver';

describe('ComicResolver', () => {
  let resolver: ComicResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComicResolver],
    }).compile();

    resolver = module.get<ComicResolver>(ComicResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
