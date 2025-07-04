import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book } from './library-dashboard.component';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { RouterModule } from '@angular/router';
import { ImagePreloadDirective } from '../../shared/directives/image-preload.directive';
import { LoadingService } from '../../services/loading.service';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, RouterModule, ImagePreloadDirective, FormsModule], // Add FormsModule
  template: `
    <div
      class="book-card"
      [class.special]="special"
      [@cardHover]="isHovered ? 'hovered' : 'normal'"
      (mouseenter)="isHovered = true"
      (mouseleave)="isHovered = false"
    >
      <div
        class="book-image-container"
        [attr.data-label]="!isFavorite ? 'Recommended' : 'Bidden'"
        [ngClass]="{ 'ribbon-lower': !isFavorite, 'ribbon-higher': isFavorite }"
      >
        <img
          [src]="book.picture"
          alt="{{ book.title }}"
          class="book-image"
          appImagePreload
          fallback="/images/image.png"
          (loaded)="onImageLoaded(book.id, $event)"
        />
        <div class="overlay">
          <span class="read-more" [routerLink]="['/books', book.id]">Read More</span>
        </div>
      </div>
      <div class="book-info">
        <h3 class="book-title">{{ book.title }}</h3>
        <div class="category-badge" *ngIf="book.category">
          {{ book.category }}
        </div>
        <div class="book-meta">
          <div class="rating">
            <div class="stars">
              <span *ngFor="let star of [1, 2, 3, 4, 5]" class="star">
                <i
                  class="pi"
                  [class.pi-star-fill]="star <= getAverageRating()"
                  [class.pi-star]="star > getAverageRating()"
                ></i>
              </span>
            </div>
            <span class="rating-count">{{ getAverageRating() }}/5</span>
          </div>
          <div class="meta-details">
            <div class="meta-stats">
              <span class="comments">
                <i class="pi pi-comments"></i>
                {{commentCount }}
              </span>
              <span class="likes">
                <i class="pi pi-heart-fill"></i>
                {{ favoriteCount }}
              </span>
              <span class="days-ago">
                {{ book.createdAt | date:'mediumDate' }}
              </span>
            </div>
            <button class="bid-button" (click)="openBidInput()" *ngIf="!showBidInput">
              Bid
            </button>
            <div *ngIf="showBidInput" class="bid-input-container">
              <input type="number" [(ngModel)]="bidAmount" placeholder="Your Bid">
              <button (click)="submitBid()" [disabled]="isSubmittingBid">
                {{ isSubmittingBid ? 'Bidding...' : 'Place Bid' }}
              </button>
              <button (click)="closeBidInput()">Cancel</button>
              <div *ngIf="bidError" class="error-message">{{ bidError }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .book-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      cursor: pointer;
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
    }

    .book-card.special {
      background: linear-gradient(145deg, #ffffff, #fff5e6);
      border: 2px solid rgba(156, 115, 80, 0.1);
      box-shadow: 0 10px 25px rgba(156, 115, 80, 0.2);
    }

    .book-card.special .book-title {
      color: #9c7350;
      font-weight: 700;
    }

    .book-card.special::before {
      content: '⭐';
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 20px;
      opacity: 0.8;
      z-index: 2;
    }

    .book-card.special .book-image-container::after {
      content: attr(data-label);
      position: absolute;
      left: -35px;
      background: linear-gradient(90deg, #9c7350, #50719c);
      color: white;
      padding: 5px 40px;
      transform: rotate(-45deg);
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .book-image-container.ribbon-lower::after {
      top: 30px;
    }

    .book-image-container.ribbon-higher::after {
      top: 18px;
    }

    .book-card.special:hover {
      transform: translateY(-10px) scale(1.03);
      box-shadow: 0 15px 30px rgba(156, 115, 80, 0.25);
    }

    .book-card.special .read-more {
      background: linear-gradient(90deg, #9c7350, #50719c);
      border: none;
      font-weight: 600;
    }

    .book-image-container {
      position: relative;
      padding-top: 140%;
      overflow: hidden;
    }

    .book-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .book-card:hover .overlay {
      opacity: 1;
    }

    .read-more {
      color: white;
      font-size: 16px;
      font-weight: 600;
      padding: 12px 24px;
      border: 2px solid white;
      border-radius: 25px;
      transform: translateY(20px);
      transition: all 0.3s ease;
      cursor: pointer;
      text-decoration: none;
    }

    .book-card:hover .read-more {
      transform: translateY(0);
    }

    .book-info {
      padding: 20px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .book-title {
      font-size: 18px;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 15px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .category-badge {
      display: inline-block;
      background-color: #9c7350;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 10px;
      width: fit-content;
    }

    .book-meta {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .star {
      color: #fbbf24;
      font-size: 14px;
    }

    .rating-count {
      color: #64748b;
      font-size: 14px;
    }

    .meta-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #64748b;
      font-size: 13px;
    }

    .meta-stats {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }

    .comments,
    .likes {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .comments i,
    .likes i {
      font-size: 14px;
    }

    .likes i {
      color: #9c7350;
    }

    .days-ago {
      color: #94a3b8;
      display: block;
      font-size: 12px;
      align-items: center;
      justify-content: center;
    }

    .bid-button {
      font-family: 'Poppins', sans-serif;
      background-color: #50719c;
      color: white;
      border: none;
      border-radius: 20px;
      padding: 6px 16px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .bid-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(80, 113, 156, 0.3);
      background-color: #445e82;
    }

    .bid-input-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }

    .bid-input-container input[type="number"] {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 12px;
    }

    .bid-input-container button {
      font-family: 'Poppins', sans-serif;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 20px;
      padding: 6px 16px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .bid-input-container button:hover {
      background-color: #45a049;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
    }

    .bid-input-container button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }

    .error-message {
      color: red;
      font-size: 11px;
    }

    @media (max-width: 640px) {
      .book-info {
        padding: 15px;
      }

      .book-title {
        font-size: 16px;
        margin-bottom: 12px;
      }

      .book-meta {
        gap: 8px;
      }

      .star {
        font-size: 12px;
      }

      .rating-count,
      .meta-details {
        font-size: 12px;
      }

      .bid-button {
        padding: 4px 12px;
        font-size: 11px;
      }

      .bid-input-container input[type="number"],
      .bid-input-container button {
        font-size: 11px;
        padding: 6px 12px;
      }
    }
  `],
  animations: [
    trigger('cardHover', [
      state(
        'normal',
        style({
          transform: 'translateY(0)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        })
      ),
      state(
        'hovered',
        style({
          transform: 'translateY(-10px)',
          boxShadow: '0 20px 30px rgba(0, 0, 0, 0.15)',
        })
      ),
      transition('normal <=> hovered', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'),
      ]),
    ]),
  ],
})

