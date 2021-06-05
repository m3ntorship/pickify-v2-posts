import { Test, TestingModule } from '@nestjs/testing';
import { OptionsGroupCreationDto } from './dto/optionGroupCreation.dto';
import { OptionRepository } from './entities/option.repository';
import { OptionsGroupRepository } from './entities/optionsGroup.repository';
import { OptionsGroups } from './interfaces/optionsGroup.interface';
import { PostRepository } from './entities/post.repository';
import { PostsService } from './posts.service';
import { PostCreationDto } from './dto/postCreation.dto';

describe('PostsService', () => {
  let service: PostsService;
  let optionRepo: OptionRepository;
  let groupRepo: OptionsGroupRepository;
  let repo: PostRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: OptionsGroupRepository,
          useValue: {
            createGroup: jest.fn().mockResolvedValue({
              uuid: 'test group id',
            }),
          },
        },
        {
          provide: OptionRepository,
          useValue: {
            createOption: jest.fn().mockResolvedValue({
              uuid: 'test option id',
            }),
          },
        },
        {
          provide: PostRepository,
          useValue: {
            createPost: jest.fn().mockResolvedValue({ uuid: 'test id' }),
            deletePost: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    optionRepo = module.get<OptionRepository>(OptionRepository);
    groupRepo = module.get<OptionsGroupRepository>(OptionsGroupRepository);
    repo = module.get<PostRepository>(PostRepository);
  });

  it('should be defined & have the necessary methods', () => {
    expect(service).toBeDefined();
    expect(service).toHaveProperty('createOptionGroup');
  });

  describe('createOptionGroup method', () => {
    it('should return the ids of the created groups & options', async () => {
      // data
      const postid = 'test post id';
      const dto: OptionsGroupCreationDto = {
        groups: [
          {
            name: 'test group name',
            options: [
              { body: 'test option 1 body' },
              { body: 'test option 2 body' },
            ],
          },
        ],
      };
      const createdOptionsGroups: OptionsGroups = {
        groups: [
          {
            id: 'test group id',
            options: [
              {
                id: 'test option id',
              },
              {
                id: 'test option id',
              },
            ],
          },
        ],
      };
      const data = await service.createOptionGroup(postid, dto);

      // assertions
      expect(data).toEqual(createdOptionsGroups);
    });

    it('should call groupRepo.createGroup & optionRepo.createOption with correct parameters', async () => {
      // data
      const postid = 'test post id';
      const dto: OptionsGroupCreationDto = {
        groups: [
          {
            name: 'test group name',
            options: [
              { body: 'test option 1 body' },
              { body: 'test option 2 body' },
            ],
          },
        ],
      };
      const createdGroup = {
        uuid: 'test group id',
      };

      await service.createOptionGroup(postid, dto);

      // assertions
      expect(groupRepo.createGroup).toBeCalledWith(postid, dto.groups[0].name);
      expect(optionRepo.createOption).toBeCalledWith(
        createdGroup,
        dto.groups[0].options[0],
      );
    });

    it('should call groupRepo.createGroup & optionRepo.createOption methods equal to no of groups & options bassed in dto', async () => {
      // data
      const postid = 'test post id';
      const dto: OptionsGroupCreationDto = {
        groups: [
          {
            name: 'test group name',
            options: [
              { body: 'test option 1 body' },
              { body: 'test option 2 body' },
              { body: 'test option 2 body' },
            ],
          },
          {
            name: 'test group name',
            options: [
              { body: 'test option 1 body' },
              { body: 'test option 2 body' },
              { body: 'test option 2 body' },
            ],
          },
        ],
      };

      await service.createOptionGroup(postid, dto);

      // assertions
      expect(optionRepo.createOption).toHaveBeenCalledTimes(6);
      expect(groupRepo.createGroup).toHaveBeenCalledTimes(2);
      expect(service).toHaveProperty('createPost');
      expect(repo).toBeDefined();
      expect(repo).toHaveProperty('createPost');
    });

    describe('createPost method', () => {
      it('should return object with id', async () => {
        const dto: PostCreationDto = {
          type: 'text_poll',
          caption: 'test caption',
          is_hidden: false,
        };
        const data = await service.createPost(dto);

        expect(data).toEqual({ id: 'test id' });

        expect(repo.createPost).toBeCalledWith(dto);
        expect(repo.createPost).toBeCalledTimes(1);
      });
    });
  });

  describe('deletePost', () => {
    it('should call repository fn with post uuid', async () => {
      const res = await service.deletePost('uuid');
      expect(res).toBeUndefined();
      expect(repo.deletePost).toHaveBeenCalledWith('uuid');
    });
  });
});
