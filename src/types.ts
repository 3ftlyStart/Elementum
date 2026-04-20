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
  company?: string;
}

export type InstrumentType = 'Balance' | 'AAS' | 'XRF' | 'InductionFurnace';
export type InstrumentStatus = 'Connected' | 'Idle' | 'Busy' | 'CalibrationRequired';

export interface Instrument {
  id: string;
  name: string;
  type: InstrumentType;
  model: string;
  status: InstrumentStatus;
  lastCalibration?: string;
  connectionType: 'USB' | 'Network' | 'Bluetooth';
}

export interface InstrumentReading {
  timestamp: string;
  value: number;
  unit: string;
  parameter: string;
}

export type InventoryCategory = 'Reagent' | 'Consumable' | 'Standard' | 'Safety';
export type UnitOfMeasure = 'kg' | 'L' | 'units' | 'g' | 'tray';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  currentStock: number;
  minStockLevel: number;
  unit: UnitOfMeasure;
  location: string;
  lastRestocked?: string;
  supplier?: string;
}

export interface StockTransaction {
  id: string;
  itemId: string;
  type: 'In' | 'Out';
  quantity: number;
  timestamp: string;
  userId: string;
  userName: string;
  reason?: string;
}

export type RequisitionStatus = 'Pending' | 'Approved' | 'Ordered' | 'Received' | 'Cancelled';

export interface Requisition {
  id: string;
  itemId: string;
  itemName: string;
  quantityRequested: number;
  unit: UnitOfMeasure;
  status: RequisitionStatus;
  requestedBy: string;
  requestedByUserName: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  paidAt?: string;
}

export interface ClientProfile extends UserProfile {
  companyName: string;
  address: string;
  contactNumber: string;
  billingEmail: string;
}
