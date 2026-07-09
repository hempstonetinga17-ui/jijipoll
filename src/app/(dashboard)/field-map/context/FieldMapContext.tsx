"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type SalesStage =
  | "1 - Lead"
  | "2 - Qualified"
  | "3 - Proposal"
  | "4 - Customer"
  | "5 - Churned";
export type Priority = "High" | "Medium" | "Low";
export type NextStep =
  | "set a meeting"
  | "phone call"
  | "send an email"
  | "drop by office"
  | "drop off a sample"
  | "follow up"
  | "close deal";
export type MapTileLayer = "street" | "satellite" | "dark" | "terrain";
export type ColorizeBy =
  | "salesStage"
  | "nextStep"
  | "priority"
  | "salesYTD"
  | "daysSinceVisit"
  | "businessType";

export interface FieldAccount {
  id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  address?: string;
  businessType?: string;
  territory?: string;
  productLine?: string;
  customFields?: Record<string, string>;
  salesYTD: number;
  nextStep: NextStep;
  nextStepDate: string;
  daysSinceVisit: number;
  salesStage: SalesStage;
  priority: Priority;
  lat: number;
  lng: number;
  notes: string[];
  photos: string[];
  lastVisitAt?: string;
  createdAt: string;
  assignedTo?: string;
  territoryId?: string;
  source?: "db" | "shops";
}

export interface ViewportBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface ClusterPoint {
  lat: number;
  lng: number;
  count: number;
  key: string;
  territory?: string;
}

export interface TerritoryInfo {
  name: string;
  centerLat: number;
  centerLng: number;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  accountCount: number;
  channels: Record<string, number>;
}

export interface RouteStop {
  id: string;
  account: FieldAccount;
  order: number;
  visited: boolean;
  visitedAt?: string;
  estimatedArrivalMin?: number;
  estimatedDurationMin: number;
  distanceKm?: number;
  notes?: string;
}

export interface SavedRoute {
  id: string;
  name: string;
  stops: RouteStop[];
  createdAt: string;
  isRecurring: boolean;
  recurringDays?: number[];
  startLocation?: { lat: number; lng: number; label: string };
  endLocation?: { lat: number; lng: number; label: string };
  totalDistanceKm?: number;
  totalTimeMin?: number;
}

export interface CheckIn {
  id: string;
  accountId: string;
  accountName: string;
  timestamp: string;
  notes: string;
  photos: string[];
  outcome: "visited" | "no_answer" | "follow_up" | "converted" | "rejected";
  durationMin?: number;
  lat?: number;
  lng?: number;
  agentName?: string;
}

export interface Appointment {
  id: string;
  accountId: string;
  accountName: string;
  date: string;
  time: string;
  durationMin: number;
  notes: string;
  reminder: boolean;
  reminderMinBefore: number;
  status: "scheduled" | "completed" | "cancelled" | "missed";
}

export interface Territory {
  id: string;
  name: string;
  color: string;
  assignedTo: string;
  polygon: [number, number][];
  accountCount: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "manager" | "rep";
  avatar?: string;
  territories: string[];
  activeRoute?: string;
  todayVisits: number;
  todayDistance: number;
  status: "online" | "offline" | "in-field";
}

export interface LeadRoutingRule {
  id: string;
  name: string;
  type: "geography" | "product" | "vertical" | "opportunity";
  criteria: Record<string, any>;
  assignTo: string;
  isActive: boolean;
}

export interface PlaceResult {
  id: string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type: string;
  category?: string;
}

export interface ActivityReport {
  date: string;
  visitsCompleted: number;
  leadsCapture: number;
  dealsWon: number;
  mileageKm: number;
  checkIns: number;
  notesAdded: number;
  photosUploaded: number;
}

export interface CRMConfig {
  provider:
    | "salesforce"
    | "hubspot"
    | "zoho"
    | "dynamics365"
    | "netsuite"
    | "insightly"
    | "veeva"
    | "none";
  connected: boolean;
  lastSyncAt?: string;
  syncDirection: "two-way" | "push-only" | "pull-only";
  autoSync: boolean;
  syncIntervalMin: number;
  mappedFields: Record<string, string>;
}

