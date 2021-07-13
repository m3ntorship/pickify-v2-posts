import { EntityRepository, getRepository, Repository } from 'typeorm';
import { UserCreationDto } from '../dto/userCreation.dto';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  private async checkUser(user: any): Promise<User> {
    return await this.createQueryBuilder('user')
      .where('user.user_id = :id', { id: user.user_id })
      .getOne();
  }

  public async createUser(user: any): Promise<User> {
    const userToFind = this.checkUser(user);
    if (userToFind) {
      return userToFind;
    }

    const newUser = this.create();
    newUser.name = user.name;
    newUser.profile_pic = user.picture;
    newUser.user_id = user.user_id;
    return await this.save(newUser);
  }
}
