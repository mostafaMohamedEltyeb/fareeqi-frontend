export type UserType = 'PLAYER' | 'FIELD_OWNER' | 'ADMIN';
export type SportType = 'FOOTBALL' | 'PADEL';
export type SlotStatus = 'AVAILABLE' | 'RESERVED' | 'DISABLED';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'CHECKED_IN';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';
export type PaymentTransactionStatus = 'INITIATED' | 'COMPLETED' | 'CANCELLED';
export type NotificationStatus = 'UNREAD' | 'READ';
export type MatchStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface AuthUser {
  token: string;
  username: string;
  email: string;
  userType: UserType;
  roles: string[];
  permissions: string[];
}

export interface SlotResponse {
  id: number;
  playgroundId: number;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  pricePerHour: number;
}

export interface PlaygroundResponse {
  id: number;
  ownerId: number;
  ownerUsername: string;
  name: string;
  location: string;
  sportType: SportType;
  availability: boolean;
  address: string;
  pricePerHour: number;
  ratings: number;
  imageUrls: string[];
}

export interface PlaygroundDetailResponse extends PlaygroundResponse {
  slots: SlotResponse[];
}

export interface BookingResponse {
  id: number;
  playerId: number;
  playerUsername: string;
  playgroundId: number;
  playgroundName: string;
  slotId: number;
  slotStartTime: string;
  slotEndTime: string;
  qrCode: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface NotificationResponse {
  id: number;
  message: string;
  dateTime: string;
  status: NotificationStatus;
  type: string;
}

export interface PaymentResponse {
  id: number;
  bookingId: number;
  playgroundName: string;
  playerUsername: string;
  amount: number;
  status: PaymentTransactionStatus;
  referenceNumber: string;
  createdAt: string;
  paidAt: string | null;
}

export interface TeamResponse {
  id: number;
  captainId: number;
  captainUsername: string;
  name: string;
  sportType: string;
  score: number;
  imageUrl?: string;
}

export interface MatchResponse {
  id: number;
  team1Id: number;
  team1Name: string;
  team2Id: number;
  team2Name: string;
  playgroundId: number;
  playgroundName: string;
  matchDate: string;
  status: MatchStatus;
}

export interface PlayerFeatureResponse {
  id: number;
  playerId: number;
  playerUsername: string;
  featureName: string;
  description: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  userType: UserType;
  roles: string[];
  permissions: string[];
  enabled: boolean;
  profileImageUrl?: string;
}

export interface PlayerDashboardResponse {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  rejectedBookings: number;
  cancelledBookings: number;
}

export interface OwnerDashboardResponse {
  totalPlaygrounds: number;
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  rejectedBookings: number;
}

export interface AdminDashboardResponse {
  totalUsers: number;
  totalPlaygrounds: number;
  totalTeams: number;
  totalMatches: number;
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  rejectedBookings: number;
  cancelledBookings: number;
  paidBookings: number;
}
