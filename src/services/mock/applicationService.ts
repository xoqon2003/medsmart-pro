import type { Application } from '../../app/types';
import { mockApplications } from '../../app/data/mockData';

export interface IApplicationService {
  getAll(): Promise<Application[]>;
}

export const applicationService: IApplicationService = {
  getAll: () => Promise.resolve([...mockApplications]),
};