export class BookCardComponent implements OnInit {
  @Input() book!: Book;
  @Input() special: boolean = false;
  @Input() isFavorite: boolean = false;
  isHovered: boolean = false;

  showBidInput: boolean = false;
  bidAmount: number | null = null;
  bidError: string = '';
  isSubmittingBid: boolean = false;
  commentCount: number = 0;
  favoriteCount: number = 0;
  private commentCountSubscription?: Subscription;
  private favoriteCountSubscription?: Subscription;
  constructor(
    private loadingService: LoadingService, // Injected, though not used in this snippet
    private bookService: BookService
  ) {}

  // Lifecycle hook called after input properties are set
  ngOnInit(): void {
    // Fetch the comment count when the component initializes
    this.getCommentCount();
    this.getFavoriteCount();
  }

  // Lifecycle hook called just before the component is destroyed
  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.commentCountSubscription) {
      this.commentCountSubscription.unsubscribe();
    }
    if (this.favoriteCountSubscription) {
      this.favoriteCountSubscription.unsubscribe();
    }

  }

  getAverageRating(): number {
    // Ensure book and ratings array exist and are not empty
    if (!this.book || !this.book.ratings || this.book.ratings.length === 0) {
      return 0;
    }
    const sum = this.book.ratings.reduce((acc, curr) => acc + curr.rate, 0);
    return sum / this.book.ratings.length;
  }

  onImageLoaded(bookId: string | number, success: boolean): void {
    if (!success) {
      console.warn(`Failed to load image for book ID: ${bookId}`);
    }
    // You might want to hide a spinner or handle UI here
  }

  openBidInput(): void {
    this.showBidInput = true;
    this.bidAmount = null; // Reset bid amount
    this.bidError = ''; // Clear any previous errors
  }

  submitBid(): void {
    // Basic validation
    if (this.bidAmount === null || this.bidAmount <= 0) {
      this.bidError = 'Please enter a valid bid amount.';
      return;
    }

    // Clear previous error and indicate submission in progress
    this.bidError = '';
    this.isSubmittingBid = true;

    // Call the service method to create the bid
    // Assuming createBid returns an Observable<Bid>
    this.bookService.createBid(this.book.id, this.bidAmount).subscribe({
      next: (bid) => {
        console.log('Bid submitted successfully:', bid);
        this.showBidInput = false; // Close bid input on success
        this.isSubmittingBid = false;
        // Optional: Add logic to update UI, show confirmation message, etc.
      },
      error: (err) => {
        console.error('Error submitting bid:', err);
        this.bidError = 'Failed to submit bid. Please try again.'; // Display user-friendly error
        this.isSubmittingBid = false; // Stop submitting state
        // Optional: Handle specific error types (e.g., insufficient funds)
      }
    });
  }

  closeBidInput(): void {
    this.showBidInput = false;
    this.bidAmount = null;
    this.bidError = '';
  }

  getCommentCount(): void {
    this.commentCountSubscription = this.bookService.getCommentCountForBook(this.book.id)
        .subscribe(
          (count) => {
            this.commentCount = count;
            console.log(`Number of comments for the book ${this.book.id}: ${this.commentCount}`);
          }
        );

  }
  getFavoriteCount(): void {

    this.favoriteCountSubscription = this.bookService.getFavoriteCount(this.book.id)
    .subscribe(
      (count) => {
        this.favoriteCount= count;
        console.log(`Number of likes for the book${this.book.id}: ${this.favoriteCount}`);
      }
    );
  }
}