export interface MapSettings {
  tileLayer: MapTileLayer;
  showClustering: boolean;
  showRoutePolyline: boolean;
  showHeatmap: boolean;
  showTerritories: boolean;
  showTraffic: boolean;
  showRadiusSearch: boolean;
  radiusSearchKm: number;
  radiusSearchCenter?: { lat: number; lng: number };
}

// ─── Color Maps ────────────────────────────────────────────────────────────────

export const NEXT_STEP_COLORS: Record<NextStep, string> = {
  "set a meeting": "#ec4899",
  "phone call": "#22c55e",
  "send an email": "#0ea5e9",
  "drop by office": "#10b981",
  "drop off a sample": "#f59e0b",
  "follow up": "#8b5cf6",
  "close deal": "#ef4444",
};

export const SALES_STAGE_COLORS: Record<SalesStage, string> = {
  "1 - Lead": "#a855f7",
  "2 - Qualified": "#3b82f6",
  "3 - Proposal": "#f59e0b",
  "4 - Customer": "#22c55e",
  "5 - Churned": "#6b7280",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#22c55e",
};

export const BUSINESS_TYPE_COLORS: Record<string, string> = {
  "Duka": "#3b82f6",          // Blue
  "Green Grocer": "#22c55e",  // Green (Mama mboga)
  "Butcher": "#ef4444",       // Red
  "Eatery": "#f59e0b",        // Orange
  "Wholesale": "#8b5cf6",     // Purple
  "Kibanda": "#ec4899",       // Pink
  "Other": "#64748b"          // Gray
};

export function getAccountColor(
  account: FieldAccount,
  colorizeBy: ColorizeBy
): string {
  switch (colorizeBy) {
    case "salesStage":
      return SALES_STAGE_COLORS[account.salesStage] || "#6b7280";
    case "nextStep":
      return NEXT_STEP_COLORS[account.nextStep] || "#6b7280";
    case "priority":
      return PRIORITY_COLORS[account.priority] || "#6b7280";
    case "salesYTD":
      if (account.salesYTD >= 20000) return "#22c55e";
      if (account.salesYTD >= 10000) return "#3b82f6";
      if (account.salesYTD >= 5000) return "#f59e0b";
      return "#ef4444";
    case "daysSinceVisit":
      if (account.daysSinceVisit <= 7) return "#22c55e";
      if (account.daysSinceVisit <= 30) return "#f59e0b";
      return "#ef4444";
    case "businessType": {
      const typeStr = account.businessType || "Other";
      // Match common Kenyan retail types
      if (typeStr.toLowerCase().includes("duka") || typeStr.toLowerCase().includes("retail")) return BUSINESS_TYPE_COLORS["Duka"];
      if (typeStr.toLowerCase().includes("grocer") || typeStr.toLowerCase().includes("mama")) return BUSINESS_TYPE_COLORS["Green Grocer"];
      if (typeStr.toLowerCase().includes("butcher") || typeStr.toLowerCase().includes("meat")) return BUSINESS_TYPE_COLORS["Butcher"];
      if (typeStr.toLowerCase().includes("eatery") || typeStr.toLowerCase().includes("chapati") || typeStr.toLowerCase().includes("hotel")) return BUSINESS_TYPE_COLORS["Eatery"];
      if (typeStr.toLowerCase().includes("wholesale")) return BUSINESS_TYPE_COLORS["Wholesale"];
      if (typeStr.toLowerCase().includes("kibanda")) return BUSINESS_TYPE_COLORS["Kibanda"];
      
      return BUSINESS_TYPE_COLORS["Other"];
    }
    default:
      return "#3b82f6";
  }
}

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function getColorLegend(
  colorizeBy: ColorizeBy
): { color: string; label: string }[] {
  switch (colorizeBy) {
    case "salesStage":
      return Object.entries(SALES_STAGE_COLORS).map(([label, color]) => ({
        label,
        color,
      }));
    case "nextStep":
      return Object.entries(NEXT_STEP_COLORS).map(([label, color]) => ({
        label,
        color,
      }));
    case "priority":
      return Object.entries(PRIORITY_COLORS).map(([label, color]) => ({
        label,
        color,
      }));
    case "salesYTD":
      return [
        { color: "#22c55e", label: "$20,000+" },
        { color: "#3b82f6", label: "$10,000–$20,000" },
        { color: "#f59e0b", label: "$5,000–$10,000" },
        { color: "#ef4444", label: "Under $5,000" },
      ];
    case "daysSinceVisit":
      return [
        { color: "#22c55e", label: "Within 7 days" },
        { color: "#f59e0b", label: "8–30 days" },
        { color: "#ef4444", label: "30+ days" },
      ];
    case "businessType":
      return Object.entries(BUSINESS_TYPE_COLORS).map(([label, color]) => ({
        label,
        color,
      }));
    default:
      return [];
  }
}

