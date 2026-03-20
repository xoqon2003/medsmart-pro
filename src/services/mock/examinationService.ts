export interface Center {
  id: number;
  name: string;
  region: string;
  district: string;
  rating: number;
  price: number;
  distanceKm: number;
}

export interface CenterFilter {
  region?: string;
  district?: string;
}

export interface IExaminationService {
  getCenters(filters?: CenterFilter): Promise<Center[]>;
  getExamsByCategory(category: string): Promise<string[]>;
}

const CENTERS: Center[] = [
  { id: 1, name: 'Toshkent Diagnostika Markazi', region: 'Toshkent', district: "M. Ulug\u02BCbek", rating: 4.7, price: 180000, distanceKm: 3.4 },
  { id: 2, name: 'Samarqand Health Lab', region: 'Samarqand', district: 'Markaz', rating: 4.6, price: 140000, distanceKm: 5.1 },
  { id: 3, name: 'MedLine Clinic', region: 'Toshkent', district: 'Yunusobod', rating: 4.5, price: 160000, distanceKm: 7.9 },
  { id: 4, name: 'ProLab', region: 'Toshkent', district: 'Chilonzor', rating: 4.4, price: 120000, distanceKm: 6.0 },
];

const EXAMS_BY_CATEGORY: Record<string, string[]> = {
  visual: ["Bosh miya MRT", "Ko\u02BCkrak KT", "Umurtqa rentgen", "Qorin bo\u02BClig\u02BCi KT"],
  ultrasound: ["Qorin bo\u02BCligi UZI", "Yurak ExoKG", "Qalqonsimon bez UZI"],
  laboratory: ['Umumiy qon tahlili', 'Biokimyoviy tahlil', 'Gormonal tahlil'],
  functional: ['EKG', 'EEG', 'Spirometriya'],
  endoscopy: ['FGDS', 'Kolonoskopiya'],
};

export const examinationService: IExaminationService = {
  getCenters: (filters) => {
    let list = [...CENTERS];
    if (filters?.region) list = list.filter((c) => c.region === filters.region);
    if (filters?.district) list = list.filter((c) => c.district === filters.district);
    return Promise.resolve(list);
  },
  getExamsByCategory: (category) =>
    Promise.resolve([...(EXAMS_BY_CATEGORY[category] || [])]),
};
