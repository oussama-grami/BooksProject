import { GraphQLModule } from '@nestjs/graphql';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from 'dotenv';
import { GlobalModule } from './Common/global.module';
import { AuthModule } from './auth/auth.module';
import { Book } from './books/entities/book.entity';
import { User } from './auth/entities/user.entity';
import { Favorite } from './favorites/entities/favorite.entity';
import { Bid } from './bids/entities/bid.entity';
import { Comment } from './comments/entities/comment.entity';
import { Notification } from './notifications/entities/notification.entity';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Ajout de ConfigService
import { BooksService } from './books/books.service';
import { BooksController } from './books/books.controller';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BookResolver } from './graphql/book.resolver';
import { AuthService } from './auth/auth.service';
import { CommentsService } from './comments/comments.service';
import { BidsService } from './bids/bids.service';
import { FavoritesService } from './favorites/favorites.service';
import { FavoritesResolver } from './graphql/favorite.resolver';
import { BidResolver } from './graphql/bid.resolver';
import { CommentsResolver } from './graphql/comment.resolver';
import { UserRatingModule } from './user-rating/user-rating.module';
import { UserRating } from './user-rating/entities/user-rating.entity';
import { RatingsResolver } from './graphql/user-rating.resolver';


import { ArticleModule } from './article/article.module';
import { join } from 'path';
import { BooksModule } from './books/books.module';
import { FavoritesModule } from './favorites/favorites.module';
import { CommentsModule } from './comments/comments.module';
import { BidsModule } from './bids/bids.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConversationModule } from './conversation/conversation.module';
import { ChatGateway } from './chat/chat.gateway';
import { Conversation } from './conversation/entities/conversation.entity';
import { Message } from './conversation/entities/message.entity';
import { RedisCacheService } from './Common/cache/redis-cache.service';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat/chat.service';
import { JwtModule } from '@nestjs/jwt'; 
import { ChatController } from './chat/chat.controller';
import { StripeModule } from './stripe/stripe.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationSchedulerModule } from './notification-scheduler/notification-scheduler.module';



config({ path: `${process.cwd()}/Config/.env.dev` });

@Module({
  imports: [
    ConfigModule.forRoot({
      // Configuration de ConfigModule
      isGlobal: true,
      envFilePath: [
        `${process.cwd()}/Config/.env`,
        `${process.cwd()}/Config/.env.${process.env.NODE_ENV}`,
      ],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      // Configuration de TypeOrmModule
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASS'),
          database: configService.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: configService.get<string>('NODE_ENV') === 'dev',
          logging: true,
        };
      },
    }),
    TypeOrmModule.forFeature([User, Conversation, Message]),
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Make sure this matches your auth configuration
      signOptions: { expiresIn: '1d' }, // Adjust as needed
    }),
    GlobalModule,
    AuthModule,
    ArticleModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public', 'uploads'),
      serveRoot: '/public/uploads',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      debug: true,
      driver: ApolloDriver,
      playground: true,
      introspection: true,
      typePaths: ['./**/*.graphql'],
      path: '/graphql',
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
        outputAs: 'class',
      },
      subscriptions: {
        'graphql-ws': {
           path: '/graphql', 
        },
        'subscriptions-transport-ws': { 
           path: '/graphql',        
        },
      },
    }),
    UserRatingModule,
    BooksModule,
    FavoritesModule,
    CommentsModule,
    BidsModule,
    NotificationsModule,
    NotificationSchedulerModule,
    ConversationModule,
    StripeModule,
  ],
  controllers: [AppController, ChatController],
  providers: [
    AppService,
    BookResolver,
    FavoritesResolver,
    BidResolver,
    CommentsResolver,
    ChatGateway,
    RatingsResolver,
    ChatService,
    JwtService,
  ],
})

export class AppModule {}
