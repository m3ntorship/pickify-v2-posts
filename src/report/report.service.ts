import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post } from '../posts/entities/post.entity';
import { UserRepository } from '../users/entities/user.repository';
import { PostRepository } from '../posts/entities/post.repository';
import { User } from '../users/entities/user.entity';
import { CreatePostsReportDTO } from './dto/createReport.dto';
import { PostsReportRepository } from './entities/report.repository';
import { ReportedPosts } from './interfaces/getPostsReports.interface';

@Injectable()
export class ReportService {
  constructor(
    private postsReportRepository: PostsReportRepository,
    private postRepository: PostRepository,
    private userRepositoy: UserRepository,
  ) {}

  async createPostsReport(
    createPostsReportDTO: CreatePostsReportDTO,
    reporter: User,
  ): Promise<void> {
    const post = await this.postRepository.findOne({
      uuid: createPostsReportDTO.postId,
    });

    if (!post) throw new NotFoundException('Post not found');

    //reporter is allowed to report 50 posts only per day
    if (reporter.dailyReportsCount <= 50) {
      await this.postsReportRepository
        .createPostsReport(post, reporter)
        //if reporter is tring to report the same post twoice throw an error
        .catch(() => {
          throw new HttpException(
            {
              message: "Reporter can't report same post twoice",
            },
            HttpStatus.CONFLICT,
          );
        });
      reporter.dailyReportsCount++;
      await this.userRepositoy.save(reporter);
      //throw an error if the daily report count is exceeded
    } else {
      throw new HttpException(
        {
          message: 'Reporter can only report 50 posts per day',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async getAllPostsReports(): Promise<Post[]> {
    return await this.postRepository.getPostsReports();
  }
}
