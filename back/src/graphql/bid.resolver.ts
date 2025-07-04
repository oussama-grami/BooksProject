import {
  Resolver,
  Query,
  Args,
  ID,
  ResolveField,
  Parent,
  Int,
  Mutation,
  Float,
  Context,
} from '@nestjs/graphql';
import { BooksService } from '../books/books.service';
import { AuthService } from '../auth/auth.service';
import { BidsService } from '../bids/bids.service';
import { Bid } from 'src/graphql';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { User } from 'src/Decorator/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GqlAuthGuard } from 'src/auth/guards/gql.guard';

@Resolver('Bid')
export class BidResolver {
  constructor(
    private readonly bidService: BidsService,
    private readonly userService: AuthService,
    private readonly bookService: BooksService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query('myBids')
  async myBids(
    @User('id') userId: number,
    @Args('limit') limit?: number,
    @Args('offset') offset?: number,
  ) {
    console.log('User ID:', userId); // Log the user ID for debugging
    try {
      return await this.bidService.findBidsByUser(userId, { limit, offset });
    } catch (error) {
      console.error('Error fetching user bids:', error);
      throw new InternalServerErrorException('Failed to fetch bids');
    }
  }

  @Query('highestBidForBook')
  async highestBidForBook(
    @Args('bookId', { type: () => Int }) bookId: number,
  ): Promise<Bid | null> {
    return this.bidService.findHighestBidForBook(bookId);
  }

  @UseGuards(GqlAuthGuard)

  @Mutation('createBid')
  async createBid(
      @Args('bookId', { type: () => Int }) bookId: number,
      @Args('amount', { type: () => Float }) amount: number,
      @Context() context: any
  ): Promise<Bid> {
    console.log('Creating bid with bookId:', bookId, 'and amount:', amount);
      try {
          const user = context.req.user;
  
          if (!user) {
              throw new InternalServerErrorException('Informations utilisateur non disponibles après authentification.');
          }
  
          const userId = user.id;
  
          console.log('Creating bid with authenticated user ID (from context):', userId);
          return await this.bidService.createBid(userId, bookId, amount);
      } catch (error) {
          console.error(
              `Error in createBid mutation`,
              error,
          );
          throw new InternalServerErrorException('Failed to create bid');
      }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation('updateBid')
  async updateBid(
      @Args('bookId', { type: () => Int }) bookId: number,
      @Args('amount', { type: () => Float }) amount: number,
      @Context() context: any
  ): Promise<Bid> {
      try {
          const user = context.req.user;
  
          if (!user) {
              throw new InternalServerErrorException('Informations utilisateur non disponibles après authentification.');
          }
  
          const userId = user.id;
  
          console.log('Updating bid with authenticated user ID (from context):', userId);
          return this.bidService.updateBid(userId, bookId, amount);
      } catch (error) {
          console.error(
              `Error in updateBid mutation `,
              error,
          );
          throw new InternalServerErrorException('Failed to update bid');
      }
  }
}
