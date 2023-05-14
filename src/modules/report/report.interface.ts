export interface IReport {
  id?: number;
  reporter?: number;
  type?: string;
  detail_report?: string;
  errors?: string[];
  id_object?: number;
  link?: string;
  is_resolve?: boolean;
}
