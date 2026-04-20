import { useQuery } from '@tanstack/react-query';
import { listDoctors } from '../api/doctors';

/**
 * DOCTOR/SPECIALIST rolidagi foydalanuvchilar.
 * staleTime: 5 daqiqa — shifokor ro'yxati tez-tez o'zgarmaydi.
 */
export const useAvailableDoctors = () =>
  useQuery({
    queryKey: ['doctors', 'available'],
    queryFn: listDoctors,
    staleTime: 5 * 60 * 1000,
  });
