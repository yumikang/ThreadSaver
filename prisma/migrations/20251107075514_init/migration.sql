-- CreateTable
CREATE TABLE "threads" (
    "id" TEXT NOT NULL,
    "conversation_id" VARCHAR(50) NOT NULL,
    "author_username" VARCHAR(100) NOT NULL,
    "author_name" VARCHAR(255),
    "tweet_count" INTEGER NOT NULL,
    "collected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "first_tweet_url" TEXT NOT NULL,
    "first_tweet_date" TIMESTAMP(3),
    "download_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tweets" (
    "id" BIGINT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "author_username" VARCHAR(100) NOT NULL,
    "reply_to_id" BIGINT,
    "retweet_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "media_urls" TEXT[],
    "sequence_number" INTEGER NOT NULL,

    CONSTRAINT "tweets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "series" (
    "id" TEXT NOT NULL,
    "author_username" VARCHAR(100) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "cover_image_url" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ongoing',
    "total_tweets" INTEGER NOT NULL DEFAULT 0,
    "total_threads" INTEGER NOT NULL DEFAULT 0,
    "total_views" INTEGER NOT NULL DEFAULT 0,
    "slug" VARCHAR(255) NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "series_threads" (
    "id" TEXT NOT NULL,
    "series_id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "series_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_progress" (
    "id" TEXT NOT NULL,
    "session_id" VARCHAR(255) NOT NULL,
    "series_id" TEXT NOT NULL,
    "last_read_tweet_id" BIGINT,
    "progress_percentage" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reading_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "session_id" VARCHAR(255) NOT NULL,
    "series_id" TEXT NOT NULL,
    "tweet_id" BIGINT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "series_views" (
    "id" TEXT NOT NULL,
    "series_id" TEXT NOT NULL,
    "session_id" VARCHAR(255),
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "series_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_saves" (
    "id" TEXT NOT NULL,
    "session_id" VARCHAR(255),
    "thread_id" TEXT NOT NULL,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "format" VARCHAR(20) NOT NULL DEFAULT 'markdown',

    CONSTRAINT "user_saves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics" (
    "id" SERIAL NOT NULL,
    "event_type" VARCHAR(50) NOT NULL,
    "thread_id" TEXT,
    "series_id" TEXT,
    "format" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "threads_conversation_id_key" ON "threads"("conversation_id");

-- CreateIndex
CREATE INDEX "threads_conversation_id_idx" ON "threads"("conversation_id");

-- CreateIndex
CREATE INDEX "threads_author_username_idx" ON "threads"("author_username");

-- CreateIndex
CREATE INDEX "threads_collected_at_idx" ON "threads"("collected_at" DESC);

-- CreateIndex
CREATE INDEX "tweets_thread_id_sequence_number_idx" ON "tweets"("thread_id", "sequence_number");

-- CreateIndex
CREATE UNIQUE INDEX "series_slug_key" ON "series"("slug");

-- CreateIndex
CREATE INDEX "series_slug_idx" ON "series"("slug");

-- CreateIndex
CREATE INDEX "series_author_username_idx" ON "series"("author_username");

-- CreateIndex
CREATE INDEX "series_is_public_updated_at_idx" ON "series"("is_public", "updated_at" DESC);

-- CreateIndex
CREATE INDEX "series_threads_series_id_sequence_number_idx" ON "series_threads"("series_id", "sequence_number");

-- CreateIndex
CREATE UNIQUE INDEX "series_threads_series_id_thread_id_key" ON "series_threads"("series_id", "thread_id");

-- CreateIndex
CREATE UNIQUE INDEX "series_threads_series_id_sequence_number_key" ON "series_threads"("series_id", "sequence_number");

-- CreateIndex
CREATE INDEX "reading_progress_session_id_idx" ON "reading_progress"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "reading_progress_session_id_series_id_key" ON "reading_progress"("session_id", "series_id");

-- CreateIndex
CREATE INDEX "bookmarks_session_id_created_at_idx" ON "bookmarks"("session_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "bookmarks_series_id_created_at_idx" ON "bookmarks"("series_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "series_views_series_id_viewed_at_idx" ON "series_views"("series_id", "viewed_at");

-- CreateIndex
CREATE INDEX "user_saves_session_id_saved_at_idx" ON "user_saves"("session_id", "saved_at" DESC);

-- CreateIndex
CREATE INDEX "analytics_event_type_created_at_idx" ON "analytics"("event_type", "created_at");

-- AddForeignKey
ALTER TABLE "tweets" ADD CONSTRAINT "tweets_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "series_threads" ADD CONSTRAINT "series_threads_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "series_threads" ADD CONSTRAINT "series_threads_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_last_read_tweet_id_fkey" FOREIGN KEY ("last_read_tweet_id") REFERENCES "tweets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_tweet_id_fkey" FOREIGN KEY ("tweet_id") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "series_views" ADD CONSTRAINT "series_views_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_saves" ADD CONSTRAINT "user_saves_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE SET NULL ON UPDATE CASCADE;