// ─── State ─────────────────────────────────────────────────────────────────────

export interface FieldMapState {
  // Viewport-loaded accounts (only what's currently visible on map)
  accounts: FieldAccount[];
  filteredAccounts: FieldAccount[];
  selectedAccount: FieldAccount | null;
  searchQuery: string;

  // Viewport state
  viewportBounds: ViewportBounds | null;
  isLoadingViewport: boolean;
  clusters: ClusterPoint[];
  totalAccountCount: number; // Grand total from server (e.g. 90,432)
  totalInView: number; // Total matching viewport (before render cap)

  // Active Tab
  activeTab: string;
  activeDetailTab: string;

  // Visualization
  colorizeBy: ColorizeBy;
  activeFilters: {
    salesStage: SalesStage[];
    priority: Priority[];
    nextStep: NextStep[];
    businessType: string[];
  };

  // Routes
  routeStops: RouteStop[];
  savedRoutes: SavedRoute[];
  isOptimizing: boolean;
  routeStartLocation: { lat: number; lng: number; label: string } | null;
  routeEndLocation: { lat: number; lng: number; label: string } | null;

  // Places
  placeResults: PlaceResult[];
  isSearchingPlaces: boolean;
  placesQuery: string;

  // Map
  mapSettings: MapSettings;
  mapCenter: [number, number];
  mapZoom: number;

  // Check-ins
  checkIns: CheckIn[];

  // Schedule
  appointments: Appointment[];

  // Territory
  territories: Territory[];
  isDrawingTerritory: boolean;

  // Team
  teamMembers: TeamMember[];

  // CRM
  crmConfig: CRMConfig;

  // Lead Routing
  leadRoutingRules: LeadRoutingRule[];

  // Reports
  activityReports: ActivityReport[];
  mileageTotal: number;

  // Territory list (from API)
  territoryList: TerritoryInfo[];
  isLoadingTerritories: boolean;
  selectedTerritory: string | null;

  // UI
  showAddAccountModal: boolean;
  isSidebarCollapsed: boolean;
  isPickingLocation: boolean;
  pickedLocation: { lat: number; lng: number } | null;
  showAddModal: boolean;
  isLassoMode: boolean;
  isDrawMode: boolean;
  drawArea: { center: [number, number]; radiusKm: number; name?: string } | null;
}

// ─── Actions ───────────────────────────────────────────────────────────────────

