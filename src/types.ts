/**
 * Elementum Assay Lab Types
 */

export type SampleStatus = 'Received' | 'Preparation' | 'Analysis' | 'Finalized' | 'Cancelled';
export type SampleType = 'Ore' | 'Concentrate' | 'Tailings' | 'Bullion' | 'Waste' | 'Cyanidation' | 'Pulp' | 'Solution' | 'Carbon';
export type Priority = 'Low' | 'Standard' | 'High' | 'Emergency';
export type UserRole = 'Admin' | 'Technician' | 'Client';
export type AssayMethod = 'FireAssay' | 'AAS' | 'CarbonAnalysis' | 'WetChemistry';
export type SourceCategory = 'Mining' | 'BallMill' | 'ILR' | 'CIL' | 'PlantFeed' | 'PlantTails';

export interface PhysicalProperties {
  moistureContent?: number; // %
  mass?: number; // grams
  form: 'pulp' | 'solution' | 'carbon' | 'rock';
}

export interface MethodSpecificData {
  fireAssay?: {
    crucibleNumber: string;
    fluxType: string;
    beadWeight?: number; // mg
  };
  aas?: {
    dilutionFactor: number;
    absorbance?: number;
    rawReading?: number;
  };
  carbon?: {
    isLoaded: boolean;
    efficiency?: number;
  };
}

export interface QAQC {
  isStandard: boolean;
  isDuplicate: boolean;
  standardReference?: string;
  varianceFromOriginal?: number; // percentage
}

export interface HistoryEntry {
  timestamp: string;
  action: string;
  userId: string;
  userName: string;
  previousStatus?: SampleStatus;
  newStatus?: SampleStatus;
  notes?: string;
}

export interface AssayElements {
  gold?: number;
  silver?: number;
  copper?: number;
  iron?: number;
  cyanideFree?: number;
  cyanideTotal?: number;
}

export interface Job {
  id: string;
  jobId: string; // User visible ID
  name: string;
  site: string;
  shift: 'Morning' | 'Afternoon' | 'Night';
  status: 'Open' | 'In-Process' | 'Completed';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Sample {
  id: string;
  jobId: string; // Foreign key to Job
  sampleId: string; // Unique sample ID (QR/Barcode)
  clientName: string;
  source: SourceCategory;
  sampleType: SampleType;
  status: SampleStatus;
  priority: Priority;
  physicalProperties?: PhysicalProperties;
  method?: AssayMethod;
  methodData?: MethodSpecificData;
  qaqc?: QAQC;
  collectedAt: string;
  submittedById: string;
  elements: AssayElements;
  notes: string;
  history: HistoryEntry[];
  updatedAt: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
}
