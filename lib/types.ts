// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Thread Types
export interface ThreadData {
  conversationId: string
  authorUsername: string
  authorName?: string
  tweetCount: number
  firstTweetUrl: string
  firstTweetDate?: Date
  tweets: TweetData[]
}

export interface TweetData {
  id: string
  content: string
  createdAt: Date
  authorUsername: string
  replyToId?: string
  retweetCount: number
  likeCount: number
  mediaUrls: string[]
  sequenceNumber: number
}

// Series Types
export interface SeriesData {
  id: string
  authorUsername: string
  title: string
  description?: string
  coverImageUrl?: string
  status: 'ongoing' | 'completed' | 'hiatus'
  totalTweets: number
  totalThreads: number
  totalViews: number
  slug: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateSeriesRequest {
  title: string
  description?: string
  authorUsername: string
  slug?: string
  status?: 'ongoing' | 'completed' | 'hiatus'
}

export interface UpdateSeriesRequest {
  title?: string
  description?: string
  coverImageUrl?: string
  status?: 'ongoing' | 'completed' | 'hiatus'
  isPublic?: boolean
}

export interface AddThreadToSeriesRequest {
  threadUrl: string
  sequenceNumber?: number
}

// Bookmark Types
export interface BookmarkData {
  id: string
  sessionId: string
  seriesId: string
  tweetId: string
  note?: string
  createdAt: Date
}

export interface CreateBookmarkRequest {
  seriesId: string
  tweetId: string
  note?: string
}

// Reading Progress Types
export interface ReadingProgressData {
  id: string
  sessionId: string
  seriesId: string
  lastReadTweetId?: string
  progressPercentage?: number
  updatedAt: Date
}

export interface UpdateReadingProgressRequest {
  seriesId: string
  lastReadTweetId: string
  progressPercentage: number
}

// Scraper Types
export interface ScrapeRequest {
  tweetUrl: string
}

export interface ScrapeResponse {
  thread: ThreadData
  message: string
}

// Pagination Types
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Series Content Types
export interface SeriesContentParams extends PaginationParams {
  seriesId: string
}

export interface SeriesContentResponse {
  series: SeriesData
  tweets: TweetData[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}
