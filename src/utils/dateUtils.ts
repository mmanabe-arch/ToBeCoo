import { format, getWeek, getYear, startOfWeek, endOfWeek, addWeeks, subWeeks, getQuarter } from 'date-fns';
import { ja } from 'date-fns/locale';

export const toDateString = (date: Date): string => format(date, 'yyyy-MM-dd');

export const toWeekKey = (date: Date): string => {
  const year = getYear(date);
  const week = getWeek(date, { weekStartsOn: 1 });
  return `${year}-${String(week).padStart(2, '0')}`;
};

export const parseWeekKey = (weekKey: string): { year: number; week: number } => {
  const [year, week] = weekKey.split('-').map(Number);
  return { year, week };
};

export const getWeekLabel = (weekKey: string): string => {
  const date = weekKeyToDate(weekKey);
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return `${format(start, 'M/d')}〜${format(end, 'M/d')}`;
};

export const weekKeyToDate = (weekKey: string): Date => {
  const [year, week] = weekKey.split('-').map(Number);
  const jan4 = new Date(year, 0, 4);
  const startOfYear = startOfWeek(jan4, { weekStartsOn: 1 });
  return addWeeks(startOfYear, week - 1);
};

export const prevWeekKey = (weekKey: string): string => {
  const date = weekKeyToDate(weekKey);
  return toWeekKey(subWeeks(date, 1));
};

export const nextWeekKey = (weekKey: string): string => {
  const date = weekKeyToDate(weekKey);
  return toWeekKey(addWeeks(date, 1));
};

export const getCurrentQuarterInfo = (): { year: number; quarter: 1 | 2 | 3 | 4 } => {
  const now = new Date();
  return {
    year: getYear(now),
    quarter: getQuarter(now) as 1 | 2 | 3 | 4,
  };
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return format(date, 'yyyy年M月d日(E)', { locale: ja });
};

export const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr);
  return format(date, 'M月d日', { locale: ja });
};

export const getTodayString = (): string => toDateString(new Date());
export const getCurrentWeekKey = (): string => toWeekKey(new Date());

export const getQuarterLabel = (year: number, quarter: number): string => {
  return `${year}年 Q${quarter}`;
};
