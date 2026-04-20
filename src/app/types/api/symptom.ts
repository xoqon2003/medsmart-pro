export interface SymptomListItem {
  id: string;
  code: string;
  nameUz: string;
  nameRu?: string;
  category: string;
  bodyZone?: string;
  isRedFlag: boolean;
}

export interface DiseaseSymptomWithWeight extends SymptomListItem {
  weight: number;
  isRequired: boolean;
  isExcluding: boolean;
}
