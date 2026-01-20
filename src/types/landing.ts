
export interface FeatureSection {
  id: string;
  title: string;
  description: string;
  details: string[];
  image: string;
  reverse?: boolean;
}

export interface UseCase {
  category: string;
  items: string[];
}
