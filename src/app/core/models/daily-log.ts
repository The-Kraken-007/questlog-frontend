export interface DailyLogDto {
  id: number;
  date: string;       // ISO yyyy-MM-dd
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrUpdateLogRequest {
  date: string;       // ISO yyyy-MM-dd
  content: string;
}
