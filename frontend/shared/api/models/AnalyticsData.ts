/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MonthlyRevenueData } from './MonthlyRevenueData';
import type { MonthlySubscriptionsData } from './MonthlySubscriptionsData';
import type { MonthlyUsersData } from './MonthlyUsersData';
export type AnalyticsData = {
    monthly_revenue: Array<MonthlyRevenueData>;
    monthly_users: Array<MonthlyUsersData>;
    monthly_subscriptions: Array<MonthlySubscriptionsData>;
};