type Action =
  | { type: "SET_ACTIVE_TAB"; tab: string }
  | { type: "SET_ACTIVE_DETAIL_TAB"; tab: string }
  | { type: "SET_SEARCH_QUERY"; query: string }
  | { type: "SET_SELECTED_ACCOUNT"; account: FieldAccount | null }
  | { type: "SET_ACCOUNTS"; accounts: FieldAccount[] }
  | { type: "SET_VIEWPORT_DATA"; accounts: FieldAccount[]; clusters: ClusterPoint[]; totalInView: number }
  | { type: "SET_LOADING_VIEWPORT"; loading: boolean }
  | { type: "SET_TOTAL_ACCOUNT_COUNT"; count: number }
  | { type: "SET_VIEWPORT_BOUNDS"; bounds: ViewportBounds }
  | { type: "ADD_ACCOUNT"; account: FieldAccount }
  | { type: "UPDATE_ACCOUNT"; account: FieldAccount }
  | { type: "DELETE_ACCOUNT"; id: string }
  | { type: "SET_COLORIZE_BY"; colorizeBy: ColorizeBy }
  | { type: "SET_FILTERS"; filters: Partial<FieldMapState["activeFilters"]> }
  | { type: "ADD_ROUTE_STOP"; account: FieldAccount }
  | { type: "REMOVE_ROUTE_STOP"; id: string }
  | { type: "REORDER_ROUTE"; stops: RouteStop[] }
  | { type: "SET_ROUTE_STOPS"; stops: RouteStop[] }
  | { type: "MARK_STOP_VISITED"; id: string }
  | { type: "CLEAR_ROUTE" }
  | { type: "SET_OPTIMIZING"; isOptimizing: boolean }
  | { type: "SAVE_ROUTE"; route: SavedRoute }
  | { type: "LOAD_ROUTE"; route: SavedRoute }
  | { type: "DELETE_SAVED_ROUTE"; id: string }
  | { type: "SET_ROUTE_START"; location: { lat: number; lng: number; label: string } | null }
  | { type: "SET_ROUTE_END"; location: { lat: number; lng: number; label: string } | null }
  | { type: "SET_PLACE_RESULTS"; results: PlaceResult[] }
  | { type: "SET_SEARCHING_PLACES"; isSearching: boolean }
  | { type: "SET_PLACES_QUERY"; query: string }
  | { type: "SET_MAP_SETTINGS"; settings: Partial<MapSettings> }
  | { type: "SET_MAP_VIEW"; center: [number, number]; zoom: number }
  | { type: "ADD_CHECK_IN"; checkIn: CheckIn }
  | { type: "SET_CHECK_INS"; checkIns: CheckIn[] }
  | { type: "ADD_APPOINTMENT"; appointment: Appointment }
  | { type: "UPDATE_APPOINTMENT"; appointment: Appointment }
  | { type: "DELETE_APPOINTMENT"; id: string }
  | { type: "ADD_TERRITORY"; territory: Territory }
  | { type: "UPDATE_TERRITORY"; territory: Territory }
  | { type: "DELETE_TERRITORY"; id: string }
  | { type: "SET_DRAWING_TERRITORY"; isDrawing: boolean }
  | { type: "SET_TEAM_MEMBERS"; members: TeamMember[] }
  | { type: "SET_CRM_CONFIG"; config: Partial<CRMConfig> }
  | { type: "ADD_LEAD_ROUTING_RULE"; rule: LeadRoutingRule }
  | { type: "UPDATE_LEAD_ROUTING_RULE"; rule: LeadRoutingRule }
  | { type: "DELETE_LEAD_ROUTING_RULE"; id: string }
  | { type: "SET_ACTIVITY_REPORTS"; reports: ActivityReport[] }
  | { type: "ADD_MILEAGE"; km: number }
  | { type: "TOGGLE_ADD_ACCOUNT_MODAL" }
  | { type: "TOGGLE_SIDEBAR_COLLAPSED" }
  | { type: "SET_PICKING_LOCATION"; isPicking: boolean }
  | { type: "SET_PICKED_LOCATION"; location: { lat: number; lng: number } | null }
  | { type: "SET_SHOW_ADD_MODAL"; show: boolean }
  | { type: "SET_LASSO_MODE"; isLassoMode: boolean }
  | { type: "ADD_ACCOUNTS_TO_ROUTE"; accounts: FieldAccount[] }
  | { type: "SET_TERRITORY_LIST"; territories: TerritoryInfo[] }
  | { type: "SET_LOADING_TERRITORIES"; loading: boolean }
  | { type: "SET_SELECTED_TERRITORY"; territory: string | null }
  | { type: "SET_DRAW_MODE"; isDrawMode: boolean }
  | { type: "SET_DRAW_AREA"; drawArea: { center: [number, number]; radiusKm: number; name?: string } | null };

