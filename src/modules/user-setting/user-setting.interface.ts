import { ChapterViewType } from './enums/chapter-view-type';

export interface ChapterSetting {
  type: ChapterViewType;
  amount: number;
}

export interface NotificationSetting {
  mention: boolean;
}

export interface UpdateUserSetting {
  chapter: ChapterSetting;
  notification: NotificationSetting;
}

export interface UserSettingResponse {
  chapter: ChapterSetting;
  notification: NotificationSetting;
}
