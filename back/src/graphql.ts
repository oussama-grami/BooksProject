
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum Category {
    FICTION = "FICTION",
    NON_FICTION = "NON_FICTION",
    SCIENCE = "SCIENCE",
    HISTORY = "HISTORY",
    BIOGRAPHY = "BIOGRAPHY",
    ROMANCE = "ROMANCE",
    OTHER = "OTHER",
    ADVENTURE = "ADVENTURE",
    FANTASY = "FANTASY",
    POETRY = "POETRY",
    ART = "ART",
    NOVEL = "NOVEL",
    THRILLER = "THRILLER",
    PHILOSOPHY = "PHILOSOPHY",
    RELIGION = "RELIGION",
    TECHNOLOGY = "TECHNOLOGY"
}

export enum Language {
    ENGLISH = "ENGLISH",
    GERMAN = "GERMAN",
    FRENCH = "FRENCH",
    ITALIAN = "ITALIAN",
    SPANISH = "SPANISH",
    OTHER = "OTHER"
}

export enum BidStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED"
}

export class User {
    id: number;
    firstName: string;
    lastName: string;
    imageUrl: string;
}

export class Comment {
    id: number;
    content: string;
    user?: Nullable<User>;
    createdAt: DateTime;
    book: Book;
}

export class Bid {
    id: number;
    amount: number;
    bidder: User;
    createdAt: DateTime;
    book: Book;
    bidStatus: BidStatus;
}

export class Book {
    id: number;
    title: string;
    author: string;
    picture: string;
    owner: User;
    comments?: Nullable<Comment[]>;
    favorites?: Nullable<Favorite[]>;
    bids?: Nullable<Bid[]>;
    price?: Nullable<number>;
    totalPages?: Nullable<number>;
    damagedPages?: Nullable<number>;
    age?: Nullable<number>;
    edition?: Nullable<number>;
    language?: Nullable<Language>;
    editor?: Nullable<string>;
    category?: Nullable<Category>;
    ratings?: Nullable<UserRating[]>;
    createdAt: DateTime;
    isSold: boolean;
    isBiddingOpen: boolean;
}

export class Favorite {
    id: number;
    user: User;
    book: Book;
}

export class UserRating {
    id: number;
    user: User;
    book: Book;
    rate: number;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export abstract class ISubscription {
    abstract bookFavoritesUpdated(bookId: number): Book | Promise<Book>;

    abstract commentAdded(bookId: number): Comment | Promise<Comment>;

    abstract commentRemoved(bookId: number): number | Promise<number>;

    abstract bookRatingUpdated(bookId: number): Book | Promise<Book>;
}

export abstract class IQuery {
    abstract viewBooks(limit?: Nullable<number>, offset?: Nullable<number>): Book[] | Promise<Book[]>;

    abstract bookDetails(id: number): Nullable<Book> | Promise<Nullable<Book>>;

    abstract myBids(limit?: Nullable<number>, offset?: Nullable<number>): Bid[] | Promise<Bid[]>;

    abstract highestBidForBook(bookId: number): Nullable<Bid> | Promise<Nullable<Bid>>;

    abstract userBookRating(userId: number, bookId: number): Nullable<UserRating> | Promise<Nullable<UserRating>>;

    abstract book(id: number): Nullable<Book> | Promise<Nullable<Book>>;

    abstract myBooks(limit?: Nullable<number>, offset?: Nullable<number>): Book[] | Promise<Book[]>;

    abstract GetBookCommentsPaginated(bookId: number, limit?: Nullable<number>, offset?: Nullable<number>): Comment[] | Promise<Comment[]>;

    abstract CommentCount(bookId: number): number | Promise<number>;

    abstract FavoriteCount(bookId: number): number | Promise<number>;
}

export abstract class IMutation {
    abstract addFavorite(bookId: number): Favorite | Promise<Favorite>;

    abstract removeFavorite(bookId: number): boolean | Promise<boolean>;

    abstract addCommentToBook(bookId: number, content: string): Nullable<Comment> | Promise<Nullable<Comment>>;

    abstract removeComment(commentId: number): boolean | Promise<boolean>;

    abstract createBid(bookId: number, amount: number): Bid | Promise<Bid>;

    abstract updateBid(bookId: number, amount: number): Bid | Promise<Bid>;

    abstract addRate(bookId: number, rate: number): UserRating | Promise<UserRating>;

    abstract updateRate(bookId: number, rate: number): UserRating | Promise<UserRating>;

    abstract deleteRate(bookId: number): boolean | Promise<boolean>;
}

export type DateTime = any;
type Nullable<T> = T | null;