// ─── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state: FieldMapState, action: Action): FieldMapState {
  switch (action.type) {
    case "SET_DRAW_MODE":
      return { ...state, isDrawMode: action.isDrawMode };
    case "SET_DRAW_AREA":
      return { ...state, drawArea: action.drawArea };
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.tab };
    case "SET_ACTIVE_DETAIL_TAB":
      return { ...state, activeDetailTab: action.tab };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.query };
    case "SET_SELECTED_ACCOUNT":
      return { ...state, selectedAccount: action.account };
    case "SET_ACCOUNTS":
      return { ...state, accounts: action.accounts, filteredAccounts: action.accounts };
    case "SET_VIEWPORT_DATA":
      return {
        ...state,
        accounts: action.accounts,
        filteredAccounts: action.accounts,
        clusters: action.clusters,
        totalInView: action.totalInView,
        isLoadingViewport: false,
      };
    case "SET_LOADING_VIEWPORT":
      return { ...state, isLoadingViewport: action.loading };
    case "SET_TOTAL_ACCOUNT_COUNT":
      return { ...state, totalAccountCount: action.count };
    case "SET_VIEWPORT_BOUNDS":
      return { ...state, viewportBounds: action.bounds };
    case "ADD_ACCOUNT": {
      const accounts = [...state.accounts, action.account];
      return { ...state, accounts, filteredAccounts: accounts };
    }
    case "UPDATE_ACCOUNT": {
      const accounts = state.accounts.map((a) =>
        a.id === action.account.id ? action.account : a
      );
      const selectedAccount =
        state.selectedAccount?.id === action.account.id
          ? action.account
          : state.selectedAccount;
      return { ...state, accounts, filteredAccounts: accounts, selectedAccount };
    }
    case "DELETE_ACCOUNT": {
      const accounts = state.accounts.filter((a) => a.id !== action.id);
      const selectedAccount =
        state.selectedAccount?.id === action.id ? null : state.selectedAccount;
      return { ...state, accounts, filteredAccounts: accounts, selectedAccount };
    }
    case "SET_COLORIZE_BY":
      return { ...state, colorizeBy: action.colorizeBy };
    case "SET_FILTERS": {
      const filters = { ...state.activeFilters, ...action.filters };
      return { ...state, activeFilters: filters };
    }
    case "ADD_ROUTE_STOP": {
      if (state.routeStops.some((s) => s.account.id === action.account.id))
        return state;
      const stop: RouteStop = {
        id: `stop-${Date.now()}`,
        account: action.account,
        order: state.routeStops.length,
        visited: false,
        estimatedDurationMin: 30,
      };
      return { ...state, routeStops: [...state.routeStops, stop] };
    }
    case "REMOVE_ROUTE_STOP":
      return {
        ...state,
        routeStops: state.routeStops
          .filter((s) => s.id !== action.id)
          .map((s, i) => ({ ...s, order: i })),
      };
    case "REORDER_ROUTE":
      return {
        ...state,
        routeStops: action.stops.map((s, i) => ({ ...s, order: i })),
      };
    case "SET_ROUTE_STOPS":
      return { ...state, routeStops: action.stops };
    case "MARK_STOP_VISITED":
      return {
        ...state,
        routeStops: state.routeStops.map((s) =>
          s.id === action.id
            ? { ...s, visited: true, visitedAt: new Date().toISOString() }
            : s
        ),
      };
    case "CLEAR_ROUTE":
      return { ...state, routeStops: [] };
    case "SET_OPTIMIZING":
      return { ...state, isOptimizing: action.isOptimizing };
    case "SAVE_ROUTE": {
      const exists = state.savedRoutes.findIndex(
        (r) => r.id === action.route.id
      );
      const savedRoutes =
        exists >= 0
          ? state.savedRoutes.map((r) =>
              r.id === action.route.id ? action.route : r
            )
          : [...state.savedRoutes, action.route];
      return { ...state, savedRoutes };
    }
    case "LOAD_ROUTE":
      return {
        ...state,
        routeStops: action.route.stops,
        routeStartLocation: action.route.startLocation || null,
        routeEndLocation: action.route.endLocation || null,
      };
    case "DELETE_SAVED_ROUTE":
      return {
        ...state,
        savedRoutes: state.savedRoutes.filter((r) => r.id !== action.id),
      };
    case "SET_ROUTE_START":
      return { ...state, routeStartLocation: action.location };
    case "SET_ROUTE_END":
      return { ...state, routeEndLocation: action.location };
    case "SET_PLACE_RESULTS":
      return { ...state, placeResults: action.results };
    case "SET_SEARCHING_PLACES":
      return { ...state, isSearchingPlaces: action.isSearching };
    case "SET_PLACES_QUERY":
      return { ...state, placesQuery: action.query };
    case "SET_MAP_SETTINGS":
      return {
        ...state,
        mapSettings: { ...state.mapSettings, ...action.settings },
      };
    case "SET_MAP_VIEW":
      return { ...state, mapCenter: action.center, mapZoom: action.zoom };
    case "ADD_CHECK_IN":
      return { ...state, checkIns: [action.checkIn, ...state.checkIns] };
    case "SET_CHECK_INS":
      return { ...state, checkIns: action.checkIns };
    case "ADD_APPOINTMENT":
      return {
        ...state,
        appointments: [...state.appointments, action.appointment],
      };
    case "UPDATE_APPOINTMENT":
      return {
        ...state,
        appointments: state.appointments.map((a) =>
          a.id === action.appointment.id ? action.appointment : a
        ),
      };
    case "DELETE_APPOINTMENT":
      return {
        ...state,
        appointments: state.appointments.filter((a) => a.id !== action.id),
      };
    case "ADD_TERRITORY":
      return {
        ...state,
        territories: [...state.territories, action.territory],
      };
    case "UPDATE_TERRITORY":
      return {
        ...state,
        territories: state.territories.map((t) =>
          t.id === action.territory.id ? action.territory : t
        ),
      };
    case "DELETE_TERRITORY":
      return {
        ...state,
        territories: state.territories.filter((t) => t.id !== action.id),
      };
    case "SET_DRAWING_TERRITORY":
      return { ...state, isDrawingTerritory: action.isDrawing };
    case "SET_TEAM_MEMBERS":
      return { ...state, teamMembers: action.members };
    case "SET_CRM_CONFIG":
      return { ...state, crmConfig: { ...state.crmConfig, ...action.config } };
    case "ADD_LEAD_ROUTING_RULE":
      return {
        ...state,
        leadRoutingRules: [...state.leadRoutingRules, action.rule],
      };
    case "UPDATE_LEAD_ROUTING_RULE":
      return {
        ...state,
        leadRoutingRules: state.leadRoutingRules.map((r) =>
          r.id === action.rule.id ? action.rule : r
        ),
      };
    case "DELETE_LEAD_ROUTING_RULE":
      return {
        ...state,
        leadRoutingRules: state.leadRoutingRules.filter(
          (r) => r.id !== action.id
        ),
      };
    case "SET_ACTIVITY_REPORTS":
      return { ...state, activityReports: action.reports };
    case "ADD_MILEAGE":
      return { ...state, mileageTotal: state.mileageTotal + action.km };
    case "TOGGLE_ADD_ACCOUNT_MODAL":
      return { ...state, showAddAccountModal: !state.showAddAccountModal };
    case "TOGGLE_SIDEBAR_COLLAPSED":
      return { ...state, isSidebarCollapsed: !state.isSidebarCollapsed };
    case "SET_PICKING_LOCATION":
      return {
        ...state,
        isPickingLocation: action.isPicking,
        pickedLocation: null,
      };
    case "SET_PICKED_LOCATION":
      return {
        ...state,
        pickedLocation: action.location,
        isPickingLocation: false,
      };
    case "SET_SHOW_ADD_MODAL":
      return { ...state, showAddModal: action.show };
    case "SET_LASSO_MODE":
      return { ...state, isLassoMode: action.isLassoMode };
    case "ADD_ACCOUNTS_TO_ROUTE": {
      const newStops = [...state.routeStops];
      action.accounts.forEach((acc) => {
        if (!newStops.some((s) => s.account.id === acc.id)) {
          newStops.push({
            id: `stop-${Date.now()}-${acc.id}`,
            account: acc,
            order: newStops.length,
            visited: false,
            estimatedDurationMin: 30,
          });
        }
      });
      return { ...state, routeStops: newStops, isLassoMode: false };
    }
    case "SET_TERRITORY_LIST":
      return { ...state, territoryList: action.territories, isLoadingTerritories: false };
    case "SET_LOADING_TERRITORIES":
      return { ...state, isLoadingTerritories: action.loading };
    case "SET_SELECTED_TERRITORY":
      return { ...state, selectedTerritory: action.territory };
    default:
      return state;
  }
}

