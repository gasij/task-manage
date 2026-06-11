export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Task = {
  id: string;
  text: string;
  done: boolean;
  time: string;
  day: WeekDay;
};
