/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActivityDay } from './ActivityDay';
import type { WeekByType } from './WeekByType';
export type ActivitySummary = {
    today: string;
    heatmap: Array<ActivityDay>;
    current_streak: number;
    best_streak: number;
    active_days_this_week: number;
    weekly_goal_days: number;
    week_by_type: WeekByType;
    last_activity_date: (string | null);
    total_active_days: number;
};