const initialState: FieldMapState = {
  accounts: [],
  filteredAccounts: [],
  selectedAccount: null,
  searchQuery: "",
  viewportBounds: null,
  isLoadingViewport: false,
  clusters: [],
  totalAccountCount: 0,
  totalInView: 0,
  activeTab: "accounts",
  activeDetailTab: "detail",
  colorizeBy: "nextStep",
  activeFilters: { salesStage: [], priority: [], nextStep: [], businessType: [] },
  routeStops: [],
  savedRoutes: [],
  isOptimizing: false,
  routeStartLocation: null,
  routeEndLocation: null,
  placeResults: [],
  isSearchingPlaces: false,
  placesQuery: "",
  mapSettings: {
    tileLayer: "street",
    showClustering: true,
    showRoutePolyline: true,
    showHeatmap: false,
    showTerritories: true,
    showTraffic: false,
    showRadiusSearch: false,
    radiusSearchKm: 5,
  },
  mapCenter: [-1.2921, 36.8219],
  mapZoom: 13,
  checkIns: [],
  appointments: [],
  territories: [],
  isDrawingTerritory: false,
  teamMembers: [],
  crmConfig: {
    provider: "none",
    connected: false,
    syncDirection: "two-way",
    autoSync: false,
    syncIntervalMin: 15,
    mappedFields: {},
  },
  leadRoutingRules: [],
  activityReports: [],
  mileageTotal: 0,
  showAddAccountModal: false,
  isSidebarCollapsed: false,
  isPickingLocation: false,
  pickedLocation: null,
  showAddModal: false,
  isLassoMode: false,
  isDrawMode: false,
  drawArea: null,
  territoryList: [],
  isLoadingTerritories: false,
  selectedTerritory: null,
};

// ─── Context ───────────────────────────────────────────────────────────────────

interface FieldMapContextType {
  state: FieldMapState;
  dispatch: React.Dispatch<Action>;
  fetchViewportAccounts: (
    bounds: ViewportBounds,
    zoom: number,
    filters?: FieldMapState["activeFilters"],
    search?: string
  ) => void;
}

const FieldMapContext = createContext<FieldMapContextType | null>(null);

export function FieldMapProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── On mount: fetch only stats + team (no accounts!) ─────────────────────
  useEffect(() => {
    fetch("/api/org-dashboard/field-map/init")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.team) {
          dispatch({ type: "SET_TEAM_MEMBERS", members: data.team });
        }
        if (data.checkIns) {
          dispatch({ type: "SET_CHECK_INS", checkIns: data.checkIns });
        }
        if (data.stats?.totalAccounts) {
          dispatch({
            type: "SET_TOTAL_ACCOUNT_COUNT",
            count: data.stats.totalAccounts,
          });
        }
      })
      .catch((err) => console.error("Failed to load field map init data", err));

    // Also fetch territory list
    fetch("/api/org-dashboard/field-map/territories")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.territories) {
          dispatch({ type: "SET_TERRITORY_LIST", territories: data.territories });
        }
      })
      .catch((err) => console.error("Failed to load territory list", err));
  }, []);

  // ─── Viewport fetch function (debounced) ───────────────────────────────────
  const fetchViewportAccounts = useCallback(
    (
      bounds: ViewportBounds,
      zoom: number,
      filters?: FieldMapState["activeFilters"],
      search?: string
    ) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      dispatch({ type: "SET_VIEWPORT_BOUNDS", bounds });
      dispatch({ type: "SET_LOADING_VIEWPORT", loading: true });

      debounceTimer.current = setTimeout(async () => {
        try {
          const params = new URLSearchParams({
            minLat: bounds.minLat.toString(),
            maxLat: bounds.maxLat.toString(),
            minLng: bounds.minLng.toString(),
            maxLng: bounds.maxLng.toString(),
            zoom: zoom.toString(),
          });

          if (search) params.set("search", search);
          if (filters?.salesStage?.length)
            params.set("salesStage", filters.salesStage.join(","));
          if (filters?.priority?.length)
            params.set("priority", filters.priority.join(","));
          if (filters?.nextStep?.length)
            params.set("nextStep", filters.nextStep.join(","));
          if (filters?.businessType?.length)
            params.set("businessType", filters.businessType.join(","));

          const res = await fetch(
            `/api/org-dashboard/field-map/accounts-in-view?${params.toString()}`
          );
          if (!res.ok) {
            dispatch({ type: "SET_LOADING_VIEWPORT", loading: false });
            return;
          }
          const data = await res.json();
          dispatch({
            type: "SET_VIEWPORT_DATA",
            accounts: data.accounts || [],
            clusters: data.clusters || [],
            totalInView: data.totalInView || 0,
          });
        } catch (err) {
          console.error("Viewport fetch error:", err);
          dispatch({ type: "SET_LOADING_VIEWPORT", loading: false });
        }
      }, 350); // 350ms debounce
    },
    []
  );

  // ─── Re-fetch viewport when filters change ─────────────────────────────────
  const filtersRef = useRef(state.activeFilters);
  const searchRef = useRef(state.searchQuery);
  const boundsRef = useRef(state.viewportBounds);
  const zoomRef = useRef(state.mapZoom);

  useEffect(() => {
    filtersRef.current = state.activeFilters;
  }, [state.activeFilters]);

  useEffect(() => {
    searchRef.current = state.searchQuery;
  }, [state.searchQuery]);

  useEffect(() => {
    boundsRef.current = state.viewportBounds;
    zoomRef.current = state.mapZoom;
  }, [state.viewportBounds, state.mapZoom]);

  // When filters change: re-fetch with current viewport
  useEffect(() => {
    if (boundsRef.current) {
      fetchViewportAccounts(
        boundsRef.current,
        zoomRef.current,
        state.activeFilters,
        searchRef.current
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeFilters]);

  // When search changes: re-fetch with current viewport
  useEffect(() => {
    if (boundsRef.current) {
      fetchViewportAccounts(
        boundsRef.current,
        zoomRef.current,
        filtersRef.current,
        state.searchQuery
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.searchQuery]);

  // ─── Load saved routes from localStorage ──────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem("stampke-saved-routes");
      if (saved) {
        const routes = JSON.parse(saved) as SavedRoute[];
        routes.forEach((r) => dispatch({ type: "SAVE_ROUTE", route: r }));
      }
    } catch {}
  }, []);

  // ─── Persist saved routes to localStorage ─────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(
        "stampke-saved-routes",
        JSON.stringify(state.savedRoutes)
      );
    } catch {}
  }, [state.savedRoutes]);

  return (
    <FieldMapContext.Provider value={{ state, dispatch, fetchViewportAccounts }}>
      {children}
    </FieldMapContext.Provider>
  );
}

export function useFieldMap() {
  const ctx = useContext(FieldMapContext);
  if (!ctx) throw new Error("useFieldMap must be used within FieldMapProvider");
  return ctx;
}
